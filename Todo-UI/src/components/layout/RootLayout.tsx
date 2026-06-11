import { Link, Outlet } from 'react-router';
import { Toaster } from 'sonner';

export function RootLayout() {
  return (
    <div className="min-h-screen bg-slate-50 text-slate-900">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6 lg:px-8">
          <Link
            to="/"
            className="text-lg font-semibold tracking-tight text-slate-900"
          >
            Starter
          </Link>

          <nav className="flex items-center gap-3 text-sm font-medium text-slate-600">
            <Link
              to="/"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Home
            </Link>
            <Link
              to="/login"
              className="rounded-md px-3 py-2 transition hover:bg-slate-100 hover:text-slate-900"
            >
              Login
            </Link>
          </nav>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
        <Outlet />
      </main>

      <Toaster richColors position="top-right" />
    </div>
  );
}
