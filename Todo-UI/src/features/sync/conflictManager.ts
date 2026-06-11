import type { PendingOperation } from '../offline/offlineTypes';
import { removeCachedTask, upsertCachedTask } from '../offline/taskCache';
import {
  removePendingOperation,
  updatePendingOperation,
} from '../offline/syncQueue';
import type { Task } from '../tasks/taskTypes';

export type ConflictResolutionAction =
  | 'keep_server'
  | 'retry_local'
  | 'dismiss_safe';

export type ConflictItem = {
  operationId: string;
  operationType: PendingOperation['type'];
  taskId?: string;
  taskTitle: string;
  localIntendedChange: Partial<Task> | null;
  localTask: Task | null;
  message: string;
  serverTask: Task | null;
  canDismissSafely: boolean;
};

function normalizeServerTask(task: Task): Task {
  return {
    ...task,
    inConflict: false,
    isOfflineCreated: false,
    isOfflineDeleted: false,
    isOfflineUpdated: false,
    lastOperationId: null,
    serverTaskForConflict: null,
  };
}

export function getConflictItems(
  pendingOperations: PendingOperation[],
  cachedTasks: Task[],
): ConflictItem[] {
  const cachedTaskMap = new Map(cachedTasks.map((task) => [task.id, task]));

  return pendingOperations
    .filter((operation) => operation.status === 'CONFLICT')
    .map((operation) => {
      const localTask = operation.taskId
        ? cachedTaskMap.get(operation.taskId) ?? null
        : null;
      const serverTask = operation.conflict?.serverTask
        ? ({
            ...(localTask ?? {}),
            ...operation.conflict.serverTask,
          } as Task)
        : localTask?.serverTaskForConflict ?? null;
      const taskTitle =
        operation.taskPayload?.title ??
        localTask?.title ??
        serverTask?.title ??
        'Untitled task';

      return {
        operationId: operation.operationId,
        operationType: operation.type,
        taskId: operation.taskId,
        taskTitle,
        localIntendedChange: operation.taskPayload ?? null,
        localTask,
        message:
          operation.conflict?.message ??
          operation.lastError ??
          'This offline change conflicts with the latest server version.',
        serverTask,
        canDismissSafely: operation.type === 'DELETE',
      };
    });
}

export async function keepServerVersion(conflict: ConflictItem) {
  await removePendingOperation(conflict.operationId);

  if (conflict.serverTask) {
    await upsertCachedTask(normalizeServerTask(conflict.serverTask));
    return;
  }

  if (conflict.taskId) {
    await removeCachedTask(conflict.taskId);
  }
}

export async function retryLocalConflict(conflict: ConflictItem) {
  const now = new Date().toISOString();
  const nextVersion = conflict.serverTask?.version;

  await updatePendingOperation(conflict.operationId, {
    conflict: null,
    createdAt: now,
    lastError: null,
    status: 'PENDING',
    taskVersion: typeof nextVersion === 'number' ? nextVersion : undefined,
  });

  if (!conflict.localTask) {
    return;
  }

  const updatedLocalTask: Task = {
    ...conflict.localTask,
    inConflict: false,
    serverTaskForConflict: null,
    updatedAt: now,
    clientUpdatedAt: conflict.localTask.clientUpdatedAt ?? now,
    version: typeof nextVersion === 'number' ? nextVersion : conflict.localTask.version,
  };

  await upsertCachedTask(updatedLocalTask);
}

export async function dismissConflictSafely(conflict: ConflictItem) {
  if (!conflict.canDismissSafely) {
    throw new Error('This conflict cannot be dismissed safely.');
  }

  await keepServerVersion(conflict);
}
