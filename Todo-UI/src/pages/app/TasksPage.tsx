import { useNavigate } from 'react-router-dom';
import TaskBoard from '../../components/TaskBoard';
import type { TaskBoardControllerProps } from '../../routes/routeTypes';

export default function TasksPage(props: TaskBoardControllerProps) {
  const navigate = useNavigate();

  return (
    <TaskBoard {...props} onCreateTask={() => navigate('/app/tasks/new')} />
  );
}
