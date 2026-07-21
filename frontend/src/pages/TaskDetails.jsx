import React, { useEffect, useState } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import { 
  ArrowLeft, Calendar, User, CheckCircle2, Clock, 
  ListTodo, AlertCircle, CornerDownRight, Plus 
} from 'lucide-react';

const TaskDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [task, setTask] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  useEffect(() => {
    const fetchTaskDetails = async () => {
      setLoading(true);
      setErrorMsg('');
      try {
        const res = await api.get(`/tasks/${id}`);
        setTask(res.data.data);
      } catch (err) {
        console.error('Failed to load task details', err);
        const serverMsg = err.response?.data?.error?.message;
        setErrorMsg(serverMsg || 'Failed to retrieve task details. Make sure you have permission.');
      } finally {
        setLoading(false);
      }
    };

    fetchTaskDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center gap-3">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" />
        <span className="text-slate-500 dark:text-slate-400 text-sm">Loading task details...</span>
      </div>
    );
  }

  if (errorMsg || !task) {
    return (
      <div className="max-w-xl mx-auto py-12 px-4 text-center space-y-4">
        <AlertCircle className="h-12 w-12 text-rose-500 mx-auto" />
        <h3 className="text-xl font-bold text-slate-800 dark:text-white">Failed to load task</h3>
        <p className="text-sm text-slate-500 dark:text-slate-400">
          {errorMsg || 'The requested task could not be found or you do not have permission to view it.'}
        </p>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-800 dark:text-white transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>
    );
  }

  // Check if overdue
  const isOverdue = () => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      
      {/* Back button */}
      <div>
        <Link 
          to="/" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-slate-500 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      {/* Main Details Panel */}
      <div className="glass dark:glass rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-xl space-y-6">
        
        {/* Title & Status */}
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
              {task.title}
            </h2>
            {task.parentTask && (
              <div className="flex items-center gap-1.5 text-sm text-slate-400 dark:text-slate-500">
                <span>Subtask of:</span>
                <Link 
                  to={`/task/${task.parentTask.id}`} 
                  className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                >
                  {task.parentTask.title}
                </Link>
              </div>
            )}
          </div>

          <div>
            <span className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border ${
              task.status === 'DONE' 
                ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                : task.status === 'IN_PROGRESS'
                ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
                : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'
            }`}>
              {task.status === 'DONE' ? (
                <CheckCircle2 className="h-3.5 w-3.5" />
              ) : task.status === 'IN_PROGRESS' ? (
                <Clock className="h-3.5 w-3.5" />
              ) : (
                <ListTodo className="h-3.5 w-3.5" />
              )}
              {task.status === 'DONE' ? 'Done' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
            </span>
          </div>
        </div>

        {/* Description */}
        <div className="border-t border-b border-slate-100 dark:border-slate-800 py-6">
          <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 mb-2">
            Description
          </h4>
          <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
            {task.description || 'No description provided for this task.'}
          </p>
        </div>

        {/* Meta Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {/* Assignee Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60">
            <div className="p-2.5 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
              <User className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assignee</span>
              <span className="block text-sm font-semibold text-slate-800 dark:text-slate-200">{task.assignee?.name || 'Unassigned'}</span>
              <span className="block text-xs text-slate-400 dark:text-slate-500">{task.assignee?.email || ''}</span>
            </div>
          </div>

          {/* Due Date Card */}
          <div className="flex items-center gap-3.5 p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/40 border border-slate-150 dark:border-slate-800/60">
            <div className={`p-2.5 rounded-xl ${
              isOverdue() 
                ? 'bg-rose-50 dark:bg-rose-950/20 text-rose-600 dark:text-rose-400' 
                : 'bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-450'
            }`}>
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="block text-[10px] font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</span>
              <span className={`block text-sm font-semibold ${isOverdue() ? 'text-rose-600 dark:text-rose-400' : 'text-slate-850 dark:text-slate-200'}`}>
                {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {
                  weekday: 'short',
                  month: 'short',
                  day: 'numeric',
                  year: 'numeric'
                }) : 'No due date set'}
              </span>
              {isOverdue() && (
                <span className="inline-block text-[10px] font-extrabold uppercase tracking-wider text-rose-500 dark:text-rose-400 mt-0.5 animate-pulse">
                  Overdue Task
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Subtasks (Child Tasks) Section */}
        <div className="pt-4 space-y-4">
          <div className="flex items-center justify-between">
            <h4 className="text-sm font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
              Subtasks ({task.childTasks?.length || 0})
            </h4>
          </div>

          {task.childTasks && task.childTasks.length === 0 ? (
            <div className="p-5 border border-dashed border-slate-200 dark:border-slate-850 rounded-2xl text-center text-slate-400 dark:text-slate-600 text-xs">
              No subtasks defined. Create a task and set this task as its parent.
            </div>
          ) : (
            <div className="space-y-2">
              {task.childTasks.map((subtask) => (
                <div 
                  key={subtask.id}
                  className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/30 border border-slate-100 dark:border-slate-800 hover:border-slate-200 dark:hover:border-slate-700 transition duration-300"
                >
                  <div className="flex items-center gap-2.5">
                    <CornerDownRight className="h-4 w-4 text-slate-400 shrink-0" />
                    <div>
                      <Link 
                        to={`/task/${subtask.id}`} 
                        className="text-sm font-semibold text-slate-800 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition"
                      >
                        {subtask.title}
                      </Link>
                      <span className="block text-xs text-slate-400 dark:text-slate-500">
                        Assignee: {subtask.assignee?.name || 'Unassigned'}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 self-end sm:self-auto">
                    {subtask.dueDate && (
                      <span className="text-[11px] text-slate-400 dark:text-slate-500">
                        Due: {new Date(subtask.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </span>
                    )}
                    
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-medium border ${
                      subtask.status === 'DONE' 
                        ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                        : subtask.status === 'IN_PROGRESS'
                        ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
                        : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'
                    }`}>
                      {subtask.status === 'DONE' ? 'Done' : subtask.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default TaskDetails;
