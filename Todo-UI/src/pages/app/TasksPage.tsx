import { Link, useNavigate } from 'react-router-dom';
import TaskBoard from '../../components/TaskBoard';
import type { TaskBoardControllerProps } from '../../routes/routeTypes';

export default function TasksPage(props: TaskBoardControllerProps) {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col gap-4">
      <div className="rounded-2xl border border-slate-100 bg-white p-5 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
              Routed Tasks
            </span>
            <h1 className="mt-1 text-xl font-black tracking-tight text-slate-900 dark:text-white">
              Task Workspace
            </h1>
            <p className="mt-1 text-xs leading-relaxed text-slate-400">
              This route keeps the same live task board behavior, now under its
              own protected URL.
            </p>
          </div>
          <Link
            className="text-xs font-bold text-indigo-400 transition hover:text-indigo-300"
            to="/app"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>

      <TaskBoard {...props} onCreateTask={() => navigate('/app/tasks/new')} />
    </div>
  );
}
