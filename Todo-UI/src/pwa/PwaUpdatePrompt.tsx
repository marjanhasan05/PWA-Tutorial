import { RefreshCw } from '../components/AppIcons';
import {
  dismissPwaRegistrationState,
  getPwaUpdateServiceWorker,
  usePwaRegistrationState,
} from './pwaRegistration';

export default function PwaUpdatePrompt() {
  const { error, needRefresh, offlineReady } = usePwaRegistrationState();

  if (!error && !needRefresh && !offlineReady) {
    return null;
  }

  return (
    <div
      className={`rounded-2xl p-3 text-slate-100 shadow-sm ${
        error
          ? 'border border-amber-500/20 bg-amber-500/10'
          : 'border border-emerald-500/20 bg-emerald-500/10'
      }`}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm font-bold text-white">
            {error
              ? 'Service worker needs attention'
              : needRefresh
                ? 'Update ready'
                : 'Offline support ready'}
          </p>
          <p
            className={`text-xs ${
              error ? 'text-amber-100/90' : 'text-emerald-100/80'
            }`}
          >
            {error
              ? `${error} If this keeps happening in dev mode, clear site data for localhost and reload once.`
              : needRefresh
                ? 'A new version of TaskFlow is available. Refresh to apply it.'
                : 'The app shell has been cached and can reopen offline after this visit.'}
          </p>
        </div>
        <div className="flex items-center gap-2">
          {needRefresh ? (
            <button
              type="button"
              onClick={() => {
                void getPwaUpdateServiceWorker()?.(true);
              }}
              className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-emerald-500"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh App
            </button>
          ) : null}
          <button
            type="button"
            onClick={dismissPwaRegistrationState}
            className={`rounded-xl border bg-transparent px-3 py-2 text-xs font-bold transition ${
              error
                ? 'border-amber-500/20 text-amber-100 hover:bg-amber-500/10'
                : 'border-emerald-500/20 text-emerald-100 hover:bg-emerald-500/10'
            }`}
          >
            Dismiss
          </button>
        </div>
      </div>
    </div>
  );
}
