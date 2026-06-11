import { Navigate, Outlet } from 'react-router-dom';
import { CheckSquare } from '../components/AppIcons';

interface AuthLayoutProps {
  isAuthenticated: boolean;
}

export default function AuthLayout({ isAuthenticated }: AuthLayoutProps) {
  if (isAuthenticated) {
    return <Navigate replace to="/app" />;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4">
      <div className="absolute inset-x-0 top-0 h-56 bg-[radial-gradient(circle_at_top,rgba(99,102,241,0.18),transparent_55%)]" />
      <div className="relative z-10 flex w-full max-w-4xl flex-col items-center justify-center gap-6">
        <div className="flex items-center justify-center gap-3 text-center">
          <div className="glow-indigo shrink-0 rounded-2xl bg-indigo-600 p-3 text-white">
            <CheckSquare className="h-6 w-6" />
          </div>
          <div className="flex flex-col items-center text-center">
            <span className="bg-gradient-to-r from-indigo-300 to-indigo-500 bg-clip-text text-lg font-black tracking-tight text-transparent">
              TaskFlow
            </span>
            <span className="text-[11px] font-bold uppercase tracking-[0.24em] text-slate-500">
              Routed Prototype
            </span>
          </div>
        </div>

        <div className="flex w-full items-center justify-center">
          <Outlet />
        </div>
      </div>
    </div>
  );
}
