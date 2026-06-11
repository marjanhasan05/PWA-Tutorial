import type { ApiSuccessResponse } from '../../types/api';

export type PushSubscriptionKeys = {
  p256dh: string;
  auth: string;
};

export type PushSubscriptionPayload = {
  endpoint: string;
  expirationTime: number | null;
  keys: PushSubscriptionKeys;
};

export type CreateNotificationSubscriptionRequest = PushSubscriptionPayload;

export type DeleteNotificationSubscriptionRequest = {
  endpoint: string;
};

export type TestNotificationRequest = {
  title: string;
  body: string;
};

export type NotificationPermissionState =
  | NotificationPermission
  | 'unsupported';

export type NotificationSubscriptionState =
  | 'subscribed'
  | 'unsubscribed'
  | 'unsupported';

export type NotificationActionResponse = ApiSuccessResponse<{
  endpoint?: string;
} | null>;
