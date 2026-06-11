import type { Task } from '../utils/db';
import {
  Bell,
  Calendar,
  Clock,
  Edit2,
  RefreshCw,
  ShieldAlert,
  Trash2,
} from './AppIcons';

interface TaskCardProps {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onResolveConflict: (task: Task) => void;
}

const priorityColors: Record<Task['priority'], string> = {
  LOW: 'border-slate-700/60 bg-slate-800/80 text-slate-300',
  MEDIUM: 'glow-amber border-amber-500/25 bg-amber-500/10 text-amber-400',
  HIGH: 'border-rose-500/25 bg-rose-500/10 text-rose-400',
};

const statusLabels: Record<Task['status'], string> = {
  TODO: 'Todo',
  IN_PROGRESS: 'In Progress',
  DONE: 'Completed',
};

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onResolveConflict,
}: TaskCardProps) {
  const isDone = task.status === 'DONE';

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) {
      return '';
    }

    try {
      return new Date(isoString).toLocaleDateString([], {
        month: 'short',
        day: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      });
    } catch {
      return '';
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`relative flex flex-col gap-3.5 rounded-xl border p-4 transition-all ${
        task.inConflict
          ? 'border-rose-800/80 bg-rose-950/25 hover:bg-rose-950/35'
          : isDone
            ? 'border-slate-800/70 bg-[#11141B]/60 opacity-60 hover:opacity-85'
            : 'border-slate-800 bg-[#1A1D23] shadow-md hover:border-slate-700 hover:shadow-indigo-950/15'
      }`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex min-w-0 flex-1 items-start gap-3">
          <button
            id={`task-toggle-${task.id}`}
            type="button"
            onClick={() => onToggleStatus(task)}
            className={`mt-1 flex h-5 w-5 items-center justify-center rounded-md border text-white transition-all ${
              isDone
                ? 'border-indigo-600 bg-indigo-600 shadow-sm hover:bg-indigo-500'
                : 'border-slate-700 bg-[#0D1016] hover:border-indigo-500'
            }`}
            title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
          >
            {isDone ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-3.5 w-3.5"
                viewBox="0 0 20 20"
                fill="currentColor"
                aria-hidden="true"
              >
                <path
                  fillRule="evenodd"
                  d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                  clipRule="evenodd"
                />
              </svg>
            ) : null}
          </button>

          <div className="min-w-0 flex-1">
            <h3
              className={`text-sm leading-tight font-semibold text-white ${
                isDone ? 'text-slate-500 line-through' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description ? (
              <p
                className={`mt-1 line-clamp-2 text-xs leading-relaxed ${
                  isDone ? 'text-slate-500' : 'text-slate-400'
                }`}
              >
                {task.description}
              </p>
            ) : null}
          </div>
        </div>

        <div className="flex shrink-0 flex-col items-end gap-1.5">
          {task.inConflict ? (
            <span className="flex animate-pulse items-center gap-0.5 rounded-full bg-rose-600 px-2 py-0.5 text-[10px] font-bold text-white shadow-md">
              <ShieldAlert className="h-3 w-3" />
              Conflict
            </span>
          ) : task.isOfflineCreated ? (
            <span className="glow-indigo flex items-center gap-0.5 rounded-full border border-indigo-500/25 bg-indigo-500/10 px-2 py-0.5 text-[10px] font-bold leading-none text-indigo-400">
              <Clock className="h-2.5 w-2.5 shrink-0" /> Local
            </span>
          ) : task.isOfflineUpdated ? (
            <span className="glow-amber flex items-center gap-0.5 rounded-full border border-amber-500/25 bg-amber-500/10 px-2 py-0.5 text-[10px] font-bold leading-none text-amber-400">
              <RefreshCw
                className="h-2.5 w-2.5 shrink-0 animate-spin"
                style={{ animationDuration: '3s' }}
              />{' '}
              Modified
            </span>
          ) : null}

          <span
            className={`shrink-0 rounded-full border px-2 py-0.5 text-[10px] leading-none font-bold ${priorityColors[task.priority]}`}
          >
            {task.priority}
          </span>
        </div>
      </div>

      {task.dueDate || task.reminderAt ? (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-dashed border-slate-800 py-1 text-[11px] text-slate-400">
          {task.dueDate ? (
            <div className="flex items-center gap-1">
              <Calendar className="h-3 w-3 text-slate-500" />
              <span>Due: {formatDateTime(task.dueDate)}</span>
            </div>
          ) : null}
          {task.reminderAt ? (
            <div className="flex items-center gap-1">
              <Bell className="h-3 w-3 text-amber-500/80" />
              <span>Reminder: {formatDateTime(task.reminderAt)}</span>
            </div>
          ) : null}
        </div>
      ) : null}

      <div className="mt-1 flex items-center justify-between border-t border-slate-800/60 pt-2.5">
        <span className="text-[10px] font-medium text-slate-400">
          Status:{' '}
          <span
            className={`font-bold uppercase ${
              isDone ? 'text-indigo-400' : 'text-slate-300'
            }`}
          >
            {statusLabels[task.status]}
          </span>
        </span>

        {task.inConflict ? (
          <button
            id={`task-resolve-${task.id}`}
            type="button"
            onClick={() => onResolveConflict(task)}
            className="flex items-center gap-1 rounded-lg bg-rose-600 px-3 py-1 text-xs font-bold text-white shadow-md transition-all hover:bg-rose-500"
          >
            <ShieldAlert className="h-3 w-3" />
            Resolve Conflict
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id={`task-edit-${task.id}`}
              type="button"
              onClick={() => onEdit(task)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-slate-800 hover:text-white"
              title="Edit Task"
            >
              <Edit2 className="h-3.5 w-3.5" />
            </button>
            <button
              id={`task-delete-${task.id}`}
              type="button"
              onClick={() => onDelete(task.id)}
              className="rounded-lg p-1.5 text-slate-400 transition-colors hover:bg-rose-950/20 hover:text-rose-400"
              title="Delete Task"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
