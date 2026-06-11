import type {
  PendingOperation,
  PendingOperationConflict,
  SyncMetaRecord,
} from '../offline/offlineTypes';
import { removeCachedTask, upsertCachedTask } from '../offline/taskCache';
import {
  getPendingOperations,
  removePendingOperation,
  updatePendingOperation,
} from '../offline/syncQueue';
import { saveSyncMeta } from '../offline/syncMeta';
import type { Task } from '../tasks/taskTypes';
import type {
  SyncOperationResult,
  SyncRequest,
  SyncRequestOperation,
  SyncResponse,
} from './syncTypes';

type ExecuteSyncRequest = (request: SyncRequest) => Promise<SyncResponse>;

export type SyncManagerResult = {
  cachedTasks: Task[];
  pendingOperations: PendingOperation[];
  syncMeta: SyncMetaRecord;
};

type RunSyncOptions = {
  cachedTasks: Task[];
  currentSyncMeta: SyncMetaRecord;
  executeSyncRequest: ExecuteSyncRequest;
  userId: string;
};

function normalizeTaskForCache(task: Task): Task {
  return {
    ...task,
    inConflict: false,
    isOfflineCreated: false,
    isOfflineDeleted: false,
    isOfflineUpdated: false,
    lastOperationId: task.lastOperationId ?? null,
    serverTaskForConflict: null,
  };
}

function toSyncTaskPayload(operation: PendingOperation) {
  if (!operation.taskPayload) {
    return undefined;
  }

  const {
    clientCreatedAt,
    clientUpdatedAt,
    deletedAt,
    description,
    dueDate,
    priority,
    reminderAt,
    status,
    title,
  } = operation.taskPayload;

  return {
    clientCreatedAt,
    clientUpdatedAt,
    deletedAt,
    description,
    dueDate,
    priority,
    reminderAt,
    status,
    title,
  };
}

export function buildSyncRequest(
  lastSyncAt: string | null,
  operations: PendingOperation[],
): SyncRequest {
  return {
    lastSyncAt,
    operations: operations.map<SyncRequestOperation>((operation) => ({
      operationId: operation.operationId,
      type: operation.type,
      taskId: operation.type === 'CREATE' ? undefined : operation.taskId,
      taskVersion: operation.type === 'CREATE' ? undefined : operation.taskVersion,
      task: toSyncTaskPayload(operation),
    })),
  };
}

function mergeServerTaskIntoCache(
  taskMap: Map<string, Task>,
  task: Task,
  hasConflict: boolean,
) {
  const existingTask = taskMap.get(task.id);

  if (hasConflict && existingTask) {
    taskMap.set(task.id, {
      ...existingTask,
      inConflict: true,
      serverTaskForConflict: task,
    });
    return;
  }

  taskMap.set(task.id, normalizeTaskForCache(task));
}

function applyConflictToCache(
  taskMap: Map<string, Task>,
  operation: PendingOperation,
  conflict: PendingOperationConflict,
) {
  if (!operation.taskId) {
    return;
  }

  const existingTask = taskMap.get(operation.taskId);
  if (!existingTask) {
    return;
  }

  taskMap.set(operation.taskId, {
    ...existingTask,
    inConflict: true,
    serverTaskForConflict: conflict.serverTask
      ? ({
          ...existingTask,
          ...conflict.serverTask,
        } as Task)
      : existingTask.serverTaskForConflict ?? null,
  });
}

async function handleAppliedOperation(
  taskMap: Map<string, Task>,
  operation: PendingOperation,
  result: SyncOperationResult,
) {
  await removePendingOperation(operation.operationId);

  if (operation.type === 'DELETE') {
    if (result.task) {
      const normalizedTask = normalizeTaskForCache(result.task);
      taskMap.delete(operation.taskId ?? normalizedTask.id);
      taskMap.set(normalizedTask.id, normalizedTask);
      await upsertCachedTask(normalizedTask);
      return;
    }

    if (operation.taskId) {
      taskMap.delete(operation.taskId);
      await removeCachedTask(operation.taskId);
    }
    return;
  }

  if (!result.task) {
    return;
  }

  const normalizedTask = normalizeTaskForCache(result.task);

  if (operation.type === 'CREATE' && operation.taskId && operation.taskId !== normalizedTask.id) {
    taskMap.delete(operation.taskId);
    await removeCachedTask(operation.taskId);
  }

  taskMap.set(normalizedTask.id, normalizedTask);
  await upsertCachedTask(normalizedTask);
}

async function handleConflictOperation(
  taskMap: Map<string, Task>,
  operation: PendingOperation,
  result: SyncOperationResult,
) {
  const conflict = {
    message: result.conflict?.message ?? 'This task has changed on the server.',
    serverTask: result.conflict?.serverTask ?? result.task ?? null,
  };

  await updatePendingOperation(operation.operationId, {
    conflict,
    lastError: conflict.message,
    status: 'CONFLICT',
  });

  applyConflictToCache(taskMap, operation, conflict);

  if (operation.taskId) {
    const task = taskMap.get(operation.taskId);
    if (task) {
      await upsertCachedTask(task);
    }
  }
}

