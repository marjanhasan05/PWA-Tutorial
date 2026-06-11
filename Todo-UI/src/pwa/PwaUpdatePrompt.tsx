import { RefreshCw } from '../components/AppIcons';
import { useRegisterSW } from 'virtual:pwa-register/react';

export default function PwaUpdatePrompt() {
  const {
    needRefresh: [needRefresh, setNeedRefresh],
    offlineReady: [offlineReady, setOfflineReady],
    updateServiceWorker,
  } = useRegisterSW();

  if (!needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 p-3 text-slate-100 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-white">
            {needRefresh ? 'Update ready' : 'Offline support ready'}
          </p>
          <p className="text-xs text-emerald-100/80">
            {needRefresh
              ? 'A new version of TaskFlow is available. Refresh to apply it.'
              : 'The app shell has been cached and can reopen offline after this visit.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {needRefresh ? (
            <button
              type="button"
              onClick={() => updateServiceWorker(true)}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh App
            </button>
          ) : null}
          <button
            type="button"
            onClick={() => {
              setNeedRefresh(false);
              setOfflineReady(false);
            }}
            className="rounded-xl border border-emerald-500/20 bg-transparent px-3 py-2 text-xs font-bold text-emerald-100 transition hover:bg-emerald-500/10"
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
