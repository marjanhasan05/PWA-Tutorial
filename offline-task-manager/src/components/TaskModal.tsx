import React from 'react';
import { Task } from '../utils/db';
import { X, Calendar, Bell, CheckSquare } from 'lucide-react';

interface TaskModalProps {
  task: Task | null; // null for Create mode, object for Edit mode
  isOpen: boolean;
  onClose: () => void;
  onSave: (taskData: {
    title: string;
    description: string;
    status: 'TODO' | 'IN_PROGRESS' | 'DONE';
    priority: 'LOW' | 'MEDIUM' | 'HIGH';
    dueDate: string | null;
    reminderAt: string | null;
  }) => void;
}

export default function TaskModal({ task, isOpen, onClose, onSave }: TaskModalProps) {
  const [title, setTitle] = React.useState('');
  const [description, setDescription] = React.useState('');
  const [status, setStatus] = React.useState<'TODO' | 'IN_PROGRESS' | 'DONE'>('TODO');
  const [priority, setPriority] = React.useState<'LOW' | 'MEDIUM' | 'HIGH'>('MEDIUM');
  const [dueDate, setDueDate] = React.useState('');
  const [reminderAt, setReminderAt] = React.useState('');
  const [error, setError] = React.useState('');

  // Synchronise state when opening or when active task changes
  React.useEffect(() => {
    if (isOpen) {
      if (task) {
        setTitle(task.title);
        setDescription(task.description || '');
        setStatus(task.status);
        setPriority(task.priority);
        // Format ISO string to datetime-local compatible format (YYYY-MM-DDThh:mm)
        setDueDate(task.dueDate ? new Date(task.dueDate).toISOString().slice(0, 16) : '');
        setReminderAt(task.reminderAt ? new Date(task.reminderAt).toISOString().slice(0, 16) : '');
      } else {
        setTitle('');
        setDescription('');
        setStatus('TODO');
        setPriority('MEDIUM');
        setDueDate('');
        setReminderAt('');
      }
      setError('');
    }
  }, [task, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      setError('Task title is required.');
      return;
    }

    onSave({
      title: title.trim(),
      description: description.trim(),
      status,
      priority,
      dueDate: dueDate ? new Date(dueDate).toISOString() : null,
      reminderAt: reminderAt ? new Date(reminderAt).toISOString() : null,
    });
    onClose();
  };

  return (
    <div id="task-form-overlay" className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in text-slate-300">
      <div
        id="task-form-dialog"
        className="w-full max-w-lg bg-[#11141B] rounded-2xl shadow-2xl border border-slate-800/80 flex flex-col max-h-[90vh] overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800/80">
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <CheckSquare className="w-5 h-5 text-indigo-400" />
            {task ? 'Edit Task Details' : 'Create New Task'}
          </h2>
          <button
            id="close-task-modal-btn"
            onClick={onClose}
            className="p-1 rounded-lg hover:bg-slate-800 text-slate-500 hover:text-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 flex flex-col gap-4">
          {error && <p className="text-xs font-semibold text-rose-400">{error}</p>}

          {/* Title */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              id="field-task-title"
              type="text"
              placeholder="e.g. Finish writing documentation"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-xs text-sm transition-all"
              required
            />
          </div>

          {/* Description */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
              Description / Notes
            </label>
            <textarea
              id="field-task-description"
              placeholder="Any useful checklist, instructions, or notes..."
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-xs text-sm resize-none transition-all"
            />
          </div>

          {/* Grid for Status and Priority */}
          <div className="grid grid-cols-2 gap-4">
            {/* Status */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Status
              </label>
              <select
                id="field-task-status"
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
              >
                <option value="TODO">Todo</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Completed</option>
              </select>
            </div>

            {/* Priority */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1">
                Priority
              </label>
              <select
                id="field-task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>

          <div className="border-t border-dashed border-slate-800 my-1"></div>

          {/* Due date */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-indigo-400" />
              <span>Due Date & Time</span>
            </label>
            <input
              id="field-task-duedate"
              type="datetime-local"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
            />
          </div>

          {/* Reminder */}
          <div className="flex flex-col gap-1.5">
            <label className="text-[10px] font-bold text-slate-400 uppercase tracking-widest leading-none mb-1 flex items-center gap-1.5">
              <Bell className="w-3.5 h-3.5 text-amber-500" />
              <span>Reminder Alarm</span>
            </label>
            <input
              id="field-task-reminder"
              type="datetime-local"
              value={reminderAt}
              onChange={(e) => setReminderAt(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl border border-slate-800 focus:outline-none focus:ring-2 focus:ring-indigo-500/25 focus:border-indigo-500 bg-[#0D1016] text-slate-200 text-sm transition-all"
            />
          </div>

          {/* Footer Action buttons */}
          <div className="flex items-center justify-end gap-3 pt-4 mt-auto border-t border-slate-800/80">
            <button
              id="cancel-modal-btn"
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl border border-slate-850 border-slate-800 hover:bg-slate-800 text-slate-300 text-xs font-semibold transition cursor-pointer"
            >
              Cancel
            </button>
            <button
              id="save-task-btn"
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-505 hover:bg-indigo-500 active:scale-95 text-white text-xs font-bold shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all glow-indigo cursor-pointer"
            >
              {task ? 'Update Task' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
