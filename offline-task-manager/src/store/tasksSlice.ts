import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { apiFetch, ApiResponse, Priority, TaskStatus } from '../utils/api';
import { offlineDB, Task, SyncQueueItem } from '../utils/db';

interface TasksState {
  items: Task[];
  totalItems: number;
  currentPage: number;
  totalPages: number;
  limit: number;
  
  isListLoading: boolean;
  listError: string | null;

  isSyncing: boolean;
  syncSuccessMessage: string | null;
  syncError: string | null;
  
  isOnline: boolean;
  lastSyncAt: string | null;
  syncQueueCount: number;

  searchQuery: string;
  statusFilter: TaskStatus | 'ALL';
  priorityFilter: Priority | 'ALL';
  sortBy: 'dueDate' | 'createdAt' | 'priority' | 'title';
  sortOrder: 'asc' | 'desc';
}

const initialState: TasksState = {
  items: [],
  totalItems: 0,
  currentPage: 1,
  totalPages: 1,
  limit: 10,
  
  isListLoading: false,
  listError: null,

  isSyncing: false,
  syncSuccessMessage: null,
  syncError: null,
  
  isOnline: typeof navigator !== 'undefined' ? navigator.onLine : true,
  lastSyncAt: null,
  syncQueueCount: 0,

  searchQuery: '',
  statusFilter: 'ALL',
  priorityFilter: 'ALL',
  sortBy: 'createdAt',
  sortOrder: 'desc',
};

// Generates an UUID for tasks created offline
function generateUUID() {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return 'local-' + Date.now() + '-' + Math.random().toString(36).substring(2, 11);
}

// Helpers for offline local item filtering, searching, sorting and pagination
function filterAndSortTasksInMemory(tasks: Task[], state: TasksState) {
  // Exclude tasks flagged as deleted locally offline
  let list = tasks.filter(t => !t.isOfflineDeleted && !t.deletedAt);

  // Search
  if (state.searchQuery) {
    const q = state.searchQuery.toLowerCase();
    list = list.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        (t.description && t.description.toLowerCase().includes(q))
    );
  }

  // Status
  if (state.statusFilter !== 'ALL') {
    list = list.filter((t) => t.status === state.statusFilter);
  }

  // Priority
  if (state.priorityFilter !== 'ALL') {
    list = list.filter((t) => t.priority === state.priorityFilter);
  }

  // Sort
  list.sort((a, b) => {
    let valA: any = a[state.sortBy];
    let valB: any = b[state.sortBy];

    // Handle null dates/priorities
    if (valA === null || valA === undefined) valA = '';
    if (valB === null || valB === undefined) valB = '';

    if (state.sortBy === 'priority') {
      const priorityMap = { HIGH: 3, MEDIUM: 2, LOW: 1 };
      valA = priorityMap[a.priority] || 0;
      valB = priorityMap[b.priority] || 0;
    }

    if (valA < valB) return state.sortOrder === 'asc' ? -1 : 1;
    if (valA > valB) return state.sortOrder === 'asc' ? 1 : -1;
    return 0;
  });

  return list;
}

// --- Thunks ---

// Initialize offline states & listeners
export const initializeAppStore = createAsyncThunk(
  'tasks/initialize',
  async (_, { dispatch }) => {
    // Load last sync time
    const lastSyncAt = await offlineDB.getKeyValue<string>('last_sync_at');
    
    // Load initial tasks into storage
    const localTasks = await offlineDB.getTasks();
    const queue = await offlineDB.getSyncQueue();

    // Setup network listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('online', () => {
        dispatch(setOnlineStatus(true));
        dispatch(syncDataWithServer());
      });
      window.addEventListener('offline', () => {
        dispatch(setOnlineStatus(false));
      });
    }

    return {
      lastSyncAt,
      syncQueueCount: queue.length,
      localTasks,
    };
  }
);

