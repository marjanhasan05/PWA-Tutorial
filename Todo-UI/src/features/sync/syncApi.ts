import { baseApi } from '../api/baseApi';
import type { SyncRequest, SyncResponse } from './syncTypes';

export const syncApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    syncTasks: builder.mutation<SyncResponse, SyncRequest>({
      query: (body) => ({
        url: '/sync',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
    }),
  }),
});

export const { useSyncTasksMutation } = syncApi;
