import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus } from '../../components/AppIcons';

interface CreateTaskPageProps {
  isTaskModalOpen: boolean;
  onOpenCreateModal: () => void;
}

export default function CreateTaskPage({
  isTaskModalOpen,
  onOpenCreateModal,
}: CreateTaskPageProps) {
  const navigate = useNavigate();
  const hasTriggeredOpen = React.useRef(false);
  const hasObservedOpen = React.useRef(false);

  React.useEffect(() => {
    if (!hasTriggeredOpen.current) {
      hasTriggeredOpen.current = true;
      onOpenCreateModal();
    }
  }, [onOpenCreateModal]);

  React.useEffect(() => {
    if (isTaskModalOpen) {
      hasObservedOpen.current = true;
      return;
    }

    if (hasObservedOpen.current) {
      navigate('/app/tasks', { replace: true });
    }
  }, [isTaskModalOpen, navigate]);

  return (
    <div className="flex min-h-[280px] items-center justify-center rounded-2xl border border-dashed border-slate-200 bg-white/80 p-6 text-center shadow-sm dark:border-slate-800 dark:bg-[#11141B]">
      <div className="flex max-w-sm flex-col items-center gap-3">
        <div className="glow-indigo rounded-2xl bg-indigo-600 p-3 text-white">
          <Plus className="h-5 w-5" />
        </div>
        <h1 className="text-lg font-black text-slate-900 dark:text-white">
          Create a New Task
        </h1>
        <p className="text-xs leading-relaxed text-slate-400">
          The task modal opens automatically on this route. Closing or saving it
          will return you to the tasks screen.
        </p>
      </div>
    </div>
  );
}