// Fetch Tasks from API (network Mode) with IDB Fallback
export const fetchTasks = createAsyncThunk(
  'tasks/fetch',
  async (_, { getState, rejectWithValue }) => {
    const state = getState() as { tasks: TasksState; auth: { accessToken: string | null } };
    const { searchQuery, statusFilter, priorityFilter, sortBy, sortOrder, currentPage, limit, isOnline } = state.tasks;
    const token = state.auth.accessToken;

    try {
      if (isOnline && token) {
        // Query Params construction
        const params = new URLSearchParams({
          page: currentPage.toString(),
          limit: limit.toString(),
          sortBy,
          sortOrder,
        });

        if (searchQuery) params.append('search', searchQuery);
        if (statusFilter !== 'ALL') params.append('status', statusFilter);
        if (priorityFilter !== 'ALL') params.append('priority', priorityFilter);

        const result = await apiFetch<any>(`/tasks?${params.toString()}`, {
          method: 'GET',
          token,
        });

        if (result.success && result.data) {
          // Bulk store synced items to IndexedDB
          await offlineDB.putTasks(result.data.items);
          const queue = await offlineDB.getSyncQueue();
          return {
            items: result.data.items,
            meta: result.data.meta,
            syncQueueCount: queue.length,
            fromNetwork: true,
          };
        }
      }

      // Offline Fallback or failure -> read from IndexedDB
      const allCachedTasks = await offlineDB.getTasks();
      const filtered = filterAndSortTasksInMemory(allCachedTasks, state.tasks);

      // Manual Pagination emulation
      const total = filtered.length;
      const totalPages = Math.ceil(total / limit) || 1;
      const offset = (currentPage - 1) * limit;
      const paginatedItems = filtered.slice(offset, offset + limit);
      const queue = await offlineDB.getSyncQueue();

      return {
        items: paginatedItems,
        meta: {
          page: currentPage,
          limit,
          total,
          totalPages,
        },
        syncQueueCount: queue.length,
        fromNetwork: false,
      };
    } catch (error: any) {
      // If error (e.g. network timeout), load from cache gracefully
      try {
        const allCachedTasks = await offlineDB.getTasks();
        const filtered = filterAndSortTasksInMemory(allCachedTasks, state.tasks);
        const total = filtered.length;
        const totalPages = Math.ceil(total / limit) || 1;
        const offset = (currentPage - 1) * limit;
        const paginatedItems = filtered.slice(offset, offset + limit);
        const queue = await offlineDB.getSyncQueue();
        return {
          items: paginatedItems,
          meta: {
            page: currentPage,
            limit,
            total,
            totalPages,
          },
          syncQueueCount: queue.length,
          fromNetwork: false,
        };
      } catch (dbErr) {
        return rejectWithValue(error.message || 'Fetch failed');
      }
    }
  }
);

// Offline-first Creation Thunk
export const createTask = createAsyncThunk(
  'tasks/create',
  async (taskInput: Omit<Task, 'id' | 'version' | 'clientCreatedAt' | 'clientUpdatedAt'>, { getState, dispatch }) => {
    const state = getState() as { auth: { user: { id: string } | null } };
    const userId = state.auth.user?.id;

    const opId = 'op-create-' + Date.now();
    const now = new Date().toISOString();

    const newTask: Task = {
      ...taskInput,
      id: generateUUID(),
      userId,
      version: 1,
      clientCreatedAt: now,
      clientUpdatedAt: now,
      createdAt: now,
      updatedAt: now,
      isOfflineCreated: true,
      lastOperationId: opId,
    };

    // 1. Write to local Cache Store
    await offlineDB.putTask(newTask);

    // 2. Queue the local Operation
    const syncOp: SyncQueueItem = {
      operationId: opId,
      type: 'CREATE',
      task: {
        title: newTask.title,
        description: newTask.description,
        status: newTask.status,
        priority: newTask.priority,
        dueDate: newTask.dueDate,
        reminderAt: newTask.reminderAt,
        clientCreatedAt: now,
        clientUpdatedAt: now,
      },
      timestamp: now,
    };
    await offlineDB.addSyncOperation(syncOp);

    // 3. Trigger immediate sync attempt in the background if online
    dispatch(syncDataWithServer());

    return newTask;
  }
);

