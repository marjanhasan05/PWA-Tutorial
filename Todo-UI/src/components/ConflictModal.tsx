import type { ConflictResolution, Task } from '../utils/db';
import { ChevronRight, ShieldAlert, X } from './AppIcons';

interface ConflictModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    taskId: string,
    resolution: ConflictResolution,
    mergedTask?: Partial<Task>,
  ) => void;
}

export default function ConflictModal({
  task,
  isOpen,
  onClose,
  onResolve,
}: ConflictModalProps) {
  if (!isOpen || !task || !task.serverTaskForConflict) {
    return null;
  }

  const serverTask = task.serverTaskForConflict;

  const formatDate = (isoString: string | null) => {
    if (!isoString) {
      return 'Not set';
    }

    try {
      return new Date(isoString).toLocaleString();
    } catch {
      return 'Not set';
    }
  };

  const handleResolveLocal = () => {
    onResolve(task.id, 'keep_local');
    onClose();
  };

  const handleResolveServer = () => {
    onResolve(task.id, 'accept_server');
    onClose();
  };

  const handleResolveMerge = () => {
    const mergedTask: Partial<Task> = {
      title: task.title || serverTask.title,
      description: task.description || serverTask.description,
      status: task.status || serverTask.status,
      priority: task.priority || serverTask.priority,
      dueDate: task.dueDate || serverTask.dueDate,
      reminderAt: task.reminderAt || serverTask.reminderAt,
    };

    onResolve(task.id, 'merge', mergedTask);
    onClose();
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#11141B] text-slate-300 shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose-900/60 bg-rose-950/15 px-6 py-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <ShieldAlert
              className="h-5.5 w-5.5 animate-bounce text-rose-400"
              style={{ animationDuration: '3s' }}
            />
            <div>
              <h2 className="text-base font-bold text-white">
                Offline Sync Conflict Detected
              </h2>
              <p className="text-[11px] font-semibold text-rose-400/80">
                This task was modified on the server while you were working
                offline.
              </p>
            </div>
          </div>
          <button
            id="close-conflict-modal-btn"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-rose-400 transition-colors hover:bg-rose-950/45 hover:text-white"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="flex flex-1 flex-col gap-6 overflow-y-auto p-6">
          <p className="text-xs leading-relaxed text-slate-400">
            Please choose which version you would like to keep. Resolving the
            conflict will update your cache and synchronize the decision back to
            the server on the next sync attempt.
          </p>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="flex flex-col rounded-xl border border-dashed border-indigo-500/25 bg-indigo-500/5 p-4 transition-colors hover:border-indigo-500/40">
              <span className="mb-2.5 block text-[10px] font-bold tracking-wider text-indigo-400 uppercase">
                Local Client Changes (Your Version)
              </span>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500">
                    Task Title
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {task.title}
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500">
                    Description
                  </label>
                  <span className="text-xs text-slate-300">
                    {task.description || (
                      <i className="text-slate-500">No notes</i>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500">
                      Status
                    </label>
                    <span className="border-slate-700/60 rounded border bg-slate-800 px-2 py-0.5 text-xs font-semibold text-indigo-300 uppercase">
                      {task.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-500">
                      Priority
                    </label>
                    <span className="rounded border border-slate-700/60 bg-slate-800 px-2 py-0.5 text-xs font-semibold text-rose-400 uppercase">
                      {task.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500">
                    Due Date
                  </label>
                  <span className="font-mono text-[11px] text-slate-300">
                    {formatDate(task.dueDate)}
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500">
                    Reminder Alert
                  </label>
                  <span className="font-mono text-[11px] text-slate-300">
                    {formatDate(task.reminderAt)}
                  </span>
                </div>
              </div>
              <button
                id="resolve-keep-local"
                type="button"
                onClick={handleResolveLocal}
                className="glow-indigo mt-6 w-full rounded-lg bg-indigo-600 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
              >
                Keep Local version
              </button>
            </div>

            <div className="flex flex-col rounded-xl border border-dashed border-slate-800 bg-[#1A1D23] p-4 transition hover:border-slate-700">
              <span className="mb-2.5 block text-[10px] font-bold tracking-wider text-slate-400 uppercase">
                Server Version (Cloud Database)
              </span>
              <div className="flex flex-col gap-3">
                <div>
                  <label className="block text-[10px] font-medium text-slate-500">
                    Task Title
                  </label>
                  <span className="text-sm font-semibold text-white">
                    {serverTask.title}
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-500">
                    Description
                  </label>
                  <span className="text-xs text-slate-300">
                    {serverTask.description || (
                      <i className="text-slate-500">No notes</i>
                    )}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400">
                      Status
                    </label>
                    <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300 uppercase">
                      {serverTask.status}
                    </span>
                  </div>
                  <div>
                    <label className="block text-[10px] font-medium text-slate-400">
                      Priority
                    </label>
                    <span className="rounded border border-slate-700 bg-slate-800 px-2 py-0.5 text-xs font-semibold text-slate-300 uppercase">
                      {serverTask.priority}
                    </span>
                  </div>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400">
                    Due Date
                  </label>
                  <span className="font-mono text-[11px] text-slate-300">
                    {formatDate(serverTask.dueDate)}
                  </span>
                </div>
                <div>
                  <label className="block text-[10px] font-medium text-slate-400">
                    Reminder Alert
                  </label>
                  <span className="font-mono text-[11px] text-slate-300">
                    {formatDate(serverTask.reminderAt)}
                  </span>
                </div>
              </div>
              <button
                id="resolve-accept-server"
                type="button"
                onClick={handleResolveServer}
                className="mt-6 w-full rounded-lg border border-slate-700 bg-slate-800 py-2 text-xs font-bold text-slate-200 transition hover:bg-slate-700"
              >
                Accept Server version
              </button>
            </div>
          </div>
        </div>

        <div className="flex flex-col items-center justify-between gap-4 border-t border-slate-800 bg-[#1A1D23] px-6 py-4 text-xs sm:flex-row">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ChevronRight className="h-4 w-4 shrink-0 text-indigo-400" />
            <span>Unsure? Use custom merge to pool both records cleanly.</span>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              id="resolve-merge"
              type="button"
              onClick={handleResolveMerge}
              className="glow-indigo rounded-xl border border-indigo-500/20 bg-indigo-500/10 px-4 py-2 text-xs font-bold text-indigo-400 transition hover:bg-indigo-500/20"
            >
              Merge non-conflicting fields
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
