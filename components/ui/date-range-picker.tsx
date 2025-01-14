'use client';

import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useMediaQuery } from '@/hooks/use-media-query';
import { zhCN } from 'date-fns/locale';

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
  const isMobile = useMediaQuery('(max-width: 1024px)');
  
  const inputClassName = "form-control w-full sm:w-32 bg-[--component-background] border border-[--border] rounded-md px-3 py-2 text-sm text-[--component-foreground] focus:border-[--primary] focus:outline-none focus:ring-1 focus:ring-[--primary]";

  return (
    <div className="flex items-center gap-2 w-full">
      <DatePicker
        selected={startDate}
        onChange={(date: Date | null) => date && onStartDateChange(date)}
        selectsStart
        startDate={startDate}
        endDate={endDate}
        maxDate={endDate}
        placeholderText="开始日期"
        className={inputClassName}
        withPortal={isMobile}
        portalId="date-picker-portal"
        dateFormat="yyyy/MM/dd"
        locale={zhCN}
      />
      <span className="text-[--component-foreground-muted] shrink-0">–</span>
      <DatePicker
        selected={endDate}
        onChange={(date: Date | null) => date && onEndDateChange(date)}
        selectsEnd
        startDate={startDate}
        endDate={endDate}
        minDate={startDate}
        maxDate={new Date()}
        placeholderText="结束日期"
        className={inputClassName}
        withPortal={isMobile}
        portalId="date-picker-portal"
        dateFormat="yyyy/MM/dd"
        locale={zhCN}
      />
    </div>
  );
} 