import type { Task } from '../tasks/taskTypes';

export type PendingOperationType = 'CREATE' | 'UPDATE' | 'DELETE';
export type PendingOperationStatus =
  | 'PENDING'
  | 'SYNCING'
  | 'FAILED'
  | 'CONFLICT';

export type SyncMetaStatus =
  | 'IDLE'
  | 'OFFLINE'
  | 'SYNCING'
  | 'SYNCED'
  | 'FAILED'
  | 'CONFLICT';

export type PendingOperationConflict = {
  message: string;
  serverTask?: Partial<Task> | null;
};

export type PendingOperation = {
  operationId: string;
  userId: string;
  type: PendingOperationType;
  taskId?: string;
  taskVersion?: number;
  taskPayload?: Partial<Task>;
  createdAt: string;
  status: PendingOperationStatus;
  conflict?: PendingOperationConflict | null;
  lastError?: string | null;
};

export type SyncMetaRecord = {
  userId: string;
  lastSyncAt: string | null;
  lastSyncAttemptAt: string | null;
  lastSyncStatus: SyncMetaStatus;
};

export type TaskSyncBadgeState = 'SYNCED' | 'PENDING' | 'OFFLINE' | 'FAILED';

export const DEFAULT_SYNC_META: SyncMetaRecord = {
  userId: '',
  lastSyncAt: null,
  lastSyncAttemptAt: null,
  lastSyncStatus: 'IDLE',
};
