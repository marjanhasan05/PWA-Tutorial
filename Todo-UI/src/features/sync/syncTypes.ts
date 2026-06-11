import type { ApiSuccessResponse } from '../../types/api';
import type { PendingOperationType } from '../offline/offlineTypes';
import type { Task } from '../tasks/taskTypes';

export type SyncOperationTaskPayload = Partial<
  Pick<
    Task,
    | 'title'
    | 'description'
    | 'status'
    | 'priority'
    | 'dueDate'
    | 'reminderAt'
    | 'clientCreatedAt'
    | 'clientUpdatedAt'
    | 'deletedAt'
  >
>;

export type SyncRequestOperation = {
  operationId: string;
  type: PendingOperationType;
  taskId?: string;
  taskVersion?: number;
  task?: SyncOperationTaskPayload;
};

export type SyncRequest = {
  lastSyncAt: string | null;
  operations: SyncRequestOperation[];
};

export type SyncOperationConflict = {
  message: string;
  serverTask?: Partial<Task> | null;
};

export type SyncOperationResultStatus = 'APPLIED' | 'CONFLICT' | 'FAILED';

export type SyncOperationResult = {
  operationId: string;
  type: PendingOperationType;
  status: SyncOperationResultStatus;
  task?: Task;
  conflict?: SyncOperationConflict;
  message?: string;
};

export type SyncResponseData = {
  operations: SyncOperationResult[];
  changedTasks: Task[];
};

export type SyncResponse = ApiSuccessResponse<SyncResponseData>;
