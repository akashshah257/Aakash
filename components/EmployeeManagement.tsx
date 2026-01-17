import React, { useState, useMemo, useRef } from 'react';
import type { Employee, Attendance, Advance } from '../types';
import useUserData from '../hooks/useUserData';
import { 
  UserPlus, Edit, Trash2, DollarSign, FileText, X, CheckCircle, 
  XCircle, TrendingDown, Download, Upload, 
  Users, Smartphone, FileDown
} from 'lucide-react';
import NepaliDate from 'nepali-date-converter';
import NepaliMonthPicker from './NepaliMonthPicker';
import NepaliDatePicker from './NepaliDatePicker';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4 animate-in fade-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden transform transition-all scale-100" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-5 border-b border-slate-100 dark:border-slate-700 bg-slate-50/50 dark:bg-slate-800">
                    <h3 className="text-lg font-bold text-slate-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors bg-transparent p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-700"><X size={20} /></button>
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
  const fileInputRef = useRef<HTMLInputElement>(null);

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
    
    const monthYear = selectedMonth; // YYYY-MM
    const monthAttendance = attendance.filter(a => a.employeeId === selectedEmployee.id && a.date.startsWith(monthYear));
    const monthAdvances = advances.filter(a => a.employeeId === selectedEmployee.id && a.date.startsWith(monthYear));
    
    const daysPresent = monthAttendance.filter(a => a.status === 'present').length;
    const daysAbsent = monthAttendance.filter(a => a.status === 'absent').length;
    const totalEarned = daysPresent * selectedEmployee.dailyWage;
    const totalAdvances = monthAdvances.reduce((sum, a) => sum + a.amount, 0);
    const netPayable = totalEarned - totalAdvances;
    
    return { daysPresent, daysAbsent, totalEarned, totalAdvances, netPayable, monthAdvances };
  }, [selectedEmployee, selectedMonth, attendance, advances]);

  const dailyStats = useMemo(() => {
    let present = 0, absent = 0, cost = 0;
    employees.forEach(emp => {
        const s = getAttendanceStatus(emp.id, selectedDate);
        if (s === 'present') { present++; cost += emp.dailyWage; }
        else if (s === 'absent') { absent++; }
    });
    return { present, absent, cost };
  }, [employees, attendance, selectedDate]);

  const handleDownloadStaffPDF = () => {
    const doc = new jsPDF() as any;
    doc.setFontSize(22);
    doc.setTextColor(37, 99, 235); // primary-600
    doc.text('RAJHOJIYARI', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('Staff Management Report', 105, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`As of: ${new NepaliDate().format('YYYY-MM-DD')} (BS)`, 105, 34, { align: 'center' });

    const tableRows = employees.map(emp => [
      emp.name,
      emp.phone || 'N/A',
      `Rs. ${emp.dailyWage}`,
      getAttendanceStatus(emp.id, selectedDate) || 'Pending'
    ]);

    doc.autoTable({
      startY: 45,
      head: [['Employee Name', 'Phone', 'Daily Wage', 'Status Today']],
      body: tableRows,
      theme: 'striped',
      headStyles: { fillColor: [37, 99, 235] }
    });

    doc.save(`staff_report_${new NepaliDate().format('YYYY-MM-DD')}.pdf`);
  };

  const handleDownloadStatementPDF = () => {
    if (!selectedEmployee || !salaryStatement) return;

    const doc = new jsPDF() as any;
    const dateStr = new NepaliDate().format('YYYY-MM-DD');

    // Branding
    doc.setFontSize(24);
    doc.setTextColor(37, 99, 235);
    doc.text('RAJHOJIYARI', 105, 25, { align: 'center' });
    
    doc.setFontSize(16);
    doc.setTextColor(50);
    doc.text('SALARY STATEMENT', 105, 35, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Month: ${selectedMonth} (BS)`, 105, 42, { align: 'center' });

    // Employee Details
    doc.setDrawColor(200);
    doc.line(14, 50, 196, 50);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Employee: ${selectedEmployee.name}`, 14, 60);
    doc.text(`Phone: ${selectedEmployee.phone || 'N/A'}`, 14, 68);
    doc.text(`Daily Wage: Rs. ${selectedEmployee.dailyWage}`, 14, 76);
    doc.line(14, 82, 196, 82);

    // Calculation Summary
    doc.setFontSize(14);
    doc.text('Summary', 14, 95);
    doc.setFontSize(11);
    doc.text(`Present Days: ${salaryStatement.daysPresent}`, 14, 105);
    doc.text(`Absent Days: ${salaryStatement.daysAbsent}`, 14, 112);
    doc.text(`Gross Earnings: Rs. ${salaryStatement.totalEarned.toLocaleString()}`, 14, 119);
    doc.setTextColor(220, 38, 38); // Red
    doc.text(`Total Advances Deducted: Rs. ${salaryStatement.totalAdvances.toLocaleString()}`, 14, 126);
    
    doc.setDrawColor(0);
    doc.setLineWidth(0.5);
    doc.line(14, 132, 196, 132);
    doc.setFontSize(16);
    doc.setTextColor(37, 99, 235);
    doc.text(`NET PAYABLE: Rs. ${salaryStatement.netPayable.toLocaleString()}`, 14, 142);
    doc.line(14, 146, 196, 146);

    // Advance History Table if exists
    if (salaryStatement.monthAdvances.length > 0) {
      doc.setTextColor(0);
      doc.setFontSize(12);
      doc.text('Cash Advance History', 14, 160);
      const advRows = salaryStatement.monthAdvances.map(a => [a.date, `Rs. ${a.amount}`]);
      doc.autoTable({
        startY: 165,
        head: [['Date (BS)', 'Amount']],
        body: advRows,
        theme: 'compact',
        headStyles: { fillColor: [100, 100, 100] }
      });
    }

    // Signatures
    const finalY = (doc as any).lastAutoTable?.finalY || 160;
    doc.setFontSize(10);
    doc.setTextColor(150);
    doc.text('_______________________', 14, finalY + 40);
    doc.text('Employer Signature', 14, finalY + 45);
    doc.text('_______________________', 150, finalY + 40);
    doc.text('Employee Signature', 150, finalY + 45);

    doc.save(`salary_${selectedEmployee.name}_${selectedMonth}.pdf`);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
            <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Staff Management</h2>
                <p className="text-slate-500 text-sm mt-1 tracking-wide">Daily operations and financial tracking</p>
            </div>
            <div className="flex flex-wrap items-end gap-3 w-full lg:w-auto">
                <div className="min-w-[220px]">
                    <NepaliDatePicker label="Operational Date (BS)" value={selectedDate} onChange={setSelectedDate} />
                </div>
                <button onClick={handleDownloadStaffPDF} disabled={employees.length === 0} className="flex items-center gap-2 bg-red-600 text-white px-5 py-2.5 rounded-lg hover:bg-red-700 transition shadow-lg shadow-red-600/20 font-medium h-[42px] active:scale-95 disabled:opacity-50"><FileDown size={18} /> Staff PDF</button>
                <button onClick={() => fileInputRef.current?.click()} className="flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-lg hover:bg-indigo-700 transition shadow-lg shadow-indigo-600/20 font-medium h-[42px] active:scale-95"><Upload size={18} /> Import</button>
                <button onClick={() => { setCurrentEmployee({ name: '', phone: '', dailyWage: 0 }); setIsEmployeeModalOpen(true); }} className="flex items-center gap-2 bg-primary-600 text-white px-5 py-2.5 rounded-lg hover:bg-primary-700 transition shadow-lg shadow-primary-600/20 font-medium h-[42px] active:scale-95"><UserPlus size={18} /> Add Employee</button>
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={async (e) => {
                    const file = e.target.files?.[0];
                    if (!file) return;
                    const arrayBuffer = await file.arrayBuffer();
                    const wb = XLSX.read(arrayBuffer, { type: 'array' });
                    const jsonData: any[] = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
                    const emps = jsonData.map(row => ({ id: crypto.randomUUID(), name: String(row['Name'] || row['Employee']), phone: String(row['Phone'] || ''), dailyWage: Number(row['Wage'] || 0) }));
                    setEmployees([...employees, ...emps]);
                }} />
            </div>
          </div>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        {[
            { label: 'Total Employees', val: employees.length, icon: Users, color: 'text-slate-600', bg: 'bg-white' },
            { label: 'Present Today', val: dailyStats.present, icon: CheckCircle, color: 'text-green-600', bg: 'bg-green-50 dark:bg-green-900/10' },
            { label: 'Absent Today', val: dailyStats.absent, icon: XCircle, color: 'text-red-600', bg: 'bg-red-50 dark:bg-red-900/10' },
            { label: 'Est. Daily Cost', val: `Rs. ${dailyStats.cost.toLocaleString()}`, icon: DollarSign, color: 'text-primary-600', bg: 'bg-primary-50 dark:bg-primary-900/10' }
        ].map((s, i) => (
            <div key={i} className={`${s.bg} p-6 rounded-2xl border border-slate-200 dark:border-slate-700 shadow-sm flex flex-col justify-between group hover:shadow-md transition-shadow`}>
                <div className={`flex items-center gap-2 ${s.color} opacity-80`}><s.icon size={16} /><span className="text-[10px] font-black uppercase tracking-[0.2em]">{s.label}</span></div>
                <div className="text-4xl font-black text-slate-800 dark:text-white mt-4">{s.val}</div>
            </div>
        ))}
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
                <thead className="text-[10px] lg:text-xs uppercase bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                    <tr>
                        <th className="px-10 py-5 font-black tracking-[0.1em] text-slate-500">Employee Profile</th>
                        <th className="px-10 py-5 text-center font-black tracking-[0.1em] text-slate-500">Attendance Log</th>
                        <th className="px-10 py-5 text-right font-black tracking-[0.1em] text-slate-500">Management</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {employees.length === 0 ? (
                    <tr>
                        <td colSpan={3} className="px-10 py-20 text-center text-slate-400 italic">No employees found. Start by adding one above.</td>
                    </tr>
                ) : employees.map(emp => {
                    const status = getAttendanceStatus(emp.id, selectedDate);
                    return (
                    <tr key={emp.id} className="hover:bg-slate-50 dark:hover:bg-slate-700/30 transition-colors">
                        <td className="px-10 py-8">
                            <div className="font-black text-slate-900 dark:text-white text-xl tracking-tight">{emp.name}</div>
                            <div className="flex items-center gap-4 mt-2">
                                <span className="text-slate-500 text-xs flex items-center gap-1 font-mono"><Smartphone size={12}/> {emp.phone || 'N/A'}</span>
                                <span className="text-primary-600 dark:text-primary-400 text-xs font-bold bg-primary-50 dark:bg-primary-900/30 px-2 py-0.5 rounded">Rs. {emp.dailyWage}/day</span>
                            </div>
                        </td>
                        <td className="px-10 py-8">
                            <div className="flex justify-center gap-4">
                                <button onClick={() => handleToggleAttendance(emp.id, 'present')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all border-2 ${status === 'present' ? 'bg-green-600 text-white border-green-600 shadow-lg shadow-green-600/20' : 'bg-white text-slate-400 border-slate-100 hover:border-green-200 dark:bg-slate-900 dark:border-slate-700'}`}><CheckCircle size={18}/> PRESENT</button>
                                <button onClick={() => handleToggleAttendance(emp.id, 'absent')} className={`flex items-center gap-2 px-8 py-3 rounded-xl text-sm font-black transition-all border-2 ${status === 'absent' ? 'bg-red-600 text-white border-red-600 shadow-lg shadow-red-600/20' : 'bg-white text-slate-400 border-slate-100 hover:border-red-200 dark:bg-slate-900 dark:border-slate-700'}`}><XCircle size={18}/> ABSENT</button>
                            </div>
                        </td>
                        <td className="px-10 py-8 text-right">
                           <div className="flex justify-end gap-2">
                                <button onClick={() => { setSelectedEmployee(emp); setAdvanceDate(getTodayBS()); setIsAdvanceModalOpen(true); }} className="p-3 bg-amber-50 dark:bg-amber-900/20 text-amber-600 rounded-xl hover:bg-amber-100 transition" title="Cash Advance"><DollarSign size={22}/></button>
                                <button onClick={() => { setSelectedEmployee(emp); setIsSalaryModalOpen(true); }} className="p-3 bg-blue-50 dark:bg-blue-900/20 text-blue-600 rounded-xl hover:bg-blue-100 transition" title="Monthly Statement"><FileText size={22}/></button>
                                <button onClick={() => { setCurrentEmployee(emp); setIsEmployeeModalOpen(true); }} className="p-3 bg-slate-50 dark:bg-slate-700 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition"><Edit size={22}/></button>
                                <button onClick={() => { if(confirm(`Delete ${emp.name}?`)) setEmployees(employees.filter(e => e.id !== emp.id)); }} className="p-3 bg-red-50 dark:bg-red-900/20 text-red-500 rounded-xl hover:bg-red-100 transition"><Trash2 size={22}/></button>
                           </div>
                        </td>
                    </tr>
                    );
                })}
                </tbody>
            </table>
          </div>
      </div>

      {/* Modals */}
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
          <button type="submit" className="w-full bg-primary-600 text-white p-4 rounded-xl font-bold hover:bg-primary-700 transition">Save Employee</button>
        </form>
      </Modal>

      <Modal isOpen={isAdvanceModalOpen} onClose={() => setIsAdvanceModalOpen(false)} title={`Cash Advance: ${selectedEmployee?.name}`}>
        <form onSubmit={handleAddAdvance} className="space-y-6">
          <NepaliDatePicker label="Advance Date (BS)" value={advanceDate} onChange={setAdvanceDate} />
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-600 dark:text-slate-400">Advance Amount (Rs.)</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">Rs.</span>
              <input type="number" placeholder="0" value={advanceAmount} onChange={e => setAdvanceAmount(e.target.value)} className="w-full p-4 pl-12 bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-xl text-lg font-bold" required />
            </div>
          </div>
          <button type="submit" className="w-full bg-amber-600 text-white p-4 rounded-xl font-bold hover:bg-amber-700 shadow-lg shadow-amber-600/20 transition">Confirm Advance Payment</button>
        </form>
      </Modal>

      <Modal isOpen={isSalaryModalOpen} onClose={() => setIsSalaryModalOpen(false)} title="Monthly Salary Statement">
        <div className="space-y-6">
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-2xl border border-slate-200 dark:border-slate-700">
               <div className="bg-primary-100 dark:bg-primary-900/30 p-3 rounded-full text-primary-600"><Users size={24}/></div>
               <div>
                 <div className="font-black text-lg leading-tight">{selectedEmployee?.name}</div>
                 <div className="text-xs text-slate-500 font-bold uppercase tracking-wider">Wage: Rs. {selectedEmployee?.dailyWage}/day</div>
               </div>
            </div>
            <NepaliMonthPicker value={selectedMonth} onChange={setSelectedMonth} />
          </div>

          {salaryStatement && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-4 bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-800 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-green-600">Present Days</div>
                  <div className="text-2xl font-black text-green-700">{salaryStatement.daysPresent}</div>
                </div>
                <div className="p-4 bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-800 rounded-xl">
                  <div className="text-[10px] font-black uppercase text-red-600">Absent Days</div>
                  <div className="text-2xl font-black text-red-700">{salaryStatement.daysAbsent}</div>
                </div>
              </div>

              <div className="space-y-2 border-t border-slate-100 dark:border-slate-700 pt-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-500">Gross Earnings ({salaryStatement.daysPresent} × {selectedEmployee?.dailyWage})</span>
                  <span className="font-bold">Rs. {salaryStatement.totalEarned.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-sm text-amber-600">
                  <span className="flex items-center gap-1"><TrendingDown size={14}/> Total Monthly Advance</span>
                  <span className="font-bold">- Rs. {salaryStatement.totalAdvances.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center pt-3 mt-2 border-t border-slate-200 dark:border-slate-600">
                  <span className="text-lg font-black text-slate-800 dark:text-white uppercase tracking-tighter">Net Payable</span>
                  <span className="text-2xl font-black text-primary-600">Rs. {salaryStatement.netPayable.toLocaleString()}</span>
                </div>
              </div>

              {salaryStatement.monthAdvances.length > 0 && (
                <div className="mt-4">
                  <div className="text-[10px] font-black uppercase text-slate-400 mb-2">Advance History</div>
                  <div className="max-h-32 overflow-y-auto space-y-1 pr-1">
                    {salaryStatement.monthAdvances.map(adv => (
                      <div key={adv.id} className="flex justify-between items-center p-2 text-xs bg-slate-50 dark:bg-slate-700 rounded border border-slate-100 dark:border-slate-600">
                        <span className="font-mono">{adv.date}</span>
                        <span className="font-bold text-red-500">Rs. {adv.amount.toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
          
          <button onClick={handleDownloadStatementPDF} className="w-full flex items-center justify-center gap-2 bg-slate-800 dark:bg-white text-white dark:text-slate-900 p-4 rounded-xl font-bold hover:opacity-90 transition active:scale-95">
            <Download size={18}/> Download PDF Statement
          </button>
        </div>
      </Modal>
    </div>
  );
};

export default EmployeeManagement;