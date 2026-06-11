import React from 'react';
import Swal from 'sweetalert2';
import 'sweetalert2/dist/sweetalert2.min.css';
import type {
  AuthTab,
  ConflictResolution,
  PriorityFilter,
  Task,
  TaskFormValues,
  TaskStatus,
  TaskStatusFilter,
} from './utils/db';
import AnalyticsPanel from './components/AnalyticsPanel';
import {
  CheckSquare,
  Heart,
  Layers,
  LogOut,
  Plus,
  Search,
} from './components/AppIcons';
import ConflictModal from './components/ConflictModal';
import LoginView from './components/LoginView';
import OnlineIndicator from './components/OnlineIndicator';
import PushNotificationManager from './components/PushNotificationManager';
import RegisterView from './components/RegisterView';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';

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
  const [isAuthenticated, setIsAuthenticated] = React.useState(false);
  const [authTab, setAuthTab] = React.useState<AuthTab>('login');
  const [user, setUser] = React.useState<{
    name: string;
    email: string;
  } | null>(null);
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

  const handleLogin = (email: string) => {
    setUser({
      name: email.split('@')[0]?.toUpperCase() || 'USER',
      email,
    });
    setIsAuthenticated(true);
  };

  const handleRegister = (name: string, email: string) => {
    setUser({ name, email });
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    setUser(null);
    setIsAuthenticated(false);
    setAuthTab('login');
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

  if (!isAuthenticated) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
        {authTab === 'login' ? (
          <LoginView
            onGoToRegister={() => setAuthTab('register')}
            onLogin={handleLogin}
          />
        ) : (
          <RegisterView
            onGoToLogin={() => setAuthTab('login')}
            onRegister={handleRegister}
          />
        )}
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="glow-indigo rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-500/15">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex select-none flex-col">
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-base font-black leading-none tracking-tight text-transparent">
                TaskFlow
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Prototype Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {user?.name || 'Worker'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {user?.email}
              </span>
            </div>

            <button
              id="btn-nav-logout"
              type="button"
              onClick={handleLogout}
              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4">
        <OnlineIndicator />

        {tasks.length > 0 ? <AnalyticsPanel tasks={tasks} /> : null}

        <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B] sm:p-5">
          <div className="flex flex-col items-center justify-between gap-3.5 border-b border-slate-100 pb-4 dark:border-slate-800/60 sm:flex-row">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="search-tasks-input"
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-200"
              />
            </div>

            <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
              <select
                id="filter-tasks-status"
                value={statusFilter}
                onChange={(event) =>
                  setStatusFilter(event.target.value as TaskStatusFilter)
                }
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-300"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>

              <select
                id="filter-tasks-priority"
                value={priorityFilter}
                onChange={(event) =>
                  setPriorityFilter(event.target.value as PriorityFilter)
                }
                className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-300"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              <button
                id="btn-create-task-floating"
                type="button"
                onClick={openCreateModal}
                className="glow-indigo ml-auto flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
              >
                <Plus className="h-3.5 w-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {filteredTasks.length === 0 ? (
            <div className="animate-fade-in flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center dark:border-slate-800 dark:bg-slate-950/25">
              <div className="rounded-2xl bg-white p-3 text-slate-400 shadow-sm dark:bg-slate-900">
                <Layers className="h-7 w-7 text-indigo-400" />
              </div>
              <div className="flex max-w-sm flex-col gap-1">
                <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
                  No tasks on record
                </h4>
                <p className="text-xs leading-normal text-slate-400">
                  Your filters did not return any tasks, or you have not created
                  any yet. Press &quot;New Task&quot; to add one.
                </p>
              </div>
            </div>
          ) : (
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              {filteredTasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                  onResolveConflict={openConflictModal}
                />
              ))}
            </div>
          )}
        </div>

        <PushNotificationManager />
      </main>

      <footer className="mt-auto border-t border-slate-100 px-4 py-6 select-none dark:border-slate-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-600 sm:flex-row">
          <div className="flex items-center gap-1">
            <span>© 2026 TaskFlow. Elegant Front-End Design & Routing.</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span>Pure HTML + CSS + React Router</span>
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
          </div>
        </div>
      </footer>

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
    </div>
  );
}
