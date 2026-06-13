import { toast } from 'sonner';
import { Check, CheckSquare, Plus } from '../components/AppIcons';
import { useInstallPrompt } from './useInstallPrompt';

export default function InstallPrompt() {
  const { canInstall, isInstalled, promptInstall } = useInstallPrompt();

  const handleInstall = async () => {
    const outcome = await promptInstall();

    if (outcome === 'accepted') {
      toast.success('TaskFlow is being installed.');
      return;
    }

    if (outcome === 'dismissed') {
      toast.info('Install dismissed for now.');
    }
  };

  const statusLabel = isInstalled
    ? 'Installed'
    : canInstall
      ? 'Ready to Install'
      : 'Waiting for Browser Prompt';

  const helperText = isInstalled
    ? 'TaskFlow is already installed or running in standalone mode on this device.'
    : canInstall
      ? 'Add the app to your device for a faster offline-friendly experience.'
      : 'The install button becomes active when the browser decides this app is installable. If needed, keep using the app for a moment and check the browser install menu too.';

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-3 text-slate-100 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Install TaskFlow</p>
            <p className="mt-0.5 text-[11px] font-bold uppercase tracking-wide text-indigo-200/70">
              {statusLabel}
            </p>
            <p className="text-xs text-indigo-100/80">
              {helperText}
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          disabled={!canInstall || isInstalled}
          className="glow-indigo inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isInstalled ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isInstalled ? 'Installed' : canInstall ? 'Install App' : 'Install Unavailable'}
        </button>
      </div>
    </div>
  );
}
