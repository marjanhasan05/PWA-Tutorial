import type { Task } from '../tasks/taskTypes';
import {
  offlineDbStores,
  requestToPromise,
  runOfflineTransaction,
} from './indexedDb';
import type { PendingOperation } from './offlineTypes';

function sortTasks(tasks: Task[]) {
  return [...tasks].sort((left, right) => {
    const leftDate = left.clientUpdatedAt ?? left.updatedAt ?? left.createdAt;
    const rightDate =
      right.clientUpdatedAt ?? right.updatedAt ?? right.createdAt;

    return new Date(rightDate).getTime() - new Date(leftDate).getTime();
  });
}

export async function getCachedTasks(userId: string) {
  return runOfflineTransaction(offlineDbStores.tasks, 'readonly', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.tasks);
    const index = store.index('byUserId');
    const tasks = (await requestToPromise(
      index.getAll(IDBKeyRange.only(userId)),
    )) as Task[];

    return sortTasks(tasks);
  });
}

export async function saveCachedTasks(userId: string, tasks: Task[]) {
  await runOfflineTransaction(offlineDbStores.tasks, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.tasks);

    await Promise.all(
      tasks
        .filter((task) => task.userId === userId)
        .map((task) => requestToPromise(store.put(task))),
    );
  });
}

export async function upsertCachedTask(task: Task) {
  await runOfflineTransaction(offlineDbStores.tasks, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.tasks);
    await requestToPromise(store.put(task));
  });
}

export async function removeCachedTask(taskId: string) {
  await runOfflineTransaction(offlineDbStores.tasks, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.tasks);
    await requestToPromise(store.delete(taskId));
  });
}

export function applyPendingOperationsToTasks(
  tasks: Task[],
  operations: PendingOperation[],
) {
  const taskMap = new Map(tasks.map((task) => [task.id, task]));

  for (const operation of operations) {
    if (operation.type === 'CREATE' && operation.taskPayload) {
      const createTask = {
        ...(operation.taskPayload as Task),
        inConflict: operation.status === 'CONFLICT',
      };
      taskMap.set(createTask.id, createTask);
      continue;
    }

    if (!operation.taskId) {
      continue;
    }

    const existingTask = taskMap.get(operation.taskId);

    if (operation.type === 'UPDATE' && existingTask) {
      taskMap.set(operation.taskId, {
        ...existingTask,
        ...operation.taskPayload,
        inConflict: operation.status === 'CONFLICT' || existingTask.inConflict,
      });
      continue;
    }

    if (operation.type === 'DELETE') {
      if (existingTask) {
        taskMap.set(operation.taskId, {
          ...existingTask,
          deletedAt:
            operation.taskPayload?.deletedAt ??
            existingTask.deletedAt ??
            operation.createdAt,
          inConflict: operation.status === 'CONFLICT' || existingTask.inConflict,
        });
      }
    }
  }

  return sortTasks(Array.from(taskMap.values()));
}
