import React from 'react';
import { useAppDispatch, useAppSelector } from '../store';
import { registerUser, clearAuthError } from '../store/authSlice';
import { UserPlus, Mail, Lock, User, AlertCircle, Eye, EyeOff } from 'lucide-react';

interface RegisterViewProps {
  onGoToLogin: () => void;
}

export default function RegisterView({ onGoToLogin }: RegisterViewProps) {
  const dispatch = useAppDispatch();
  const { isAuthLoading, authError } = useAppSelector((state) => state.auth);

  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);

  React.useEffect(() => {
    dispatch(clearAuthError());
  }, [dispatch]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !email || !password) return;
    dispatch(registerUser({ name, email, password }));
  };

  return (
    <div className="w-full max-w-sm flex flex-col gap-6 p-6 sm:p-8 bg-[#11141B] border border-slate-800/80 rounded-2xl shadow-2xl font-sans">
      <div className="flex flex-col gap-2 text-center select-none">
        <h1 className="text-xl font-black tracking-tight text-white flex items-center justify-center gap-2">
          <UserPlus className="w-5.5 h-5.5 text-indigo-400" />
          Create Account
        </h1>
        <p className="text-xs text-slate-400 leading-normal max-w-[260px] mx-auto font-medium">
          Start organising your tasks locally and sync across devices instantly.
        </p>
      </div>

      {authError && (
        <div id="register-error-alert" className="flex items-start gap-2.5 bg-rose-950/20 border border-rose-900/60 text-rose-450 p-3 rounded-xl text-xs font-semibold animate-fade-in">
          <AlertCircle className="w-4.5 h-4.5 text-rose-400 shrink-0 mt-0.5" />
          <span>{authError}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Name */}
        <div className="flex flex-col gap-1.55">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Full Name
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              id="register-name"
              type="text"
              placeholder="e.g. Marjan"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
              required
            />
          </div>
        </div>

        {/* Email */}
        <div className="flex flex-col gap-1.55">
          <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 w-4 h-4 text-slate-500" />
            <input
              id="register-email"
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
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full pl-9 pr-10 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
              minLength={6}
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

        {/* Submit */}
        <button
          id="btn-register-submit"
          type="submit"
          disabled={isAuthLoading}
          className="mt-2 w-full py-2.5 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 active:scale-98 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all glow-indigo cursor-pointer"
        >
          {isAuthLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      {/* Switch to login */}
      <div className="text-center text-xs text-slate-400 border-t border-slate-800/80 pt-4 font-normal">
        Already have an account?{' '}
        <button
          id="btn-switch-to-login"
          onClick={onGoToLogin}
          className="text-indigo-400 hover:text-indigo-300 font-bold transition cursor-pointer"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
