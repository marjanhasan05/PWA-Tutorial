import { Link, useParams } from 'react-router-dom';
import { Calendar, Clock, Edit2, ShieldAlert } from '../../components/AppIcons';
import type { Task } from '../../utils/db';

interface TaskDetailsPageProps {
  tasks: Task[];
  onEditTask: (task: Task) => void;
  onOpenConflictModal: (task: Task) => void;
  onToggleTaskStatus: (task: Task) => void;
}

function formatValue(isoString: string | null) {
  if (!isoString) {
    return 'Not set';
  }

  try {
    return new Date(isoString).toLocaleString();
  } catch {
    return 'Not set';
  }
}

export default function TaskDetailsPage({
  tasks,
  onEditTask,
  onOpenConflictModal,
  onToggleTaskStatus,
}: TaskDetailsPageProps) {
  const { taskId } = useParams();
  const task = tasks.find((item) => item.id === taskId);

  if (!task) {
    return (
      <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
        <h1 className="text-lg font-black text-slate-900 dark:text-white">
          Task not found
        </h1>
        <p className="mt-2 text-sm text-slate-400">
          The requested task does not exist in the current in-memory dataset.
        </p>
        <Link
          className="mt-4 inline-flex text-sm font-bold text-indigo-400 hover:text-indigo-300"
          to="/app/tasks"
        >
          Return to Tasks
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
              Task Details
            </span>
            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              {task.title}
            </h1>
            <p className="mt-2 text-sm leading-relaxed text-slate-400">
              {task.description || 'No description was added for this task.'}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
              onClick={() => onToggleTaskStatus(task)}
              type="button"
            >
              Toggle Status
            </button>
            <button
              className="glow-indigo flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
              onClick={() => onEditTask(task)}
              type="button"
            >
              <Edit2 className="h-3.5 w-3.5" />
              Edit Task
            </button>
            {task.inConflict ? (
              <button
                className="flex items-center gap-1 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500"
                onClick={() => onOpenConflictModal(task)}
                type="button"
              >
                <ShieldAlert className="h-3.5 w-3.5" />
                Resolve Conflict
              </button>
            ) : null}
          </div>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Timeline
          </h2>
          <div className="mt-4 flex flex-col gap-4 text-sm text-slate-400">
            <div className="flex items-start gap-3">
              <Calendar className="mt-0.5 h-4 w-4 text-indigo-400" />
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  Due Date
                </div>
                <div>{formatValue(task.dueDate)}</div>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <Clock className="mt-0.5 h-4 w-4 text-amber-400" />
              <div>
                <div className="font-semibold text-slate-700 dark:text-slate-200">
                  Reminder
                </div>
                <div>{formatValue(task.reminderAt)}</div>
              </div>
            </div>
          </div>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Metadata
          </h2>
          <dl className="mt-4 grid grid-cols-1 gap-4 text-sm">
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Status
              </dt>
              <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                {task.status}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Priority
              </dt>
              <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                {task.priority}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Version
              </dt>
              <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                v{task.version}
              </dd>
            </div>
            <div>
              <dt className="text-xs font-bold uppercase tracking-wide text-slate-400">
                Last Updated
              </dt>
              <dd className="mt-1 font-semibold text-slate-700 dark:text-slate-200">
                {formatValue(task.clientUpdatedAt)}
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </div>
  );
}
