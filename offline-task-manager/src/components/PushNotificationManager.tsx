import React from 'react';
import { useAppSelector } from '../store';
import {
  checkNotificationPermission,
  requestNotificationPermission,
  subscribeToPush,
  unsubscribeFromPush,
  triggerTestNotification,
} from '../utils/notifications';
import { Bell, BellOff, HelpCircle, Sparkles, Check, AlertTriangle } from 'lucide-react';

export default function PushNotificationManager() {
  const token = useAppSelector((state) => state.auth.accessToken);
  const { isOnline } = useAppSelector((state) => state.tasks);

  const [permission, setPermission] = React.useState<NotificationPermission>('default');
  const [isSubscribed, setIsSubscribed] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [testResult, setTestResult] = React.useState<{ success: boolean; message: string } | null>(null);

  const updateSubState = async () => {
    const perm = await checkNotificationPermission();
    setPermission(perm);

    if (perm === 'granted' && 'serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const sub = await registration.pushManager.getSubscription();
        setIsSubscribed(!!sub);
      } catch (e) {
        setIsSubscribed(false);
      }
    } else {
      setIsSubscribed(false);
    }
  };

  React.useEffect(() => {
    updateSubState();
  }, [token]);

  const handleEnable = async () => {
    if (!token) return;
    setIsLoading(true);
    setTestResult(null);

    try {
      const granted = await requestNotificationPermission();
      if (granted) {
        if (isOnline) {
          await subscribeToPush(token);
          await updateSubState();
        } else {
          setTestResult({
            success: false,
            message: 'You are offline. Push subscription will be activated when internet connectivity is re-established.',
          });
        }
      } else {
        setTestResult({
          success: false,
          message: 'Notifications are blocked. Please enable them in your browser site settings.',
        });
      }
    } catch (err: any) {
      console.error(err);
      setTestResult({
        success: false,
        message: err.message || 'Subscription failed.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisable = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      await unsubscribeFromPush(token);
      await updateSubState();
    } catch (err: any) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleTest = async () => {
    if (!token) return;
    setIsLoading(true);
    setTestResult(null);
    try {
      await triggerTestNotification(
        token,
        'Alarm Triggered! ⏰',
        'Your offline synchronized Task Manager reminder alert is active and working.'
      );
      setTestResult({
        success: true,
        message: 'A test notification payload has been sent from the server. Keep an eye on your status bar!',
      });
    } catch (err: any) {
      setTestResult({
        success: false,
        message: err.message || 'Failed to dispatch test notification.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div id="push-notification-settings" className="w-full bg-[#1A1D23] border border-slate-800 p-5 rounded-2xl flex flex-col gap-4 font-sans shadow-md">
      <div className="flex items-start gap-3">
        <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400 glow-indigo">
          <Bell className="w-5 h-5" />
        </div>
        <div className="flex flex-col">
          <h3 className="text-sm font-bold text-white">Push Notifications & Reminders</h3>
          <p className="text-xs text-slate-450 text-slate-400 leading-relaxed max-w-md mt-0.5">
            Receive reminders and task alarms directly on this device, even when you are not actively navigating the application.
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-0.5"></div>

      {/* Permissions status indicators */}
      <div className="flex items-center justify-between text-xs font-mono">
        <span className="text-slate-400">System Permission:</span>
        <span
          className={`flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
            permission === 'granted'
              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 glow-emerald'
              : permission === 'denied'
              ? 'bg-rose-500/10 text-rose-450 text-rose-400 border border-rose-500/20'
              : 'bg-slate-800 text-slate-350 border border-slate-700'
          }`}
        >
          {permission === 'granted' && <Check className="w-3.5 h-3.5" />}
          {permission.toUpperCase()}
        </span>
      </div>

      {testResult && (
        <div
          className={`p-3 rounded-xl text-xs leading-normal flex items-start gap-2 border ${
            testResult.success
              ? 'bg-emerald-950/20 border-emerald-900/40 text-emerald-400'
              : 'bg-amber-950/20 border-amber-900/40 text-amber-400'
          }`}
        >
          {testResult.success ? (
            <Sparkles className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
          ) : (
            <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
          )}
          <span>{testResult.message}</span>
        </div>
      )}

      {/* Primary Actions row */}
      <div className="flex flex-wrap gap-3 mt-1.5">
        {!isSubscribed ? (
          <button
            id="btn-subscribe-push"
            onClick={handleEnable}
            disabled={isLoading}
            className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all cursor-pointer glow-indigo"
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Enable Reminders</span>
          </button>
        ) : (
          <div className="flex flex-wrap gap-2">
            <button
              id="btn-unsubscribe-push"
              onClick={handleDisable}
              disabled={isLoading}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-750 border border-slate-700 text-slate-300 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              <BellOff className="w-3.5 h-3.5" />
              <span>Disable Reminders</span>
            </button>
            <button
              id="btn-test-push"
              onClick={handleTest}
              disabled={isLoading || !isOnline}
              className="flex items-center justify-center gap-1.5 px-4 py-2 bg-indigo-550 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl border border-indigo-500/20 shadow-md shadow-indigo-500/10 transition-all cursor-pointer glow-indigo"
              title={!isOnline ? 'Test when online' : 'Send a test notification now'}
            >
              <span>Test Push Alarm</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
