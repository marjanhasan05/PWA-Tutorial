import Swal from 'sweetalert2';
import { toast } from 'sonner';
import { Check, CheckSquare, Plus } from '../components/AppIcons';
import { useInstallPrompt } from './useInstallPrompt';

export default function InstallPrompt() {
  const { canInstall, isInstalled, platform, promptInstall } = useInstallPrompt();

  const showManualInstallHelp = async () => {
    const instructions =
      platform === 'ios'
        ? 'Open this app in Safari, tap Share, then choose Add to Home Screen.'
        : platform === 'android'
          ? 'Open the browser menu, then choose Install app or Add to Home screen.'
          : 'Use your browser install menu to add this app to your device.';

    await Swal.fire({
      title: 'Install TaskFlow',
      text: instructions,
      icon: 'info',
      confirmButtonText: 'Got It',
      background: '#11141B',
      color: '#E2E8F0',
      confirmButtonColor: '#4F46E5',
      customClass: {
        popup: 'rounded-[24px] border border-slate-800 shadow-2xl',
        title: 'text-left text-xl font-black text-white',
        htmlContainer: 'text-left text-sm text-slate-400',
        actions: 'gap-3',
        confirmButton: 'rounded-xl px-4 py-2 text-xs font-bold',
      },
    });
  };

  const handleInstall = async () => {
    if (!canInstall) {
      await showManualInstallHelp();
      return;
    }

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
      : 'Install Available';

  const helperText = isInstalled
    ? 'TaskFlow is already installed or running in standalone mode on this device.'
    : canInstall
      ? 'Add the app to your device for a faster offline-friendly experience.'
      : platform === 'ios'
        ? 'Tap Install App for the steps. On iPhone and iPad, Safari usually uses Share -> Add to Home Screen instead of a browser prompt.'
        : platform === 'android'
          ? 'Tap Install App. If Chrome does not expose a browser prompt, we will show the menu-based install steps instead.'
          : 'Tap Install App to try the browser prompt. If the browser does not expose one, we will show the manual install steps.';

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
          disabled={isInstalled}
          className="glow-indigo inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isInstalled ? (
            <Check className="h-3.5 w-3.5" />
          ) : (
            <Plus className="h-3.5 w-3.5" />
          )}
          {isInstalled ? 'Installed' : 'Install App'}
        </button>
      </div>
    </div>
  );
}
