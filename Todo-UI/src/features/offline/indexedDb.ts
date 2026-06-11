const DB_NAME = 'todo-ui-offline';
const DB_VERSION = 1;
const TASK_STORE = 'cachedTasks';
const QUEUE_STORE = 'pendingOperations';
const META_STORE = 'syncMeta';

export const offlineDbStores = {
  meta: META_STORE,
  queue: QUEUE_STORE,
  tasks: TASK_STORE,
} as const;

function promisifyRequest<T>(request: IDBRequest<T>) {
  return new Promise<T>((resolve, reject) => {
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export function openOfflineDb() {
  return new Promise<IDBDatabase>((resolve, reject) => {
    const request = window.indexedDB.open(DB_NAME, DB_VERSION);

    request.onupgradeneeded = () => {
      const database = request.result;

      if (!database.objectStoreNames.contains(TASK_STORE)) {
        const tasksStore = database.createObjectStore(TASK_STORE, {
          keyPath: 'id',
        });
        tasksStore.createIndex('byUserId', 'userId', { unique: false });
      }

      if (!database.objectStoreNames.contains(QUEUE_STORE)) {
        const queueStore = database.createObjectStore(QUEUE_STORE, {
          keyPath: 'operationId',
        });
        queueStore.createIndex('byUserId', 'userId', { unique: false });
        queueStore.createIndex('byTaskId', 'taskId', { unique: false });
      }

      if (!database.objectStoreNames.contains(META_STORE)) {
        database.createObjectStore(META_STORE, {
          keyPath: 'userId',
        });
      }
    };

    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

export async function runOfflineTransaction<T>(
  storeNames: string | string[],
  mode: IDBTransactionMode,
  callback: (
    transaction: IDBTransaction,
    getStore: (storeName: string) => IDBObjectStore,
  ) => Promise<T> | T,
) {
  const database = await openOfflineDb();

  return new Promise<T>((resolve, reject) => {
    const transaction = database.transaction(storeNames, mode);
    const getStore = (storeName: string) => transaction.objectStore(storeName);

    let result: T;

    Promise.resolve(callback(transaction, getStore))
      .then((value) => {
        result = value;
      })
      .catch((error) => {
        reject(error);
        transaction.abort();
      });

    transaction.oncomplete = () => {
      resolve(result!);
      database.close();
    };
    transaction.onerror = () => {
      reject(transaction.error);
      database.close();
    };
    transaction.onabort = () => {
      reject(transaction.error ?? new Error('IndexedDB transaction aborted.'));
      database.close();
    };
  });
}

export function requestToPromise<T>(request: IDBRequest<T>) {
  return promisifyRequest(request);
}

export async function clearOfflineDataForUser(userId: string) {
  await runOfflineTransaction(
    [TASK_STORE, QUEUE_STORE, META_STORE],
    'readwrite',
    async (_transaction, getStore) => {
      const tasksStore = getStore(TASK_STORE);
      const queueStore = getStore(QUEUE_STORE);
      const metaStore = getStore(META_STORE);

      const taskIndex = tasksStore.index('byUserId');
      const queueIndex = queueStore.index('byUserId');

      const taskRecords = await requestToPromise(taskIndex.getAll(IDBKeyRange.only(userId)));
      const queueRecords = await requestToPromise(
        queueIndex.getAll(IDBKeyRange.only(userId)),
      );

      await Promise.all(
        taskRecords.map((task) =>
          requestToPromise(tasksStore.delete((task as { id: string }).id)),
        ),
      );

      await Promise.all(
        queueRecords.map((operation) =>
          requestToPromise(
            queueStore.delete((operation as { operationId: string }).operationId),
          ),
        ),
      );

      await requestToPromise(metaStore.delete(userId));
    },
  );
}
