import { Layers, Plus, Search } from './AppIcons';
import TaskCard from './TaskCard';
import type { TaskBoardControllerProps } from '../routes/routeTypes';

export default function TaskBoard({
  tasks,
  searchQuery,
  statusFilter,
  priorityFilter,
  onSearchChange,
  onStatusFilterChange,
  onPriorityFilterChange,
  onCreateTask,
  onEditTask,
  onDeleteTask,
  onToggleTaskStatus,
  onOpenConflictModal,
}: TaskBoardControllerProps) {
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
            id="filter-tasks-status"
            value={statusFilter}
            onChange={(event) => onStatusFilterChange(event.target.value as typeof statusFilter)}
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-300"
          >
            <option value="ALL">All Status</option>
            <option value="TODO">Todo</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="DONE">Completed</option>
          </select>

          <select
            id="filter-tasks-priority"
            value={priorityFilter}
            onChange={(event) =>
              onPriorityFilterChange(event.target.value as typeof priorityFilter)
            }
            className="cursor-pointer rounded-xl border border-slate-200 bg-slate-50 px-3 py-1.5 text-xs font-medium text-slate-600 dark:border-slate-800 dark:bg-[#0D1016] dark:text-slate-300"
          >
            <option value="ALL">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
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

      {tasks.length === 0 ? (
        <div className="animate-fade-in flex flex-col items-center justify-center gap-3.5 rounded-2xl border border-dashed border-slate-200 bg-slate-50/50 px-4 py-16 text-center dark:border-slate-800 dark:bg-slate-950/25">
          <div className="rounded-2xl bg-white p-3 text-slate-400 shadow-sm dark:bg-slate-900">
            <Layers className="h-7 w-7 text-indigo-400" />
          </div>
          <div className="flex max-w-sm flex-col gap-1">
            <h4 className="text-sm font-bold text-slate-900 dark:text-slate-200">
              No tasks on record
            </h4>
            <p className="text-xs leading-normal text-slate-400">
              Your filters did not return any tasks, or you have not created any
              yet. Press &quot;New Task&quot; to add one.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {tasks.map((task) => (
            <TaskCard
              key={task.id}
              task={task}
              onDelete={onDeleteTask}
              onEdit={onEditTask}
              onResolveConflict={onOpenConflictModal}
              onToggleStatus={onToggleTaskStatus}
            />
          ))}
        </div>
      )}
    </div>
  );
}
