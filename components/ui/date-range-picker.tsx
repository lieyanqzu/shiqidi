'use client';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";

interface DateRangePickerProps {
  startDate: Date;
  endDate: Date;
  onStartDateChange: (date: Date) => void;
  onEndDateChange: (date: Date) => void;
}

export function DateRangePicker({
  startDate,
  endDate,
  onStartDateChange,
  onEndDateChange,
}: DateRangePickerProps) {
  const inputClassName = "form-control bg-[--component-background] border border-[--border] rounded-md px-3 py-2 text-sm text-[--component-foreground] focus:border-[--primary] focus:outline-none focus:ring-1 focus:ring-[--primary]";

  return (
    <div className="flex items-center gap-2">
      <DatePicker
        selected={startDate}
        onChange={(date: Date | null) => date && onStartDateChange(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        maxDate={endDate}
        placeholderText="Start Date"
        className={inputClassName}
      />
      <span className="text-[--component-foreground-muted]">–</span>
      <DatePicker
        selected={endDate}
        onChange={(date: Date | null) => date && onEndDateChange(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        maxDate={new Date()}
        placeholderText="End Date"
        className={inputClassName}
      />
    </div>
  );
} 