// Offline-first Edit Thunk
export const updateTask = createAsyncThunk(
  'tasks/update',
  async ({ id, updates }: { id: string; updates: Partial<Task> }, { getState, dispatch }) => {
    const now = new Date().toISOString();
    const existing = await offlineDB.getTask(id);

    if (!existing) {
      throw new Error('Task to update not found in local DB');
    }

    const updatedTask: Task = {
      ...existing,
      ...updates,
      clientUpdatedAt: now,
      updatedAt: now,
    };

    // If it's already an un-synced offline task, we can just update the task record inside DB
    if (existing.isOfflineCreated) {
      updatedTask.isOfflineCreated = true;
    } else {
      updatedTask.isOfflineUpdated = true;
    }

    // 1. Save to local Cache Store
    await offlineDB.putTask(updatedTask);

    // 2. Queue transaction
    const opId = 'op-update-' + Date.now();
    if (existing.isOfflineCreated && existing.lastOperationId) {
      // Optimisation: update the initial CREATE operation directly inside IndexedDB so we don't send multi ops
      const ops = await offlineDB.getSyncQueue();
      const createOp = ops.find(o => o.operationId === existing.lastOperationId);
      if (createOp) {
        createOp.task = {
          ...createOp.task,
          ...updates,
          clientUpdatedAt: now,
        };
        await offlineDB.addSyncOperation(createOp);
      } else {
        const syncOp: SyncQueueItem = {
          operationId: opId,
          type: 'UPDATE',
          taskId: id,
          taskVersion: existing.version,
          task: { ...updates, clientUpdatedAt: now },
          timestamp: now,
        };
        await offlineDB.addSyncOperation(syncOp);
      }
    } else {
      const syncOp: SyncQueueItem = {
        operationId: opId,
        type: 'UPDATE',
        taskId: id,
        taskVersion: existing.version,
        task: { ...updates, clientUpdatedAt: now },
        timestamp: now,
      };
      await offlineDB.addSyncOperation(syncOp);
    }

    dispatch(syncDataWithServer());
    return updatedTask;
  }
);

// Offline-first Deletion Thunk
export const deleteTask = createAsyncThunk(
  'tasks/delete',
  async (id: string, { dispatch }) => {
    const now = new Date().toISOString();
    const existing = await offlineDB.getTask(id);

    if (!existing) {
      throw new Error('Task not found');
    }

    const opId = 'op-delete-' + Date.now();

    // 1. Handle un-synced task deletion trivially
    if (existing.isOfflineCreated && existing.lastOperationId) {
      await offlineDB.deleteTask(id);
      await offlineDB.deleteSyncOperation(existing.lastOperationId);
      dispatch(fetchTasks());
      return id;
    }

    // 2. Otherwise flag as offline deleted
    const markedDeletedTask: Task = {
      ...existing,
      isOfflineDeleted: true,
      deletedAt: now,
    };
    await offlineDB.putTask(markedDeletedTask);

    // Queue operation
    const syncOp: SyncQueueItem = {
      operationId: opId,
      type: 'DELETE',
      taskId: id,
      taskVersion: existing.version,
      timestamp: now,
    };
    await offlineDB.addSyncOperation(syncOp);

    dispatch(syncDataWithServer());
    return id;
  }
);

// Resolve Conflict (Client makes choice)
export const resolveConflict = createAsyncThunk(
  'tasks/resolveConflict',
  async (
    { taskId, resolution, mergedTask }: { taskId: string; resolution: 'keep_local' | 'accept_server' | 'merge'; mergedTask?: Partial<Task> },
    { getState, dispatch }
  ) => {
    const task = await offlineDB.getTask(taskId);
    if (!task || !task.serverTaskForConflict) return;

    const serverTask = task.serverTaskForConflict;

    if (resolution === 'accept_server') {
      // Simply delete conflict banners, sync queue logs, and overwrite local task with server task
      const cleanedServerTask: Task = {
        ...serverTask,
        inConflict: false,
        serverTaskForConflict: null,
      };
      await offlineDB.putTask(cleanedServerTask);
    } else if (resolution === 'keep_local' || resolution === 'merge') {
      const baseTask = resolution === 'keep_local' ? task : { ...task, ...mergedTask };
      
      // Keep local choice -> We prepare it with the latest server version as its based version
      const forceTask: Task = {
        ...baseTask,
        version: serverTask.version, // bump version to server's level to bypass conflict checks next time
        inConflict: false,
        serverTaskForConflict: null,
        isOfflineUpdated: true,
      };
      
      await offlineDB.putTask(forceTask);

      // Queue an UPDATE operation with the updated base
      const opId = 'op-update-resolve-' + Date.now();
      const now = new Date().toISOString();
      const syncOp: SyncQueueItem = {
        operationId: opId,
        type: 'UPDATE',
        taskId: taskId,
        taskVersion: serverTask.version,
        task: {
          title: forceTask.title,
          description: forceTask.description,
          status: forceTask.status,
          priority: forceTask.priority,
          dueDate: forceTask.dueDate,
          reminderAt: forceTask.reminderAt,
          clientUpdatedAt: now,
        },
        timestamp: now,
      };
      await offlineDB.addSyncOperation(syncOp);
    }

    dispatch(syncDataWithServer());
  }
);

