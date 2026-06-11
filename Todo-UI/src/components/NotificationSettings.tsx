import Swal from 'sweetalert2';
import { AlertCircle, Bell, BellOff, Check, Sparkles } from './AppIcons';
import { usePushNotifications } from '../features/notifications/usePushNotifications';

export default function NotificationSettings() {
  const {
    isSendingTest,
    isSubscribing,
    isUnsubscribing,
    permission,
    requestPermission,
    sendTest,
    status,
    subscribe,
    subscription,
    unsubscribe,
    unsupportedReason,
  } = usePushNotifications();

  const isBusy = isSendingTest || isSubscribing || isUnsubscribing;

  const permissionBadgeClass =
    permission === 'granted'
      ? 'border-emerald-500/20 bg-emerald-500/10 text-emerald-400'
      : permission === 'denied'
        ? 'border-rose-500/20 bg-rose-500/10 text-rose-400'
        : 'border-slate-700 bg-slate-800 text-slate-300';

  const subscriptionBadgeClass =
    status === 'subscribed'
      ? 'border-indigo-500/20 bg-indigo-500/10 text-indigo-400'
      : 'border-slate-700 bg-slate-800 text-slate-300';

  const handleUnsubscribe = async () => {
    const result = await Swal.fire({
      title: 'Disable push notifications?',
      text: 'This device will stop receiving browser push alerts until you subscribe again.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonText: 'Disable Notifications',
      cancelButtonText: 'Keep Enabled',
      reverseButtons: true,
      background: '#11141B',
      color: '#E2E8F0',
      confirmButtonColor: '#DC2626',
      cancelButtonColor: '#334155',
      customClass: {
        popup: 'rounded-[24px] border border-slate-800 shadow-2xl',
        title: 'text-left text-xl font-black text-white',
        htmlContainer: 'text-left text-sm text-slate-400',
        actions: 'gap-3',
        confirmButton: 'rounded-xl px-4 py-2 text-xs font-bold',
        cancelButton: 'rounded-xl px-4 py-2 text-xs font-bold',
      },
    });

    if (result.isConfirmed) {
      await unsubscribe();
    }
  };

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-6 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B]">
      <div className="flex items-start gap-3">
        <div className="glow-indigo rounded-xl border border-indigo-500/20 bg-indigo-500/10 p-2.5 text-indigo-400">
          <Bell className="h-5 w-5" />
        </div>
        <div className="flex flex-col">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white">
            Push Notifications
          </h2>
          <p className="mt-0.5 max-w-lg text-xs leading-relaxed text-slate-400">
            Connect this device to browser push notifications for reminders and
            task alerts. The browser permission, service worker subscription,
            and backend device registration all need to succeed.
          </p>
        </div>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Permission
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${permissionBadgeClass}`}
          >
            {permission === 'granted' ? <Check className="h-3.5 w-3.5" /> : null}
            {permission}
          </div>
        </div>
        <div className="rounded-xl bg-slate-50 p-4 dark:bg-slate-900/70">
          <div className="text-[10px] font-bold uppercase tracking-wide text-slate-400">
            Subscription
          </div>
          <div
            className={`mt-2 inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-[10px] font-bold uppercase ${subscriptionBadgeClass}`}
          >
            {status === 'subscribed' ? <Sparkles className="h-3.5 w-3.5" /> : null}
            {status}
          </div>
        </div>
      </div>

      {unsupportedReason ? (
        <div className="flex items-start gap-2 rounded-xl border border-amber-500/20 bg-amber-500/10 p-3 text-xs text-amber-300">
          <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
          <span>{unsupportedReason}</span>
        </div>
      ) : null}

      {subscription?.endpoint ? (
        <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 text-xs text-slate-500 dark:border-slate-800 dark:bg-slate-900/70 dark:text-slate-400">
          <div className="font-bold uppercase tracking-wide text-slate-400">
            Device Endpoint
          </div>
          <div className="mt-1 break-all font-mono text-[11px]">
            {subscription.endpoint}
          </div>
        </div>
      ) : null}

      <div className="flex flex-wrap gap-3">
        {permission !== 'granted' ? (
          <button
            type="button"
            onClick={() => {
              void requestPermission();
            }}
            disabled={isBusy || permission === 'denied'}
            className="rounded-xl border border-slate-200 px-4 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-700 dark:text-slate-200 dark:hover:bg-slate-800"
          >
            Request Permission
          </button>
        ) : null}

        {status !== 'subscribed' ? (
          <button
            id="btn-subscribe-push"
            type="button"
            onClick={() => {
              void subscribe();
            }}
            disabled={isBusy || permission === 'denied'}
            className="glow-indigo flex items-center justify-center gap-1.5 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <Bell className="h-3.5 w-3.5" />
            <span>{isSubscribing ? 'Subscribing...' : 'Subscribe Device'}</span>
          </button>
        ) : (
          <>
            <button
              id="btn-unsubscribe-push"
              type="button"
              onClick={() => {
                void handleUnsubscribe();
              }}
              disabled={isBusy}
              className="flex items-center justify-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs font-bold text-slate-300 transition hover:bg-slate-700 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <BellOff className="h-3.5 w-3.5" />
              <span>
                {isUnsubscribing ? 'Unsubscribing...' : 'Unsubscribe Device'}
              </span>
            </button>
            <button
              id="btn-test-push"
              type="button"
              onClick={() => {
                void sendTest();
              }}
              disabled={isBusy}
              className="glow-indigo flex items-center justify-center gap-1.5 rounded-xl border border-indigo-500/20 bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition-all hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <span>{isSendingTest ? 'Sending Test...' : 'Send Test Notification'}</span>
            </button>
          </>
        )}
      </div>

      {permission === 'denied' ? (
        <p className="text-xs text-slate-400">
          Browser permission is denied. You will need to re-enable notifications
          from your browser site settings before subscribing.
        </p>
      ) : status === 'subscribed' ? (
        <p className="text-xs text-slate-400">
          This device is registered with the backend and ready to receive test
          notifications while the service worker is active.
        </p>
      ) : (
        <p className="text-xs text-slate-400">
          Subscription only affects this browser profile. If you switch devices
          or clear site data, you may need to subscribe again.
        </p>
      )}
    </div>
  );
}
