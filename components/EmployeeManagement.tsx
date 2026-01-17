import React, { useState, useMemo } from 'react';
import type { Employee, Attendance, Advance } from '../types';
import useUserData from '../hooks/useUserData';
import { 
  UserPlus, Edit, Trash2, DollarSign, FileText, X, CheckCircle, 
  XCircle, TrendingDown, Users, Smartphone
} from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import NepaliMonthPicker from './NepaliMonthPicker';
import NepaliDatePicker from './NepaliDatePicker';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 transition-colors"><X size={20} /></button>
                </div>
                <div className="p-6 max-h-[85vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const EmployeeManagement: React.FC = () => {
  const getTodayBS = () => new NepaliDate().format('YYYY-MM-DD');
  const [employees, setEmployees] = useUserData<Employee[]>('employees', []);
  const [attendance, setAttendance] = useUserData<Attendance[]>('attendance', []);
  const [advances, setAdvances] = useUserData<Advance[]>('advances', []);
  
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);
  const [isEmployeeModalOpen, setIsEmployeeModalOpen] = useState(false);
  const [isAdvanceModalOpen, setIsAdvanceModalOpen] = useState(false);
  const [isSalaryModalOpen, setIsSalaryModalOpen] = useState(false);
  
  const [currentEmployee, setCurrentEmployee] = useState<Omit<Employee, 'id'> | Employee>({ name: '', phone: '', dailyWage: 0 });
  const [advanceAmount, setAdvanceAmount] = useState('');
  const [advanceDate, setAdvanceDate] = useState(getTodayBS());
  
  const [selectedDate, setSelectedDate] = useState(() => getTodayBS());
  const [selectedMonth, setSelectedMonth] = useState(() => getTodayBS().substring(0, 7));

  const handleToggleAttendance = (employeeId: string, status: 'present' | 'absent') => {
    const existingIndex = attendance.findIndex(a => a.employeeId === employeeId && a.date === selectedDate);
    if (existingIndex > -1) {
        if (attendance[existingIndex].status === status) {
            setAttendance(attendance.filter((_, index) => index !== existingIndex));
        } else {
            const updated = [...attendance];
            updated[existingIndex] = { ...updated[existingIndex], status };
            setAttendance(updated);
        }
    } else {
        setAttendance([...attendance, { employeeId, date: selectedDate, status }]);
    }
  };

  const getAttendanceStatus = (id: string, date: string) => attendance.find(a => a.employeeId === id && a.date === date)?.status;

  const handleSaveEmployee = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentEmployee.name || currentEmployee.dailyWage <= 0) return;
    
    if ('id' in currentEmployee) {
      setEmployees(employees.map(e => e.id === currentEmployee.id ? (currentEmployee as Employee) : e));
    } else {
      setEmployees([...employees, { ...currentEmployee, id: crypto.randomUUID() }]);
    }
    setIsEmployeeModalOpen(false);
  };

  const handleAddAdvance = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedEmployee || !advanceAmount || Number(advanceAmount) <= 0) return;
    
    const newAdvance: Advance = {
      id: crypto.randomUUID(),
      employeeId: selectedEmployee.id,
      amount: Number(advanceAmount),
      date: advanceDate
    };
    
    setAdvances([...advances, newAdvance]);
    setAdvanceAmount('');
    setIsAdvanceModalOpen(false);
  };

  const salaryStatement = useMemo(() => {
    if (!selectedEmployee) return null;
    
    const monthYear = selectedMonth; 
    const monthAttendance = attendance.filter(a => a.employeeId === selectedEmployee.id && a.date.startsWith(monthYear));
    const monthAdvances = advances.filter(a => a.employeeId === selectedEmployee.id && a.date.startsWith(monthYear));
    
    const daysPresent = monthAttendance.filter(a => a.status === 'present').length;
    const daysAbsent = monthAttendance.filter(a => a.status === 'absent').length;
    const totalEarned = daysPresent * selectedEmployee.dailyWage;
    const totalAdvances = monthAdvances.reduce((sum, a) => sum + a.amount, 0);
    const netPayable = totalEarned - totalAdvances;
    
    return { daysPresent, daysAbsent, totalEarned, totalAdvances, netPayable, monthAdvances };
  }, [selectedEmployee, selectedMonth, attendance, advances]);

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Management</h2>
                <p className="text-slate-500 text-sm mt-1">Daily attendance and financial tracking</p>
            </div>
            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                <div className="min-w-[220px]">
                    <NepaliDatePicker label="Operational Date (BS)" value={selectedDate} onChange={setSelectedDate} />
                </div>
                <button onClick={() => { setCurrentEmployee({ name: '', phone: '', dailyWage: 0 }); setIsEmployeeModalOpen(true); }} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition">
                    <UserPlus size={18} /> Add Employee
                </button>
            </div>
          </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-6 py-4 font-bold">Employee Profile</th>
                        <th className="px-6 py-4 text-center font-bold">Attendance Log</th>
                        <th className="px-6 py-4 text-right font-bold">Management</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {employees.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="px-6 py-20 text-center text-slate-400">No employees found.</td>
                    </tr>
                ) : employees.map(emp => {
                    const status = getAttendanceStatus(emp.id, selectedDate);
                    return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30">
                        <td className="px-6 py-6">
                            <div className="font-bold text-lg">{emp.name}</div>
                            <div className="flex items-center gap-4 mt-1">
                                <span className="text-slate-500 text-xs flex items-center gap-1"><Smartphone size={12}/> {emp.phone || 'N/A'}</span>
                                <span className="text-primary-600 font-bold text-xs">Rs. {emp.dailyWage}/day</span>
                            </div>
                        </td>
                        <td className="px-6 py-6">
                            <div className="flex justify-center gap-3">
                                <button onClick={() => handleToggleAttendance(emp.id, 'present')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${status === 'present' ? 'bg-green-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>PRESENT</button>
                                <button onClick={() => handleToggleAttendance(emp.id, 'absent')} className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${status === 'absent' ? 'bg-red-600 text-white' : 'bg-slate-100 dark:bg-slate-700 text-slate-400'}`}>ABSENT</button>
                            </div>
                        </td>
                        <td className="px-6 py-6 text-right">
                           <div className="flex justify-end gap-2">
                                <button onClick={() => { setSelectedEmployee(emp); setAdvanceDate(getTodayBS()); setIsAdvanceModalOpen(true); }} className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition" title="Cash Advance"><DollarSign size={20}/></button>
                                <button onClick={() => { setSelectedEmployee(emp); setIsSalaryModalOpen(true); }} className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition" title="Monthly Statement"><FileText size={20}/></button>
                                <button onClick={() => { setCurrentEmployee(emp); setIsEmployeeModalOpen(true); }} className="p-2 text-slate-400 hover:text-slate-600 rounded-lg transition"><Edit size={20}/></button>
                                <button onClick={() => { if(confirm(`Delete ${emp.name}?`)) setEmployees(employees.filter(e => e.id !== emp.id)); }} className="p-2 text-red-400 hover:text-red-500 rounded-lg transition"><Trash2 size={20}/></button>
                           </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
      </div>

      <Modal isOpen={isEmployeeModalOpen} onClose={() => setIsEmployeeModalOpen(false)} title={ 'id' in currentEmployee ? 'Edit Employee' : 'Add New Employee'}>
        <form onSubmit={handleSaveEmployee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1">Full Name</label>
            <input type="text" value={currentEmployee.name} onChange={e => setCurrentEmployee({...currentEmployee, name: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" required />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Phone Number</label>
            <input type="text" value={currentEmployee.phone} onChange={e => setCurrentEmployee({...currentEmployee, phone: e.target.value})} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">Daily Wage (Rs.)</label>
            <input type="number" value={currentEmployee.dailyWage || ''} onChange={e => setCurrentEmployee({...currentEmployee, dailyWage: Number(e.target.value)})} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg" required />
          </div>
          <button type="submit" className="w-full bg-primary-600 text-white p-3 rounded-lg font-bold hover:bg-primary-700 transition">Save Employee</button>
        </form>
      </Modal>

      <Modal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} title={`Cash Advance: ${selectedEmployee?.name}`}>
        <form onSubmit={handleAddAdvance} className="space-y-4">
          <NepaliDatePicker label="Advance Date (BS)" value={advanceDate} onChange={setAdvanceDate} />
          <div>
            <label className="block text-sm font-medium mb-1">Advance Amount (Rs.)</label>
            <input type="number" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} className="w-full p-3 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg font-bold" required />
          </div>
          <button type="submit" className="w-full bg-amber-600 text-white p-3 rounded-lg font-bold hover:bg-amber-700 transition">Confirm Advance</button>
        </form>
      </Modal>

      <Modal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} title="Monthly Salary Statement">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <h4 className="font-bold text-lg">{selectedEmployee?.name}</h4>
            <NepaliMonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>

          {salaryStatement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-center">
                <div className="p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-xs text-green-600">Present</div>
                  <div className="text-xl font-bold">{salaryStatement.daysPresent}</div>
                </div>
                <div className="p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-xs text-red-600">Absent</div>
                  <div className="text-xl font-bold">{salaryStatement.daysAbsent}</div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-500">Gross Earnings</span>
                  <span className="font-bold">Rs. {salaryStatement.totalEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm text-amber-600">
                  <span>Total Advance</span>
                  <span className="font-bold">- Rs. {salaryStatement.totalAdvances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between pt-3 mt-2 border-t border-slate-200">
                  <span className="text-lg font-bold">Net Payable</span>
                  <span className="text-xl font-black text-primary-600">Rs. {salaryStatement.netPayable.toLocaleString()}</span>
                </div>
              </div>
            </div>
          )}
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;