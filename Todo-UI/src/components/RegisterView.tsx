import React from 'react';
import { Eye, EyeOff, Lock, Mail, User, UserPlus } from './AppIcons';

interface RegisterViewProps {
  onGoToLogin: () => void;
  onRegister: (name: string, email: string) => void;
}

export default function RegisterView({
  onGoToLogin,
  onRegister,
}: RegisterViewProps) {
  const [name, setName] = React.useState('');
  const [email, setEmail] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [showPassword, setShowPassword] = React.useState(false);
  const [isAuthLoading, setIsAuthLoading] = React.useState(false);

  const handleSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    if (!name || !email || !password) {
      return;
    }

    setIsAuthLoading(true);

    window.setTimeout(() => {
      setIsAuthLoading(false);
      onRegister(name, email);
    }, 450);
  };

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-slate-800/80 bg-[#11141B] p-6 font-sans shadow-2xl sm:p-8">
      <div className="flex flex-col gap-2 text-center select-none">
        <h1 className="flex items-center justify-center gap-2 text-xl font-black tracking-tight text-white">
          <UserPlus className="h-5.5 w-5.5 text-indigo-400" />
          Create Account
        </h1>
        <p className="mx-auto max-w-[260px] text-xs font-medium leading-normal text-slate-400">
          Start organizing your tasks with modern, smooth responsiveness.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="flex flex-col gap-1">
          <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
            Full Name
          </label>
          <div className="relative flex items-center">
            <User className="absolute left-3 h-4 w-4 text-slate-500" />
            <input
              id="register-name"
              type="text"
              placeholder="e.g. Marjan"
              value={name}
              onChange={(event) => setName(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] py-2.5 pr-4 pl-9 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-slate-500" />
            <input
              id="register-email"
              type="email"
              placeholder="e.g. marjan@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] py-2.5 pr-4 pl-9 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              required
            />
          </div>
        </div>

        <div className="flex flex-col gap-1">
          <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-slate-500" />
            <input
              id="register-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="Min 6 characters"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] py-2.5 pr-10 pl-9 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              minLength={6}
              required
            />
            <button
              type="button"
              onClick={() => setShowPassword((value) => !value)}
              className="absolute right-3 rounded-lg p-1 text-slate-500 transition hover:bg-slate-800 hover:text-slate-300"
            >
              {showPassword ? (
                <EyeOff className="h-3.5 w-3.5" />
              ) : (
                <Eye className="h-3.5 w-3.5" />
              )}
            </button>
          </div>
        </div>

        <button
          id="btn-register-submit"
          type="submit"
          disabled={isAuthLoading}
          className="glow-indigo mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          {isAuthLoading ? 'Creating Account...' : 'Sign Up'}
        </button>
      </form>

      <div className="border-t border-slate-800/80 pt-4 text-center text-xs font-normal text-slate-400">
        Already have an account?{' '}
        <button
          id="btn-switch-to-login"
          type="button"
          onClick={onGoToLogin}
          className="font-bold text-indigo-400 transition hover:text-indigo-300"
        >
          Sign In
        </button>
      </div>
    </div>
  );
}
