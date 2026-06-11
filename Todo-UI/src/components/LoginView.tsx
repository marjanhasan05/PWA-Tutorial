import { zodResolver } from '@hookform/resolvers/zod';
import React from 'react';
import { useForm } from 'react-hook-form';
import type { LoginRequest } from '../features/auth/authTypes';
import { loginSchema } from '../features/auth/authTypes';
import { Eye, EyeOff, Lock, LogIn, Mail } from './AppIcons';

interface LoginViewProps {
  errorMessage?: string | null;
  isLoading?: boolean;
  onGoToRegister: () => void;
  onLogin: (values: LoginRequest) => Promise<void> | void;
}

export default function LoginView({
  errorMessage,
  isLoading = false,
  onGoToRegister,
  onLogin,
}: LoginViewProps) {
  const [showPassword, setShowPassword] = React.useState(false);
  const {
    formState: { errors },
    handleSubmit,
    register,
  } = useForm<LoginRequest>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: '',
      password: '',
    },
  });

  return (
    <div className="flex w-full max-w-sm flex-col gap-6 rounded-2xl border border-slate-800/80 bg-[#11141B] p-6 font-sans shadow-2xl sm:p-8">
      <div className="flex flex-col gap-2 text-center">
        <h1 className="flex items-center justify-center gap-2 text-xl font-black tracking-tight text-white select-none">
          <LogIn className="h-5.5 w-5.5 text-indigo-400" />
          Welcome Back
        </h1>
        <p className="mx-auto max-w-[260px] text-xs leading-normal text-slate-400 select-none">
          Sign in to your sophisticated task manager workspace. Explore the
          visual design.
        </p>
      </div>

      <form onSubmit={handleSubmit(onLogin)} className="flex flex-col gap-4">
        {errorMessage ? (
          <p className="rounded-xl border border-rose-900/50 bg-rose-950/20 px-3 py-2 text-xs font-semibold text-rose-300">
            {errorMessage}
          </p>
        ) : null}

        <div className="flex flex-col gap-1">
          <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
            Email Address
          </label>
          <div className="relative flex items-center">
            <Mail className="absolute left-3 h-4 w-4 text-slate-500" />
            <input
              id="login-email"
              type="email"
              placeholder="e.g. marjan@example.com"
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] py-2.5 pr-4 pl-9 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:opacity-70"
              disabled={isLoading}
              {...register('email')}
            />
          </div>
          {errors.email ? (
            <p className="text-[11px] font-medium text-rose-400">
              {errors.email.message}
            </p>
          ) : null}
        </div>

        <div className="flex flex-col gap-1">
          <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
            Password
          </label>
          <div className="relative flex items-center">
            <Lock className="absolute left-3 h-4 w-4 text-slate-500" />
            <input
              id="login-password"
              type={showPassword ? 'text' : 'password'}
              placeholder="••••••••"
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] py-2.5 pr-10 pl-9 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 disabled:opacity-70"
              disabled={isLoading}
              {...register('password')}
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
          {errors.password ? (
            <p className="text-[11px] font-medium text-rose-400">
              {errors.password.message}
            </p>
          ) : null}
        </div>

        <button
          id="btn-login-submit"
          type="submit"
          disabled={isLoading}
          className="glow-indigo mt-2 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div className="border-t border-slate-800/80 pt-4 text-center text-xs font-normal text-slate-400">
        Don&apos;t have an account?{' '}
        <button
          id="btn-switch-to-register"
          type="button"
          onClick={onGoToRegister}
          className="font-bold text-indigo-400 transition hover:text-indigo-300"
        >
          Create Account
        </button>
      </div>
    </div>
  );
}
