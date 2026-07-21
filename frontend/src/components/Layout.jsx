import React from 'react';
import { Outlet, useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeToggle from './ThemeToggle';
import { LogOut, ClipboardList, User } from 'lucide-react';

const Layout = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900 transition-colors duration-300 flex flex-col">
      {/* Header / Navbar */}
      <header className="sticky top-0 z-40 w-full glass dark:glass border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <Link to="/" className="flex items-center gap-2 group">
                <div className="p-2 bg-primary-600 rounded-lg text-white group-hover:bg-primary-700 transition-all duration-300 shadow-md shadow-primary-500/20">
                  <ClipboardList className="h-5 w-5" />
                </div>
                <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white bg-gradient-to-r from-slate-900 to-slate-700 dark:from-white dark:to-slate-300 bg-clip-text text-transparent">
                  Team Task Board
                </span>
              </Link>
            </div>

            {/* Middle Workspace Badge */}
            {user && (
              <div className="hidden md:flex items-center px-3 py-1 bg-primary-50 dark:bg-primary-950/30 border border-primary-100 dark:border-primary-900/50 rounded-full text-xs font-medium text-primary-700 dark:text-primary-300 animate-pulse">
                Workspace: {user.workspaceName || 'My Workspace'}
              </div>
            )}

            {/* Profile & Controls */}
            <div className="flex items-center gap-4">
              <ThemeToggle />
              
              {user && (
                <div className="flex items-center gap-3 pl-4 border-l border-slate-200 dark:border-slate-800">
                  <div className="flex flex-col text-right">
                    <span className="text-sm font-semibold text-slate-700 dark:text-slate-200">
                      {user.name}
                    </span>
                    <span className="text-xs text-slate-400 dark:text-slate-500">
                      {user.email}
                    </span>
                  </div>

                  <button
                    onClick={handleLogout}
                    className="p-2 rounded-xl text-rose-500 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-rose-500"
                    title="Log Out"
                    aria-label="Logout"
                  >
                    <LogOut className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <Outlet />
      </main>

      {/* Footer */}
      <footer className="py-6 border-t border-slate-200 dark:border-slate-800 text-center text-xs text-slate-400 dark:text-slate-500">
        &copy; {new Date().getFullYear()} Team Task Board. Enforced Workspace Isolation.
      </footer>
    </div>
  );
};

export default Layout;
