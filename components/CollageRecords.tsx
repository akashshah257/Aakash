import React, { useState, useMemo } from 'react';
import type { CollageRecord } from '../types';
import useUserData from '../hooks/useUserData';
import { 
  PlusCircle, Trash2, Edit, X, Save, Search, 
  Calendar, User, Smartphone, CheckCircle2, Clock
} from 'lucide-react';
import NepaliDatePicker from './NepaliDatePicker';
import NepaliDate from 'nepali-date-converter';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 p-2"><X size={20} /></button>
                </div>
                <div className="p-8 max-h-[80vh] overflow-y-auto">
                    {children}
                </div>
            </div>
        </div>
    );
};

const CollageRecords: React.FC = () => {
  const getTodayBS = () => new NepaliDate().format('YYYY-MM-DD');
  const [records, setRecords] = useUserData<CollageRecord[]>('collageRecords', []);
  const [newRecord, setNewRecord] = useState<Omit<CollageRecord, 'id' | 'sn'>>({
    collageName: '',
    studentName: '',
    mobile: '',
    totalAmount: 0,
    deliveryStatus: 'no',
    deliveryDate: getTodayBS()
  });
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editingRecord, setEditingRecord] = useState<CollageRecord | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

  const nextSn = useMemo(() => {
    return records.length > 0 ? Math.max(...records.map(r => r.sn)) + 1 : 1;
  }, [records]);
  
  const handleAddRecord = (e: React.FormEvent) => {
    e.preventDefault();
    if (newRecord.collageName && newRecord.studentName && newRecord.totalAmount > 0) {
      const recordToAdd: CollageRecord = { 
        ...newRecord, 
        id: crypto.randomUUID(), 
        sn: nextSn, 
        totalAmount: Number(newRecord.totalAmount),
        deliveryDate: newRecord.deliveryDate || getTodayBS() 
      };
      setRecords([...records, recordToAdd]);
      setNewRecord({ collageName: '', studentName: '', mobile: '', totalAmount: 0, deliveryStatus: 'no', deliveryDate: getTodayBS() });
      setIsModalOpen(false);
    }
  };

  const handleDeleteRecord = (id: string) => {
    if (window.confirm('Are you sure you want to delete this record?')) {
      setRecords(records.filter(r => r.id !== id));
    }
  };

  const filteredRecords = useMemo(() => {
    let filtered = [...records];
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.collageName.toLowerCase().includes(lower) || 
        r.studentName.toLowerCase().includes(lower)
      );
    }
    return filtered;
  }, [records, searchTerm]);

  return (
    <div className="space-y-8">
      <div className="bg-white dark:bg-slate-800 p-6 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col md:flex-row justify-between items-center gap-4">
        <div>
            <h2 className="text-2xl font-black text-slate-900 dark:text-white">Collage Records</h2>
            <p className="text-slate-500 text-sm">Distribution logs for student orders</p>
        </div>
        <div className="flex gap-4 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                <input type="text" placeholder="Search..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="pl-10 w-full p-2.5 bg-slate-50 border border-slate-200 rounded-xl" />
            </div>
            <button onClick={() => setIsModalOpen(true)} className="bg-emerald-600 text-white px-6 py-2.5 rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2">
                <PlusCircle size={18} /> New Entry
            </button>
        </div>
      </div>
      
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-slate-50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">S.N.</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Identity</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Payment</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400">Status</th>
                <th className="px-6 py-4 font-bold text-xs uppercase text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-20 text-center text-slate-400">No records found.</td>
                </tr>
              ) : filteredRecords.sort((a,b) => b.sn - a.sn).map(record => (
                <tr key={record.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-6 font-bold">{record.sn}</td>
                    <td className="px-6 py-6">
                        <div className="font-bold">{record.studentName}</div>
                        <div className="text-xs text-slate-500">{record.collageName}</div>
                    </td>
                    <td className="px-6 py-6 font-bold">Rs. {record.totalAmount.toLocaleString()}</td>
                    <td className="px-6 py-6">
                        <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase ${record.deliveryStatus === 'yes' ? 'bg-emerald-100 text-emerald-700' : 'bg-amber-100 text-amber-700'}`}>
                            {record.deliveryStatus === 'yes' ? 'Delivered' : 'Pending'}
                        </span>
                    </td>
                    <td className="px-6 py-6 text-right">
                        <button onClick={() => handleDeleteRecord(record.id)} className="p-2 text-red-400 hover:text-red-500"><Trash2 size={18} /></button>
                    </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Distribution Log">
          <form onSubmit={handleAddRecord} className="space-y-6">
            <div className="space-y-2">
                 <label className="text-sm font-bold">Institution / Collage</label>
                 <input type="text" value={newRecord.collageName} onChange={e => setNewRecord({...newRecord, collageName: e.target.value})} required className="w-full p-4 border border-slate-200 rounded-xl" />
            </div>
            <div className="space-y-2">
                 <label className="text-sm font-bold">Student Name</label>
                 <input type="text" value={newRecord.studentName} onChange={e => setNewRecord({...newRecord, studentName: e.target.value})} required className="w-full p-4 border border-slate-200 rounded-xl" />
            </div>
            <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                    <label className="text-sm font-bold">Amount (Rs.)</label>
                    <input type="number" value={newRecord.totalAmount || ''} onChange={e => setNewRecord({...newRecord, totalAmount: parseFloat(e.target.value) || 0})} required className="w-full p-4 border border-slate-200 rounded-xl" />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-bold">Status</label>
                    <select value={newRecord.deliveryStatus} onChange={e => setNewRecord({...newRecord, deliveryStatus: e.target.value as any})} className="w-full p-4 border border-slate-200 rounded-xl">
                        <option value="no">Pending</option>
                        <option value="yes">Delivered</option>
                    </select>
                </div>
            </div>
            <NepaliDatePicker label="Log Date" value={newRecord.deliveryDate} onChange={(date) => setNewRecord({...newRecord, deliveryDate: date})} />
            <button type="submit" className="w-full bg-emerald-600 text-white p-4 rounded-xl font-bold hover:bg-emerald-700">Save Record</button>
          </form>
      </Modal>
    </div>
  );
};

export default CollageRecords;