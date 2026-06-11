import { toast } from 'sonner';
import { CheckSquare, Plus } from '../components/AppIcons';
import { useInstallPrompt } from './useInstallPrompt';

export default function InstallPrompt() {
  const { canInstall, promptInstall } = useInstallPrompt();
  if (!canInstall) {
    return null;
  }

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

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/10 p-3 text-slate-100 shadow-sm">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3">
          <div className="rounded-xl bg-indigo-600 p-2 text-white">
            <CheckSquare className="h-4 w-4" />
          </div>
          <div>
            <p className="text-sm font-bold text-white">Install TaskFlow</p>
            <p className="text-xs text-indigo-100/80">
              Add the app to your home screen for a faster offline-friendly
              experience.
            </p>
          </div>
        </div>
        <button
          type="button"
          onClick={handleInstall}
          className="glow-indigo inline-flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
        >
          <Plus className="h-3.5 w-3.5" />
          Install App
        </button>
      </div>
    </div>
  );
}
