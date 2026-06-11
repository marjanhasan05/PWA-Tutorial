import { RefreshCw, Wifi, WifiOff } from './AppIcons';
import type { SyncMetaRecord } from '../features/offline/offlineTypes';

interface OnlineIndicatorProps {
  conflictCount: number;
  isOnline: boolean;
  isSyncing: boolean;
  isUsingOfflineData: boolean;
  onOpenConflicts: () => void;
  onRetrySync: () => void | Promise<void>;
  onSyncNow: () => void | Promise<void>;
  pendingOperationCount: number;
  syncMeta: SyncMetaRecord;
}

export default function OnlineIndicator({
  conflictCount,
  isOnline,
  isSyncing,
  isUsingOfflineData,
  onOpenConflicts,
  onRetrySync,
  onSyncNow,
  pendingOperationCount,
  syncMeta,
}: OnlineIndicatorProps) {
  const formatLastSynced = (isoString: string | null) => {
    if (!isoString) {
      return 'Never';
    }

    try {
      return new Date(isoString).toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      });
    } catch {
      return 'Never';
    }
  };

  const syncStatusLabel =
    syncMeta.lastSyncStatus === 'SYNCING'
      ? 'Syncing'
      : syncMeta.lastSyncStatus === 'SYNCED'
        ? 'Synced'
        : syncMeta.lastSyncStatus === 'FAILED'
          ? 'Failed'
          : syncMeta.lastSyncStatus === 'CONFLICT'
            ? 'Conflict'
            : syncMeta.lastSyncStatus === 'OFFLINE'
              ? 'Offline'
              : 'Idle';

  const syncStatusTone =
    syncMeta.lastSyncStatus === 'SYNCED'
      ? 'border-emerald-500/20 text-emerald-300'
      : syncMeta.lastSyncStatus === 'FAILED'
        ? 'border-rose-500/20 text-rose-300'
        : syncMeta.lastSyncStatus === 'CONFLICT'
          ? 'border-amber-500/20 text-amber-300'
          : 'border-indigo-500/20 text-indigo-300';

  return (
    <div className="flex w-full flex-col gap-2">
      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#11141B] p-3.5 text-slate-200 shadow-lg">
        <div className="flex min-w-0 items-center gap-3">
          <div className="relative flex h-3 w-3">
            {isOnline ? (
              <>
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
                <span className="relative inline-flex h-3 w-3 rounded-full bg-emerald-500" />
              </>
            ) : (
              <span className="relative inline-flex h-3 w-3 rounded-full bg-amber-500" />
            )}
          </div>

          <div className="flex min-w-0 flex-col select-none">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-semibold tracking-wide text-white">
                {isOnline ? 'Network: Online' : 'Network: Offline'}
              </span>
              <span
                className={`flex items-center gap-1 rounded border px-1.5 py-1 text-[10px] ${syncStatusTone}`}
              >
                {isOnline ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                )}
                {isUsingOfflineData ? 'Using Cached Tasks' : 'Live Backend Data'}
              </span>
              <span
                className={`rounded border px-1.5 py-1 text-[10px] font-bold uppercase tracking-wide ${syncStatusTone}`}
              >
                {syncStatusLabel}
              </span>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Last Database Sync: {formatLastSynced(syncMeta.lastSyncAt)}
            </span>
            <span className="mt-1 text-[11px] text-slate-500">
              {!isOnline
                ? 'You can keep browsing cached tasks. New changes will stay queued locally.'
                : conflictCount > 0
                  ? 'Resolve sync conflicts before your queued changes can fully settle.'
                  : pendingOperationCount > 0
                    ? 'Queued changes are waiting for the next sync pass.'
                    : 'Your task shell is connected and ready.'}
            </span>
          </div>
        </div>

        <div className="flex w-full flex-wrap items-center gap-3 sm:w-auto sm:justify-end">
          <div className="rounded-xl border border-slate-700 bg-slate-900/60 px-3 py-2 text-right">
            <div className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
              Queue
            </div>
            <div className="text-sm font-black text-white">
              {pendingOperationCount}
            </div>
          </div>
          {conflictCount > 0 ? (
            <button
              type="button"
              onClick={onOpenConflicts}
              className="rounded-xl border border-rose-500/25 bg-rose-500/10 px-3 py-2 text-right transition hover:bg-rose-500/20"
            >
              <div className="text-[10px] font-bold uppercase tracking-wide text-rose-300">
                Conflicts
              </div>
              <div className="text-sm font-black text-white">{conflictCount}</div>
            </button>
          ) : null}
          <button
            id="sync-actions-button"
            type="button"
            onClick={syncMeta.lastSyncStatus === 'FAILED' ? onRetrySync : onSyncNow}
            disabled={isSyncing || !isOnline}
            className="glow-indigo flex items-center gap-1.5 rounded-xl border border-indigo-500/35 bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            title={isOnline ? 'Sync latest changes' : 'Connect to sync'}
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span>
              {isSyncing
                ? 'Syncing...'
                : syncMeta.lastSyncStatus === 'FAILED'
                  ? 'Retry Sync'
                  : 'Sync Now'}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
