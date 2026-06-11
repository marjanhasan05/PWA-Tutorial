export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type PriorityFilter = 'ALL' | TaskPriority;
export type TaskStatusFilter = 'ALL' | TaskStatus;

export type TaskSortBy =
  | 'updatedAt'
  | 'createdAt'
  | 'dueDate'
  | 'priority'
  | 'status'
  | 'title';

export type TaskSortOrder = 'asc' | 'desc';

export type TaskSortValue =
  | 'updatedAt:desc'
  | 'updatedAt:asc'
  | 'createdAt:desc'
  | 'dueDate:asc'
  | 'priority:desc';

export type TaskFormValues = {
  title: string;
  description: string;
  status: TaskStatus;
  priority: TaskPriority;
  dueDate: string | null;
  reminderAt: string | null;
};

export type Task = TaskFormValues & {
  id: string;
  userId: string;
  reminderSentAt?: string | null;
  version: number;
  clientCreatedAt: string;
  clientUpdatedAt: string;
  lastOperationId?: string | null;
  createdAt: string;
  updatedAt: string;
  deletedAt?: string | null;
  inConflict?: boolean;
  serverTaskForConflict?: Task | null;
  isOfflineCreated?: boolean;
  isOfflineUpdated?: boolean;
  isOfflineDeleted?: boolean;
};

export type TaskListMeta = {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
};

export type TaskListQueryParams = {
  page?: number;
  limit?: number;
  search?: string;
  status?: TaskStatusFilter;
  priority?: PriorityFilter;
  sortBy?: TaskSortBy;
  sortOrder?: TaskSortOrder;
  updatedSince?: string;
};

export type TaskListResult = {
  items: Task[];
  meta: TaskListMeta;
};

export const DEFAULT_TASK_PAGE_SIZE = 6;

export const DEFAULT_TASK_LIST_META: TaskListMeta = {
  page: 1,
  limit: DEFAULT_TASK_PAGE_SIZE,
  total: 0,
  totalPages: 1,
  hasNextPage: false,
  hasPrevPage: false,
};

export const TASK_SORT_OPTIONS: Array<{
  label: string;
  value: TaskSortValue;
}> = [
  { label: 'Recently Updated', value: 'updatedAt:desc' },
  { label: 'Oldest Updated', value: 'updatedAt:asc' },
  { label: 'Newest Created', value: 'createdAt:desc' },
  { label: 'Due Soon', value: 'dueDate:asc' },
  { label: 'Priority First', value: 'priority:desc' },
];
