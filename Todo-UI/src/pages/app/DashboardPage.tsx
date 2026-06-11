import AnalyticsPanel from '../../components/AnalyticsPanel';
import PushNotificationManager from '../../components/PushNotificationManager';
import TaskBoard from '../../components/TaskBoard';
import type { TaskBoardControllerProps } from '../../routes/routeTypes';
import { useNavigate } from 'react-router-dom';
import type { Task } from '../../utils/db';

interface DashboardPageProps extends TaskBoardControllerProps {
  allTasks: Task[];
}

export default function DashboardPage({
  allTasks,
  ...taskBoardProps
}: DashboardPageProps) {
  const navigate = useNavigate();

  return (
    <>
      {allTasks.length > 0 ? <AnalyticsPanel tasks={allTasks} /> : null}
      <TaskBoard
        {...taskBoardProps}
        onCreateTask={() => navigate('/app/tasks/new')}
      />
      <PushNotificationManager />
    </>
  );
}
