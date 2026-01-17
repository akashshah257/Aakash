import React, { useState, useEffect } from 'react';
import type { View } from '../types';
import { Users, ClipboardList, Building2, Sun, Moon, Share2 } from 'lucide-react';
import EmployeeManagement from './EmployeeManagement';
import CollageRecords from './CollageRecords';
import useLocalStorage from '../hooks/useLocalStorage';
import NepaliDate from 'nepali-date-converter';

const MainApp: React.FC = () => {
  const [activeView, setActiveView] = useState<View>('employees');
  const [theme, setTheme] = useLocalStorage<'light' | 'dark'>('theme', 'light');
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [theme]);

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light');
  };

  const handleShare = async () => {
    const shareData = {
      title: 'RAJHOJIYARI Management App',
      text: 'Secure Cloud Management System for RAJHOJIYARI',
      url: window.location.href,
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch (error) {
        console.log('Error sharing:', error);
      }
    } else {
      try {
        await navigator.clipboard.writeText(window.location.href);
        alert('App link copied to clipboard!');
      } catch (err) {
        console.error('Failed to copy: ', err);
      }
    }
  };

  const renderView = () => {
    switch (activeView) {
      case 'employees':
        return <EmployeeManagement />;
      case 'collage':
        return <CollageRecords />;
      default:
        return <EmployeeManagement />;
    }
  };

  const NavButton: React.FC<{
    viewName: View;
    label: string;
    icon: React.ReactNode;
  }> = ({ viewName, label, icon }) => (
    <button
      onClick={() => setActiveView(viewName)}
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-5 py-2.5 text-sm font-semibold rounded-full transition-all duration-200 ${
        activeView === viewName
          ? 'bg-primary-600 text-white shadow-lg shadow-primary-600/30 ring-2 ring-white ring-opacity-50'
          : 'text-slate-600 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans selection:bg-primary-200 dark:selection:bg-primary-900 transition-colors duration-300">
      {/* Fixed Top Bar */}
      <header className="fixed top-0 left-0 w-full bg-white/80 dark:bg-slate-800/90 backdrop-blur-md shadow-sm z-50 border-b border-orange-100 dark:border-slate-700 transition-all">
        <div className="container mx-auto px-4 py-3 flex items-center flex-wrap gap-4">
          <div className="flex items-center gap-3 mr-auto">
            <div className="bg-gradient-to-br from-primary-500 to-primary-700 p-2 rounded-xl shadow-md text-white">
                <Building2 className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-xl font-bold text-slate-800 dark:text-white tracking-tight leading-none">
                RAJHOJIYARI
                </h1>
                <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium uppercase tracking-wider">Management System</p>
            </div>
          </div>
          
          <div className="hidden sm:flex flex-col items-end mr-2 px-3 border-r border-slate-200 dark:border-slate-700/50">
            <span className="text-sm font-bold text-slate-700 dark:text-slate-200 tabular-nums leading-tight">
              {currentTime.toLocaleTimeString()}
            </span>
            <span className="text-[10px] text-primary-600 dark:text-primary-400 font-bold uppercase tracking-wider">
              {new NepaliDate(currentTime).format('YYYY MMMM DD, dddd')}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-slate-600 transition-colors"
              aria-label="Share App"
              title="Share Application"
            >
              <Share2 size={20} />
            </button>

            <button
              onClick={toggleTheme}
              className="p-2 rounded-full bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-slate-300 hover:bg-orange-200 dark:hover:bg-slate-600 transition-colors"
              aria-label="Toggle dark mode"
              title={theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>

          <nav className="flex items-center gap-2 p-1.5 bg-slate-100 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-full order-last w-full sm:order-none sm:w-auto shadow-inner">
            <NavButton viewName="employees" label="Employees" icon={<Users size={18} />} />
            <NavButton viewName="collage" label="Collage" icon={<ClipboardList size={18} />} />
          </nav>
        </div>
      </header>

      {/* Main Content - Added padding-top to account for fixed header */}
      <main className="container mx-auto p-4 md:p-8 pt-28 sm:pt-24 max-w-7xl">
        {renderView()}
      </main>

      <footer className="text-center py-8 text-xs text-slate-500 border-t border-slate-200 dark:border-slate-800 mt-12">
        <p className="mb-2 font-medium">RAJHOJIYARI Secure Management System</p>
        <p className="opacity-75">Data Storage: <span className="text-primary-600 dark:text-primary-400 font-semibold">Local Device (Browser)</span></p>
      </footer>
    </div>
  );
};

export default MainApp;