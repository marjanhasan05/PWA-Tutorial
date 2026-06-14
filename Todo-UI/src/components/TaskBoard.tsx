import { ChevronRight, Layers, Plus, Search } from './AppIcons';
import { TASK_SORT_OPTIONS } from '../features/tasks/taskTypes';
import TaskCard from './TaskCard';
import type { TaskBoardControllerProps } from '../routes/routeTypes';

export default function TaskBoard({
  errorMessage,
  getTaskSyncState,
  hasActiveFilters,
  isFetching = false,
  isLoading = false,
  listMeta,
  onChangePage,
  tasks,
  searchQuery,
  sortValue,
  onSearchChange,
  onRetry,
  onSortChange,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
  onOpenConflictModal,
}: TaskBoardControllerProps) {
  const isEmpty = tasks.length === 0;
  const emptyTitle = hasActiveFilters ? 'No matching tasks found' : 'No tasks on record';
  const emptyMessage = hasActiveFilters
    ? 'Try adjusting your search, filter, or sort choices to widen the result set.'
    : 'You have not created any tasks yet. Press "New Task" to add your first one.';

  return (
    <div className="flex w-full flex-col gap-4 rounded-2xl border border-slate-100 bg-white p-4 shadow-sm dark:border-slate-800/80 dark:bg-[#11141B] sm:p-5">
      <div className="flex flex-col items-center justify-between gap-3.5 border-b border-slate-100 pb-4 dark:border-slate-800/60 sm:flex-row">
        <div className="relative w-full sm:max-w-xs">
          <Search className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            id="search-tasks-input"
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(event) => onSearchChange(event.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-white py-2 pr-4 pl-10 text-xs text-slate-700 focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/10 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-200"
          />
        </div>

        <div className="flex w-full flex-wrap items-center gap-2 sm:w-auto">
          <select
            id="filter-tasks-sort"
            value={sortValue}
            onChange={(event) => onSortChange(event.target.value as typeof sortValue)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-300"
          >
            {TASK_SORT_OPTIONS.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>

          <button
            id="btn-create-task-floating"
            type="button"
            onClick={onCreateTask}
            className="glow-indigo ml-auto flex items-center justify-center gap-1 rounded-xl bg-indigo-600 px-4 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 active:scale-95"
          >
            <Plus className="h-3.5 w-3.5" />
            <span>New Task</span>
          </button>
        </div>
      </div>

      {errorMessage ? (
        <div className="animate-fade-in rounded-2xl border border-rose-900/50 bg-rose-950/20 p-4 text-sm text-rose-200">
          <p className="font-semibold">Unable to load tasks.</p>
          <p className="mt-1 text-xs text-rose-200/80">{errorMessage}</p>
          <button
            type="button"
            onClick={onRetry}
            className="mt-3 rounded-xl bg-rose-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-rose-500"
          >
            Retry
          </button>
        </div>
      ) : isLoading ? (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-44 animate-pulse rounded-xl border border-slate-800 bg-[#1A1D23]"
            />
          ))}
        </div>
      ) : isEmpty ? (
        <div className="animate-fade-in flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center dark:border-slate-800 dark:bg-slate-950/25">
          <div className="rounded-2xl bg-white p-3 text-slate-400 shadow-sm dark:bg-slate-900">
            <Layers className="h-7 w-7 text-indigo-400" />
          </div>
          <div className="flex max-w-sm flex-col gap-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
              {emptyTitle}
            </h4>
            <p className="text-xs leading-normal text-slate-400">
              {emptyMessage}
            </p>
          </div>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          <div className="flex items-center justify-between gap-3 text-[11px] font-medium text-slate-400">
            <span>
              Showing page {listMeta.page} of {listMeta.totalPages} with{' '}
              {listMeta.total} total task{listMeta.total === 1 ? '' : 's'}.
            </span>
            {isFetching ? (
              <span className="flex items-center gap-1 text-indigo-400">
                <span className="h-2 w-2 animate-pulse rounded-full bg-indigo-400" />
                Refreshing...
              </span>
            ) : null}
          </div>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {tasks.map((task) => (
              <TaskCard
                key={task.id}
                syncState={getTaskSyncState(task)}
                task={task}
                onDelete={onDeleteTask}
                onEdit={onEditTask}
                onResolveConflict={onOpenConflictModal}
                onToggleStatus={onToggleTaskStatus}
              />
            ))}
          </div>

          <div className="flex items-center justify-between gap-3 border-t border-slate-100 pt-3 dark:border-slate-800/60">
            <button
              type="button"
              onClick={() => onChangePage(listMeta.page - 1)}
              disabled={!listMeta.hasPrevPage}
              className="rounded-xl border border-slate-200 px-3 py-2 text-xs font-bold text-slate-600 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-slate-800 dark:text-slate-300 dark:hover:bg-slate-900"
            >
              Previous
            </button>
            <span className="text-xs font-semibold text-slate-400">
              Page {listMeta.page} / {listMeta.totalPages}
            </span>
            <button
              type="button"
              onClick={() => onChangePage(listMeta.page + 1)}
              disabled={!listMeta.hasNextPage}
              className="glow-indigo flex items-center gap-1 rounded-xl bg-indigo-600 px-3 py-2 text-xs font-bold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Next
              <ChevronRight className="h-3 w-3" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
