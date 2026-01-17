
import React, { useMemo } from 'react';
import { 
  Users, ClipboardList, Wallet, TrendingUp, 
  CheckCircle, AlertCircle, Calendar, ArrowRight,
  TrendingDown, ShoppingBag
} from 'lucide-react';
import useUserData from '../hooks/useUserData';
import type { Employee, Attendance, Advance, CollageRecord, View } from '../types';
import NepaliDate from 'nepali-date-converter';

interface DashboardProps {
  onNavigate: (view: View) => void;
}

const Dashboard: React.FC<DashboardProps> = ({ onNavigate }) => {
  const [employees] = useUserData<Employee[]>('employees', []);
  const [attendance] = useUserData<Attendance[]>('attendance', []);
  const [advances] = useUserData<Advance[]>('advances', []);
  const [collageRecords] = useUserData<CollageRecord[]>('collageRecords', []);
  
  const todayBS = new NepaliDate().format('YYYY-MM-DD');
  const currentMonthBS = todayBS.substring(0, 7);

  const stats = useMemo(() => {
    const presentToday = attendance.filter(a => a.date === todayBS && a.status === 'present').length;
    const totalAdvancesThisMonth = advances
      .filter(a => a.date.startsWith(currentMonthBS))
      .reduce((sum, a) => sum + a.amount, 0);
    const pendingCollageAmount = collageRecords
      .filter(r => r.deliveryStatus === 'no')
      .reduce((sum, r) => sum + r.totalAmount, 0);
    const completedCollageAmount = collageRecords
        .filter(r => r.deliveryStatus === 'yes')
        .reduce((sum, r) => sum + r.totalAmount, 0);

    return {
      presentToday,
      totalAdvancesThisMonth,
      pendingCollageAmount,
      completedCollageAmount,
      activeStaff: employees.length
    };
  }, [employees, attendance, advances, collageRecords, todayBS, currentMonthBS]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      {/* Welcome Header */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-indigo-700 p-8 rounded-[2rem] text-white shadow-2xl shadow-primary-600/20">
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div className="space-y-2">
            <h2 className="text-3xl md:text-4xl font-black tracking-tight">Namaste, RAJHOJIYARI Team!</h2>
            <p className="text-primary-100 font-medium opacity-90 max-w-md">
              Your business overview for {new NepaliDate().format('MMMM DD, YYYY', 'np')} is ready.
            </p>
          </div>
          <div className="flex gap-4">
             <div className="bg-white/10 backdrop-blur-md px-6 py-3 rounded-2xl border border-white/10 text-center">
                <div className="text-[10px] font-black uppercase tracking-widest opacity-60 mb-1">Staff Present</div>
                <div className="text-2xl font-black">{stats.presentToday} / {stats.activeStaff}</div>
             </div>
          </div>
        </div>
        {/* Decorative elements */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -mr-32 -mt-32"></div>
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-primary-400/10 rounded-full blur-3xl -ml-24 -mb-24"></div>
      </div>

      {/* Primary Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/20 rounded-2xl flex items-center justify-center text-blue-600 mb-4 group-hover:scale-110 transition">
                <Users size={24} />
            </div>
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Total Employees</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">{stats.activeStaff}</div>
            <button onClick={() => onNavigate('employees')} className="text-blue-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                Manage Staff <ArrowRight size={10} />
            </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-amber-50 dark:bg-amber-900/20 rounded-2xl flex items-center justify-center text-amber-600 mb-4 group-hover:scale-110 transition">
                <Wallet size={24} />
            </div>
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Monthly Advance</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">Rs. {stats.totalAdvancesThisMonth.toLocaleString()}</div>
            <div className="text-amber-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <TrendingDown size={10} /> Paid Out
            </div>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-red-50 dark:bg-red-900/20 rounded-2xl flex items-center justify-center text-red-600 mb-4 group-hover:scale-110 transition">
                <AlertCircle size={24} />
            </div>
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Pending Collage</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">Rs. {stats.pendingCollageAmount.toLocaleString()}</div>
            <button onClick={() => onNavigate('collage')} className="text-red-600 text-[10px] font-black uppercase tracking-widest flex items-center gap-1 hover:underline">
                View Pending <ArrowRight size={10} />
            </button>
        </div>

        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-100 dark:border-slate-700 shadow-sm hover:shadow-xl transition-all group">
            <div className="w-12 h-12 bg-emerald-50 dark:bg-emerald-900/20 rounded-2xl flex items-center justify-center text-emerald-600 mb-4 group-hover:scale-110 transition">
                <TrendingUp size={24} />
            </div>
            <div className="text-slate-500 text-xs font-black uppercase tracking-widest mb-1">Delivered Amount</div>
            <div className="text-3xl font-black text-slate-900 dark:text-white mb-2">Rs. {stats.completedCollageAmount.toLocaleString()}</div>
            <div className="text-emerald-500 text-[10px] font-black uppercase tracking-widest flex items-center gap-1">
                <CheckCircle size={10} /> Settled
            </div>
        </div>
      </div>

      {/* Quick Actions & Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 p-8 rounded-[2.5rem] border border-slate-100 dark:border-slate-700">
            <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl font-black text-slate-900 dark:text-white flex items-center gap-2">
                    <ShoppingBag className="text-primary-600" /> Recent Deliveries
                </h3>
                <button onClick={() => onNavigate('collage')} className="text-xs font-bold text-primary-600 hover:underline uppercase tracking-widest">View All</button>
            </div>
            <div className="space-y-4">
                {collageRecords.length === 0 ? (
                    <div className="py-12 text-center text-slate-400 font-medium">No recent delivery logs found.</div>
                ) : collageRecords.slice(-5).reverse().map(record => (
                    <div key={record.id} className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-2xl border border-slate-100 dark:border-slate-700 group hover:border-primary-200 transition-colors">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${record.deliveryStatus === 'yes' ? 'bg-emerald-100 text-emerald-600' : 'bg-amber-100 text-amber-600'}`}>
                                <Calendar size={18} />
                            </div>
                            <div>
                                <div className="font-black text-slate-800 dark:text-white leading-none">{record.collageName}</div>
                                <div className="text-xs text-slate-500 font-medium mt-1">{record.studentName}</div>
                            </div>
                        </div>
                        <div className="text-right">
                            <div className="font-black text-slate-900 dark:text-white">Rs. {record.totalAmount.toLocaleString()}</div>
                            <div className={`text-[9px] font-black uppercase tracking-widest mt-0.5 ${record.deliveryStatus === 'yes' ? 'text-emerald-500' : 'text-amber-500'}`}>
                                {record.deliveryStatus === 'yes' ? 'Delivered' : 'Pending'}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-slate-900 dark:bg-black p-8 rounded-[2.5rem] text-white shadow-xl">
                <h3 className="text-xl font-black mb-6">Quick Actions</h3>
                <div className="grid grid-cols-1 gap-3">
                    <button onClick={() => onNavigate('employees')} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                        <Users size={20} className="text-blue-400" />
                        <span className="font-bold text-sm">Update Attendance</span>
                    </button>
                    <button onClick={() => onNavigate('employees')} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                        <Wallet size={20} className="text-amber-400" />
                        <span className="font-bold text-sm">Give Cash Advance</span>
                    </button>
                    <button onClick={() => onNavigate('collage')} className="flex items-center gap-3 p-4 bg-white/5 hover:bg-white/10 rounded-2xl transition-all border border-white/10">
                        <ClipboardList size={20} className="text-emerald-400" />
                        <span className="font-bold text-sm">Log New Delivery</span>
                    </button>
                </div>
            </div>

            <div className="bg-orange-50 dark:bg-slate-800/50 p-6 rounded-3xl border border-orange-100 dark:border-slate-700">
                <div className="flex items-center gap-2 text-orange-600 mb-2">
                    <AlertCircle size={18} />
                    <span className="text-xs font-black uppercase tracking-widest">Business Tip</span>
                </div>
                <p className="text-sm font-medium text-orange-800 dark:text-slate-300 leading-relaxed">
                    Always verify student mobile numbers before dispatching deliveries to ensure zero returns!
                </p>
            </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
