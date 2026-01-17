import React, { useState, useMemo, useRef } from 'react';
import type { CollageRecord } from '../types';
import useUserData from '../hooks/useUserData';
import { 
  PlusCircle, Download, Trash2, Edit, X, Save, Search, 
  Filter, Calendar, Upload, FileSpreadsheet, User, 
  Smartphone, CheckCircle2, Clock, ArrowUpRight, Hash,
  FileText, ClipboardList
} from 'lucide-react';
import NepaliDatePicker from './NepaliDatePicker';
import NepaliDate from 'nepali-date-converter';
import * as XLSX from 'xlsx';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
    if (!isOpen) return null;
    return (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex justify-center items-center p-4 animate-in fade-in zoom-in duration-200" onClick={onClose}>
            <div className="bg-white dark:bg-slate-800 rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden transform transition-all" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-6 border-b border-slate-100 dark:border-slate-700">
                    <h3 className="text-xl font-black text-slate-800 dark:text-white tracking-tight">{title}</h3>
                    <button onClick={onClose} className="text-slate-400 hover:text-red-500 transition-colors bg-slate-50 dark:bg-slate-700 p-2 rounded-full"><X size={20} /></button>
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
  const [deliveryStatusFilter, setDeliveryStatusFilter] = useState<'all' | 'yes' | 'no'>('all');
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  const handleStartEditing = (record: CollageRecord) => {
    setEditingId(record.id);
    setEditingRecord({ ...record, deliveryDate: record.deliveryDate || getTodayBS() });
  };

  const handleCancelEditing = () => {
    setEditingId(null);
    setEditingRecord(null);
  };

  const handleSaveEditing = () => {
    if (editingRecord) {
        setRecords(records.map(r => r.id === editingId ? {...editingRecord, totalAmount: Number(editingRecord.totalAmount)} : r));
        handleCancelEditing();
    }
  };

  const handleExport = () => {
    const exportData = filteredRecords.map(r => ({
      'S.N.': r.sn,
      'Collage Name': r.collageName,
      'Student Name': r.studentName,
      'Mobile Number': r.mobile,
      'Total Amount': r.totalAmount,
      'Delivery Status': r.deliveryStatus,
      'Delivery Date (BS)': r.deliveryDate
    }));
    const ws = XLSX.utils.json_to_sheet(exportData);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Collage Records");
    XLSX.writeFile(wb, `collage_records_${new Date().toISOString().split('T')[0]}.xlsx`);
  };

  const handleDownloadPDF = () => {
    const doc = new jsPDF() as any;
    
    // Header
    doc.setFontSize(22);
    doc.setTextColor(16, 185, 129); // Emerald-600
    doc.text('RAJHOJIYARI', 105, 20, { align: 'center' });
    doc.setFontSize(14);
    doc.setTextColor(100);
    doc.text('Collage Delivery Ledger', 105, 28, { align: 'center' });
    doc.setFontSize(10);
    doc.text(`Generated on: ${new NepaliDate().format('YYYY-MM-DD')} (BS)`, 105, 34, { align: 'center' });
    
    // Table data
    const tableRows = filteredRecords.map(r => [
      r.sn,
      r.collageName,
      r.studentName,
      r.mobile,
      `Rs. ${r.totalAmount.toLocaleString()}`,
      r.deliveryStatus === 'yes' ? 'Delivered' : 'Pending',
      r.deliveryDate
    ]);

    doc.autoTable({
      startY: 45,
      head: [['S.N.', 'Institution', 'Student', 'Mobile', 'Amount', 'Status', 'Date']],
      body: tableRows,
      theme: 'grid',
      headStyles: { fillColor: [16, 185, 129], textColor: [255, 255, 255] },
      styles: { fontSize: 8 },
      margin: { top: 40 }
    });

    // Summary footer
    const finalY = (doc as any).lastAutoTable.finalY || 100;
    const totalSum = filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0);
    doc.setFontSize(12);
    doc.setTextColor(0);
    doc.text(`Total Receivable Amount: Rs. ${totalSum.toLocaleString()}`, 14, finalY + 15);
    doc.text(`Total Records: ${filteredRecords.length}`, 14, finalY + 22);

    doc.save(`collage_ledger_${new NepaliDate().format('YYYY-MM-DD')}.pdf`);
  };

  const handleDownloadTemplate = () => {
      const templateData = [{
          'Collage Name': 'Sample College',
          'Student Name': 'Sample Student',
          'Mobile': '9800000000',
          'Total Amount': 5000,
          'Delivery Status': 'no',
          'Delivery Date (BS)': '2081-01-01'
      }];
      const ws = XLSX.utils.json_to_sheet(templateData);
      const wb = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(wb, ws, "Template");
      XLSX.writeFile(wb, "collage_import_template.xlsx");
  };

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
      const file = event.target.files?.[0];
      if (!file) return;
      try {
          const arrayBuffer = await file.arrayBuffer();
          const wb = XLSX.read(arrayBuffer, { type: 'array' });
          const jsonData = XLSX.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
          processImportedData(jsonData);
      } catch (error) {
          alert("Error reading file.");
      }
      if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const processImportedData = (data: any[]) => {
      const newRecords: CollageRecord[] = [];
      let currentSn = nextSn;
      data.forEach((row: any) => {
          const collageName = row['Collage Name'] || row['Collage'];
          const studentName = row['Student Name'] || row['Student'];
          if (collageName && studentName) {
              newRecords.push({
                  id: crypto.randomUUID(),
                  sn: currentSn++,
                  collageName: String(collageName),
                  studentName: String(studentName),
                  mobile: String(row['Mobile'] || row['Phone'] || ''),
                  totalAmount: parseFloat(row['Total Amount'] || row['Amount']) || 0,
                  deliveryStatus: String(row['Delivery Status'] || '').toLowerCase().includes('yes') ? 'yes' : 'no',
                  deliveryDate: String(row['Delivery Date (BS)'] || getTodayBS())
              });
          }
      });
      if (newRecords.length > 0) setRecords(prev => [...prev, ...newRecords]);
  };

  const filteredRecords = useMemo(() => {
    let filtered = [...records];
    if (deliveryStatusFilter !== 'all') filtered = filtered.filter(r => r.deliveryStatus === deliveryStatusFilter);
    if (searchTerm) {
      const lower = searchTerm.toLowerCase();
      filtered = filtered.filter(r => 
        r.collageName.toLowerCase().includes(lower) || 
        r.studentName.toLowerCase().includes(lower) || 
        r.mobile.includes(lower)
      );
    }
    return filtered;
  }, [records, searchTerm, deliveryStatusFilter]);
  
  const totalSum = useMemo(() => filteredRecords.reduce((sum, r) => sum + r.totalAmount, 0), [filteredRecords]);

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Dynamic Action Bar */}
      <div className="bg-white dark:bg-slate-800 p-8 rounded-[2rem] shadow-xl shadow-slate-200/50 dark:shadow-none border border-slate-100 dark:border-slate-700">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6 mb-8">
            <div className="space-y-1">
                <div className="flex items-center gap-2 text-emerald-600 font-black text-xs uppercase tracking-[0.2em]">
                  <ArrowUpRight size={14} /> Distribution Ledger
                </div>
                <h2 className="text-3xl font-black text-slate-900 dark:text-white tracking-tighter">Collage Delivery Records</h2>
                <p className="text-slate-500 text-sm font-medium">Tracking distribution batches for RAJHOJIYARI</p>
            </div>
            <div className="flex flex-wrap gap-3 w-full lg:w-auto">
                <input type="file" ref={fileInputRef} onChange={handleFileChange} className="hidden" accept=".xlsx,.xls,.csv" />
                
                <button onClick={handleDownloadTemplate} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-slate-50 dark:bg-slate-700 text-slate-600 dark:text-slate-300 px-6 py-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-600 transition-all font-bold text-sm border border-slate-200 dark:border-slate-600">
                    <FileSpreadsheet size={18} /> <span className="hidden xl:inline">Template</span>
                </button>
                
                <div className="flex-1 lg:flex-none flex gap-1 bg-slate-100 dark:bg-slate-700 p-1 rounded-2xl">
                  <button onClick={() => fileInputRef.current?.click()} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all font-bold text-sm">
                      <Upload size={18} /> Import
                  </button>
                  <button onClick={handleExport} disabled={records.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 transition-all font-bold text-sm disabled:opacity-50">
                      <Download size={18} /> Excel
                  </button>
                  <button onClick={handleDownloadPDF} disabled={records.length === 0} className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl hover:bg-white dark:hover:bg-slate-600 text-red-600 dark:text-red-400 transition-all font-bold text-sm disabled:opacity-50">
                      <FileText size={18} /> PDF
                  </button>
                </div>

                <button onClick={() => setIsModalOpen(true)} className="flex-1 lg:flex-none flex items-center justify-center gap-2 bg-emerald-600 text-white px-8 py-3 rounded-2xl hover:bg-emerald-700 hover:scale-[1.02] transition-all shadow-xl shadow-emerald-600/20 font-black text-sm active:scale-95">
                    <PlusCircle size={18} /> New Entry
                </button>
            </div>
        </div>

        <div className="flex flex-col md:flex-row gap-4 pt-6 border-t border-slate-50 dark:border-slate-700/50">
             <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input 
                  type="text" 
                  placeholder="Find by college, student, or phone..." 
                  value={searchTerm} 
                  onChange={(e) => setSearchTerm(e.target.value)} 
                  className="pl-12 w-full py-4 bg-slate-50 border border-slate-200 rounded-2xl text-slate-700 dark:bg-slate-900 dark:border-slate-700 dark:text-white transition-all outline-none focus:ring-4 focus:ring-emerald-500/10 focus:border-emerald-500 font-medium" 
                />
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-2 px-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl text-slate-400">
                <Filter size={18} />
                <select 
                  value={deliveryStatusFilter} 
                  onChange={(e) => setDeliveryStatusFilter(e.target.value as any)} 
                  className="bg-transparent py-4 text-slate-700 dark:text-white outline-none font-bold text-sm min-w-[140px]"
                >
                    <option value="all">All Statuses</option>
                    <option value="yes">Delivered Only</option>
                    <option value="no">Pending Only</option>
                </select>
              </div>
            </div>
        </div>
      </div>
      
      {/* Table Layout */}
      <div className="bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl shadow-slate-200/40 dark:shadow-none border border-slate-100 dark:border-slate-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead className="bg-slate-50/50 dark:bg-slate-900/50 border-b border-slate-100 dark:border-slate-700">
              <tr>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400"><Hash size={14}/></th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Collage Group</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Student Identity</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Payment</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-center">Status</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400">Log Date</th>
                <th className="px-8 py-6 font-black text-[10px] uppercase tracking-[0.2em] text-slate-400 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700/50">
              {filteredRecords.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-8 py-24 text-center">
                    <div className="flex flex-col items-center gap-4 text-slate-300">
                      <div className="p-6 bg-slate-50 dark:bg-slate-900 rounded-full">
                        <ClipboardList size={48} className="opacity-20" />
                      </div>
                      <p className="font-bold text-lg">No distribution records found</p>
                      <button onClick={() => setIsModalOpen(true)} className="text-emerald-600 font-black text-sm hover:underline uppercase tracking-widest">Create First Entry</button>
                    </div>
                  </td>
                </tr>
              ) : filteredRecords.sort((a,b) => b.sn - a.sn).map(record => (
                <tr key={record.id} className="group hover:bg-emerald-50/30 dark:hover:bg-emerald-900/10 transition-all">
                   {editingId === record.id && editingRecord ? (
                    <>
                      <td className="px-8 py-6 font-black text-slate-400">{record.sn}</td>
                      <td className="px-2 py-6"><input type="text" value={editingRecord.collageName} onChange={e => setEditingRecord({...editingRecord, collageName: e.target.value})} className="w-full p-3 border border-emerald-200 rounded-xl dark:bg-slate-900 dark:border-slate-600" /></td>
                      <td className="px-2 py-6"><input type="text" value={editingRecord.studentName} onChange={e => setEditingRecord({...editingRecord, studentName: e.target.value})} className="w-full p-3 border border-emerald-200 rounded-xl dark:bg-slate-900 dark:border-slate-600" /></td>
                      <td className="px-2 py-6 text-center font-bold">Rs. <input type="number" value={editingRecord.totalAmount} onChange={e => setEditingRecord({...editingRecord, totalAmount: parseFloat(e.target.value) || 0})} className="w-24 p-3 border border-emerald-200 rounded-xl dark:bg-slate-900 dark:border-slate-600 inline" /></td>
                      <td className="px-2 py-6"><select value={editingRecord.deliveryStatus} onChange={e => setEditingRecord({...editingRecord, deliveryStatus: e.target.value as any})} className="w-full p-3 border border-emerald-200 rounded-xl dark:bg-slate-900 dark:border-slate-600"><option value="no">Pending</option><option value="yes">Delivered</option></select></td>
                      <td className="px-2 py-6"><NepaliDatePicker value={editingRecord.deliveryDate} onChange={(date) => setEditingRecord({...editingRecord, deliveryDate: date})} /></td>
                      <td className="px-8 py-6 text-right flex justify-end gap-2"><button onClick={handleSaveEditing} className="p-3 bg-emerald-600 text-white rounded-xl shadow-lg shadow-emerald-600/20 hover:scale-110 transition"><Save size={18} /></button><button onClick={handleCancelEditing} className="p-3 bg-slate-100 dark:bg-slate-700 text-slate-400 rounded-xl hover:bg-slate-200 transition"><X size={18} /></button></td>
                    </>
                  ) : (
                    <>
                      <td className="px-8 py-8 font-black text-slate-300 tabular-nums">{record.sn}</td>
                      <td className="px-8 py-8">
                        <div className="font-black text-slate-900 dark:text-white text-lg tracking-tight">{record.collageName}</div>
                        <div className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Institutional Partner</div>
                      </td>
                      <td className="px-8 py-8">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-700 dark:text-slate-200 flex items-center gap-2"><User size={14} className="text-emerald-500" /> {record.studentName}</span>
                          <span className="text-xs font-mono text-slate-400 flex items-center gap-2 mt-1"><Smartphone size={12} /> {record.mobile || 'Private'}</span>
                        </div>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <div className="font-black text-slate-900 dark:text-white text-lg">Rs. {record.totalAmount.toLocaleString()}</div>
                      </td>
                      <td className="px-8 py-8 text-center">
                        <div className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-[0.1em] border shadow-sm transition-all ${record.deliveryStatus === 'yes' ? 'bg-emerald-50 text-emerald-700 border-emerald-100 dark:bg-emerald-900/30 dark:text-emerald-400 dark:border-emerald-800' : 'bg-amber-50 text-amber-700 border-amber-100 dark:bg-amber-900/30 dark:text-amber-400 dark:border-amber-800'}`}>
                          {record.deliveryStatus === 'yes' ? <CheckCircle2 size={12}/> : <Clock size={12}/>}
                          {record.deliveryStatus === 'yes' ? 'Delivered' : 'Pending'}
                        </div>
                      </td>
                      <td className="px-8 py-8 whitespace-nowrap">
                        <div className="flex items-center gap-2 font-bold text-slate-500 text-sm"><Calendar size={14} className="text-slate-400"/> {record.deliveryDate}</div>
                      </td>
                      <td className="px-8 py-8 text-right">
                        <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleStartEditing(record)} className="p-3 text-slate-400 hover:text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-900/20 rounded-xl transition" title="Edit"><Edit size={20} /></button>
                          <button onClick={() => handleDeleteRecord(record.id)} className="p-3 text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition" title="Delete"><Trash2 size={20} /></button>
                        </div>
                      </td>
                    </>
                  )}
                </tr>
              ))}
            </tbody>
            {filteredRecords.length > 0 && (
                <tfoot className="bg-slate-900 dark:bg-black text-white">
                    <tr>
                        <td colSpan={3} className="px-8 py-8 text-right uppercase text-[10px] font-black tracking-[0.3em] opacity-40">Financial Settlement Summary</td>
                        <td className="px-8 py-8 text-center">
                          <div className="text-xs font-bold text-emerald-400 uppercase mb-1">Total Receivable</div>
                          <div className="text-2xl font-black tabular-nums">Rs. {totalSum.toLocaleString()}</div>
                        </td>
                        <td colSpan={3} className="px-8 py-8">
                           <div className="h-1 bg-emerald-500/20 rounded-full overflow-hidden">
                              <div className="h-full bg-emerald-500 transition-all duration-1000" style={{ width: `${(filteredRecords.filter(r => r.deliveryStatus === 'yes').length / filteredRecords.length) * 100}%` }}></div>
                           </div>
                           <div className="mt-2 text-[9px] font-black uppercase tracking-widest opacity-50 flex justify-between">
                              <span>Delivery Completion</span>
                              <span>{Math.round((filteredRecords.filter(r => r.deliveryStatus === 'yes').length / filteredRecords.length) * 100)}%</span>
                           </div>
                        </td>
                    </tr>
                </tfoot>
            )}
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="New Delivery Log">
          <form onSubmit={handleAddRecord} className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="md:col-span-2 space-y-2">
                 <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Institution / Collage Name</label>
                 <input type="text" placeholder="e.g. Tribhuvan University, KMC, etc." value={newRecord.collageName} onChange={e => setNewRecord({...newRecord, collageName: e.target.value})} required className="w-full p-4 border border-slate-200 rounded-2xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold" />
            </div>
            <div className="space-y-2">
                 <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Full Name of Student</label>
                 <input type="text" placeholder="Full name" value={newRecord.studentName} onChange={e => setNewRecord({...newRecord, studentName: e.target.value})} required className="w-full p-4 border border-slate-200 rounded-2xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold" />
            </div>
            <div className="space-y-2">
                 <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Contact Number</label>
                 <input type="tel" placeholder="Mobile / Phone" value={newRecord.mobile} onChange={e => setNewRecord({...newRecord, mobile: e.target.value})} className="w-full p-4 border border-slate-200 rounded-2xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold" />
            </div>
            <div className="space-y-2">
                 <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Amount to Receive (Rs.)</label>
                 <input type="number" placeholder="0.00" value={newRecord.totalAmount || ''} onChange={e => setNewRecord({...newRecord, totalAmount: parseFloat(e.target.value) || 0})} required className="w-full p-4 border border-slate-200 rounded-2xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-black text-xl" />
            </div>
             <div className="space-y-2">
                <label className="block text-xs font-black uppercase tracking-widest text-slate-500">Status</label>
                <select value={newRecord.deliveryStatus} onChange={e => setNewRecord({...newRecord, deliveryStatus: e.target.value as any})} className="w-full p-4 border border-slate-200 rounded-2xl dark:bg-slate-700 dark:border-slate-600 dark:text-white font-bold">
                    <option value="no">Pending Distribution</option>
                    <option value="yes">Successfully Delivered</option>
                </select>
            </div>
            <div className="md:col-span-2">
                <NepaliDatePicker label="Distribution Date (BS)" value={newRecord.deliveryDate} onChange={(date) => setNewRecord({...newRecord, deliveryDate: date})} />
            </div>
            <button type="submit" className="md:col-span-2 bg-emerald-600 text-white p-5 rounded-2xl hover:bg-emerald-700 font-black text-lg transition shadow-xl shadow-emerald-600/30 active:scale-95">Save Distribution Entry</button>
          </form>
      </Modal>
    </div>
  );
};

export default CollageRecords;