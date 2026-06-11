import React from 'react';
import { toast } from 'sonner';
import { env } from '../../lib/env';
import { getApiErrorMessage } from '../../types/api';
import {
  useCreateNotificationSubscriptionMutation,
  useDeleteNotificationSubscriptionMutation,
  useSendTestNotificationMutation,
} from './notificationsApi';
import {
  getExistingPushSubscription,
  isPushNotificationSupported,
  requestPushSubscription,
  serializePushSubscription,
} from './pushUtils';
import type {
  NotificationPermissionState,
  NotificationSubscriptionState,
  PushSubscriptionPayload,
} from './notificationTypes';

type PushNotificationsState = {
  isSupported: boolean;
  permission: NotificationPermissionState;
  status: NotificationSubscriptionState;
  subscription: PushSubscriptionPayload | null;
};

const unsupportedState: PushNotificationsState = {
  isSupported: false,
  permission: 'unsupported',
  status: 'unsupported',
  subscription: null,
};

export function usePushNotifications() {
  const [state, setState] =
    React.useState<PushNotificationsState>(unsupportedState);
  const [createSubscription, { isLoading: isSubscribing }] =
    useCreateNotificationSubscriptionMutation();
  const [deleteSubscription, { isLoading: isUnsubscribing }] =
    useDeleteNotificationSubscriptionMutation();
  const [sendTestNotification, { isLoading: isSendingTest }] =
    useSendTestNotificationMutation();

  const refreshStatus = React.useCallback(async () => {
    if (!isPushNotificationSupported()) {
      setState(unsupportedState);
      return;
    }

    try {
      const existingSubscription = await getExistingPushSubscription();

      setState({
        isSupported: true,
        permission: Notification.permission,
        status: existingSubscription ? 'subscribed' : 'unsubscribed',
        subscription: existingSubscription
          ? serializePushSubscription(existingSubscription)
          : null,
      });
    } catch {
      setState({
        isSupported: true,
        permission: Notification.permission,
        status: 'unsubscribed',
        subscription: null,
      });
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(() => {
      void refreshStatus();
    });
  }, [refreshStatus]);

  const requestPermission = React.useCallback(async () => {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in this browser.');
      return 'unsupported' as const;
    }

    try {
      const permission = await Notification.requestPermission();
      setState((current) => ({
        ...current,
        isSupported: true,
        permission,
      }));

      if (permission === 'granted') {
        toast.success('Notification permission granted.');
      } else if (permission === 'denied') {
        toast.error('Notification permission was denied.');
      } else {
        toast.info('Notification permission request was dismissed.');
      }

      return permission;
    } catch {
      toast.error('Unable to request notification permission right now.');
      return 'default' as const;
    }
  }, []);

  const subscribe = React.useCallback(async () => {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in this browser.');
      return;
    }

    if (!env.vapidPublicKey) {
      toast.error('VAPID public key is missing. Add VITE_VAPID_PUBLIC_KEY first.');
      return;
    }

    let permission = state.permission;
    if (permission !== 'granted') {
      permission = await requestPermission();
    }

    if (permission !== 'granted') {
      return;
    }

    try {
      const browserSubscription = await requestPushSubscription(env.vapidPublicKey);
      const payload = serializePushSubscription(browserSubscription);

      await createSubscription(payload).unwrap();

      setState({
        isSupported: true,
        permission: 'granted',
        status: 'subscribed',
        subscription: payload,
      });
      toast.success('Push notifications enabled for this device.');
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Unable to subscribe this device to push notifications.',
        ),
      );
    }
  }, [createSubscription, requestPermission, state.permission]);

  const unsubscribe = React.useCallback(async () => {
    if (!isPushNotificationSupported()) {
      toast.error('Push notifications are not supported in this browser.');
      return;
    }

    try {
      const existingSubscription = await getExistingPushSubscription();
      const endpoint = existingSubscription?.endpoint ?? state.subscription?.endpoint;

      if (!endpoint) {
        setState((current) => ({
          ...current,
          status: 'unsubscribed',
          subscription: null,
        }));
        toast.info('This device is already unsubscribed.');
        return;
      }

      await deleteSubscription({ endpoint }).unwrap();
      await existingSubscription?.unsubscribe();

      setState({
        isSupported: true,
        permission: Notification.permission,
        status: 'unsubscribed',
        subscription: null,
      });
      toast.success('Push notifications disabled for this device.');
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Unable to unsubscribe this device right now.',
        ),
      );
    }
  }, [deleteSubscription, state.subscription]);

  const sendTest = React.useCallback(async () => {
    if (state.status !== 'subscribed') {
      toast.info('Subscribe this device before sending a test notification.');
      return;
    }

    try {
      await sendTestNotification({
        body: 'This is a test notification',
        title: 'Hello',
      }).unwrap();
      toast.success('Test notification request sent.');
    } catch (error) {
      toast.error(
        getApiErrorMessage(
          error,
          'Unable to send a test notification right now.',
        ),
      );
    }
  }, [sendTestNotification, state.status]);

  return {
    isSendingTest,
    isSubscribing,
    isUnsubscribing,
    permission: state.permission,
    requestPermission,
    sendTest,
    status: state.status,
    subscribe,
    subscription: state.subscription,
    unsubscribe,
    unsupportedReason: state.isSupported
      ? null
      : 'This browser does not support service worker push notifications.',
  };
}
