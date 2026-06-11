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
  DEFAULT_TASK_LIST_META,
  DEFAULT_TASK_PAGE_SIZE,
  type PriorityFilter,
  type Task,
  type TaskFormValues,
  type TaskSortBy,
  type TaskSortOrder,
  type TaskSortValue,
  type TaskStatus,
  type TaskStatusFilter,
} from './features/tasks/taskTypes';
import {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTasksQuery,
  useUpdateTaskMutation,
} from './features/tasks/tasksApi';
import AppRouter from './routes/AppRouter';
import type { ConflictResolution } from './utils/db';
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

export default function App() {
  const dispatch = useAppDispatch();
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
  const [statusFilter, setStatusFilter] =
    React.useState<TaskStatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>('ALL');
  const [currentPage, setCurrentPage] = React.useState(1);
  const [sortValue, setSortValue] =
    React.useState<TaskSortValue>('updatedAt:desc');
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] =
    React.useState<Task | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = React.useState(false);
  const [selectedTaskForConflict, setSelectedTaskForConflict] =
    React.useState<Task | null>(null);
  const deferredSearchQuery = React.useDeferredValue(searchQuery);
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
      priority: priorityFilter,
      search: deferredSearchQuery,
      sortBy,
      sortOrder,
      status: statusFilter,
    },
    {
      refetchOnMountOrArgChange: true,
      skip: !isAuthenticated,
    },
  );

  const paginatedTasks = tasksResponse?.items ?? [];
  const taskListMeta = tasksResponse?.meta ?? DEFAULT_TASK_LIST_META;
  const tasksErrorMessage = tasksError
    ? getApiErrorMessage(tasksError, 'Unable to load your tasks right now.')
    : null;
  const allTasks = paginatedTasks;
  const hasActiveFilters =
    statusFilter !== 'ALL' ||
    priorityFilter !== 'ALL' ||
    deferredSearchQuery.trim().length > 0;
  const isSavingTask = isCreatingTask || isUpdatingTask;

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
    setSelectedTaskForConflict(null);
  };

  const handleCreateTask = async (taskData: TaskFormValues) => {
    try {
      await createTask(taskData).unwrap();
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

    try {
      await updateTask({
        data: taskData,
        id: selectedTaskForEdit.id,
      }).unwrap();
      toast.success('Task updated successfully.');
      setIsTaskModalOpen(false);
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
    try {
      await updateTask({
        data: {
          status: nextStatusMap[task.status],
        },
        id: task.id,
      }).unwrap();
    } catch (error) {
      const message = getApiErrorMessage(
        error,
        'Unable to update task status right now.',
      );
      toast.error(message);
    }
  };

  const handleDeleteTask = async (id: string) => {
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
      try {
        await deleteTask(id).unwrap();
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

  const handleResolveConflictChoice = (
    taskId: string,
    resolution: ConflictResolution,
    mergedTask?: Partial<Task>,
  ) => {
    const activeTask = paginatedTasks.find((task) => task.id === taskId);

    if (!activeTask) {
      return;
    }

    if (resolution === 'accept_server' && activeTask.serverTaskForConflict) {
      void updateTask({
        data: {
          description: activeTask.serverTaskForConflict.description,
          dueDate: activeTask.serverTaskForConflict.dueDate,
          priority: activeTask.serverTaskForConflict.priority,
          reminderAt: activeTask.serverTaskForConflict.reminderAt,
          status: activeTask.serverTaskForConflict.status,
          title: activeTask.serverTaskForConflict.title,
        },
        id: taskId,
      });
      return;
    }

    if (resolution === 'merge' && mergedTask) {
      void updateTask({
        data: mergedTask,
        id: taskId,
      });
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

  const openConflictModal = (task: Task) => {
    setSelectedTaskForConflict(task);
    setIsConflictModalOpen(true);
  };

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    setCurrentPage(1);
  };

  const handleStatusFilterChange = (value: TaskStatusFilter) => {
    setStatusFilter(value);
    setCurrentPage(1);
  };

  const handlePriorityFilterChange = (value: PriorityFilter) => {
    setPriorityFilter(value);
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
        errorMessage={tasksErrorMessage}
        hasActiveFilters={hasActiveFilters}
        isAuthReady={isHydrated && !isCheckingSession}
        isAuthenticated={isAuthenticated}
        isFetchingTasks={isFetchingTasks}
        isLoadingTasks={isLoadingTasks}
        isTaskModalOpen={isTaskModalOpen}
        listMeta={taskListMeta}
        onChangePage={handleChangePage}
        onDeleteTask={handleDeleteTask}
        onLogout={handleLogout}
        onOpenConflictModal={openConflictModal}
        onOpenCreateModal={openCreateModal}
        onOpenEditModal={openEditModal}
        onPriorityFilterChange={handlePriorityFilterChange}
        onRetryTasks={refetchTasks}
        onSearchChange={handleSearchChange}
        onSortChange={handleSortChange}
        onStatusFilterChange={handleStatusFilterChange}
        onToggleTaskStatus={handleToggleStatus}
        paginatedTasks={paginatedTasks}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        sortValue={sortValue}
        statusFilter={statusFilter}
        user={user}
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
        isOpen={isConflictModalOpen}
        task={selectedTaskForConflict}
        onClose={() => setIsConflictModalOpen(false)}
        onResolve={handleResolveConflictChoice}
      />
    </>
  );
}
