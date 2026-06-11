import type { AuthUser } from '../features/auth/authTypes';
import type { SyncMetaRecord, TaskSyncBadgeState } from '../features/offline/offlineTypes';
import type {
  PriorityFilter,
  Task,
  TaskListMeta,
  TaskSortValue,
  TaskStatusFilter,
} from '../features/tasks/taskTypes';

export interface TaskBoardControllerProps {
  tasks: Task[];
  errorMessage?: string | null;
  getTaskSyncState: (task: Task) => TaskSyncBadgeState;
  hasActiveFilters: boolean;
  isFetching?: boolean;
  isLoading?: boolean;
  listMeta: TaskListMeta;
  onChangePage: (page: number) => void;
  searchQuery: string;
  sortValue: TaskSortValue;
  statusFilter: TaskStatusFilter;
  priorityFilter: PriorityFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onRetry: () => void;
  onSortChange: (value: TaskSortValue) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void | Promise<void>;
  onToggleTaskStatus: (task: Task) => void;
  onOpenConflictModal: (task: Task) => void;
}

export interface AppRouterProps {
  allTasks: Task[];
  conflictCount: number;
  errorMessage?: string | null;
  getTaskSyncState: (task: Task) => TaskSyncBadgeState;
  hasActiveFilters: boolean;
  isAuthReady: boolean;
  isAuthenticated: boolean;
  isOnline: boolean;
  isSyncing: boolean;
  isUsingOfflineData: boolean;
  isFetchingTasks: boolean;
  isLoadingTasks: boolean;
  isTaskModalOpen: boolean;
  listMeta: TaskListMeta;
  onChangePage: (page: number) => void;
  onDeleteTask: (id: string) => void | Promise<void>;
  onLogout: () => void;
  onOpenConflicts: () => void;
  onOpenConflictModal: (task: Task) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (task: Task) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onRetrySync: () => void | Promise<void>;
  onRetryTasks: () => void;
  onSearchChange: (value: string) => void;
  onSortChange: (value: TaskSortValue) => void;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onSyncNow: () => void | Promise<void>;
  onToggleTaskStatus: (task: Task) => void;
  pendingOperationCount: number;
  paginatedTasks: Task[];
  priorityFilter: PriorityFilter;
  searchQuery: string;
  syncMeta: SyncMetaRecord;
  sortValue: TaskSortValue;
  statusFilter: TaskStatusFilter;
  user: AuthUser | null;
}