// Central Offline Integration syncing endpoint
export const syncDataWithServer = createAsyncThunk(
  'tasks/syncData',
  async (_, { getState, dispatch, rejectWithValue }) => {
    const state = getState() as { tasks: TasksState; auth: { accessToken: string | null } };
    const token = state.auth.accessToken;
    const { isOnline, lastSyncAt, isSyncing } = state.tasks;

    if (!isOnline || !token || isSyncing) {
      return rejectWithValue('Cannot sync currently (either offline or sync active)');
    }

    try {
      const operations = await offlineDB.getSyncQueue();
      
      // Even if there are no local operations in queue, we still sync/pull remote changes
      const payload = {
        lastSyncAt,
        operations: operations.map(op => ({
          operationId: op.operationId,
          type: op.type,
          ...(op.taskId ? { taskId: op.taskId } : {}),
          ...(op.taskVersion ? { taskVersion: op.taskVersion } : {}),
          ...(op.task ? { task: op.task } : {}),
        })),
      };

      const result = await apiFetch<{
        operations: Array<{
          operationId: string;
          type: 'CREATE' | 'UPDATE' | 'DELETE';
          status: 'APPLIED' | 'CONFLICT' | 'REJECTED';
          task?: any;
          conflict?: {
            message: string;
            serverTask: any;
          };
        }>;
        changedTasks: any[];
      }>('/sync', {
        method: 'POST',
        token,
        body: JSON.stringify(payload),
      });

      if (result.success && result.data) {
        const syncResponse = result.data;
        const appliedOps = syncResponse.operations || [];
        const changedTasks = syncResponse.changedTasks || [];

        // 1. Process local synced operations
        for (const opRes of appliedOps) {
          const originalOp = operations.find(o => o.operationId === opRes.operationId);
          
          if (opRes.status === 'APPLIED') {
            // Delete operation from Queue
            await offlineDB.deleteSyncOperation(opRes.operationId);

            // If CREATE, the server might have assigned a persistent Server UUID/UserID. Match it locally!
            if (opRes.type === 'CREATE' && opRes.task) {
              if (originalOp && originalOp.task) {
                // If the local ID was temp, we want to migrate
                const originalTempId = operations.find(o => o.operationId === opRes.operationId)?.taskId;
                if (originalTempId) {
                  await offlineDB.deleteTask(originalTempId);
                }
              }
              // Place final server-approved task in cache, with markers removed
              const completedTask: Task = {
                ...opRes.task,
                isOfflineCreated: false,
                isOfflineUpdated: false,
                isOfflineDeleted: false,
                inConflict: false,
                serverTaskForConflict: null,
              };
              await offlineDB.putTask(completedTask);
            } else if (opRes.type === 'UPDATE' && opRes.task) {
              const completedTask: Task = {
                ...opRes.task,
                isOfflineUpdated: false,
                inConflict: false,
                serverTaskForConflict: null,
              };
              await offlineDB.putTask(completedTask);
            } else if (opRes.type === 'DELETE') {
              const deletedTaskId = originalOp?.taskId;
              if (deletedTaskId) {
                await offlineDB.deleteTask(deletedTaskId);
              }
            }
          } else if (opRes.status === 'CONFLICT') {
            // Set conflict marker on local cache, preserving original intent so user can choose resolution
            const taskId = opRes.conflict?.serverTask?.id || originalOp?.taskId;
            if (taskId) {
              const existing = await offlineDB.getTask(taskId);
              if (existing) {
                const conflictedTask: Task = {
                  ...existing,
                  inConflict: true,
                  serverTaskForConflict: opRes.conflict?.serverTask || null,
                };
                await offlineDB.putTask(conflictedTask);
              }
            }
          }
        }

        // 2. Fetch/Ingest Server Modified tasks
        for (const extTask of changedTasks) {
          const locallyCached = await offlineDB.getTask(extTask.id);
          // If task doesn't exist locally or does not conflict, safely save it!
          if (!locallyCached || (!locallyCached.isOfflineUpdated && !locallyCached.inConflict)) {
            if (extTask.deletedAt) {
              await offlineDB.deleteTask(extTask.id);
            } else {
              await offlineDB.putTask({
                ...extTask,
                isOfflineCreated: false,
                isOfflineUpdated: false,
                isOfflineDeleted: false,
                inConflict: false,
                serverTaskForConflict: null,
              });
            }
          }
        }

        // Write last synced time
        const newSyncTime = result.serverTime || new Date().toISOString();
        await offlineDB.setKeyValue('last_sync_at', newSyncTime);

        const currentQueue = await offlineDB.getSyncQueue();
        
        dispatch(fetchTasks());

        return {
          lastSyncAt: newSyncTime,
          syncQueueCount: currentQueue.length,
          message: appliedOps.length > 0 ? `Successfully synchronized ${appliedOps.length} updates.` : 'Tasks up to date.',
        };
      }
      
      return rejectWithValue(result.message || 'Sync response was invalid');
    } catch (err: any) {
      console.error('Task syncing failed:', err);
      // Fail gracefully: UI stays operational
      const queue = await offlineDB.getSyncQueue();
      return rejectWithValue({
        message: err.message || 'Synchronization failed',
        syncQueueCount: queue.length,
      });
    }
  }
);


