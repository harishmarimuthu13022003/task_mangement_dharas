import React, { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import api from '../services/api';
import { X, AlertCircle } from 'lucide-react';

const TaskModal = ({ isOpen, onClose, task = null, onSaveSuccess }) => {
  const [users, setUsers] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [errorMessage, setErrorMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm({
    defaultValues: {
      title: '',
      description: '',
      status: 'TODO',
      assigneeId: '',
      dueDate: '',
      parentTaskId: '',
    },
  });

  const isEditMode = !!task;

  // Load users (assignees) and other tasks (for parent tasks) on mount/open
  useEffect(() => {
    if (!isOpen) return;

    const loadDropdownData = async () => {
      try {
        setErrorMessage('');
        
        // 1. Fetch workspace users
        const usersRes = await api.get('/auth/users');
        setUsers(usersRes.data.data);

        // 2. Fetch workspace tasks to select as parent (limit to 100 to cover list)
        const tasksRes = await api.get('/tasks', { params: { limit: 100 } });
        // Filter out current task if in edit mode to prevent self-parenting
        const filteredTasks = isEditMode
          ? tasksRes.data.data.filter((t) => t.id !== task.id)
          : tasksRes.data.data;
        setTasks(filteredTasks);
      } catch (err) {
        console.error('Failed to load modal details', err);
        setErrorMessage('Failed to load assignees or parent tasks data.');
      }
    };

    loadDropdownData();
  }, [isOpen, task, isEditMode]);

  // Populate form if in edit mode
  useEffect(() => {
    if (isOpen && task) {
      setValue('title', task.title);
      setValue('description', task.description || '');
      setValue('status', task.status);
      setValue('assigneeId', task.assigneeId);
      setValue('dueDate', task.dueDate ? task.dueDate.split('T')[0] : '');
      setValue('parentTaskId', task.parentTaskId || '');
    } else if (isOpen && !task) {
      reset({
        title: '',
        description: '',
        status: 'TODO',
        assigneeId: '',
        dueDate: '',
        parentTaskId: '',
      });
    }
  }, [isOpen, task, setValue, reset]);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    setErrorMessage('');
    
    // Format optional values
    const payload = {
      ...data,
      assigneeId: parseInt(data.assigneeId, 10),
      parentTaskId: data.parentTaskId ? parseInt(data.parentTaskId, 10) : null,
      dueDate: data.dueDate || null,
    };

    try {
      if (isEditMode) {
        await api.put(`/tasks/${task.id}`, payload);
      } else {
        await api.post('/tasks', payload);
      }
      onSaveSuccess();
      onClose();
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message;
      setErrorMessage(serverMsg || 'An error occurred while saving the task.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      />

      {/* Modal Dialog */}
      <div className="relative w-full max-w-lg overflow-hidden rounded-2xl bg-white dark:bg-slate-800 p-6 shadow-2xl transition-all border border-slate-200 dark:border-slate-700 animate-fade-in">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-100 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white">
            {isEditMode ? 'Edit Task' : 'Create Task'}
          </h3>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit(onSubmit)} className="mt-4 space-y-4">
          
          {/* Error Message Alert */}
          {errorMessage && (
            <div className="flex items-start gap-2.5 p-3.5 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 text-sm">
              <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Title */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Title <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition"
              placeholder="Task name"
              {...register('title', { required: 'Task title is required' })}
            />
            {errors.title && (
              <span className="text-xs text-rose-500 mt-1 block">{errors.title.message}</span>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
              Description
            </label>
            <textarea
              rows="3"
              className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition resize-none"
              placeholder="Provide a detailed description of the task..."
              {...register('description')}
            />
          </div>

          {/* Assignee & Status */}
          <div className="grid grid-cols-2 gap-4">
            {/* Assignee */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Assignee <span className="text-rose-500">*</span>
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition"
                {...register('assigneeId', { required: 'Please select an assignee' })}
              >
                <option value="">Select Assignee</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name}
                  </option>
                ))}
              </select>
              {errors.assigneeId && (
                <span className="text-xs text-rose-500 mt-1 block">{errors.assigneeId.message}</span>
              )}
            </div>

            {/* Status */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Status
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition"
                {...register('status')}
              >
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>
          </div>

          {/* Due Date & Parent Task */}
          <div className="grid grid-cols-2 gap-4">
            {/* Due Date */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Due Date
              </label>
              <input
                type="date"
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition"
                {...register('dueDate')}
              />
            </div>

            {/* Parent Task */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-1.5">
                Parent Task
              </label>
              <select
                className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900 px-4 py-2.5 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition"
                {...register('parentTaskId')}
              >
                <option value="">None</option>
                {tasks.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.title}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="flex justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-700">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 dark:border-slate-700 px-4 py-2.5 text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 focus:outline-none transition"
              disabled={isSubmitting}
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-primary-600 px-5 py-2.5 text-sm font-semibold text-white shadow-md shadow-primary-500/10 hover:bg-primary-700 hover:shadow-primary-700/20 focus:outline-none transition flex items-center justify-center min-w-[80px]"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default TaskModal;
