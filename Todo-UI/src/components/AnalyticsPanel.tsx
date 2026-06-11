import type { Task } from '../utils/db';
import { AlertCircle, Clock } from './AppIcons';

interface AnalyticsPanelProps {
  tasks: Task[];
}

export default function AnalyticsPanel({ tasks }: AnalyticsPanelProps) {
  const activeTasks = tasks.filter(
    (task) => !task.isOfflineDeleted && !task.deletedAt,
  );
  const total = activeTasks.length;
  const todo = activeTasks.filter((task) => task.status === 'TODO').length;
  const inProgress = activeTasks.filter(
    (task) => task.status === 'IN_PROGRESS',
  ).length;
  const completed = activeTasks.filter((task) => task.status === 'DONE').length;
  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div className="grid w-full grid-cols-2 gap-4 font-sans lg:grid-cols-4">
      <div className="glow-indigo col-span-2 flex items-center justify-between rounded-2xl border border-slate-800/80 bg-gradient-to-br from-[#11141B] to-[#1A1D23] p-5 text-white shadow-lg">
        <div className="min-w-0 flex-1 pr-4">
          <span className="text-[10px] font-bold tracking-widest text-indigo-400 uppercase">
            Overall Progress
          </span>
          <h3 className="mb-1 text-lg font-bold tracking-tight text-white">
            Your Completed Tasks
          </h3>
          <p className="mt-auto max-w-[200px] text-xs leading-normal text-slate-400">
            {completed} out of {total} items are complete. Let&apos;s tackle
            what is next!
          </p>
        </div>

        <div className="relative h-18 w-18 shrink-0">
          <svg className="h-full w-full" viewBox="0 0 36 36">
            <path
              className="text-slate-800/80"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-indigo-400 transition-all duration-700"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.2"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text
              x="18"
              y="20.5"
              className="fill-white text-[10px] font-black"
              textAnchor="middle"
            >
              {percentage}%
            </text>
          </svg>
        </div>
      </div>

      <div className="flex items-start justify-between rounded-2xl border border-slate-800 bg-[#1A1D23] p-4 shadow-md transition-colors hover:border-slate-700">
        <div className="flex flex-col gap-1 select-none">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            To Do
          </span>
          <span className="text-2xl font-black text-white">{todo}</span>
          <p className="mt-2 text-[10px] text-slate-500">
            Pending initial start
          </p>
        </div>
        <div className="rounded-xl border border-slate-800 bg-[#11141B] p-2 text-slate-400">
          <AlertCircle className="h-4.5 w-4.5" />
        </div>
      </div>

      <div className="flex items-start justify-between rounded-2xl border border-slate-800 bg-[#1A1D23] p-4 shadow-md transition-colors hover:border-slate-700">
        <div className="flex flex-col gap-1 select-none">
          <span className="text-[10px] font-bold tracking-wider text-slate-400 uppercase">
            Active
          </span>
          <span className="text-2xl font-black text-indigo-400">
            {inProgress}
          </span>
          <p className="mt-2 text-[10px] text-slate-500">
            Tasks currently in status
          </p>
        </div>
        <div className="glow-indigo rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2 text-indigo-400">
          <Clock className="h-4.5 w-4.5" />
        </div>
      </div>
    </div>
  );
}
