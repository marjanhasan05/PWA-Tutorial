import React from 'react';
import { Bell, BellOff, Check, Sparkles } from './AppIcons';

export default function PushNotificationManager() {
  const [permission, setPermission] =
    React.useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{
    success: boolean;
    message: string;
  } | null>(null);

  const handleEnable = () => {
    setIsLoading(true);
    setTestResult(null);

    window.setTimeout(() => {
      setIsLoading(false);
      setPermission('granted');
      setIsSubscribed(true);
      setTestResult({
        success: true,
        message:
          'Simulated Notification: Reminders successfully activated on this device!',
      });
    }, 500);
  };

  const handleDisable = () => {
    setIsLoading(true);

    window.setTimeout(() => {
      setIsLoading(false);
      setPermission('default');
      setIsSubscribed(false);
      setTestResult(null);
    }, 450);
  };

  const handleTest = () => {
    setIsLoading(true);
    setTestResult(null);

    window.setTimeout(() => {
      setIsLoading(false);
      setTestResult({
        success: true,
        message:
          'Alarm Triggered! Simulated notification delivered to your browser screen.',
      });
    }, 500);
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-800 bg-[#1A1D23] p-5 font-sans shadow-md">
      <div className="flex items-start gap-3">
        <div className="glow-indigo rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-indigo-400">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-white">
            Push Notifications & Reminders
          </h3>
          <p className="mt-0.5 max-w-md text-xs leading-relaxed text-slate-400">
            Receive reminders and task alarms directly on this device, even when
            you are not actively navigating the application.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-0.5" />

      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-400">System Permission:</span>
        <span
          className={`flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase ${
            permission === 'granted'
              ? 'glow-emerald border border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
              : 'border border-slate-700 bg-slate-800 text-slate-300'
          }`}
        >
          {permission === 'granted' ? <Check className="h-3.5 w-3.5" /> : null}
          {permission.toUpperCase()}
        </span>
      </div>

      {testResult ? (
        <div className="animate-fade-in flex items-start gap-2 rounded-xl border border-emerald-900/40 bg-emerald-950/20 p-3 text-xs leading-normal text-emerald-400">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-400" />
          <span>{testResult.message}</span>
        </div>
      ) : null}

      <div className="mt-1.5 flex flex-wrap gap-3">
        {!isSubscribed ? (
          <button
            id="btn-subscribe-push"
            type="button"
            onClick={handleEnable}
            disabled={isLoading}
            className="glow-indigo flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>Enable Reminders</span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              id="btn-unsubscribe-push"
              type="button"
              onClick={handleDisable}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700 disabled:opacity-50"
            >
              <BellOff className="h-3.5 w-3.5" />
              <span>Disable Reminders</span>
            </button>
            <button
              id="btn-test-push"
              type="button"
              onClick={handleTest}
              disabled={isLoading}
              className="glow-indigo flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:opacity-50"
            >
              <span>Test Push Alarm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
