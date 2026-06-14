import React from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from './app/hooks';
import ConflictModal from './components/ConflictModal';
import TaskModal from './components/TaskModal';
import { baseApi } from './features/api/baseApi';
import {
  useLazyGetCurrentUserQuery,
  useLogoutMutation,
} from './features/auth/authApi';
import { clearAuth, finishSessionCheck, setUser } from './features/auth/authSlice';
import {
  applyPendingOperationsToTasks,
  getCachedTasks,
  removeCachedTask,
  saveCachedTasks,
  upsertCachedTask,
} from './features/offline/taskCache';
import {
  DEFAULT_SYNC_META,
  type PendingOperation,
  type SyncMetaRecord,
  type TaskSyncBadgeState,
} from './features/offline/offlineTypes';
import {
  addPendingOperation,
  generateOperationId,
  getPendingOperations,
  removePendingOperation,
  updatePendingOperation,
} from './features/offline/syncQueue';
import { getSyncMeta, saveSyncMeta } from './features/offline/syncMeta';
import {
  dismissConflictSafely,
  getConflictItems,
  keepServerVersion,
  retryLocalConflict,
  type ConflictItem,
  type ConflictResolutionAction,
} from './features/sync/conflictManager';
import { useSync } from './features/sync/useSync';
import {
  DEFAULT_TASK_LIST_META,
  DEFAULT_TASK_PAGE_SIZE,
  type Task,
  type TaskFormValues,
  type TaskSortBy,
  type TaskSortOrder,
  type TaskSortValue,
  type TaskStatus,
} from './features/tasks/taskTypes';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from './features/tasks/tasksApi';
import useOnlineStatus from './hooks/useOnlineStatus';
import AppRouter from './routes/AppRouter';
import { getApiErrorMessage } from './types/api';

const nextStatusMap: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

function parseSortValue(sortValue: TaskSortValue): {
  sortBy: TaskSortBy;
  sortOrder: TaskSortOrder;
} {
  const [sortBy, sortOrder] = sortValue.split(':') as [
    TaskSortBy,
    TaskSortOrder,
  ];

  return { sortBy, sortOrder };
}

function buildLocalListMeta(page: number, total: number) {
  const totalPages = Math.max(1, Math.ceil(total / DEFAULT_TASK_PAGE_SIZE));
  const safePage = Math.max(1, Math.min(page, totalPages));

  return {
    page: safePage,
    limit: DEFAULT_TASK_PAGE_SIZE,
    total,
    totalPages,
    hasNextPage: safePage < totalPages,
    hasPrevPage: safePage > 1,
  };
}

function sliceLocalTasks(tasks: Task[], page: number) {
  const start = (page - 1) * DEFAULT_TASK_PAGE_SIZE;
  return tasks.slice(start, start + DEFAULT_TASK_PAGE_SIZE);
}

const taskPriorityRank: Record<Task['priority'], number> = {
  HIGH: 3,
  MEDIUM: 2,
  LOW: 1,
};

const taskStatusRank: Record<TaskStatus, number> = {
  TODO: 1,
  IN_PROGRESS: 2,
  DONE: 3,
};

function compareDateValues(
  left: string | null | undefined,
  right: string | null | undefined,
  sortOrder: TaskSortOrder,
) {
  const leftValue = left ? new Date(left).getTime() : Number.POSITIVE_INFINITY;
  const rightValue = right ? new Date(right).getTime() : Number.POSITIVE_INFINITY;

  return sortOrder === 'asc' ? leftValue - rightValue : rightValue - leftValue;
}

