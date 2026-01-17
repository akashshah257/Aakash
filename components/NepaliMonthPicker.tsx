import React from 'react';
import NepaliDate from 'nepali-date-converter';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface NepaliMonthPickerProps {
  value: string; // YYYY-MM
  onChange: (newValue: string) => void;
}

const NepaliMonthPicker: React.FC<NepaliMonthPickerProps> = ({ value, onChange }) => {
  // Ensure we have a valid date object even if the value is incomplete
  const currentNepaliDate = new NepaliDate(value ? `${value}-01` : undefined);

  const handlePrevMonth = () => {
    // Create a new instance using string format to satisfy type requirements (string | number | Date)
    // We use '01' as day to avoid overflow issues when navigating between months of different lengths
    const newDate = new NepaliDate(currentNepaliDate.format('YYYY-MM-01'));
    newDate.setMonth(newDate.getMonth() - 1);
    onChange(newDate.format('YYYY-MM'));
  };

  const handleNextMonth = () => {
    // Create a new instance using string format to satisfy type requirements
    const newDate = new NepaliDate(currentNepaliDate.format('YYYY-MM-01'));
    newDate.setMonth(newDate.getMonth() + 1);
    onChange(newDate.format('YYYY-MM'));
  };

  return (
    <div className="flex items-center justify-between p-2 border rounded-md bg-white dark:bg-slate-700 dark:border-slate-600 w-full">
      <button
        type="button"
        onClick={handlePrevMonth}
        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        aria-label="Previous month"
      >
        <ChevronLeft size={20} />
      </button>
      <span className="font-semibold text-center tabular-nums" style={{ minWidth: '120px' }}>
        {currentNepaliDate.format('MMMM YYYY', 'np')}
      </span>
      <button
        type="button"
        onClick={handleNextMonth}
        className="p-1 rounded-full hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
        aria-label="Next month"
      >
        <ChevronRight size={20} />
      </button>
    </div>
  );
};

export default NepaliMonthPicker;