'use client';

import { useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';

interface PopperProps {
  open: boolean;
  onClose: () => void;
  children: React.ReactNode;
  anchor: HTMLElement | null;
}

export function Popper({ open, onClose, children, anchor }: PopperProps) {
  const popperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node;
      
      // 检查点击是否在日期选择器的 Portal 内
      const datePickerPortal = document.getElementById('date-picker-portal');
      const isDatePickerClick = datePickerPortal?.contains(target);
      
      if (
        !isDatePickerClick && // 如果不是点击日期选择器
        popperRef.current && 
        !popperRef.current.contains(target) &&
        anchor && 
        !anchor.contains(target)
      ) {
        onClose();
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open, onClose, anchor]);

  if (!open || !anchor) return null;

  const rect = anchor.getBoundingClientRect();

  return createPortal(
    <div 
      ref={popperRef}
      className="fixed z-50 w-[calc(100vw-2rem)] max-w-md bg-[--background] rounded-lg shadow-lg p-4 space-y-4 max-h-[80vh] overflow-y-auto"
      style={{
        top: `${rect.bottom + 8}px`,
        left: '50%',
        transform: 'translateX(-50%)',
      }}
    >
      {children}
    </div>,
    document.body
  );
} 