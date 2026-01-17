import React, { useState } from 'react';
import { useUser } from '../contexts/UserContext';
import { Building2, CheckSquare, Square } from 'lucide-react';

const Login: React.FC = () => {
  const { login } = useUser();
  const [rememberMe, setRememberMe] = useState(true);

  const handleLogin = () => {
    login(rememberMe);
  };

  return (
    <div className="min-h-screen bg-orange-50 dark:bg-slate-900 flex items-center justify-center p-4">
      <div className="w-full max-w-md bg-white dark:bg-slate-800 rounded-lg shadow-xl p-8 space-y-8 text-center border-t-4 border-primary-500">
        <div>
            <div className="flex items-center justify-center gap-3 mb-4">
                <div className="bg-orange-100 dark:bg-slate-700 p-3 rounded-full">
                    <Building2 className="h-10 w-10 text-primary-600" />
                </div>
                <h1 className="text-3xl font-bold text-slate-800 dark:text-white">
                RAJHOJIYARI
                </h1>
            </div>
            <p className="text-slate-500 dark:text-slate-400">Secure Cloud Management System</p>
        </div>

        <div className="border-t border-slate-200 dark:border-slate-700 pt-8 space-y-6">
            <h2 className="text-lg font-semibold text-slate-700 dark:text-slate-300">Sign in to access your data</h2>
            
            <button 
                onClick={handleLogin}
                className="w-full flex items-center justify-center gap-3 bg-white dark:bg-slate-700 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-200 font-semibold py-3 px-4 rounded-lg hover:bg-orange-50 dark:hover:bg-slate-600 transition duration-200 shadow-sm hover:shadow-md"
            >
                <img src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" alt="Google" className="w-6 h-6" />
                Sign in with Gmail
            </button>

            <div 
                className="flex items-center justify-center gap-2 cursor-pointer select-none text-slate-600 dark:text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 transition-colors"
                onClick={() => setRememberMe(!rememberMe)}
            >
                {rememberMe ? (
                    <CheckSquare size={20} className="text-primary-600" />
                ) : (
                    <Square size={20} />
                )}
                <span className="text-sm font-medium">Remember my login</span>
            </div>
            
            <p className="mt-6 text-xs text-slate-400 bg-slate-100 dark:bg-slate-900 p-2 rounded">
                Note: You must configure your Firebase keys in <code>firebase.ts</code> for this to work.
            </p>
        </div>
      </div>
    </div>
  );
};

export default Login;