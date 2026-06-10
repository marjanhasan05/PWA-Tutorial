import React from 'react';
import { useAppDispatch, useAppSelector } from './store';
import { bootstrapAuth, logoutUser } from './store/authSlice';
import {
  initializeAppStore,
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  resolveConflict,
  setSearchQuery,
  setStatusFilter,
  setPriorityFilter,
  setSortOptions,
  setCurrentPage,
  syncDataWithServer,
} from './store/tasksSlice';
import { Task } from './utils/db';

// Component Imports
import LoginView from './components/LoginView';
import RegisterView from './components/RegisterView';
import OnlineIndicator from './components/OnlineIndicator';
import TaskCard from './components/TaskCard';
import TaskModal from './components/TaskModal';
import ConflictModal from './components/ConflictModal';
import PushNotificationManager from './components/PushNotificationManager';
import AnalyticsPanel from './components/AnalyticsPanel';

import { LogOut, Plus, Search, Filter, RefreshCw, Layers, CheckSquare, Heart } from 'lucide-react';

export default function App() {
  const dispatch = useAppDispatch();

  // Redux States
  const { user, isAuthenticated, isAuthLoading } = useAppSelector((state) => state.auth);
  const {
    items: tasks,
    isListLoading,
    isOnline,
    currentPage,
    totalPages,
    searchQuery,
    statusFilter,
    priorityFilter,
    sortBy,
    sortOrder,
  } = useAppSelector((state) => state.tasks);

  // Router page toggles for public views ('login' | 'register')
  const [authTab, setAuthTab] = React.useState<'login' | 'register'>('login');

  // Modal Control States
  const [isTaskModalOpen, setIsTaskModalOpen] = React.useState(false);
  const [selectedTaskForEdit, setSelectedTaskForEdit] = React.useState<Task | null>(null);
  const [isConflictModalOpen, setIsConflictModalOpen] = React.useState(false);
  const [selectedTaskForConflict, setSelectedTaskForConflict] = React.useState<Task | null>(null);

  // 1. Session Bootstrap on mount
  React.useEffect(() => {
    dispatch(bootstrapAuth());
  }, [dispatch]);

  // 2. Initialize task listeners and pull items upon login
  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(initializeAppStore()).then(() => {
        dispatch(fetchTasks());
        // Try initial synchronization on login
        dispatch(syncDataWithServer());
      });
    }
  }, [isAuthenticated, dispatch]);

  // 3. Keep list refreshed when filters or pages change
  React.useEffect(() => {
    if (isAuthenticated) {
      dispatch(fetchTasks());
    }
  }, [searchQuery, statusFilter, priorityFilter, sortBy, sortOrder, currentPage, isAuthenticated, dispatch]);

  // Handlers for Task CRUD Actions
  const handleCreateTask = (taskData: Omit<Task, 'id' | 'version' | 'clientCreatedAt' | 'clientUpdatedAt'>) => {
    dispatch(createTask(taskData)).then(() => {
      dispatch(fetchTasks());
    });
  };

  const handleUpdateTask = (taskData: any) => {
    if (selectedTaskForEdit) {
      dispatch(updateTask({ id: selectedTaskForEdit.id, updates: taskData }));
    }
  };

  const handleToggleStatus = (task: Task) => {
    const nextStatus: Task['status'] =
      task.status === 'DONE' ? 'TODO' : task.status === 'TODO' ? 'IN_PROGRESS' : 'DONE';
    dispatch(updateTask({ id: task.id, updates: { status: nextStatus } }));
  };

  const handleDeleteTask = (id: string) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      dispatch(deleteTask(id));
    }
  };

  const handleResolveConflictChoice = (
    taskId: string,
    resolution: 'keep_local' | 'accept_server' | 'merge',
    mergedTask?: Partial<Task>
  ) => {
    dispatch(resolveConflict({ taskId, resolution, mergedTask }));
  };

  const handleLogout = () => {
    if (window.confirm('Are you sure you want to logout? Locally cached tasks will be cleared.')) {
      dispatch(logoutUser());
    }
  };

  // Dialog launching helpers
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

  // Loading Screen for Session Recovery
  if (isAuthLoading) {
    return (
      <div id="auth-loading-screen" className="fixed inset-0 flex flex-col items-center justify-center bg-slate-950 text-white font-sans">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="w-8 h-8 text-blue-500 animate-spin" />
          <span className="text-sm font-semibold tracking-wide text-slate-400">Recovering Offline Session...</span>
        </div>
      </div>
    );
  }

  // Auth Screens
  if (!isAuthenticated) {
    return (
      <div id="public-auth-stage" className="min-h-screen bg-slate-950 flex flex-col items-center justify-center p-4">
        {authTab === 'login' ? (
          <LoginView onGoToRegister={() => setAuthTab('register')} />
        ) : (
          <RegisterView onGoToLogin={() => setAuthTab('login')} />
        )}
      </div>
    );
  }

  return (
    <div id="applet-dashboard-stage" className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* Navbar header */}
      <header className="sticky top-0 z-40 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-3.5 flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-blue-600 rounded-xl text-white shadow-md shadow-blue-500/15">
              <CheckSquare className="w-5 h-5" />
            </div>
            <div className="flex flex-col select-none">
              <span className="text-base font-black tracking-tight leading-none bg-gradient-to-r from-blue-600 to-indigo-600 bg-clip-text text-transparent">
                TaskFlow
              </span>
              <span className="text-[10px] font-mono font-bold text-slate-400 tracking-wide mt-0.5 uppercase">
                PWA Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="hidden sm:flex flex-col items-end">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {user?.name || 'Worker'}
              </span>
              <span className="text-[10px] text-slate-400 font-mono">
                {user?.email}
              </span>
            </div>

            <button
              id="btn-nav-logout"
              onClick={handleLogout}
              className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 rounded-xl transition-all cursor-pointer"
              title="Sign Out"
            >
              <LogOut className="w-4.5 h-4.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Workspace Frame */}
      <main className="flex-1 max-w-5xl w-full mx-auto p-4 flex flex-col gap-5">
        {/* Connection status tracker & alert notifications */}
        <OnlineIndicator />

        {/* Analytics Highlights */}
        {tasks.length > 0 && <AnalyticsPanel tasks={tasks} />}

        {/* Main Content Workspace Layout */}
        <div className="w-full flex flex-col gap-4 bg-white dark:bg-slate-900 border border-slate-100 dark:border-slate-800/85 p-4 sm:p-5 rounded-2xl shadow-sm">
          {/* Operations Hub: Search bar, status tags, priority filter, creation trigger */}
          <div className="flex flex-col sm:flex-row gap-3.5 items-center justify-between border-b border-slate-150/50 dark:border-slate-800/60 pb-4">
            <div className="relative w-full sm:max-w-xs">
              <Search className="absolute left-3.5 w-4 h-4 text-slate-400 top-1/2 -translate-y-1/2" />
              <input
                id="search-tasks-input"
                type="text"
                placeholder="Search tasks..."
                value={searchQuery}
                onChange={(e) => dispatch(setSearchQuery(e.target.value))}
                className="w-full pl-9.5 pr-4 py-2 rounded-xl border border-slate-150 dark:border-slate-800 bg-white dark:bg-slate-950 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500/10 focus:border-blue-500"
              />
            </div>

            {/* Quick selectors row */}
            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              {/* Status Select */}
              <select
                id="filter-tasks-status"
                value={statusFilter}
                onChange={(e) => dispatch(setStatusFilter(e.target.value as any))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
              >
                <option value="ALL">All Status</option>
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>

              {/* Priority Select */}
              <select
                id="filter-tasks-priority"
                value={priorityFilter}
                onChange={(e) => dispatch(setPriorityFilter(e.target.value as any))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs text-slate-600 dark:text-slate-300 font-medium cursor-pointer"
              >
                <option value="ALL">All Priorities</option>
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>

              {/* Create trigger */}
              <button
                id="btn-create-task-floating"
                onClick={openCreateModal}
                className="ml-auto flex items-center justify-center gap-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 active:scale-95 text-xs text-white font-bold rounded-xl shadow-md shadow-blue-500/10 transition cursor-pointer"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>New Task</span>
              </button>
            </div>
          </div>

          {/* Task Render Board */}
          {isListLoading ? (
            <div id="loading-task-list" className="py-20 flex flex-col items-center justify-center gap-3">
              <RefreshCw className="w-7 h-7 text-blue-500 animate-spin" />
              <span className="text-xs font-mono text-slate-400">Retrieving active lists...</span>
            </div>
          ) : tasks.length === 0 ? (
            <div id="empty-task-placeholder" className="py-16 px-4 bg-slate-50/50 dark:bg-slate-950/20 rounded-2xl border border-dashed border-slate-150 dark:border-slate-800 flex flex-col items-center justify-center text-center gap-3.5 animate-fade-in">
              <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl text-slate-400 shadow-sm">
                <Layers className="w-7 h-7" />
              </div>
              <div className="flex flex-col gap-1 max-w-sm">
                <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200">No tasks on record</h4>
                <p className="text-xs text-slate-500 leading-normal">
                  Your filters didn't return any tasks, or you haven't created any yet. Press the button above to add your first task.
                </p>
              </div>
            </div>
          ) : (
            <div id="tasks-cards-grid" className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <TaskCard
                  key={task.id}
                  task={task as Task}
                  onEdit={openEditModal}
                  onDelete={handleDeleteTask}
                  onToggleStatus={handleToggleStatus}
                  onResolveConflict={openConflictModal}
                />
              ))}
            </div>
          )}

          {/* Pagination Toolbar */}
          {!isListLoading && tasks.length > 0 && totalPages > 1 && (
            <div id="app-pagination-toolbar" className="flex items-center justify-between border-t border-slate-100 dark:border-slate-800/60 pt-4 mt-2">
              <button
                id="pagination-prev-btn"
                disabled={currentPage <= 1}
                onClick={() => dispatch(setCurrentPage(currentPage - 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-350 transition cursor-pointer"
              >
                Previous
              </button>
              <span className="text-xs text-slate-500 font-mono font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                id="pagination-next-btn"
                disabled={currentPage >= totalPages}
                onClick={() => dispatch(setCurrentPage(currentPage + 1))}
                className="px-3 py-1.5 rounded-xl border border-slate-200 hover:bg-slate-50 disabled:opacity-40 disabled:hover:bg-transparent text-xs font-bold text-slate-600 dark:border-slate-800 dark:hover:bg-slate-800 dark:text-slate-350 transition cursor-pointer"
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* WebPush Subscription Console */}
        <PushNotificationManager />
      </main>

      {/* Application Footer with subtle credits */}
      <footer className="mt-auto py-6 border-t border-slate-100 dark:border-slate-850 px-4">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-3 text-slate-400 dark:text-slate-600 text-[11px] font-medium tracking-wide">
          <div className="flex items-center gap-1">
            <span>© 2026 TaskFlow. Offline-First Progressive Application.</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span>Built with React + Redux Toolkit</span>
            <Heart className="w-3 h-3 text-rose-500 fill-rose-500" />
          </div>
        </div>
      </footer>

      {/* Dynamic Modal Instances */}
      <TaskModal
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
