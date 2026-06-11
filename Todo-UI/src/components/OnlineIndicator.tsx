import React from 'react';
import { CheckCircle2, RefreshCw, Wifi, WifiOff } from './AppIcons';

export default function OnlineIndicator() {
  const [isOnline, setIsOnline] = React.useState(true);
  const [isSyncing, setIsSyncing] = React.useState(false);
  const [lastSyncAt, setLastSyncAt] = React.useState<string | null>(
    new Date().toISOString(),
  );
  const [syncSuccessMessage, setSyncSuccessMessage] = React.useState<
    string | null
  >(null);

  const handleSync = () => {
    setIsSyncing(true);
    setSyncSuccessMessage(null);

    window.setTimeout(() => {
      setIsSyncing(false);
      setLastSyncAt(new Date().toISOString());
      setSyncSuccessMessage(
        'Simulated Sync: All tasks resolved and locally synchronized!',
      );
    }, 1000);
  };

  React.useEffect(() => {
    if (!syncSuccessMessage) {
      return;
    }

    const timer = window.setTimeout(() => {
      setSyncSuccessMessage(null);
    }, 4000);

    return () => window.clearTimeout(timer);
  }, [syncSuccessMessage]);

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

  return (
    <div className="flex w-full flex-col gap-2">
      {syncSuccessMessage ? (
        <div className="animate-fade-in glow-emerald flex items-center gap-2 rounded-r-xl border-l-4 border-emerald-500 bg-emerald-950/30 p-3 text-xs font-semibold text-emerald-400">
          <CheckCircle2 className="h-4.5 w-4.5 shrink-0 text-emerald-400" />
          <span>{syncSuccessMessage}</span>
        </div>
      ) : null}

      <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-800/80 bg-[#11141B] p-3.5 text-slate-200 shadow-lg">
        <div className="flex items-center gap-3">
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

          <div className="flex flex-col select-none">
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-semibold tracking-wide text-white">
                {isOnline
                  ? 'Network: Online'
                  : 'Network: Offline (App Restored)'}
              </span>
              <button
                type="button"
                onClick={() => setIsOnline((value) => !value)}
                className="flex items-center gap-1 rounded border border-indigo-500/20 px-1.5 py-1 text-xs text-indigo-400 transition hover:bg-slate-800"
                title="Toggle Mode"
              >
                {isOnline ? (
                  <Wifi className="h-3.5 w-3.5" />
                ) : (
                  <WifiOff className="h-3.5 w-3.5 text-amber-500" />
                )}
                <span className="text-[9px] uppercase tracking-wider">
                  Test {isOnline ? 'Offline' : 'Online'} CSS
                </span>
              </button>
            </div>
            <span className="font-mono text-[11px] text-slate-400">
              Last Database Sync: {formatLastSynced(lastSyncAt)}
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            id="sync-actions-button"
            type="button"
            onClick={handleSync}
            disabled={isSyncing}
            className="glow-indigo flex items-center gap-1.5 rounded-xl border border-indigo-500/35 bg-indigo-600 px-3.5 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            title="Sync latest changes"
          >
            <RefreshCw
              className={`h-3.5 w-3.5 ${isSyncing ? 'animate-spin' : ''}`}
            />
            <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
