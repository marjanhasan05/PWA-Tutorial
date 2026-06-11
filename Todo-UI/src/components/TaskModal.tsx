import React from 'react';
import type {
  Task,
  TaskFormValues,
  TaskPriority,
  TaskStatus,
} from '../utils/db';
import { Bell, Calendar, CheckSquare, X } from './AppIcons';

interface TaskModalProps {
  isSaving?: boolean;
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: TaskFormValues) => Promise<void> | void;
}

function getInitialTaskState(task: Task | null) {
  return {
    title: task?.title ?? '',
    description: task?.description ?? '',
    status: task?.status ?? ('TODO' as TaskStatus),
    priority: task?.priority ?? ('MEDIUM' as TaskPriority),
    dueDate: task?.dueDate
      ? new Date(task.dueDate).toISOString().slice(0, 16)
      : '',
    reminderAt: task?.reminderAt
      ? new Date(task.reminderAt).toISOString().slice(0, 16)
      : '',
  };
}

export default function TaskModal({
  isSaving = false,
  task,
  isOpen,
  onClose,
  onSave,
}: TaskModalProps) {
  const initialState = React.useMemo(() => getInitialTaskState(task), [task]);
  const [title, setTitle] = React.useState(initialState.title);
  const [description, setDescription] = React.useState(
    initialState.description,
  );
  const [status, setStatus] = React.useState<TaskStatus>(initialState.status);
  const [priority, setPriority] = React.useState<TaskPriority>(
    initialState.priority,
  );
  const [dueDate, setDueDate] = React.useState(initialState.dueDate);
  const [reminderAt, setReminderAt] = React.useState(initialState.reminderAt);
  const [error, setError] = React.useState('');

  if (!isOpen) {
    return null;
  }

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    setError('');

    try {
      await onSave({
        title: title.trim(),
        description: description.trim(),
        status,
        priority,
        dueDate: dueDate ? new Date(dueDate).toISOString() : null,
        reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
      });
    } catch (submissionError) {
      setError(
        submissionError instanceof Error
          ? submissionError.message
          : 'Unable to save the task right now.',
      );
    }
  };

  return (
    <div className="animate-fade-in fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 p-4 text-slate-300 backdrop-blur-sm">
      <div className="flex max-h-[90vh] w-full max-w-lg flex-col overflow-hidden rounded-2xl border border-slate-800/80 bg-[#11141B] shadow-2xl">
        <div className="flex items-center justify-between border-b border-slate-800/80 px-6 py-4">
          <h2 className="flex items-center gap-2 text-lg font-bold text-white">
            <CheckSquare className="h-5 w-5 text-indigo-400" />
            {task ? 'Edit Task Details' : 'Create New Task'}
          </h2>
          <button
            id="close-task-modal-btn"
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-slate-500 transition-colors hover:bg-slate-800 hover:text-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="flex flex-1 flex-col gap-4 overflow-y-auto p-6"
        >
          {error ? (
            <p className="text-xs font-semibold text-rose-400">{error}</p>
          ) : null}

          <div className="flex flex-col gap-1.5">
            <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-task-title"
              type="text"
              placeholder="e.g. Finish writing documentation"
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              required
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
              Description / Notes
            </label>
            <textarea
              id="field-task-description"
              placeholder="Any useful checklist, instructions, or notes..."
              rows={3}
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              className="w-full resize-none rounded-xl border border-slate-800 bg-[#0D1016] px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
                Status
              </label>
              <select
                id="field-task-status"
                value={status}
                onChange={(event) =>
                  setStatus(event.target.value as TaskStatus)
                }
                className="w-full rounded-xl border border-slate-800 bg-[#0D1016] px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="mb-1 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
                Priority
              </label>
              <select
                id="field-task-priority"
                value={priority}
                onChange={(event) =>
                  setPriority(event.target.value as TaskPriority)
                }
                className="w-full rounded-xl border border-slate-800 bg-[#0D1016] px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="my-1 border-t border-dashed border-slate-800" />

          <div className="flex flex-col gap-1.5">
            <label className="mb-1 flex items-center gap-1.5 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
              <Calendar className="h-3.5 w-3.5 text-indigo-400" />
              <span>Due Date & Time</span>
            </label>
            <input
              id="field-task-duedate"
              type="datetime-local"
              value={dueDate}
              onChange={(event) => setDueDate(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>

          <div className="flex flex-col gap-1.5">
            <label className="mb-1 flex items-center gap-1.5 text-[10px] font-bold leading-none tracking-widest text-slate-400 uppercase">
              <Bell className="h-3.5 w-3.5 text-amber-500" />
              <span>Reminder Alarm</span>
            </label>
            <input
              id="field-task-reminder"
              type="datetime-local"
              value={reminderAt}
              onChange={(event) => setReminderAt(event.target.value)}
              className="w-full rounded-xl border border-slate-800 bg-[#0D1016] px-3.5 py-2.5 text-sm text-slate-200 transition-all focus:border-indigo-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/25"
            />
          </div>

          <div className="mt-auto flex items-center justify-end gap-3 border-t border-slate-800/80 pt-4">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              disabled={isSaving}
              className="rounded-xl border border-slate-800 px-4 py-2.5 text-xs font-semibold text-slate-300 transition hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              disabled={isSaving}
              className="glow-indigo rounded-xl bg-indigo-600 px-5 py-2.5 text-xs font-bold text-white transition-all hover:bg-indigo-500"
            >
              {isSaving
                ? task
                  ? 'Updating...'
                  : 'Saving...'
                : task
                  ? 'Update Task'
                  : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
