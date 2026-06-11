import type { ConflictItem, ConflictResolutionAction } from '../features/sync/conflictManager';
import { ChevronRight, RefreshCw, ShieldAlert, Trash2, X } from './AppIcons';

interface ConflictModalProps {
  conflicts: ConflictItem[];
  focusedOperationId: string | null;
  isOpen: boolean;
  onClose: () => void;
  onResolve: (
    conflict: ConflictItem,
    action: ConflictResolutionAction,
  ) => void | Promise<void>;
}

function formatDate(isoString: string | null | undefined) {
  if (!isoString) {
    return 'Not set';
  }

  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return 'Not set';
  }
}

function renderValue(value: string | null | undefined) {
  if (!value) {
    return 'Not set';
  }

  return value;
}

export default function ConflictModal({
  conflicts,
  focusedOperationId,
  isOpen,
  onClose,
  onResolve,
}: ConflictModalProps) {
  if (!isOpen || conflicts.length === 0) {
    return null;
  }

  const orderedConflicts = focusedOperationId
    ? [
        ...conflicts.filter((conflict) => conflict.operationId === focusedOperationId),
        ...conflicts.filter((conflict) => conflict.operationId !== focusedOperationId),
      ]
    : conflicts;

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 backdrop-blur-sm">
      <div className="flex max-h-[92vh] w-full max-w-4xl flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#11141B] text-slate-300 shadow-2xl">
        <div className="flex items-center justify-between border-b border-rose-900/60 bg-rose-950/15 px-6 py-4">
          <div className="flex items-center gap-2.5 text-rose-400">
            <ShieldAlert className="h-5.5 w-5.5 text-rose-400" />
            <div>
              <h2 className="text-base font-bold text-white">
                Sync Conflicts
              </h2>
              <p className="text-[11px] font-semibold text-rose-400/80">
                {conflicts.length} queued change{conflicts.length === 1 ? '' : 's'} need your review.
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

        <div className="flex flex-1 flex-col gap-4 overflow-y-auto p-6">
          {orderedConflicts.map((conflict) => (
            <div
              key={conflict.operationId}
              className="rounded-2xl border border-slate-800 bg-[#1A1D23] p-4"
            >
              <div className="flex flex-col gap-3 border-b border-slate-800 pb-4 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold uppercase text-white">
                      {conflict.operationType}
                    </span>
                    <span className="text-[10px] font-bold uppercase tracking-wide text-slate-500">
                      {conflict.operationId}
                    </span>
                  </div>
                  <h3 className="mt-2 text-sm font-bold text-white">
                    {conflict.taskTitle}
                  </h3>
                  <p className="mt-1 text-xs text-rose-300">
                    {conflict.message}
                  </p>
                </div>
                {conflict.canDismissSafely ? (
                  <span className="rounded-full border border-slate-700 px-2 py-1 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Safe dismiss available
                  </span>
                ) : null}
              </div>

              <div className="mt-4 grid gap-4 md:grid-cols-2">
                <div className="rounded-xl border border-indigo-500/20 bg-indigo-500/5 p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-indigo-400">
                    Local intended change
                  </span>
                  <dl className="mt-3 space-y-2 text-xs text-slate-300">
                    <div>
                      <dt className="text-slate-500">Title</dt>
                      <dd className="font-semibold text-white">
                        {renderValue(
                          conflict.localIntendedChange?.title ??
                            conflict.localTask?.title,
                        )}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Description</dt>
                      <dd>{renderValue(conflict.localIntendedChange?.description)}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Status / Priority</dt>
                      <dd>
                        {renderValue(conflict.localIntendedChange?.status)} /{' '}
                        {renderValue(conflict.localIntendedChange?.priority)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Due / Reminder</dt>
                      <dd>
                        {formatDate(conflict.localIntendedChange?.dueDate)} /{' '}
                        {formatDate(conflict.localIntendedChange?.reminderAt)}
                      </dd>
                    </div>
                  </dl>
                </div>

                <div className="rounded-xl border border-slate-800 bg-[#11141B] p-4">
                  <span className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                    Server version summary
                  </span>
                  <dl className="mt-3 space-y-2 text-xs text-slate-300">
                    <div>
                      <dt className="text-slate-500">Title</dt>
                      <dd className="font-semibold text-white">
                        {renderValue(conflict.serverTask?.title)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Version</dt>
                      <dd>v{conflict.serverTask?.version ?? 'Unknown'}</dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Status / Priority</dt>
                      <dd>
                        {renderValue(conflict.serverTask?.status)} /{' '}
                        {renderValue(conflict.serverTask?.priority)}
                      </dd>
                    </div>
                    <div>
                      <dt className="text-slate-500">Updated</dt>
                      <dd>{formatDate(conflict.serverTask?.updatedAt)}</dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div className="mt-4 flex flex-wrap items-center gap-2 border-t border-slate-800 pt-4">
                <button
                  type="button"
                  onClick={() => onResolve(conflict, 'keep_server')}
                  className="rounded-xl border border-slate-700 bg-slate-800 px-3 py-2 text-xs font-bold text-slate-100 transition hover:bg-slate-700"
                >
                  Keep Server Version
                </button>
                <button
                  type="button"
                  onClick={() => onResolve(conflict, 'retry_local')}
                  className="glow-indigo flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
                >
                  <RefreshCw className="h-3.5 w-3.5" />
                  Retry Local Change
                </button>
                {conflict.canDismissSafely ? (
                  <button
                    type="button"
                    onClick={() => onResolve(conflict, 'dismiss_safe')}
                    className="flex items-center gap-1 rounded-xl border border-amber-500/20 bg-amber-500/10 px-3 py-2 text-xs font-bold text-amber-300 transition hover:bg-amber-500/20"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                    Dismiss Safely
                  </button>
                ) : null}
              </div>
            </div>
          ))}
        </div>

        <div className="flex items-center gap-1.5 border-t border-slate-800 bg-[#1A1D23] px-6 py-4 text-xs text-slate-400">
          <ChevronRight className="h-4 w-4 shrink-0 text-indigo-400" />
          <span>
            Keeping the server version removes the conflicting offline operation. Retrying keeps your local intent and queues it again with the latest safe version when available.
          </span>
        </div>
      </div>
    </div>
  );
}
