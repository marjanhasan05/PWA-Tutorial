import { Task } from '../utils/db';
import { ShieldAlert, ArrowRight, X, ChevronRight } from 'lucide-react';

interface ConflictModalProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (taskId: string, resolution: 'keep_local' | 'accept_server' | 'merge', mergedTask?: Partial<Task>) => void;
}

export default function ConflictModal({ task, isOpen, onClose, onResolve }: ConflictModalProps) {
  if (!isOpen || !task || !task.serverTaskForConflict) return null;

  const serverTask = task.serverTaskForConflict;

  const formatDate = (isoStr: string | null) => {
    if (!isoStr) return 'Not set';
    try {
      return new Date(isoStr).toLocaleString();
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
    // Basic merge strategy: mix non-null values
    const merged: Partial<Task> = {
      title: task.title || serverTask.title,
      description: task.description || serverTask.description,
      status: task.status || serverTask.status,
      priority: task.priority || serverTask.priority,
      dueDate: task.dueDate || serverTask.dueDate,
      reminderAt: task.reminderAt || serverTask.reminderAt,
    };
    onResolve(task.id, 'merge', merged);
    onClose();
  };

  return (
    <div id="conflict-resolution-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
      <div
        id="conflict-resolution-dialog"
        className="w-full max-w-2xl bg-[#11141B] rounded-2xl shadow-2xl border border-slate-800/80 flex flex-col max-h-[92vh] overflow-hidden text-slate-300"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 bg-rose-950/15 border-b border-rose-900/60">
          <div className="flex items-center gap-2.5 text-rose-400">
            <ShieldAlert className="w-5.5 h-5.5 text-rose-450 animate-bounce" style={{ animationDuration: '3s' }} />
            <div>
              <h2 className="text-base font-bold text-white">Offline Sync Conflict Detected</h2>
              <p className="text-[11px] font-semibold text-rose-400/80">This task was modified on the server while you were working offline.</p>
            </div>
          </div>
          <button
            id="close-conflict-modal-btn"
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-rose-950/45 text-rose-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Comparison Area */}
        <div className="flex-1 overflow-y-auto p-6 flex flex-col gap-6">
          <p className="text-xs text-slate-400 leading-relaxed">
            Please choose which version you would like to keep. Resolving the conflict will update your cache and synchronize the decision back to the server on the next sync attempt.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Left: Client local edits */}
            <div className="flex flex-col p-4 rounded-xl border border-dashed border-indigo-500/25 bg-indigo-500/5 hover:border-indigo-500/40 transition-colors">
              <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-wider mb-2.5 block">
                Local Client Changes (Your Version)
              </span>
              <div className="flex flex-col gap-3 font-sans">
                <div>
                  <label className="text-[10px] text-slate-500 block font-medium">Task Title</label>
                  <span className="text-sm font-semibold text-white">{task.title}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block font-medium">Description</label>
                  <span className="text-xs text-slate-350">{task.description || <i className="text-slate-550">No notes</i>}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-500 block font-medium">Status</label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700/60 uppercase">{task.status}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-500 block font-medium">Priority</label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-rose-450 text-rose-400 border border-slate-700/60 uppercase">{task.priority}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block font-medium">Due Date</label>
                  <span className="text-[11px] text-slate-300 font-mono">{formatDate(task.dueDate)}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block font-medium">Reminder Alert</label>
                  <span className="text-[11px] text-slate-300 font-mono">{formatDate(task.reminderAt)}</span>
                </div>
              </div>
              <button
                id="resolve-keep-local"
                onClick={handleResolveLocal}
                className="mt-6 w-full py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-98 text-white rounded-lg text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition cursor-pointer glow-indigo"
              >
                Keep Local version
              </button>
            </div>

            {/* Right: Server version */}
            <div className="flex flex-col p-4 rounded-xl border border-dashed border-slate-800 bg-[#1A1D23] hover:border-slate-700 transition">
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider mb-2.5 block">
                Server Version (Cloud Database)
              </span>
              <div className="flex flex-col gap-3 font-sans">
                <div>
                  <label className="text-[10px] text-slate-500 block font-medium">Task Title</label>
                  <span className="text-sm font-semibold text-white">{serverTask.title}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-500 block font-medium">Description</label>
                  <span className="text-xs text-slate-300">{serverTask.description || <i className="text-slate-550">No notes</i>}</span>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="text-[10px] text-slate-400 block font-medium">Status</label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-750 uppercase">{serverTask.status}</span>
                  </div>
                  <div>
                    <label className="text-[10px] text-slate-400 block font-medium">Priority</label>
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-750 uppercase">{serverTask.priority}</span>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 text-slate-400 block font-medium">Due Date</label>
                  <span className="text-[11px] text-slate-300 font-mono">{formatDate(serverTask.dueDate)}</span>
                </div>
                <div>
                  <label className="text-[10px] text-slate-455 text-slate-400 block font-medium">Reminder Alert</label>
                  <span className="text-[11px] text-slate-300 font-mono">{formatDate(serverTask.reminderAt)}</span>
                </div>
              </div>
              <button
                id="resolve-accept-server"
                onClick={handleResolveServer}
                className="mt-6 w-full py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 active:scale-98 text-slate-200 rounded-lg text-xs font-bold transition cursor-pointer"
              >
                Accept Server version
              </button>
            </div>
          </div>
        </div>

        {/* Footer Area - Quick Merge Options */}
        <div className="px-6 py-4 border-t border-slate-850 border-slate-800 bg-[#1A1D23] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-sans">
          <div className="flex items-center gap-1.5 text-slate-400">
            <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0" />
            <span>Unsure? Use custom merge to pool both records cleanly.</span>
          </div>

          <div className="flex gap-3 shrink-0">
            <button
              id="resolve-merge"
              onClick={handleResolveMerge}
              className="px-4 py-2 bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/20 text-xs font-bold rounded-xl transition cursor-pointer glow-indigo"
            >
              Merge non-conflicting fields
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
