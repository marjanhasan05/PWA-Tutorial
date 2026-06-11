import {
  offlineDbStores,
  requestToPromise,
  runOfflineTransaction,
} from './indexedDb';
import type { PendingOperation } from './offlineTypes';

export function generateOperationId() {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return `op_${crypto.randomUUID()}`;
  }

  return `op_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

export async function addPendingOperation(operation: PendingOperation) {
  await runOfflineTransaction(offlineDbStores.queue, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.queue);
    await requestToPromise(store.put(operation));
  });
}

export async function getPendingOperations(userId: string) {
  return runOfflineTransaction(offlineDbStores.queue, 'readonly', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.queue);
    const index = store.index('byUserId');
    const operations = (await requestToPromise(
      index.getAll(IDBKeyRange.only(userId)),
    )) as PendingOperation[];

    return operations.sort(
      (left, right) =>
        new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
    );
  });
}

export async function updatePendingOperation(
  operationId: string,
  changes: Partial<PendingOperation>,
) {
  await runOfflineTransaction(offlineDbStores.queue, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.queue);
    const current = (await requestToPromise(
      store.get(operationId),
    )) as PendingOperation | undefined;

    if (!current) {
      return;
    }

    await requestToPromise(
      store.put({
        ...current,
        ...changes,
      }),
    );
  });
}

export async function removePendingOperation(operationId: string) {
  await runOfflineTransaction(offlineDbStores.queue, 'readwrite', async (_tx, getStore) => {
    const store = getStore(offlineDbStores.queue);
    await requestToPromise(store.delete(operationId));
  });
}
