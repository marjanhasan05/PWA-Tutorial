import { Navigate, Outlet, useLocation } from 'react-router-dom';

interface ProtectedRouteProps {
  isAuthReady: boolean;
  isAuthenticated: boolean;
}

export default function ProtectedRoute({
  isAuthReady,
  isAuthenticated,
}: ProtectedRouteProps) {
  const location = useLocation();

  if (!isAuthReady) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-300">
        <div className="rounded-2xl border border-slate-800/80 bg-[#11141B] px-6 py-4 text-sm font-semibold shadow-2xl">
          Restoring your session...
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate replace state={{ from: location }} to="/login" />;
  }

  return <Outlet />;
}
