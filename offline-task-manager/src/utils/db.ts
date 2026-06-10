export interface Task {
  id: string;
  userId?: string;
  title: string;
  description: string;
  status: 'TODO' | 'IN_PROGRESS' | 'DONE';
  priority: 'LOW' | 'MEDIUM' | 'HIGH';
  dueDate: string | null;
  reminderAt: string | null;
  reminderSentAt?: string | null;
  version: number;
  clientCreatedAt: string | null;
  clientUpdatedAt: string | null;
  lastOperationId?: string | null;
  createdAt?: string;
  updatedAt?: string;
  deletedAt?: string | null;
  // Local UI status helpers (e.g. state for in-conflict tasks)
  isOfflineCreated?: boolean;
  isOfflineUpdated?: boolean;
  isOfflineDeleted?: boolean;
  inConflict?: boolean;
  serverTaskForConflict?: Task | null;
}

export interface SyncQueueItem {
  operationId: string;
  type: 'CREATE' | 'UPDATE' | 'DELETE';
  taskId?: string; // present for UPDATE and DELETE
  taskVersion?: number; // version we think we are modifying, crucial for conflicts
  task?: Partial<Task>; // representation of changes
  timestamp: string;
}

export interface AuthSession {
  user: {
    id: string;
    email: string;
    name: string;
    createdAt?: string;
    updatedAt?: string;
  } | null;
  accessToken: string | null;
  refreshToken: string | null;
  sessionExpiresAt: string | null;
}

class OfflineDB {
  private dbName = 'OfflineTaskManagerDB';
  private dbVersion = 1;
  private dbPromise: Promise<IDBDatabase> | null = null;

  constructor() {
    this.initDB();
  }

  private initDB(): Promise<IDBDatabase> {
    if (this.dbPromise) return this.dbPromise;

    this.dbPromise = new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBOpenDBRequest).error);
        reject((event.target as IDBOpenDBRequest).error);
      };

      request.onsuccess = (event) => {
        resolve((event.target as IDBOpenDBRequest).result);
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Tasks store
        if (!db.objectStoreNames.contains('tasks')) {
          db.createObjectStore('tasks', { keyPath: 'id' });
        }

        // Sync queue store
        if (!db.objectStoreNames.contains('syncQueue')) {
          db.createObjectStore('syncQueue', { keyPath: 'operationId' });
        }

        // Key-value store
        if (!db.objectStoreNames.contains('keyValue')) {
          db.createObjectStore('keyValue', { keyPath: 'key' });
        }
      };
    });

    return this.dbPromise;
  }

  private async getStore(
    storeName: 'tasks' | 'syncQueue' | 'keyValue',
    mode: IDBTransactionMode = 'readonly'
  ): Promise<{ store: IDBObjectStore; transaction: IDBTransaction }> {
    const db = await this.initDB();
    const transaction = db.transaction(storeName, mode);
    const store = transaction.objectStore(storeName);
    return { store, transaction };
  }

  // --- KeyValue Store Actions (Auth, Session, Sync Info) ---
  async getKeyValue<T>(key: string): Promise<T | null> {
    try {
      const { store } = await this.getStore('keyValue', 'readonly');
      return new Promise<T | null>((resolve) => {
        const request = store.get(key);
        request.onsuccess = () => {
          resolve(request.result ? (request.result.value as T) : null);
        };
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      console.error('Error on getKeyValue', e);
      return null;
    }
  }

  async setKeyValue<T>(key: string, value: T): Promise<void> {
    try {
      const { store } = await this.getStore('keyValue', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.put({ key, value });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error on setKeyValue', e);
    }
  }

  async deleteKeyValue(key: string): Promise<void> {
    try {
      const { store } = await this.getStore('keyValue', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(key);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error on deleteKeyValue', e);
    }
  }

  // --- Tasks Cache Actions ---
  async getTasks(): Promise<Task[]> {
    try {
      const { store } = await this.getStore('tasks', 'readonly');
      return new Promise<Task[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          resolve(request.result || []);
        };
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      console.error('Error getting tasks from IndexedDB', e);
      return [];
    }
  }

  async getTask(id: string): Promise<Task | null> {
    try {
      const { store } = await this.getStore('tasks', 'readonly');
      return new Promise<Task | null>((resolve) => {
        const request = store.get(id);
        request.onsuccess = () => {
          resolve(request.result || null);
        };
        request.onerror = () => resolve(null);
      });
    } catch (e) {
      console.error('Error getting task', e);
      return null;
    }
  }

  async putTask(task: Task): Promise<void> {
    try {
      const { store } = await this.getStore('tasks', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.put(task);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error putting task', e);
    }
  }

  async putTasks(tasks: Task[]): Promise<void> {
    if (tasks.length === 0) return;
    try {
      const db = await this.initDB();
      const transaction = db.transaction('tasks', 'readwrite');
      const store = transaction.objectStore('tasks');
      
      const promises = tasks.map((task) => {
        return new Promise<void>((resolve, reject) => {
          const req = store.put(task);
          req.onsuccess = () => resolve();
          req.onerror = (e) => reject((e.target as IDBRequest).error);
        });
      });
      await Promise.all(promises);
    } catch (e) {
      console.error('Error putting bulk tasks', e);
    }
  }

  async deleteTask(id: string): Promise<void> {
    try {
      const { store } = await this.getStore('tasks', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(id);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error deleting task', e);
    }
  }

  async clearTasks(): Promise<void> {
    try {
      const { store } = await this.getStore('tasks', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error clearing tasks', e);
    }
  }

  // --- Sync Queue Actions ---
  async getSyncQueue(): Promise<SyncQueueItem[]> {
    try {
      const { store } = await this.getStore('syncQueue', 'readonly');
      return new Promise<SyncQueueItem[]>((resolve) => {
        const request = store.getAll();
        request.onsuccess = () => {
          const items = request.result || [];
          // Sort items chronologically by timestamp
          items.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
          resolve(items);
        };
        request.onerror = () => resolve([]);
      });
    } catch (e) {
      console.error('Error getting syncQueue', e);
      return [];
    }
  }

  async addSyncOperation(op: SyncQueueItem): Promise<void> {
    try {
      const { store } = await this.getStore('syncQueue', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.put(op);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error adding sync operation', e);
    }
  }

  async deleteSyncOperation(operationId: string): Promise<void> {
    try {
      const { store } = await this.getStore('syncQueue', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.delete(operationId);
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error deleting sync operation', e);
    }
  }

  async clearSyncQueue(): Promise<void> {
    try {
      const { store } = await this.getStore('syncQueue', 'readwrite');
      return new Promise<void>((resolve, reject) => {
        const request = store.clear();
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject((e.target as IDBRequest).error);
      });
    } catch (e) {
      console.error('Error clearing sync queue', e);
    }
  }
}

export const offlineDB = new OfflineDB();
