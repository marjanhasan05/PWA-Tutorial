import type { AuthUser } from '../features/auth/authTypes';
import type { PriorityFilter, Task, TaskStatusFilter } from '../utils/db';

export interface TaskBoardControllerProps {
  tasks: Task[];
  searchQuery: string;
  statusFilter: TaskStatusFilter;
  priorityFilter: PriorityFilter;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onCreateTask: () => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (id: string) => void | Promise<void>;
  onToggleTaskStatus: (task: Task) => void;
  onOpenConflictModal: (task: Task) => void;
}

export interface AppRouterProps {
  allTasks: Task[];
  filteredTasks: Task[];
  isAuthReady: boolean;
  isAuthenticated: boolean;
  isTaskModalOpen: boolean;
  onDeleteTask: (id: string) => void | Promise<void>;
  onLogout: () => void;
  onOpenConflictModal: (task: Task) => void;
  onOpenCreateModal: () => void;
  onOpenEditModal: (task: Task) => void;
  onPriorityFilterChange: (value: PriorityFilter) => void;
  onSearchChange: (value: string) => void;
  onStatusFilterChange: (value: TaskStatusFilter) => void;
  onToggleTaskStatus: (task: Task) => void;
  priorityFilter: PriorityFilter;
  searchQuery: string;
  statusFilter: TaskStatusFilter;
  user: AuthUser | null;
}
