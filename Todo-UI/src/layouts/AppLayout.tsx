import { NavLink, Outlet } from 'react-router-dom';
import {
  CheckSquare,
  Heart,
  Layers,
  LogOut,
  Plus,
  User,
} from '../components/AppIcons';
import OnlineIndicator from '../components/OnlineIndicator';
import type { AuthUser } from '../features/auth/authTypes';

interface AppLayoutProps {
  user: AuthUser | null;
  onLogout: () => void;
}

const navItems = [
  { to: '/app', label: 'Dashboard', icon: CheckSquare, end: true },
  { to: '/app/tasks', label: 'Tasks', icon: Layers },
  { to: '/app/tasks/new', label: 'Create', icon: Plus },
  { to: '/app/profile', label: 'Profile', icon: User },
];

export default function AppLayout({ user, onLogout }: AppLayoutProps) {
  return (
    <div className="flex min-h-screen flex-col bg-slate-50 font-sans text-slate-900 dark:bg-slate-950 dark:text-slate-100">
      <header className="sticky top-0 z-40 border-b border-slate-100 bg-white shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4 px-4 py-3.5">
          <div className="flex items-center gap-2">
            <div className="glow-indigo rounded-xl bg-indigo-600 p-2 text-white shadow-md shadow-indigo-500/15">
              <CheckSquare className="h-5 w-5" />
            </div>
            <div className="flex select-none flex-col">
              <span className="bg-gradient-to-r from-indigo-400 to-indigo-600 bg-clip-text text-base font-black leading-none tracking-tight text-transparent">
                TaskFlow
              </span>
              <span className="mt-0.5 text-[10px] font-bold uppercase tracking-wide text-slate-400">
                Prototype Workspace
              </span>
            </div>
          </div>

          <div className="flex items-center gap-3.5">
            <div className="hidden flex-col items-end sm:flex">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                {user?.name || 'Worker'}
              </span>
              <span className="font-mono text-[10px] text-slate-400">
                {user?.email}
              </span>
            </div>

            <button
              id="btn-nav-logout"
              type="button"
              onClick={onLogout}
              className="rounded-xl p-2 text-slate-400 transition-all hover:bg-rose-50 hover:text-rose-600 dark:hover:bg-rose-950/20"
              title="Sign Out"
            >
              <LogOut className="h-4.5 w-4.5" />
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-5 p-4 pb-24 sm:pb-6">
        <OnlineIndicator />

        <nav className="hidden rounded-2xl border border-slate-100 bg-white p-2 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B] sm:block">
          <div className="flex flex-wrap items-center gap-2">
            {navItems.map(({ to, label, icon: Icon, end }) => (
              <NavLink
                key={to}
                className={({ isActive }) =>
                  `flex items-center gap-2 rounded-xl px-3 py-2 text-xs font-bold transition ${
                    isActive
                      ? 'glow-indigo bg-indigo-600 text-white'
                      : 'text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-slate-800 dark:hover:text-white'
                  }`
                }
                end={end}
                to={to}
              >
                <Icon className="h-3.5 w-3.5" />
                <span>{label}</span>
              </NavLink>
            ))}
          </div>
        </nav>

        <Outlet />
      </main>

      <footer className="mt-auto border-t border-slate-100 px-4 py-6 select-none dark:border-slate-900">
        <div className="mx-auto flex max-w-5xl flex-col items-center justify-between gap-3 text-[11px] font-medium tracking-wide text-slate-400 dark:text-slate-600 sm:flex-row">
          <div className="flex items-center gap-1">
            <span>© 2026 TaskFlow. Elegant Front-End Design & Routing.</span>
          </div>
          <div className="flex items-center gap-1 font-mono">
            <span>Pure HTML + CSS + React Router</span>
            <Heart className="h-3 w-3 fill-rose-500 text-rose-500" />
          </div>
        </div>
      </footer>

      <nav className="fixed inset-x-0 bottom-0 z-40 border-t border-slate-800/80 bg-[#11141B]/96 px-3 py-2 backdrop-blur sm:hidden">
        <div className="mx-auto flex max-w-md items-center justify-between gap-2">
          {navItems.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              className={({ isActive }) =>
                `flex min-w-0 flex-1 flex-col items-center gap-1 rounded-xl px-2 py-2 text-[10px] font-bold transition ${
                  isActive
                    ? 'bg-indigo-600 text-white'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
              end={end}
              to={to}
            >
              <Icon className="h-4 w-4" />
              <span className="truncate">{label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
