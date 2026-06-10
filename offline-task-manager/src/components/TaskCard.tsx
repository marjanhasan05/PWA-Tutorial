import { Task } from '../utils/db';
import { Calendar, Bell, Edit2, Trash2, ShieldAlert, Clock, RefreshCw } from 'lucide-react';

interface TaskCardProps {
  key?: string;
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (id: string) => void;
  onToggleStatus: (task: Task) => void;
  onResolveConflict: (task: Task) => void;
}

export default function TaskCard({
  task,
  onEdit,
  onDelete,
  onToggleStatus,
  onResolveConflict,
}: TaskCardProps) {
  const isDone = task.status === 'DONE';

  const priorityColors = {
    LOW: 'bg-slate-800/80 text-slate-300 border-slate-700/60',
    MEDIUM: 'bg-amber-500/10 text-amber-400 border-amber-500/25 glow-amber',
    HIGH: 'bg-rose-500/10 text-rose-400 border-rose-500/25',
  };

  const statusLabels = {
    TODO: 'Todo',
    IN_PROGRESS: 'In Progress',
    DONE: 'Completed',
  };

  const formatDateTime = (isoString: string | null) => {
    if (!isoString) return '';
    try {
      const d = new Date(isoString);
      return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  };

  return (
    <div
      id={`task-card-${task.id}`}
      className={`relative flex flex-col gap-3.5 p-4 rounded-xl transition-all border ${
        task.inConflict
          ? 'bg-rose-950/25 hover:bg-rose-950/35 border-rose-800/80'
          : isDone
          ? 'bg-[#11141B]/60 border-slate-800/70 opacity-60 hover:opacity-85'
          : 'bg-[#1A1D23] border-slate-800 hover:border-slate-700 shadow-md hover:shadow-indigo-950/15'
      }`}
    >
      {/* Top row: Status checkbox & Title & Sync Indicators */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-start gap-3 flex-1 min-w-0">
          <button
            id={`task-toggle-${task.id}`}
            onClick={() => onToggleStatus(task)}
            className={`mt-1 flex items-center justify-center w-5 h-5 rounded-md border text-white transition-all cursor-pointer ${
              isDone
                ? 'bg-indigo-600 border-indigo-600 hover:bg-indigo-500 shadow-sm'
                : 'border-slate-700 hover:border-indigo-500 bg-[#0D1016]'
            }`}
            title={isDone ? 'Mark as Incomplete' : 'Mark as Done'}
          >
            {isDone && (
              <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
              </svg>
            )}
          </button>

          <div className="flex-1 min-w-0">
            <h3
              className={`text-sm font-semibold text-white leading-tight ${
                isDone ? 'line-through text-slate-550' : ''
              }`}
            >
              {task.title}
            </h3>
            {task.description && (
              <p className={`text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed ${isDone ? 'text-slate-500' : ''}`}>
                {task.description}
              </p>
            )}
          </div>
        </div>

        {/* Sync badges / Conflict tag */}
        <div className="flex flex-col items-end gap-1.5 shrink-0">
          {task.inConflict ? (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-rose-600 text-white text-[10px] font-mono font-bold shadow-md animate-pulse">
              <ShieldAlert className="w-3 h-3" />
              Conflict
            </span>
          ) : task.isOfflineCreated ? (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-indigo-500/10 border border-indigo-500/25 text-indigo-400 text-[10px] font-mono font-bold leading-none glow-indigo">
              <Clock className="w-2.5 h-2.5 shrink-0" /> Local
            </span>
          ) : task.isOfflineUpdated ? (
            <span className="flex items-center gap-0.5 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/25 text-amber-400 text-[10px] font-mono font-bold leading-none glow-amber">
              <RefreshCw className="w-2.5 h-2.5 shrink-0 animate-spin" style={{ animationDuration: '3s' }} /> Modified
            </span>
          ) : null}

          {/* Priority Indicator */}
          <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border leading-none shrink-0 ${priorityColors[task.priority]}`}>
            {task.priority}
          </span>
        </div>
      </div>

      {/* Middle row: Schedule info (Due dates, Reminders) */}
      {(task.dueDate || task.reminderAt) && (
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1.5 py-1 text-[11px] text-slate-400 border-t border-dashed border-slate-800">
          {task.dueDate && (
            <div className="flex items-center gap-1">
              <Calendar className="w-3 h-3 text-slate-500" />
              <span>Due: {formatDateTime(task.dueDate)}</span>
            </div>
          )}
          {task.reminderAt && (
            <div className="flex items-center gap-1">
              <Bell className="w-3 h-3 text-amber-500/80" />
              <span>Reminder: {formatDateTime(task.reminderAt)}</span>
            </div>
          )}
        </div>
      )}

      {/* Bottom Row - Conflict Callout & Actions */}
      <div className="flex items-center justify-between mt-1 pt-2.5 border-t border-slate-800/60">
        <span className="text-[10px] text-slate-400 font-medium">
          Status: <span className={`font-bold uppercase ${isDone ? 'text-indigo-400' : 'text-slate-350'}`}>{statusLabels[task.status]}</span>
        </span>

        {task.inConflict ? (
          <button
            id={`task-resolve-${task.id}`}
            onClick={() => onResolveConflict(task)}
            className="flex items-center gap-1 px-3 py-1 bg-rose-600 hover:bg-rose-500 active:scale-95 text-white text-xs font-bold rounded-lg shadow-md font-sans transition-all cursor-pointer"
          >
            <ShieldAlert className="w-3 h-3" />
            Resolve Conflict
          </button>
        ) : (
          <div className="flex items-center gap-2">
            <button
              id={`task-edit-${task.id}`}
              onClick={() => onEdit(task)}
              className="p-1.5 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-colors cursor-pointer"
              title="Edit Task"
            >
              <Edit2 className="w-3.5 h-3.5" />
            </button>
            <button
              id={`task-delete-${task.id}`}
              onClick={() => onDelete(task.id)}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-950/20 rounded-lg transition-colors cursor-pointer"
              title="Delete Task"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
