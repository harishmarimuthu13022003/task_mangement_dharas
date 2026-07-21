import React, { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import api from '../services/api';
import TaskModal from '../components/TaskModal';
import { 
  Plus, Search, Filter, ArrowUpDown, ChevronLeft, ChevronRight, 
  Trash2, Edit, AlertCircle, CheckCircle, Clock, ListTodo, FileText 
} from 'lucide-react';

const Dashboard = () => {
  // Stats state
  const [stats, setStats] = useState({ TODO: 0, IN_PROGRESS: 0, DONE: 0, total: 0 });
  
  // Task list & pagination state
  const [tasks, setTasks] = useState([]);
  const [pagination, setPagination] = useState({ totalRecords: 0, totalPages: 1, currentPage: 1, limit: 10 });
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState('');

  // Dropdown filter data
  const [users, setUsers] = useState([]);

  // Active filters & sorting states
  const [searchTerm, setSearchTerm] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assigneeFilter, setAssigneeFilter] = useState('');
  const [sortOption, setSortOption] = useState('createdAt');
  const [currentPage, setCurrentPage] = useState(1);
  const [limitPerPage, setLimitPerPage] = useState(10);

  // Modal control states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Debounce search term
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
      setCurrentPage(1); // reset to page 1 on new search
    }, 400);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users list for assignee filter dropdown
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await api.get('/auth/users');
        setUsers(res.data.data);
      } catch (err) {
        console.error('Failed to load workspace users', err);
      }
    };
    fetchUsers();
  }, []);

  // Fetch stats and tasks list
  const loadDashboardData = useCallback(async () => {
    setLoading(true);
    setErrorMsg('');
    try {
      // 1. Load Stats
      const statsRes = await api.get('/tasks/stats');
      setStats(statsRes.data.data);

      // 2. Load Tasks with filters
      const params = {
        page: currentPage,
        limit: limitPerPage,
        sort: sortOption,
      };
      if (statusFilter) params.status = statusFilter;
      if (assigneeFilter) params.assignee = assigneeFilter;
      if (debouncedSearch) params.search = debouncedSearch;

      const tasksRes = await api.get('/tasks', { params });
      setTasks(tasksRes.data.data);
      setPagination(tasksRes.data.pagination);
    } catch (err) {
      console.error('Failed to load dashboard data', err);
      setErrorMsg('Failed to load tasks database. Make sure the backend is active.');
    } finally {
      setLoading(false);
    }
  }, [currentPage, limitPerPage, sortOption, statusFilter, assigneeFilter, debouncedSearch]);

  useEffect(() => {
    loadDashboardData();
  }, [loadDashboardData]);

  // Delete Task Handler
  const handleDeleteTask = async (taskId) => {
    if (!window.confirm('Are you sure you want to delete this task? All subtasks will be cascade deleted.')) {
      return;
    }
    try {
      await api.delete(`/tasks/${taskId}`);
      loadDashboardData();
    } catch (err) {
      const serverMsg = err.response?.data?.error?.message;
      alert(serverMsg || 'Failed to delete the task.');
    }
  };

  // Open Edit Task Modal
  const openEditModal = (task) => {
    setSelectedTask(task);
    setIsModalOpen(true);
  };

  // Open Create Task Modal
  const openCreateModal = () => {
    setSelectedTask(null);
    setIsModalOpen(true);
  };

  // Helper to check if task is overdue
  const isOverdue = (task) => {
    if (!task.dueDate || task.status === 'DONE') return false;
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const due = new Date(task.dueDate);
    due.setHours(0, 0, 0, 0);
    return due < today;
  };

  return (
    <div className="space-y-8">
      {/* Top Welcome Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            Workspace Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400 text-sm mt-1">
            Manage your team's taskboard, open items, and subtasks structure.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-5 py-3 text-sm font-semibold text-white shadow-md shadow-primary-500/10 hover:bg-primary-700 hover:shadow-primary-700/20 focus:outline-none transition-all duration-300 shrink-0"
        >
          <Plus className="h-5 w-5" />
          Create Task
        </button>
      </div>

      {/* Error Alert */}
      {errorMsg && (
        <div className="flex items-start gap-2.5 p-4 bg-rose-50 dark:bg-rose-950/20 border border-rose-200 dark:border-rose-900/50 rounded-xl text-rose-700 dark:text-rose-400 text-sm animate-fade-in">
          <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
          <div>
            <h5 className="font-semibold">Error Loading Workspace Data</h5>
            <p className="mt-0.5">{errorMsg}</p>
          </div>
        </div>
      )}

      {/* Statistics Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Tasks */}
        <div className="glass dark:glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-slate-100 dark:bg-slate-800 rounded-xl text-slate-600 dark:text-slate-300">
            <FileText className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Total</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.total}</span>
          </div>
        </div>

        {/* To Do */}
        <div className="glass dark:glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-sky-50 dark:bg-sky-950/30 rounded-xl text-sky-600 dark:text-sky-400">
            <ListTodo className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">To Do</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.TODO}</span>
          </div>
        </div>

        {/* In Progress */}
        <div className="glass dark:glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl text-amber-600 dark:text-amber-400">
            <Clock className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">In Progress</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.IN_PROGRESS}</span>
          </div>
        </div>

        {/* Done */}
        <div className="glass dark:glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm flex items-center gap-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <CheckCircle className="h-6 w-6" />
          </div>
          <div>
            <span className="block text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">Done</span>
            <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{stats.DONE}</span>
          </div>
        </div>
      </div>

      {/* Filter / Search Dashboard Section */}
      <div className="glass dark:glass p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-1">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              placeholder="Search tasks by title..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 text-sm text-slate-900 dark:text-white focus:border-primary-500 focus:outline-none focus:ring-2 focus:ring-primary-500/20 dark:focus:ring-primary-500/10 transition"
            />
          </div>

          {/* Selector Dropdowns */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Status Dropdown */}
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-slate-400" />
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="">All Statuses</option>
                <option value="TODO">To Do</option>
                <option value="IN_PROGRESS">In Progress</option>
                <option value="DONE">Done</option>
              </select>
            </div>

            {/* Assignee Dropdown */}
            <select
              value={assigneeFilter}
              onChange={(e) => { setAssigneeFilter(e.target.value); setCurrentPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="">All Assignees</option>
              {users.map((u) => (
                <option key={u.id} value={u.id}>
                  {u.name}
                </option>
              ))}
            </select>

            {/* Sort Dropdown */}
            <div className="flex items-center gap-2">
              <ArrowUpDown className="h-4 w-4 text-slate-400" />
              <select
                value={sortOption}
                onChange={(e) => { setSortOption(e.target.value); setCurrentPage(1); }}
                className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
              >
                <option value="createdAt">Date Created</option>
                <option value="dueDate">Due Date</option>
              </select>
            </div>

            {/* Limit Selector */}
            <select
              value={limitPerPage}
              onChange={(e) => { setLimitPerPage(parseInt(e.target.value, 10)); setCurrentPage(1); }}
              className="rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-900/50 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
            >
              <option value="5">5 per page</option>
              <option value="10">10 per page</option>
              <option value="25">25 per page</option>
            </select>
          </div>
        </div>
      </div>

      {/* Task Table Section */}
      <div className="glass dark:glass rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden">
        {loading ? (
          <div className="py-20 flex flex-col items-center justify-center gap-3">
            <div className="h-8 w-8 animate-spin rounded-full border-4 border-slate-200 border-t-primary-600 dark:border-slate-700 dark:border-t-primary-500" />
            <span className="text-slate-500 dark:text-slate-400 text-sm">Loading tasks data...</span>
          </div>
        ) : tasks.length === 0 ? (
          <div className="py-20 text-center">
            <AlertCircle className="h-10 w-10 text-slate-400 dark:text-slate-500 mx-auto" />
            <h4 className="mt-4 font-bold text-slate-800 dark:text-white">No tasks found</h4>
            <p className="text-slate-400 dark:text-slate-500 text-sm mt-1">
              Try adjusting your query filters or create a new task.
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20">
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Title</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Status</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Assignee</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Due Date</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Parent Task</th>
                  <th className="px-6 py-4 text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {tasks.map((task) => {
                  const overdue = isOverdue(task);
                  return (
                    <tr 
                      key={task.id} 
                      className={`hover:bg-slate-50/50 dark:hover:bg-slate-900/10 transition-colors duration-250 ${overdue ? 'bg-rose-50/20 dark:bg-rose-950/5' : ''}`}
                    >
                      {/* Title */}
                      <td className="px-6 py-4">
                        <Link 
                          to={`/task/${task.id}`} 
                          className="font-semibold text-slate-900 dark:text-white hover:text-primary-600 dark:hover:text-primary-400 transition"
                        >
                          {task.title}
                        </Link>
                        {task.description && (
                          <span className="block text-xs text-slate-400 dark:text-slate-500 mt-0.5 line-clamp-1">
                            {task.description}
                          </span>
                        )}
                      </td>
                      
                      {/* Status */}
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium border ${
                          task.status === 'DONE' 
                            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/30 text-emerald-700 dark:text-emerald-400'
                            : task.status === 'IN_PROGRESS'
                            ? 'bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-900/30 text-amber-700 dark:text-amber-400'
                            : 'bg-slate-50 dark:bg-slate-800/40 border-slate-200 dark:border-slate-700/50 text-slate-600 dark:text-slate-400'
                        }`}>
                          {task.status === 'DONE' ? 'Done' : task.status === 'IN_PROGRESS' ? 'In Progress' : 'To Do'}
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="px-6 py-4 text-sm font-medium text-slate-600 dark:text-slate-300">
                        {task.assignee?.name || 'Unassigned'}
                      </td>

                      {/* Due Date */}
                      <td className="px-6 py-4 text-sm">
                        <span className={overdue ? 'text-rose-600 dark:text-rose-400 font-semibold' : 'text-slate-500 dark:text-slate-400'}>
                          {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric',
                          }) : 'None'}
                          {overdue && <span className="block text-[10px] uppercase font-bold tracking-wider text-rose-500 dark:text-rose-400 mt-0.5">Overdue</span>}
                        </span>
                      </td>

                      {/* Parent Task */}
                      <td className="px-6 py-4 text-sm">
                        {task.parentTask ? (
                          <Link 
                            to={`/task/${task.parentTask.id}`}
                            className="text-primary-600 dark:text-primary-400 hover:underline font-medium"
                          >
                            {task.parentTask.title}
                          </Link>
                        ) : (
                          <span className="text-slate-400 dark:text-slate-600 font-light">—</span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right space-x-2">
                        <button
                          onClick={() => openEditModal(task)}
                          className="inline-flex p-1.5 rounded-lg border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 transition"
                          title="Edit Task"
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteTask(task.id)}
                          className="inline-flex p-1.5 rounded-lg border border-rose-100 dark:border-rose-950/20 hover:bg-rose-50 dark:hover:bg-rose-950/30 text-rose-600 dark:text-rose-400 hover:text-rose-700 transition"
                          title="Delete Task"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Table Footer / Pagination */}
        {tasks.length > 0 && !loading && (
          <div className="px-6 py-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400 dark:text-slate-500">
              Showing page <strong>{pagination.currentPage}</strong> of <strong>{pagination.totalPages}</strong> ({pagination.totalRecords} total records)
            </span>
            <div className="flex gap-2">
              <button
                onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                disabled={currentPage === 1}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                <ChevronLeft className="h-4 w-4" />
                Previous
              </button>
              <button
                onClick={() => setCurrentPage((p) => Math.min(p + 1, pagination.totalPages))}
                disabled={currentPage === pagination.totalPages}
                className="flex items-center gap-1.5 rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-900 disabled:opacity-40 disabled:hover:bg-transparent transition"
              >
                Next
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Task Modal component */}
      <TaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        task={selectedTask}
        onSaveSuccess={loadDashboardData}
      />
    </div>
  );
};

export default Dashboard;
