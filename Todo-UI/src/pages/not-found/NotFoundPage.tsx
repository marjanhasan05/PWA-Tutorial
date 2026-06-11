import { Link } from 'react-router-dom';

interface NotFoundPageProps {
  isAuthenticated: boolean;
}

export default function NotFoundPage({
  isAuthenticated,
}: NotFoundPageProps) {
  const fallbackHref = isAuthenticated ? '/app' : '/login';

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 p-4 text-slate-200">
      <div className="w-full max-w-md rounded-3xl border border-slate-800 bg-[#11141B] p-8 text-center shadow-2xl">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-indigo-400">
          404
        </div>
        <h1 className="mt-3 text-2xl font-black text-white">
          Page not found
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-slate-400">
          The route you requested is not part of the current tutorial flow yet.
        </p>
        <Link
          className="glow-indigo mt-6 inline-flex rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500"
          to={fallbackHref}
        >
          Return to {isAuthenticated ? 'App' : 'Login'}
        </Link>
      </div>
    </div>
  );
}
