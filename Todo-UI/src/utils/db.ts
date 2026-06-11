export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH';
export type PriorityFilter = 'ALL' | TaskPriority;
export type AuthTab = 'login' | 'register';

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
  version: number;
  clientCreatedAt: string;
  clientUpdatedAt: string;
  inConflict?: boolean;
  serverTaskForConflict?: Task | null;
  isOfflineCreated?: boolean;
  isOfflineUpdated?: boolean;
  isOfflineDeleted?: boolean;
  deletedAt?: string | null;
};
