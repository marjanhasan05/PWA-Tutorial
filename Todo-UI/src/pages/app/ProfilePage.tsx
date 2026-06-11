import NotificationSettings from '../../components/NotificationSettings';
import type { AuthUser } from '../../features/auth/authTypes';
import type { Task } from '../../features/tasks/taskTypes';

interface ProfilePageProps {
  user: AuthUser | null;
  tasks: Task[];
}

export default function ProfilePage({ user, tasks }: ProfilePageProps) {
  const completedTasks = tasks.filter((task) => task.status === 'DONE').length;
  const pendingTasks = tasks.filter((task) => task.status !== 'DONE').length;

  return (
    <div className="grid gap-4">
      <div className="grid gap-4 md:grid-cols-[1.2fr_0.8fr]">
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
          <span className="text-[10px] font-bold uppercase tracking-[0.24em] text-indigo-400">
            User Profile
          </span>
          <h1 className="mt-2 text-xl font-black tracking-tight text-slate-900 dark:text-white">
            {user?.name || 'Worker'}
          </h1>
          <p className="mt-1 font-mono text-xs text-slate-400">{user?.email}</p>
          <p className="mt-4 max-w-md text-sm leading-relaxed text-slate-400">
            Your authenticated profile comes from the backend session, while
            browser-only features like push notifications stay tied to this
            specific device and service worker.
          </p>
        </div>

        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Snapshot
          </h2>
          <div className="mt-4 grid gap-3">
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Total Tasks
              </div>
              <div className="mt-1 text-2xl font-black text-slate-900 dark:text-white">
                {tasks.length}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Completed
              </div>
              <div className="mt-1 text-2xl font-black text-indigo-400">
                {completedTasks}
              </div>
            </div>
            <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
              <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Pending
              </div>
              <div className="mt-1 text-2xl font-black text-amber-400">
                {pendingTasks}
              </div>
            </div>
          </div>
        </div>
      </div>

      <NotificationSettings />
    </div>
  );
}
