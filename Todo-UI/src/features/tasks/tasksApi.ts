import type { ApiSuccessResponse } from '../../types/api';
import { baseApi } from '../api/baseApi';
import type {
  Task,
  TaskFormValues,
  TaskListMeta,
  TaskListQueryParams,
  TaskListResult,
} from './taskTypes';
import { DEFAULT_TASK_LIST_META } from './taskTypes';

type RawTaskListData = {
  tasks?: Task[];
  items?: Task[];
  meta?: Partial<TaskListMeta>;
  page?: number;
  limit?: number;
  total?: number;
  totalPages?: number;
};

type RawTaskListResponse = ApiSuccessResponse<RawTaskListData> & {
  meta?: Partial<TaskListMeta>;
};

type RawTaskResponse = ApiSuccessResponse<Task | { task?: Task }>;

function normalizeTaskListResponse(response: RawTaskListResponse): TaskListResult {
  const items = response.data.tasks ?? response.data.items ?? [];
  const responseMeta = response.data.meta ?? response.meta ?? {};
  const page = responseMeta.page ?? response.data.page ?? DEFAULT_TASK_LIST_META.page;
  const limit =
    responseMeta.limit ?? response.data.limit ?? DEFAULT_TASK_LIST_META.limit;
  const total =
    responseMeta.total ?? response.data.total ?? items.length ?? DEFAULT_TASK_LIST_META.total;
  const totalPages =
    responseMeta.totalPages ??
    (limit > 0 ? Math.max(1, Math.ceil(total / limit)) : 1);

  return {
    items,
    meta: {
      page,
      limit,
      total,
      totalPages,
      hasNextPage:
        responseMeta.hasNextPage ?? page < totalPages,
      hasPrevPage:
        responseMeta.hasPrevPage ?? page > 1,
    },
  };
}

function normalizeTaskResponse(response: RawTaskResponse): Task {
  return 'task' in response.data && response.data.task
    ? response.data.task
    : (response.data as Task);
}

export const tasksApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query<TaskListResult, TaskListQueryParams | void>({
      query: (queryParams) => {
        const params: Record<string, string | number> = {};

        if (queryParams?.page) {
          params.page = queryParams.page;
        }
        if (queryParams?.limit) {
          params.limit = queryParams.limit;
        }
        if (queryParams?.search?.trim()) {
          params.search = queryParams.search.trim();
        }
        if (queryParams?.status && queryParams.status !== 'ALL') {
          params.status = queryParams.status;
        }
        if (queryParams?.priority && queryParams.priority !== 'ALL') {
          params.priority = queryParams.priority;
        }
        if (queryParams?.sortBy) {
          params.sortBy = queryParams.sortBy;
        }
        if (queryParams?.sortOrder) {
          params.sortOrder = queryParams.sortOrder;
        }
        if (queryParams?.updatedSince) {
          params.updatedSince = queryParams.updatedSince;
        }

        return {
          url: '/tasks',
          method: 'GET',
          params,
        };
      },
      providesTags: (result) =>
        result
          ? [
              { type: 'Task', id: 'LIST' },
              ...result.items.map((task) => ({ type: 'Task' as const, id: task.id })),
            ]
          : [{ type: 'Task', id: 'LIST' }],
      transformResponse: normalizeTaskListResponse,
    }),
    getTask: builder.query<Task, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: 'GET',
      }),
      providesTags: (_result, _error, taskId) => [{ type: 'Task', id: taskId }],
      transformResponse: normalizeTaskResponse,
    }),
    createTask: builder.mutation<Task, TaskFormValues>({
      query: (body) => ({
        url: '/tasks',
        method: 'POST',
        body,
      }),
      invalidatesTags: [{ type: 'Task', id: 'LIST' }],
      transformResponse: normalizeTaskResponse,
    }),
    updateTask: builder.mutation<
      Task,
      { id: string; data: Partial<TaskFormValues> }
    >({
      query: ({ data, id }) => ({
        url: `/tasks/${id}`,
        method: 'PATCH',
        body: data,
      }),
      invalidatesTags: (_result, _error, { id }) => [
        { type: 'Task', id: 'LIST' },
        { type: 'Task', id },
      ],
      transformResponse: normalizeTaskResponse,
    }),
    deleteTask: builder.mutation<void, string>({
      query: (taskId) => ({
        url: `/tasks/${taskId}`,
        method: 'DELETE',
      }),
      invalidatesTags: (_result, _error, taskId) => [
        { type: 'Task', id: 'LIST' },
        { type: 'Task', id: taskId },
      ],
    }),
  }),
});

export const {
  useCreateTaskMutation,
  useDeleteTaskMutation,
  useGetTaskQuery,
  useGetTasksQuery,
  useUpdateTaskMutation,
} = tasksApi;
