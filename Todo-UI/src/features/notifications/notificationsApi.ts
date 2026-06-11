import { baseApi } from '../api/baseApi';
import type {
  CreateNotificationSubscriptionRequest,
  DeleteNotificationSubscriptionRequest,
  NotificationActionResponse,
  TestNotificationRequest,
} from './notificationTypes';

export const notificationsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createNotificationSubscription: builder.mutation<
      NotificationActionResponse,
      CreateNotificationSubscriptionRequest
    >({
      query: (body) => ({
        url: '/notifications/subscriptions',
        method: 'POST',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    deleteNotificationSubscription: builder.mutation<
      NotificationActionResponse,
      DeleteNotificationSubscriptionRequest
    >({
      query: (body) => ({
        url: '/notifications/subscriptions',
        method: 'DELETE',
        body,
      }),
      invalidatesTags: ['Notification'],
    }),
    sendTestNotification: builder.mutation<
      NotificationActionResponse,
      TestNotificationRequest
    >({
      query: (body) => ({
        url: '/notifications/test',
        method: 'POST',
        body,
      }),
    }),
  }),
});

export const {
  useCreateNotificationSubscriptionMutation,
  useDeleteNotificationSubscriptionMutation,
  useSendTestNotificationMutation,
} = notificationsApi;
