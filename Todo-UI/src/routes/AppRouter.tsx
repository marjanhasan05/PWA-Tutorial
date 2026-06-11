import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import AppLayout from '../layouts/AppLayout';
import AuthLayout from '../layouts/AuthLayout';
import CreateTaskPage from '../pages/app/CreateTaskPage';
import DashboardPage from '../pages/app/DashboardPage';
import ProfilePage from '../pages/app/ProfilePage';
import TaskDetailsPage from '../pages/app/TaskDetailsPage';
import TasksPage from '../pages/app/TasksPage';
import LoginPage from '../pages/auth/LoginPage';
import RegisterPage from '../pages/auth/RegisterPage';
import NotFoundPage from '../pages/not-found/NotFoundPage';
import type { AppRouterProps } from './routeTypes';
import ProtectedRoute from './ProtectedRoute';

export default function AppRouter({
  allTasks,
  conflictCount,
  errorMessage,
  getTaskSyncState,
  hasActiveFilters,
  isAuthReady,
  isAuthenticated,
  isOnline,
  isSyncing,
  isUsingOfflineData,
  isFetchingTasks,
  isLoadingTasks,
  isTaskModalOpen,
  listMeta,
  onChangePage,
  onDeleteTask,
  onLogout,
  onOpenConflicts,
  onOpenConflictModal,
  onOpenCreateModal,
  onOpenEditModal,
  onPriorityFilterChange,
  onRetrySync,
  onRetryTasks,
  onSearchChange,
  onSortChange,
  onStatusFilterChange,
  onSyncNow,
  onToggleTaskStatus,
  pendingOperationCount,
  paginatedTasks,
  priorityFilter,
  searchQuery,
  syncMeta,
  sortValue,
  statusFilter,
  user,
}: AppRouterProps) {
  const boardProps = {
    errorMessage,
    getTaskSyncState,
    hasActiveFilters,
    isFetching: isFetchingTasks,
    isLoading: isLoadingTasks,
    listMeta,
    onChangePage,
    onCreateTask: onOpenCreateModal,
    onDeleteTask,
    onEditTask: onOpenEditModal,
    onOpenConflictModal,
    onPriorityFilterChange,
    onRetry: onRetryTasks,
    onSearchChange,
    onSortChange,
    onStatusFilterChange,
    onToggleTaskStatus,
    priorityFilter,
    searchQuery,
    sortValue,
    statusFilter,
    tasks: paginatedTasks,
  };

  return (
    <BrowserRouter>
      <Routes>
        <Route element={<AuthLayout isAuthenticated={isAuthenticated} />}>
          <Route element={<LoginPage />} path="/login" />
          <Route element={<RegisterPage />} path="/register" />
        </Route>

        <Route
          element={
            <ProtectedRoute
              isAuthReady={isAuthReady}
              isAuthenticated={isAuthenticated}
            />
          }
        >
          <Route
            element={
              <AppLayout
                conflictCount={conflictCount}
                isOnline={isOnline}
                isSyncing={isSyncing}
                isUsingOfflineData={isUsingOfflineData}
                onLogout={onLogout}
                onOpenConflicts={onOpenConflicts}
                onRetrySync={onRetrySync}
                onSyncNow={onSyncNow}
                pendingOperationCount={pendingOperationCount}
                syncMeta={syncMeta}
                user={user}
              />
            }
          >
            <Route
              element={
                <DashboardPage allTasks={allTasks} {...boardProps} />
              }
              path="/app"
            />
            <Route element={<TasksPage {...boardProps} />} path="/app/tasks" />
            <Route
              element={
                <CreateTaskPage
                  isTaskModalOpen={isTaskModalOpen}
                  onOpenCreateModal={onOpenCreateModal}
                />
              }
              path="/app/tasks/new"
            />
            <Route
              element={
                <TaskDetailsPage
                  onEditTask={onOpenEditModal}
                  onOpenConflictModal={onOpenConflictModal}
                  onToggleTaskStatus={onToggleTaskStatus}
                />
              }
              path="/app/tasks/:taskId"
            />
            <Route
              element={<ProfilePage tasks={allTasks} user={user} />}
              path="/app/profile"
            />
          </Route>
        </Route>

        <Route
          element={<Navigate replace to={isAuthenticated ? '/app' : '/login'} />}
          path="/"
        />
        <Route
          element={<NotFoundPage isAuthenticated={isAuthenticated} />}
          path="*"
        />
      </Routes>
    </BrowserRouter>
  );
}
