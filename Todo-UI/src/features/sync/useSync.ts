import React from 'react';
import { toast } from 'sonner';
import type {
  PendingOperation,
  SyncMetaRecord,
} from '../offline/offlineTypes';
import type { Task } from '../tasks/taskTypes';
import { runPendingTaskSync } from './syncManager';
import { useSyncTasksMutation } from './syncApi';

type UseSyncOptions = {
  cachedTasks: Task[];
  isOnline: boolean;
  onPostSyncRefreshStart?: () => void;
  onSyncComplete: (result: {
    cachedTasks: Task[];
    pendingOperations: PendingOperation[];
    syncMeta: SyncMetaRecord;
  }) => void;
  pendingOperations: PendingOperation[];
  refetchTasks: () => Promise<unknown> | unknown;
  syncMeta: SyncMetaRecord;
  userId: string | null;
};

export function useSync({
  cachedTasks,
  isOnline,
  onSyncComplete,
  pendingOperations,
  refetchTasks,
  syncMeta,
  userId,
  onPostSyncRefreshStart,
}: UseSyncOptions) {
  const [syncTasks, { isLoading: isSyncing }] = useSyncTasksMutation();
  const hasAttemptedAutoSyncRef = React.useRef(false);
  const isSyncingRef = React.useRef(false);

  const syncNow = React.useCallback(async () => {
    if (!userId) {
      return false;
    }

    if (!isOnline) {
      toast.info('You are offline. Sync will resume when the network returns.');
      return false;
    }

    if (isSyncingRef.current) {
      return false;
    }

    isSyncingRef.current = true;

    try {
      const result = await runPendingTaskSync({
        cachedTasks,
        currentSyncMeta: syncMeta,
        executeSyncRequest: (request) => syncTasks(request).unwrap(),
        userId,
      });

      onSyncComplete(result);
      onPostSyncRefreshStart?.();
      await Promise.resolve(refetchTasks());

      if (result.pendingOperations.some((operation) => operation.status === 'CONFLICT')) {
        toast.error('Sync completed with conflicts. Review the affected tasks.');
      } else if (result.pendingOperations.some((operation) => operation.status === 'FAILED')) {
        toast.error('Some offline changes could not be synced. Try again.');
      } else if (pendingOperations.length > 0) {
        toast.success('Offline changes synced successfully.');
      }

      return true;
    } catch {
      toast.error('Sync failed. Please try again.');
      return false;
    } finally {
      isSyncingRef.current = false;
    }
  }, [
    cachedTasks,
    isOnline,
    onSyncComplete,
    onPostSyncRefreshStart,
    pendingOperations.length,
    refetchTasks,
    syncMeta,
    syncTasks,
    userId,
  ]);

  React.useEffect(() => {
    if (!isOnline) {
      hasAttemptedAutoSyncRef.current = false;
      return;
    }

    const hasRetryableOperations = pendingOperations.some(
      (operation) => operation.status !== 'CONFLICT',
    );

    if (!hasRetryableOperations || hasAttemptedAutoSyncRef.current) {
      return;
    }

    hasAttemptedAutoSyncRef.current = true;
    void syncNow();
  }, [isOnline, pendingOperations, syncNow]);

  return {
    isSyncing,
    syncNow,
  };
}
