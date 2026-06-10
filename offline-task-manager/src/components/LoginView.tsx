import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { loginUser, clearAuthError } from '../store/authSlice';
import { LogIn, Mail, Lock, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface LoginViewProps {
  onGoToRegister: () => void;
}

export default function LoginView({ onGoToRegister }: LoginViewProps) {
  const dispatch = useAppDispatch();
  const { isAuthLoading, authError } = useAppSelector((state) => state.auth);

  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) return;
    dispatch(loginUser({ email, password }));
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6 p-6 sm:p-8 bg-[#11141B] border border-slate-800/80 rounded-2xl shadow-2xl font-sans">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2 select-none">
          <LogIn className="w-5.5 h-5.5 text-indigo-400" />
          Welcome Back
        </h1>
        <p className="text-xs text-slate-400 leading-normal max-w-[260px] mx-auto select-none">
          Sign to your Offline Task Manager. Syncs automatically when back online.
        </p>
      </div>

      {authError && (
        <div id="login-error-alert" className="flex items-start gap-2.5 bg-rose-950/20 border border-rose-900/60 text-rose-400 p-3 rounded-xl text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Email */}
        <div className="flex flex-col gap-1.55">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              id="login-email"
              type="email"
              placeholder="e.g. marjan@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
              required
            />
          </div>
        </div>

        {/* Password */}
        <div className="flex flex-col gap-1.55">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-350"
            >
              {showPassword ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
            </button>
          </div>
        </div>

        {/* Action button */}
        <button
          id="btn-login-submit"
          type="submit"
          disabled={isAuthLoading}
          className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all glow-indigo cursor-pointer"
        >
          {isAuthLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      {/* Switch to Register */}
      <div className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 font-normal">
        Don't have an account?{' '}
        <button
          id="btn-switch-to-register"
          onClick={onGoToRegister}
          className="text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
