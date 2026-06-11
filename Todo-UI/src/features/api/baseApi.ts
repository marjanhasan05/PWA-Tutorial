import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { RootState } from '../../app/store';
import { env } from '../../lib/env';
import { loadStoredAuthSession } from '../../lib/storage';

export const baseApi = createApi({
  reducerPath: 'baseApi',
  baseQuery: fetchBaseQuery({
    baseUrl: env.apiBaseUrl,
    prepareHeaders: (headers, { getState }) => {
      const state = getState() as RootState;
      const fallbackSession = loadStoredAuthSession();
      const accessToken =
        state.auth.accessToken ?? fallbackSession.accessToken ?? null;

      headers.set('Content-Type', 'application/json');

      if (accessToken) {
        headers.set('Authorization', `Bearer ${accessToken}`);
      }

      return headers;
    },
  }),
  tagTypes: ['Auth', 'Task'],
  endpoints: () => ({}),
});