const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setOnlineStatus(state, action: PayloadAction<boolean>) {
      state.isOnline = action.payload;
    },
    setSearchQuery(state, action: PayloadAction<string>) {
      state.searchQuery = action.payload;
      state.currentPage = 1;
    },
    setStatusFilter(state, action: PayloadAction<TaskStatus | 'ALL'>) {
      state.statusFilter = action.payload;
      state.currentPage = 1;
    },
    setPriorityFilter(state, action: PayloadAction<Priority | 'ALL'>) {
      state.priorityFilter = action.payload;
      state.currentPage = 1;
    },
    setSortOptions(state, action: PayloadAction<{ sortBy: TasksState['sortBy']; sortOrder: TasksState['sortOrder'] }>) {
      state.sortBy = action.payload.sortBy;
      state.sortOrder = action.payload.sortOrder;
    },
    setCurrentPage(state, action: PayloadAction<number>) {
      state.currentPage = action.payload;
    },
    clearSyncResult(state) {
      state.syncSuccessMessage = null;
      state.syncError = null;
    }
  },
  extraReducers: (builder) => {
    // Initialize
    builder.addCase(initializeAppStore.fulfilled, (state, action) => {
      state.lastSyncAt = action.payload.lastSyncAt;
      state.syncQueueCount = action.payload.syncQueueCount;
    });

    // Fetch Tasks list
    builder.addCase(fetchTasks.pending, (state) => {
      state.isListLoading = true;
      state.listError = null;
    });
    builder.addCase(fetchTasks.fulfilled, (state, action) => {
      state.isListLoading = false;
      state.items = action.payload.items;
      state.totalItems = action.payload.meta.total;
      state.totalPages = action.payload.meta.totalPages;
      state.currentPage = action.payload.meta.page;
      state.syncQueueCount = action.payload.syncQueueCount;
    });
    builder.addCase(fetchTasks.rejected, (state, action) => {
      state.isListLoading = false;
      state.listError = action.payload as string || 'An error occurred during task retrieval';
    });

    // Create Task Optimistic update
    builder.addCase(createTask.fulfilled, (state, action: PayloadAction<Task>) => {
      // Refresh current page view dynamically
      state.syncQueueCount += 1;
    });

    // Update Task Optimistic update
    builder.addCase(updateTask.fulfilled, (state, action: PayloadAction<Task>) => {
      const idx = state.items.findIndex(t => t.id === action.payload.id);
      if (idx !== -1) {
        state.items[idx] = action.payload;
      }
      state.syncQueueCount += 1;
    });

    // Delete Task Optimistic update
    builder.addCase(deleteTask.fulfilled, (state, action: PayloadAction<string>) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      state.syncQueueCount += 1;
    });

    // Sync logic
    builder.addCase(syncDataWithServer.pending, (state) => {
      state.isSyncing = true;
      state.syncError = null;
      state.syncSuccessMessage = null;
    });
    builder.addCase(syncDataWithServer.fulfilled, (state, action) => {
      state.isSyncing = false;
      state.lastSyncAt = action.payload.lastSyncAt;
      state.syncQueueCount = action.payload.syncQueueCount;
      state.syncSuccessMessage = action.payload.message;
    });
    builder.addCase(syncDataWithServer.rejected, (state, action: any) => {
      state.isSyncing = false;
      if (action.payload && typeof action.payload === 'object') {
        state.syncError = action.payload.message;
        state.syncQueueCount = action.payload.syncQueueCount;
      } else {
        state.syncError = action.payload || 'Failed to synchronize with server';
      }
    });
  }
});

export const {
  setOnlineStatus,
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setSortOptions,
  setCurrentPage,
  clearSyncResult
} = tasksSlice.actions;

export default tasksSlice.reducer;
