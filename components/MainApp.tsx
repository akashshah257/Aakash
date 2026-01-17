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
      text: 'Secure Management System for RAJHOJIYARI',
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
      className={`flex-1 sm:flex-none flex items-center justify-center gap-2 px-6 py-3 text-sm font-bold rounded-2xl transition-all duration-300 ${
        activeView === viewName
          ? 'bg-primary-600 text-white shadow-xl'
          : 'text-slate-600 dark:text-slate-400 hover:bg-orange-100 dark:hover:bg-slate-700'
      }`}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 text-slate-800 dark:text-slate-200 font-sans transition-colors duration-300">
      {/* Top Bar */}
      <header className="fixed top-0 left-0 w-full bg-white dark:bg-slate-800 shadow-sm z-50 border-b border-orange-100 dark:border-slate-700">
        <div className="container mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-primary-600 p-2 rounded-xl text-white">
                <Building2 className="h-6 w-6" />
            </div>
            <div>
                <h1 className="text-xl font-black text-slate-900 dark:text-white tracking-tighter">
                RAJHOJIYARI
                </h1>
                <p className="text-[9px] text-slate-500 font-black uppercase tracking-[0.2em]">Management Suite</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="hidden md:flex flex-col items-end mr-4">
              <span className="text-sm font-black tabular-nums">{currentTime.toLocaleTimeString()}</span>
              <span className="text-[10px] text-primary-600 font-black uppercase">{new NepaliDate(currentTime).format('YYYY MMMM DD')}</span>
            </div>
            <button
              onClick={handleShare}
              className="p-2.5 rounded-xl bg-blue-50 dark:bg-slate-700 text-blue-600 dark:text-blue-400 hover:bg-blue-100"
            >
              <Share2 size={20} />
            </button>
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl bg-orange-100 dark:bg-slate-700 text-orange-600 dark:text-slate-300 hover:bg-orange-200"
            >
              {theme === 'dark' ? <Sun size={20} /> : <Moon size={20} />}
            </button>
          </div>
        </div>
        <div className="bg-slate-50 dark:bg-slate-900/50 p-2">
          <nav className="container mx-auto flex gap-2">
            <NavButton viewName="employees" label="Staff" icon={<Users size={18} />} />
            <NavButton viewName="collage" label="Ledger" icon={<ClipboardList size={18} />} />
          </nav>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto p-4 pt-32 md:pt-40 max-w-7xl">
        {renderView()}
      </main>
    </div>
  );
};

export default MainApp;