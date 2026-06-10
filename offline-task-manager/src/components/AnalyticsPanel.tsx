import { Task } from '../utils/db';
import { Target, CheckCircle, Clock, AlertCircle } from 'lucide-react';

interface AnalyticsPanelProps {
  tasks: Task[];
}

export default function AnalyticsPanel({ tasks }: AnalyticsPanelProps) {
  const activeTasks = tasks.filter(t => !t.isOfflineDeleted && !t.deletedAt);
  const total = activeTasks.length;
  
  const todo = activeTasks.filter((t) => t.status === 'TODO').length;
  const inProgress = activeTasks.filter((t) => t.status === 'IN_PROGRESS').length;
  const completed = activeTasks.filter((t) => t.status === 'DONE').length;

  const percentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  return (
    <div id="analytics-statistics-grid" className="w-full grid grid-cols-2 lg:grid-cols-4 gap-4 font-sans">
      {/* Percentage Circle Card */}
      <div className="col-span-2 bg-gradient-to-br from-[#11141B] to-[#1A1D23] text-white p-5 rounded-2xl flex items-center justify-between shadow-lg border border-slate-800/80 glow-indigo">
        <div className="flex flex-col gap-1.5 flex-1 pr-4 min-w-0">
          <span className="text-[10px] uppercase font-bold text-indigo-400 tracking-widest">Overall Progress</span>
          <h3 className="text-lg font-bold tracking-tight text-white mb-1">Your Completed Tasks</h3>
          <p className="text-xs text-slate-400 leading-normal max-w-[200px] mt-auto">
            {completed} out of {total} items are complete. Let's tackle what is next!
          </p>
        </div>
        
        {/* Modern Radial Ring */}
        <div className="relative w-18 h-18 shrink-0">
          <svg className="w-full h-full" viewBox="0 0 36 36">
            <path
              className="text-slate-800/80"
              strokeWidth="3.2"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <path
              className="text-indigo-400 transition-all duration-700"
              strokeDasharray={`${percentage}, 100`}
              strokeWidth="3.2"
              strokeLinecap="round"
              stroke="currentColor"
              fill="none"
              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
            />
            <text x="18" y="20.5" className="text-[10px] font-black fill-white text-center font-mono" textAnchor="middle">
              {percentage}%
            </text>
          </svg>
        </div>
      </div>

      {/* Todo Box */}
      <div className="bg-[#1A1D23] border border-slate-800 p-4 rounded-2xl flex items-start justify-between shadow-md hover:border-slate-750 transition-colors">
        <div className="flex flex-col gap-1 select-none">
          <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">To Do</span>
          <span className="text-2xl font-black text-white">{todo}</span>
          <p className="text-[10px] text-slate-500 mt-2">Pending initial start</p>
        </div>
        <div className="p-2 bg-[#11141B] rounded-xl text-slate-400 border border-slate-800">
          <AlertCircle className="w-4.5 h-4.5" />
        </div>
      </div>

      {/* In Progress Box */}
      <div className="bg-[#1A1D23] border border-slate-800 p-4 rounded-2xl flex items-start justify-between shadow-md hover:border-slate-750 transition-colors">
        <div className="flex flex-col gap-1 select-none">
          <span className="text-[10px] uppercase font-bold text-slate-450 tracking-wider">Active</span>
          <span className="text-2xl font-black text-indigo-400">{inProgress}</span>
          <p className="text-[10px] text-slate-500 mt-2">Tasks currently in status</p>
        </div>
        <div className="p-2 bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-xl glow-indigo">
          <Clock className="w-4.5 h-4.5" />
        </div>
      </div>
    </div>
  );
}
