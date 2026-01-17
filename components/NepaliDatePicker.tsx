import React, { useMemo } from 'react';
import NepaliDate from 'nepali-date-converter';

interface NepaliDatePickerProps {
  value: string; // YYYY-MM-DD
  onChange: (date: string) => void;
  label?: string;
  disabled?: boolean;
}

const NEPAL_MONTHS = [
  "Baishakh", "Jestha", "Ashadh", "Shrawan", "Bhadra", "Ashwin",
  "Kartik", "Mangsir", "Poush", "Magh", "Falgun", "Chaitra"
];

const NepaliDatePicker: React.FC<NepaliDatePickerProps> = ({ value, onChange, label, disabled }) => {
    const [year, month, day] = useMemo(() => {
        if (!value) {
             const today = new NepaliDate();
             return [today.getYear(), today.getMonth() + 1, today.getDate()];
        }
        const parts = value.split('-').map(Number);
        if (parts.length === 3) return parts;
        const today = new NepaliDate();
        return [today.getYear(), today.getMonth() + 1, today.getDate()];
    }, [value]);

    const years = useMemo(() => {
        const currentYear = new NepaliDate().getYear();
        const start = currentYear - 5;
        const end = currentYear + 5;
        const arr = [];
        for (let i = start; i <= end; i++) arr.push(i);
        return arr;
    }, []);

    const days = useMemo(() => Array.from({length: 32}, (_, i) => i + 1), []);

    const handleChange = (type: 'year' | 'month' | 'day', val: number) => {
        let newYear = year;
        let newMonth = month;
        let newDay = day;

        if (type === 'year') newYear = val;
        if (type === 'month') newMonth = val;
        if (type === 'day') newDay = val;

        const mStr = newMonth.toString().padStart(2, '0');
        const dStr = newDay.toString().padStart(2, '0');
        onChange(`${newYear}-${mStr}-${dStr}`);
    };

    return (
        <div className="flex flex-col gap-1.5">
            {label && <label className="text-sm font-medium text-slate-700 dark:text-slate-300">{label}</label>}
            <div className="flex gap-2">
                <select 
                    value={year} 
                    onChange={(e) => handleChange('year', parseInt(e.target.value))}
                    disabled={disabled}
                    className="p-2.5 border border-slate-300 rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 text-sm min-w-[80px]"
                >
                    {years.map(y => <option key={y} value={y}>{y}</option>)}
                </select>
                <select 
                    value={month} 
                    onChange={(e) => handleChange('month', parseInt(e.target.value))}
                    disabled={disabled}
                    className="p-2.5 border border-slate-300 rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 flex-1 disabled:opacity-50 text-sm"
                >
                    {NEPAL_MONTHS.map((m, i) => <option key={i} value={i + 1}>{m}</option>)}
                </select>
                <select 
                    value={day} 
                    onChange={(e) => handleChange('day', parseInt(e.target.value))}
                    disabled={disabled}
                    className="p-2.5 border border-slate-300 rounded-lg bg-white dark:bg-slate-700 dark:border-slate-600 outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 disabled:opacity-50 text-sm min-w-[60px]"
                >
                    {days.map(d => <option key={d} value={d}>{d}</option>)}
                </select>
            </div>
        </div>
    );
};

export default NepaliDatePicker;