async function handleFailedOperation(
  operation: PendingOperation,
  result: SyncOperationResult,
) {
  await updatePendingOperation(operation.operationId, {
    lastError: result.message ?? 'The server could not apply this change.',
    status: 'FAILED',
  });
}

export async function runPendingTaskSync({
  cachedTasks,
  currentSyncMeta,
  executeSyncRequest,
  userId,
}: RunSyncOptions): Promise<SyncManagerResult> {
  const queue = await getPendingOperations(userId);
  const syncAttemptAt = new Date().toISOString();
  const syncingMeta: SyncMetaRecord = {
    ...currentSyncMeta,
    userId,
    lastSyncAttemptAt: syncAttemptAt,
    lastSyncStatus: 'SYNCING',
  };

  await saveSyncMeta(syncingMeta);

  if (queue.length === 0) {
    const idleMeta: SyncMetaRecord = {
      ...syncingMeta,
      lastSyncStatus: 'SYNCED',
    };
    await saveSyncMeta(idleMeta);

    return {
      cachedTasks,
      pendingOperations: [],
      syncMeta: idleMeta,
    };
  }

  await Promise.all(
    queue.map((operation) =>
      updatePendingOperation(operation.operationId, {
        conflict: null,
        lastError: null,
        status: 'SYNCING',
      }),
    ),
  );

  const queuedOperations = queue.map((operation) => ({
    ...operation,
    conflict: null,
    lastError: null,
    status: 'SYNCING' as const,
  }));
  const taskMap = new Map(cachedTasks.map((task) => [task.id, task]));

  try {
    const response = await executeSyncRequest(
      buildSyncRequest(currentSyncMeta.lastSyncAt, queuedOperations),
    );

    const resultsByOperationId = new Map(
      response.data.operations.map((result) => [result.operationId, result]),
    );

    for (const operation of queuedOperations) {
      const result = resultsByOperationId.get(operation.operationId);
      if (!result) {
        await updatePendingOperation(operation.operationId, {
          lastError: 'No sync result was returned for this operation.',
          status: 'FAILED',
        });
        continue;
      }

      if (result.status === 'APPLIED') {
        await handleAppliedOperation(taskMap, operation, result);
        continue;
      }

      if (result.status === 'CONFLICT') {
        await handleConflictOperation(taskMap, operation, result);
        continue;
      }

      await handleFailedOperation(operation, result);
    }

    const remainingOperations = await getPendingOperations(userId);
    const conflictingTaskIds = new Set(
      remainingOperations
        .filter((operation) => operation.status === 'CONFLICT' && operation.taskId)
        .map((operation) => operation.taskId as string),
    );

    for (const changedTask of response.data.changedTasks) {
      mergeServerTaskIntoCache(
        taskMap,
        changedTask,
        conflictingTaskIds.has(changedTask.id),
      );
      await upsertCachedTask(
        conflictingTaskIds.has(changedTask.id)
          ? (taskMap.get(changedTask.id) as Task)
          : normalizeTaskForCache(changedTask),
      );
    }

    const hasConflict = remainingOperations.some(
      (operation) => operation.status === 'CONFLICT',
    );
    const hasFailed = remainingOperations.some(
      (operation) => operation.status === 'FAILED',
    );
    const nextSyncMeta: SyncMetaRecord = {
      ...syncingMeta,
      lastSyncAt: response.serverTime,
      lastSyncStatus: hasConflict
        ? 'CONFLICT'
        : hasFailed
          ? 'FAILED'
          : 'SYNCED',
    };

    await saveSyncMeta(nextSyncMeta);

    return {
      cachedTasks: Array.from(taskMap.values()).sort(
        (left, right) =>
          new Date(
            right.clientUpdatedAt ?? right.updatedAt ?? right.createdAt,
          ).getTime() -
          new Date(
            left.clientUpdatedAt ?? left.updatedAt ?? left.createdAt,
          ).getTime(),
      ),
      pendingOperations: remainingOperations,
      syncMeta: nextSyncMeta,
    };
  } catch {
    await Promise.all(
      queuedOperations.map((operation) =>
        updatePendingOperation(operation.operationId, {
          lastError: 'Sync failed before the server could confirm this change.',
          status: 'FAILED',
        }),
      ),
    );

    const failedMeta: SyncMetaRecord = {
      ...syncingMeta,
      lastSyncStatus: 'FAILED',
    };
    await saveSyncMeta(failedMeta);

    return {
      cachedTasks,
      pendingOperations: await getPendingOperations(userId),
      syncMeta: failedMeta,
    };
  }
}
