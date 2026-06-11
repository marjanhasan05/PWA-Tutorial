import React from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import { toast } from 'sonner';
import { useAppDispatch, useAppSelector } from './app/hooks';
import ConflictModal from './components/ConflictModal';
import TaskModal from './components/TaskModal';
import {
  useLazyGetCurrentUserQuery,
  useLogoutMutation,
} from './features/auth/authApi';
import { clearAuth, finishSessionCheck, setUser } from './features/auth/authSlice';
import AppRouter from './routes/AppRouter';
import type {
  ConflictResolution,
  PriorityFilter,
  Task,
  TaskFormValues,
  TaskStatus,
  TaskStatusFilter,
} from './utils/db';

const INITIAL_TASKS: Task[] = [
  {
    id: 'task-1',
    title: 'Finalize Mobile Design Architecture',
    description:
      'Ensure layout is fully responsive down to 320px with custom tactile controls and touch support.',
    status: 'IN_PROGRESS',
    priority: 'HIGH',
    dueDate: new Date(Date.now() + 86400000).toISOString(),
    reminderAt: new Date(Date.now() + 72000000).toISOString(),
    version: 1,
    clientCreatedAt: new Date().toISOString(),
    clientUpdatedAt: new Date().toISOString(),
  },
  {
    id: 'task-2',
    title: 'Audit Offline Synchronization Protocol',
    description:
      'Verify client conflict-resolution modal loads correctly when simultaneous modifications occur.',
    status: 'TODO',
    priority: 'MEDIUM',
    dueDate: new Date(Date.now() + 172800000).toISOString(),
    reminderAt: null,
    version: 1,
    clientCreatedAt: new Date().toISOString(),
    clientUpdatedAt: new Date().toISOString(),
    inConflict: true,
    serverTaskForConflict: {
      id: 'task-2',
      title: 'Audit Global Synchronization Engine (Server Version)',
      description:
        'Review overall client conflict-resolution pipeline with priority controls and detailed schema merges.',
      status: 'IN_PROGRESS',
      priority: 'HIGH',
      dueDate: new Date(Date.now() + 120000000).toISOString(),
      reminderAt: new Date(Date.now() + 100000000).toISOString(),
      version: 2,
      clientCreatedAt: new Date().toISOString(),
      clientUpdatedAt: new Date().toISOString(),
    },
  },
  {
    id: 'task-3',
    title: 'PWA Manifest configuration review',
    description:
      'Verify background worker configuration, caching thresholds and icons rendering properties.',
    status: 'DONE',
    priority: 'LOW',
    dueDate: new Date(Date.now() - 36000000).toISOString(),
    reminderAt: null,
    version: 1,
    clientCreatedAt: new Date().toISOString(),
    clientUpdatedAt: new Date().toISOString(),
  },
  {
    id: 'task-4',
    title: 'Compile asset bundles for release',
    description:
      'Double check visual shadow assets and SVGs from Lucide collection are correctly cached.',
    status: 'DONE',
    priority: 'MEDIUM',
    dueDate: null,
    reminderAt: null,
    version: 1,
    clientCreatedAt: new Date().toISOString(),
    clientUpdatedAt: new Date().toISOString(),
  },
];

const nextStatusMap: Record<TaskStatus, TaskStatus> = {
  TODO: 'IN_PROGRESS',
  IN_PROGRESS: 'DONE',
  DONE: 'TODO',
};

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
  const [tasks, setTasks] = React.useState<Task[]>(INITIAL_TASKS);
  const [searchQuery, setSearchQuery] = React.useState('');
  const [statusFilter, setStatusFilter] =
    React.useState<TaskStatusFilter>('ALL');
  const [priorityFilter, setPriorityFilter] =
    React.useState<PriorityFilter>('ALL');
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] =
    React.useState<Task | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = React.useState(false);
  const [selectedTaskForConflict, setSelectedTaskForConflict] =
    React.useState<Task | null>(null);

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

    dispatch(clearAuth());
    setIsTaskModalOpen(false);
    setSelectedTaskForEdit(null);
    setIsConflictModalOpen(false);
    setSelectedTaskForConflict(null);
  };

  const handleCreateTask = (taskData: TaskFormValues) => {
    const newTask: Task = {
      ...taskData,
      id: `task-${Date.now()}`,
      version: 1,
      clientCreatedAt: new Date().toISOString(),
      clientUpdatedAt: new Date().toISOString(),
    };

    setTasks((currentTasks) => [newTask, ...currentTasks]);
    setIsTaskModalOpen(false);
    setSelectedTaskForEdit(null);
  };

  const handleUpdateTask = (taskData: TaskFormValues) => {
    if (!selectedTaskForEdit) {
      return;
    }

    setTasks((currentTasks) =>
      currentTasks.map((task) =>
        task.id === selectedTaskForEdit.id
          ? {
              ...task,
              ...taskData,
              clientUpdatedAt: new Date().toISOString(),
            }
          : task,
      ),
    );
    setIsTaskModalOpen(false);
  };

  const handleToggleStatus = (task: Task) => {
    setTasks((currentTasks) =>
      currentTasks.map((currentTask) =>
        currentTask.id === task.id
          ? {
              ...currentTask,
              status: nextStatusMap[currentTask.status],
              clientUpdatedAt: new Date().toISOString(),
            }
          : currentTask,
      ),
    );
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
      setTasks((currentTasks) => currentTasks.filter((task) => task.id !== id));
    }
  };

  const handleResolveConflictChoice = (
    taskId: string,
    resolution: ConflictResolution,
    mergedTask?: Partial<Task>,
  ) => {
    setTasks((currentTasks) =>
      currentTasks.map((task) => {
        if (task.id !== taskId) {
          return task;
        }

        if (resolution === 'accept_server' && task.serverTaskForConflict) {
          return {
            ...task.serverTaskForConflict,
            inConflict: false,
            serverTaskForConflict: null,
          };
        }

        if (resolution === 'merge' && mergedTask) {
          return {
            ...task,
            ...mergedTask,
            inConflict: false,
            serverTaskForConflict: null,
            version: task.version + 1,
          };
        }

        return {
          ...task,
          inConflict: false,
          serverTaskForConflict: null,
          version: task.version + 1,
        };
      }),
    );
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

  const filteredTasks = tasks.filter((task) => {
    const matchesSearch =
      task.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      task.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'ALL' || task.status === statusFilter;
    const matchesPriority =
      priorityFilter === 'ALL' || task.priority === priorityFilter;

    return matchesSearch && matchesStatus && matchesPriority;
  });

  return (
    <>
      <AppRouter
        allTasks={tasks}
        filteredTasks={filteredTasks}
        isAuthReady={isHydrated && !isCheckingSession}
        isAuthenticated={isAuthenticated}
        isTaskModalOpen={isTaskModalOpen}
        onDeleteTask={handleDeleteTask}
        onLogout={handleLogout}
        onOpenConflictModal={openConflictModal}
        onOpenCreateModal={openCreateModal}
        onOpenEditModal={openEditModal}
        onPriorityFilterChange={setPriorityFilter}
        onSearchChange={setSearchQuery}
        onStatusFilterChange={setStatusFilter}
        onToggleTaskStatus={handleToggleStatus}
        priorityFilter={priorityFilter}
        searchQuery={searchQuery}
        statusFilter={statusFilter}
        user={user}
      />

      <TaskModal
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