function sortTasksLocally(
  tasks: Task[],
  sortBy: TaskSortBy,
  sortOrder: TaskSortOrder,
) {
  return [...tasks].sort((leftTask, rightTask) => {
    switch (sortBy) {
      case 'createdAt':
        return compareDateValues(
          leftTask.createdAt,
          rightTask.createdAt,
          sortOrder,
        );
      case 'dueDate':
        return compareDateValues(leftTask.dueDate, rightTask.dueDate, sortOrder);
      case 'priority': {
        const difference =
          taskPriorityRank[leftTask.priority] - taskPriorityRank[rightTask.priority];
        return sortOrder === 'asc' ? difference : -difference;
      }
      case 'status': {
        const difference =
          taskStatusRank[leftTask.status] - taskStatusRank[rightTask.status];
        return sortOrder === 'asc' ? difference : -difference;
      }
      case 'title': {
        const comparison = leftTask.title.localeCompare(rightTask.title);
        return sortOrder === 'asc' ? comparison : -comparison;
      }
      case 'updatedAt':
      default:
        return compareDateValues(
          leftTask.updatedAt,
          rightTask.updatedAt,
          sortOrder,
        );
    }
  });
}

export default function App() {
  const dispatch = useAppDispatch();
  const isOnline = useOnlineStatus();
  const {
    accessToken,
    isAuthenticated,
    isCheckingSession,
    isHydrated,
    refreshToken,
    user,
  } = useAppSelector((state) => state.auth);
  const [triggerGetCurrentUser] = useLazyGetCurrentUserQuery();
  const [logoutRequest] = useLogoutMutation();
  const [createTask, { isLoading: isCreatingTask }] = useCreateTaskMutation();
  const [updateTask, { isLoading: isUpdatingTask }] = useUpdateTaskMutation();
  const [deleteTask] = useDeleteTaskMutation();
  const [searchQuery, setSearchQuery] = React.useState('');
  const [cachedTasks, setCachedTasks] = React.useState<Task[]>([]);
  const [pendingOperations, setPendingOperations] = React.useState<
    PendingOperation[]
  >([]);
  const [syncMeta, setSyncMeta] = React.useState<SyncMetaRecord>(
    DEFAULT_SYNC_META,
  );
  const [isOfflineStateReady, setIsOfflineStateReady] = React.useState(false);
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortValue, setSortValue] =
    React.useState<TaskSortValue>('updatedAt:desc');
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] =
    React.useState<Task | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = React.useState(false);
  const [focusedConflictOperationId, setFocusedConflictOperationId] =
    React.useState<string | null>(null);
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
  const userId = user?.id ?? null;
  const { sortBy, sortOrder } = React.useMemo(
    () => parseSortValue(sortValue),
    [sortValue],
  );
  const {
    data: tasksResponse,
    error: tasksError,
    isFetching: isFetchingTasks,
    isLoading: isLoadingTasks,
    refetch: refetchTasks,
  } = useGetTasksQuery(
    {
      limit: DEFAULT_TASK_PAGE_SIZE,
      page: currentPage,
      search: deferredSearchQuery,
      sortBy,
      sortOrder,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !isAuthenticated || !isOnline,
    },
  );
  const pendingOperationCount = pendingOperations.length;
  const cachedVisibleTasks = React.useMemo(() => {
    const normalizedSearch = deferredSearchQuery.trim().toLowerCase();

    return sortTasksLocally(
      cachedTasks.filter((task) => {
        if (task.deletedAt) {
          return false;
        }

        if (!normalizedSearch) {
          return true;
        }

        const searchableText = `${task.title} ${task.description}`.toLowerCase();
        return searchableText.includes(normalizedSearch);
      }),
      sortBy,
      sortOrder,
    );
  }, [cachedTasks, deferredSearchQuery, sortBy, sortOrder]);
  const localListMeta = React.useMemo(
    () => buildLocalListMeta(currentPage, cachedVisibleTasks.length),
    [cachedVisibleTasks.length, currentPage],
  );
  const localPaginatedTasks = React.useMemo(
    () => sliceLocalTasks(cachedVisibleTasks, localListMeta.page),
    [cachedVisibleTasks, localListMeta.page],
  );
  const isUsingOfflineData = !isOnline || pendingOperationCount > 0;
  const shouldUseCachedFallback =
    !isUsingOfflineData &&
    isOfflineStateReady &&
    !tasksResponse &&
    cachedTasks.length > 0;
  const isShowingCachedSnapshot = shouldUseCachedFallback;
  const paginatedTasks = isUsingOfflineData || shouldUseCachedFallback
    ? localPaginatedTasks
    : tasksResponse?.items ?? [];
  const taskListMeta = isUsingOfflineData || shouldUseCachedFallback
    ? localListMeta
    : tasksResponse?.meta ?? DEFAULT_TASK_LIST_META;
  const tasksErrorMessage =
    isOnline && !isUsingOfflineData && !shouldUseCachedFallback && tasksError
      ? getApiErrorMessage(tasksError, 'Unable to load your tasks right now.')
      : null;
  const allTasks = isUsingOfflineData || shouldUseCachedFallback
    ? cachedVisibleTasks
    : paginatedTasks;
  const hasActiveFilters = deferredSearchQuery.trim().length > 0;
  const isSavingTask = isCreatingTask || isUpdatingTask;
  const conflictItems = React.useMemo(
    () => getConflictItems(pendingOperations, cachedTasks),
    [cachedTasks, pendingOperations],
  );
  const conflictCount = conflictItems.length;

  const reloadOfflineState = React.useCallback(async () => {
    if (!userId) {
      setCachedTasks([]);
      setPendingOperations([]);
      setSyncMeta(DEFAULT_SYNC_META);
      return;
    }

    const [tasks, operations, meta] = await Promise.all([
      getCachedTasks(userId),
      getPendingOperations(userId),
      getSyncMeta(userId),
    ]);

    setCachedTasks(tasks);
    setPendingOperations(operations);
    setSyncMeta(meta);
  }, [userId]);

  React.useEffect(() => {
    if (!userId) {
      void Promise.resolve().then(() => {
        setCachedTasks([]);
        setPendingOperations([]);
        setSyncMeta(DEFAULT_SYNC_META);
        setIsOfflineStateReady(true);
      });
      return;
    }

    let isActive = true;
    void Promise.resolve().then(() => {
      if (isActive) {
        setIsOfflineStateReady(false);
      }
    });

    Promise.all([
      getCachedTasks(userId),
      getPendingOperations(userId),
      getSyncMeta(userId),
    ])
      .then(([tasks, operations, meta]) => {
        if (!isActive) {
          return;
        }

        setCachedTasks(tasks);
        setPendingOperations(operations);
        setSyncMeta(meta);
        setIsOfflineStateReady(true);
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        setCachedTasks([]);
        setPendingOperations([]);
        setSyncMeta({ ...DEFAULT_SYNC_META, userId });
        setIsOfflineStateReady(true);
      });

    return () => {
      isActive = false;
    };
  }, [userId]);

  React.useEffect(() => {
    if (isHydrated) {
      return;
    }

    if (!accessToken) {
      dispatch(finishSessionCheck());
      return;
    }

    let isActive = true;

    triggerGetCurrentUser()
      .unwrap()
      .then((response) => {
        if (!isActive) {
          return;
        }

        dispatch(setUser(response.data));
        dispatch(finishSessionCheck());
      })
      .catch(() => {
        if (!isActive) {
          return;
        }

        dispatch(baseApi.util.resetApiState());
        dispatch(clearAuth());
        toast.error('Your saved session has expired. Please sign in again.');
      });

    return () => {
      isActive = false;
    };
  }, [accessToken, dispatch, isHydrated, triggerGetCurrentUser]);

  React.useEffect(() => {
    if (!userId || isOnline) {
      return;
    }

    const persistOfflineMeta = async () => {
      const now = new Date().toISOString();

      setSyncMeta((currentMeta) => {
        const nextMeta = {
          ...currentMeta,
          userId,
          lastSyncAttemptAt: now,
          lastSyncStatus: 'OFFLINE' as const,
        };
        void saveSyncMeta(nextMeta);
        return nextMeta;
      });
    };

    void persistOfflineMeta();
  }, [isOnline, userId]);

  React.useEffect(() => {
    if (!userId || !isOnline || !tasksResponse) {
      return;
    }

    const persistFetchedTasks = async () => {
      const now = new Date().toISOString();
      const mergedTasks =
        pendingOperations.length > 0
          ? applyPendingOperationsToTasks(tasksResponse.items, pendingOperations)
          : tasksResponse.items;
      const nextMeta = {
        userId,
        lastSyncAt: syncMeta.lastSyncAt ?? now,
        lastSyncAttemptAt: syncMeta.lastSyncAttemptAt ?? now,
        lastSyncStatus:
          pendingOperations.length > 0 ? syncMeta.lastSyncStatus : ('SYNCED' as const),
      };

      setCachedTasks(mergedTasks);
      setSyncMeta(nextMeta);
      await saveCachedTasks(userId, mergedTasks);
      await saveSyncMeta(nextMeta);
    };

    void persistFetchedTasks();
  }, [isOnline, pendingOperations, syncMeta.lastSyncAt, syncMeta.lastSyncAttemptAt, syncMeta.lastSyncStatus, tasksResponse, userId]);

  React.useEffect(() => {
    if (!userId || !isOnline || !tasksError) {
      return;
    }

    const persistFailedSyncMeta = async () => {
      const now = new Date().toISOString();

      setSyncMeta((currentMeta) => {
        const nextMeta = {
          ...currentMeta,
          userId,
          lastSyncAttemptAt: now,
          lastSyncStatus: 'FAILED' as const,
        };
        void saveSyncMeta(nextMeta);
        return nextMeta;
      });
    };

    void persistFailedSyncMeta();
  }, [isOnline, tasksError, userId]);

  const getTaskSyncState = React.useCallback(
    (task: Task): TaskSyncBadgeState => {
      const taskOperations = pendingOperations.filter(
        (operation) => operation.taskId === task.id,
      );

      if (task.inConflict) {
        return 'FAILED';
      }

      if (taskOperations.some((operation) => operation.status === 'FAILED')) {
        return 'FAILED';
      }

      if (
        taskOperations.some((operation) => operation.status === 'CONFLICT')
      ) {
        return 'FAILED';
      }

      if (taskOperations.length > 0) {
        return isOnline ? 'PENDING' : 'OFFLINE';
      }

      return 'SYNCED';
    },
    [isOnline, pendingOperations],
  );

  const queueOfflineFeedback = (message: string) => {
    toast.success(message);
    toast.info('Will sync when online.');
  };

  const updateCachedTasksState = React.useCallback((updater: (tasks: Task[]) => Task[]) => {
    setCachedTasks((currentTasks) => updater(currentTasks));
  }, []);

  const updatePendingOperationsState = React.useCallback(
    (updater: (operations: PendingOperation[]) => PendingOperation[]) => {
      setPendingOperations((currentOperations) => updater(currentOperations));
    },
    [],
  );

  const handleSyncComplete = React.useCallback(
    (result: {
      cachedTasks: Task[];
      pendingOperations: PendingOperation[];
      syncMeta: SyncMetaRecord;
    }) => {
      setCachedTasks(result.cachedTasks);
      setPendingOperations(result.pendingOperations);
      setSyncMeta(result.syncMeta);
    },
    [],
  );

  const { isSyncing, syncNow } = useSync({
    cachedTasks,
    isOnline,
    onSyncComplete: handleSyncComplete,
    pendingOperations,
    refetchTasks,
    syncMeta,
    userId,
  });
  const handleSyncNow = React.useCallback(async () => {
    await syncNow();
  }, [syncNow]);

  const handleLogout = async () => {
    const tokenForLogout = refreshToken;

    if (tokenForLogout) {
      try {
        await logoutRequest({ refreshToken: tokenForLogout }).unwrap();
        toast.success('Signed out successfully.');
      } catch {
        toast.error('Signed out locally. The server session could not be closed.');
      }
    }

    dispatch(baseApi.util.resetApiState());
    dispatch(clearAuth());
    setIsTaskModalOpen(false);
    setSelectedTaskForEdit(null);
    setIsConflictModalOpen(false);
    setFocusedConflictOperationId(null);
  };

  const handleCreateTask = async (taskData: TaskFormValues) => {
    if (!userId) {
      throw new Error('No authenticated user was found.');
    }

    if (!isOnline) {
      const now = new Date().toISOString();
      const operationId = generateOperationId();
      const localTask: Task = {
        ...taskData,
        id: `local_${operationId}`,
        userId,
        reminderSentAt: null,
        version: 0,
        clientCreatedAt: now,
        clientUpdatedAt: now,
        lastOperationId: operationId,
        createdAt: now,
        updatedAt: now,
        deletedAt: null,
        isOfflineCreated: true,
      };
      const pendingOperation: PendingOperation = {
        operationId,
        userId,
        type: 'CREATE',
        taskId: localTask.id,
        taskVersion: localTask.version,
        taskPayload: localTask,
        createdAt: now,
        status: 'PENDING',
      };

      await upsertCachedTask(localTask);
      await addPendingOperation(pendingOperation);

      updateCachedTasksState((currentTasks) =>
        applyPendingOperationsToTasks(
          [...currentTasks.filter((task) => task.id !== localTask.id), localTask],
          [pendingOperation],
        ),
      );
      updatePendingOperationsState((currentOperations) => [
        ...currentOperations,
        pendingOperation,
      ]);

      setIsTaskModalOpen(false);
      setSelectedTaskForEdit(null);
      setCurrentPage(1);
      queueOfflineFeedback('Saved offline');
      return;
    }

    try {
      const createdTask = await createTask(taskData).unwrap();
      await upsertCachedTask(createdTask);
      updateCachedTasksState((currentTasks) =>
        applyPendingOperationsToTasks(
          [...currentTasks.filter((task) => task.id !== createdTask.id), createdTask],
          pendingOperations,
        ),
      );
      toast.success('Task created successfully.');
      setIsTaskModalOpen(false);
      setSelectedTaskForEdit(null);
      setCurrentPage(1);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to create the task right now.',
      );
      toast.error(message);
      throw new Error(message, { cause: error });
    }
  };

  const handleUpdateTask = async (taskData: TaskFormValues) => {
    if (!selectedTaskForEdit) {
      throw new Error('No task was selected for editing.');
    }

    if (!userId) {
      throw new Error('No authenticated user was found.');
    }

    const existingCreateOperation = pendingOperations.find(
      (operation) =>
        operation.taskId === selectedTaskForEdit.id && operation.type === 'CREATE',
    );
    const existingUpdateOperation = pendingOperations.find(
      (operation) =>
        operation.taskId === selectedTaskForEdit.id && operation.type === 'UPDATE',
    );

    if (!isOnline || existingCreateOperation || existingUpdateOperation) {
      const now = new Date().toISOString();
      const operationId =
        existingCreateOperation?.operationId ??
        existingUpdateOperation?.operationId ??
        generateOperationId();
      const localTask: Task = {
        ...selectedTaskForEdit,
        ...taskData,
        clientUpdatedAt: now,
        updatedAt: now,
        lastOperationId: operationId,
        isOfflineUpdated: !selectedTaskForEdit.isOfflineCreated,
      };

      await upsertCachedTask(localTask);

      if (existingCreateOperation) {
        await updatePendingOperation(existingCreateOperation.operationId, {
          taskPayload: localTask,
          taskVersion: localTask.version,
        });
        updatePendingOperationsState((currentOperations) =>
          currentOperations.map((operation) =>
            operation.operationId === existingCreateOperation.operationId
              ? {
                  ...operation,
                  taskPayload: localTask,
                  taskVersion: localTask.version,
                }
              : operation,
          ),
        );
      } else if (existingUpdateOperation) {
        await updatePendingOperation(existingUpdateOperation.operationId, {
          createdAt: now,
          status: 'PENDING',
          taskPayload: localTask,
          taskVersion: localTask.version,
        });
        updatePendingOperationsState((currentOperations) =>
          currentOperations.map((operation) =>
            operation.operationId === existingUpdateOperation.operationId
              ? {
                  ...operation,
                  createdAt: now,
                  status: 'PENDING',
                  taskPayload: localTask,
                  taskVersion: localTask.version,
                }
              : operation,
          ),
        );
      } else {
        const pendingOperation: PendingOperation = {
          operationId,
          userId,
          type: 'UPDATE',
          taskId: localTask.id,
          taskVersion: localTask.version,
          taskPayload: localTask,
          createdAt: now,
          status: 'PENDING',
        };

        await addPendingOperation(pendingOperation);
        updatePendingOperationsState((currentOperations) => [
          ...currentOperations,
          pendingOperation,
        ]);
      }

      updateCachedTasksState((currentTasks) =>
        currentTasks.map((task) => (task.id === localTask.id ? localTask : task)),
      );
      setSelectedTaskForEdit(localTask);
      setIsTaskModalOpen(false);
      queueOfflineFeedback('Saved offline');
      return;
    }

    try {
      const updatedTask = await updateTask({
        data: taskData,
        id: selectedTaskForEdit.id,
      }).unwrap();
      await upsertCachedTask(updatedTask);
      updateCachedTasksState((currentTasks) =>
        currentTasks.map((task) => (task.id === updatedTask.id ? updatedTask : task)),
      );
      toast.success('Task updated successfully.');
      setIsTaskModalOpen(false);
      setSelectedTaskForEdit(updatedTask);
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to update the task right now.',
      );
      toast.error(message);
      throw new Error(message, { cause: error });
    }
  };

  const handleToggleStatus = async (task: Task) => {
    const nextStatus = nextStatusMap[task.status];
    const hasQueuedOperation = pendingOperations.some(
      (operation) =>
        operation.taskId === task.id &&
        operation.type !== 'DELETE' &&
        operation.status !== 'FAILED',
    );

    if (!isOnline || hasQueuedOperation) {
      setSelectedTaskForEdit(task);
      await handleUpdateTask({
        description: task.description,
        dueDate: task.dueDate,
        priority: task.priority,
        reminderAt: task.reminderAt,
        status: nextStatus,
        title: task.title,
      });
      return;
    }

    try {
      const updatedTask = await updateTask({
        data: {
          status: nextStatus,
        },
        id: task.id,
      }).unwrap();
      await upsertCachedTask(updatedTask);
      updateCachedTasksState((currentTasks) =>
        currentTasks.map((currentTask) =>
          currentTask.id === updatedTask.id ? updatedTask : currentTask,
        ),
      );
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to update task status right now.',
      );
      toast.error(message);
    }
  };

  const handleDeleteTask = async (id: string) => {
    if (!userId) {
      return;
    }

    const result = await Swal.fire({
      title: 'Delete this task?',
      text: 'This action will permanently remove it from the current dashboard.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Delete Task',
      cancelButtonText: 'Keep Task',
      reverseButtons: true,
      background: '#11141B',
      color: '#E2E8F0',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#334155',
      customClass: {
        popup: 'rounded-[24px] border border-slate-800 shadow-2xl',
        title: 'text-left text-xl font-black text-white',
        htmlContainer: 'text-left text-sm text-slate-400',
        actions: 'gap-3',
        confirmButton: 'rounded-xl px-4 py-2 text-xs font-bold',
        cancelButton: 'rounded-xl px-4 py-2 text-xs font-bold',
      },
    });

    if (result.isConfirmed) {
      const targetTask = cachedTasks.find((task) => task.id === id);
      const existingCreateOperation = pendingOperations.find(
        (operation) => operation.taskId === id && operation.type === 'CREATE',
      );
      const existingUpdateOperation = pendingOperations.find(
        (operation) => operation.taskId === id && operation.type === 'UPDATE',
      );
      const existingDeleteOperation = pendingOperations.find(
        (operation) => operation.taskId === id && operation.type === 'DELETE',
      );

      if (targetTask && (!isOnline || existingCreateOperation || existingUpdateOperation)) {
        if (existingCreateOperation) {
          await removePendingOperation(existingCreateOperation.operationId);
          await removeCachedTask(id);
          updatePendingOperationsState((currentOperations) =>
            currentOperations.filter(
              (operation) => operation.operationId !== existingCreateOperation.operationId,
            ),
          );
          updateCachedTasksState((currentTasks) =>
            currentTasks.filter((task) => task.id !== id),
          );
          queueOfflineFeedback('Queued for sync');
          return;
        }

        const now = new Date().toISOString();
        const operationId =
          existingDeleteOperation?.operationId ?? generateOperationId();
        const deletedTask: Task = {
          ...targetTask,
          deletedAt: now,
          clientUpdatedAt: now,
          updatedAt: now,
          lastOperationId: operationId,
          isOfflineDeleted: true,
        };

        await upsertCachedTask(deletedTask);

        if (existingUpdateOperation) {
          await removePendingOperation(existingUpdateOperation.operationId);
        }

        if (existingDeleteOperation) {
          await updatePendingOperation(existingDeleteOperation.operationId, {
            createdAt: now,
            status: 'PENDING',
            taskPayload: { deletedAt: now },
            taskVersion: deletedTask.version,
          });
          updatePendingOperationsState((currentOperations) =>
            currentOperations
              .filter(
                (operation) =>
                  operation.operationId !== existingUpdateOperation?.operationId,
              )
              .map((operation) =>
                operation.operationId === existingDeleteOperation.operationId
                  ? {
                      ...operation,
                      createdAt: now,
                      status: 'PENDING',
                      taskPayload: { deletedAt: now },
                      taskVersion: deletedTask.version,
                    }
                  : operation,
              ),
          );
        } else {
          const pendingOperation: PendingOperation = {
            operationId,
            userId,
            type: 'DELETE',
            taskId: deletedTask.id,
            taskVersion: deletedTask.version,
            taskPayload: { deletedAt: now },
            createdAt: now,
            status: 'PENDING',
          };

          await addPendingOperation(pendingOperation);
          updatePendingOperationsState((currentOperations) => [
            ...currentOperations.filter(
              (operation) =>
                operation.operationId !== existingUpdateOperation?.operationId,
            ),
            pendingOperation,
          ]);
        }

        updateCachedTasksState((currentTasks) =>
          currentTasks.map((task) => (task.id === deletedTask.id ? deletedTask : task)),
        );
        queueOfflineFeedback('Queued for sync');
        return;
      }

      try {
        await deleteTask(id).unwrap();
        await removeCachedTask(id);
        updateCachedTasksState((currentTasks) =>
          currentTasks.filter((task) => task.id !== id),
        );
        toast.success('Task deleted successfully.');
        if (paginatedTasks.length === 1 && currentPage > 1) {
          setCurrentPage((page) => page - 1);
        }
      } catch (error) {
        const message = getApiErrorMessage(
          error,
          'Unable to delete the task right now.',
        );
        toast.error(message);
      }
    }
  };

  const openEditModal = (task: Task) => {
    setSelectedTaskForEdit(task);
    setIsTaskModalOpen(true);
  };

  const openCreateModal = () => {
    setSelectedTaskForEdit(null);
    setIsTaskModalOpen(true);
  };

  const openConflictsPanel = () => {
    setFocusedConflictOperationId(null);
    setIsConflictModalOpen(true);
  };

  const openConflictModal = (task: Task) => {
    const matchingConflict = conflictItems.find(
      (conflict) => conflict.taskId === task.id,
    );
    setFocusedConflictOperationId(matchingConflict?.operationId ?? null);
    setIsConflictModalOpen(true);
  };

  const handleResolveConflict = async (
    conflict: ConflictItem,
    action: ConflictResolutionAction,
  ) => {
    try {
      if (action === 'keep_server') {
        await keepServerVersion(conflict);
        await reloadOfflineState();
        toast.success('Server version kept. The conflicting local change was removed.');
      } else if (action === 'retry_local') {
        await retryLocalConflict(conflict);
        await reloadOfflineState();
        toast.success('Local change queued again for sync.');
        toast.info(isOnline ? 'Use Sync Now to retry immediately.' : 'It will retry when you are back online.');
      } else {
        await dismissConflictSafely(conflict);
        await reloadOfflineState();
        toast.success('Conflict dismissed safely.');
      }

      setFocusedConflictOperationId(null);

      const nextConflictCount = conflictCount - 1;
      if (nextConflictCount <= 0 || action !== 'retry_local') {
        setIsConflictModalOpen(false);
      }
    } catch (error) {
      const message =
        error instanceof Error
          ? error.message
          : 'Unable to resolve this conflict right now.';
      toast.error(message);
    }
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleSortChange = (value: TaskSortValue) => {
    setSortValue(value);
    setCurrentPage(1);
  };

  const handleChangePage = (page: number) => {
    const nextPage = Math.max(1, Math.min(page, taskListMeta.totalPages));
    setCurrentPage(nextPage);
  };

  return (
    <>
      <AppRouter
        allTasks={allTasks}
        conflictCount={conflictCount}
        errorMessage={tasksErrorMessage}
        hasActiveFilters={hasActiveFilters}
        isAuthReady={isHydrated && !isCheckingSession}
        isAuthenticated={isAuthenticated}
        isOnline={isOnline}
        isShowingCachedSnapshot={isShowingCachedSnapshot}
        isSyncing={isSyncing}
        isUsingOfflineData={isUsingOfflineData}
        isFetchingTasks={isFetchingTasks}
        isLoadingTasks={
          !isOfflineStateReady || (!shouldUseCachedFallback && isLoadingTasks)
        }
        isTaskModalOpen={isTaskModalOpen}
        listMeta={taskListMeta}
        onChangePage={handleChangePage}
        onDeleteTask={handleDeleteTask}
        onLogout={handleLogout}
        onOpenConflicts={openConflictsPanel}
        onOpenConflictModal={openConflictModal}
        onOpenCreateModal={openCreateModal}
        onOpenEditModal={openEditModal}
        onRetrySync={handleSyncNow}
        onRetryTasks={refetchTasks}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onSyncNow={handleSyncNow}
        onToggleTaskStatus={handleToggleStatus}
        pendingOperationCount={pendingOperationCount}
        paginatedTasks={paginatedTasks}
        searchQuery={searchQuery}
        syncMeta={syncMeta}
        sortValue={sortValue}
        user={user}
        getTaskSyncState={getTaskSyncState}
      />

      <TaskModal
        isSaving={isSavingTask}
        key={selectedTaskForEdit?.id ?? (isTaskModalOpen ? 'create' : 'closed')}
        isOpen={isTaskModalOpen}
        task={selectedTaskForEdit}
        onClose={() => setIsTaskModalOpen(false)}
        onSave={selectedTaskForEdit ? handleUpdateTask : handleCreateTask}
      />

      <ConflictModal
        conflicts={conflictItems}
        focusedOperationId={focusedConflictOperationId}
        isOpen={isConflictModalOpen}
        onClose={() => {
          setIsConflictModalOpen(false);
          setFocusedConflictOperationId(null);
        }}
        onResolve={handleResolveConflict}
      />
    </>
  );
}
