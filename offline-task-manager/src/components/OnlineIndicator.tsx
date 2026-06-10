import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { syncDataWithServer, clearSyncResult } from '../store/tasksSlice';
import { Wifi, WifiOff, RefreshCw, AlertCircle, CheckCircle2 } from 'lucide-react';

export default function OnlineIndicator() {
  const dispatch = useAppDispatch();
  const { isOnline, lastSyncAt, isSyncing, syncQueueCount, syncSuccessMessage, syncError } = useAppSelector(
    (state) => state.tasks
  );

  const handleSync = () => {
    dispatch(syncDataWithServer());
  };

  // Automatically clear success/error banner messages after 5 seconds
  React.useEffect(() => {
    if (syncSuccessMessage || syncError) {
      const timer = setTimeout(() => {
        dispatch(clearSyncResult());
      }, 5000);
      return () => clearTimeout(timer);
    }
  }, [syncSuccessMessage, syncError, dispatch]);

  const formatLastSynced = (isoStr: string | null) => {
    if (!isoStr) return 'Never';
    try {
      const d = new Date(isoStr);
      return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
    } catch {
      return 'Never';
    }
  };

  return (
    <div id="pwa-status-controller" className="w-full flex flex-col gap-2">
      {/* Toast Messages for Sync Feedback */}
      {syncSuccessMessage && (
        <div id="sync-success-banner" className="flex items-center gap-2 bg-emerald-950/30 text-emerald-400 border-l-4 border-emerald-500 p-3 rounded-r-xl text-xs font-semibold shadow-md animate-fade-in glow-emerald">
          <CheckCircle2 className="w-4.5 h-4.5 text-emerald-400 shrink-0" />
          <span>{syncSuccessMessage}</span>
        </div>
      )}

      {syncError && (
        <div id="sync-error-banner" className="flex items-center gap-2 bg-rose-950/30 text-rose-400 border-l-4 border-rose-500 p-3 rounded-r-xl text-xs font-semibold shadow-md animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0" />
          <span>Sync issue: {syncError}</span>
        </div>
      )}

      {/* Main Status Badge Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-[#11141B] text-slate-200 p-3.5 rounded-2xl shadow-lg border border-slate-800/80">
        <div className="flex items-center gap-3">
          {/* Pulsing Status Dot */}
          <div className="relative flex h-3 w-3">
            {isOnline ? (
              <>
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
              </>
            ) : (
              <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
            )}
          </div>

          <div className="flex flex-col select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-wide text-white">
                {isOnline ? 'Network: Online' : 'Network: Offline (App Restored)'}
              </span>
              {isOnline ? (
                <Wifi className="w-3.5 h-3.5 text-emerald-400" />
              ) : (
                <WifiOff className="w-3.5 h-3.5 text-amber-500" />
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-mono">
              Last Database Sync: {formatLastSynced(lastSyncAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {syncQueueCount > 0 && (
            <div id="pending-queue-badge" className="flex items-center px-2.5 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30 text-amber-400 text-xs font-mono font-medium glow-amber">
              {syncQueueCount} pending
            </div>
          )}

          <button
            id="sync-actions-button"
            onClick={handleSync}
            disabled={isSyncing || !isOnline}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-bold transition-all ${
              !isOnline
                ? 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
                : isSyncing
                ? 'bg-indigo-600 text-white cursor-not-allowed border border-indigo-500'
                : 'bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-white border border-indigo-500/35 hover:shadow-lg glow-indigo cursor-pointer'
            }`}
            title={!isOnline ? 'Connect to the internet to synchronise' : 'Sync latest changes'}
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
