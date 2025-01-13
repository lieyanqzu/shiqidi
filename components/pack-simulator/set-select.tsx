'use client';

import React, { useEffect, useState } from 'react';
import { useSetStore } from '@/lib/store';
import { getAvailableSets } from '@/lib/pack-simulator';
import type { Set } from '@/types/pack-simulator';

interface SetSelectProps {
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
  title?: string;
  iconSize?: '1x' | '2x' | '3x' | '4x' | '5x' | '6x';
}

export function SetSelect({ value, onChange, disabled, iconSize = '1x' }: SetSelectProps) {
  const { chineseSetNames } = useSetStore();
  const [isOpen, setIsOpen] = useState(false);
  const sets = getAvailableSets();

  // 点击外部时关闭下拉菜单
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement;
      if (!target.closest('.set-select')) {
        setIsOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => {
      document.removeEventListener('click', handleClickOutside);
    };
  }, []);

  return (
    <div className="relative w-full set-select">
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        disabled={disabled}
        className={`
          w-full rounded-md border border-[--border] bg-[--component-background] px-3 pr-10 py-2 text-sm text-[--component-foreground]
          flex items-center gap-2
          focus:border-[--primary] focus:outline-none focus:ring-1 focus:ring-[--primary]
          disabled:cursor-not-allowed disabled:opacity-50
        `}
      >
        {value && (
          <>
            <i className={`keyrune ss ss-${iconSize} ss-${value.toLowerCase()} w-[1.5em] text-center`} />
            <span className="truncate">{chineseSetNames[value] || value}</span>
          </>
        )}
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="h-4 w-4 fill-current text-[--component-foreground-muted]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </button>

      {isOpen && (
        <div className="absolute z-10 mt-1 min-w-full whitespace-nowrap rounded-md border border-[--border] bg-[--component-background] shadow-lg">
          <div className="max-h-60 overflow-auto py-1">
            {sets.map((set: Set) => (
              <button
                key={set.code}
                onClick={() => {
                  onChange(set.code);
                  setIsOpen(false);
                }}
                className={`
                  w-full px-3 py-2 text-sm text-[--component-foreground]
                  flex items-center gap-2
                  hover:bg-[--accent] focus:bg-[--accent] focus:outline-none
                  ${value === set.code ? 'bg-[--accent]' : ''}
                `}
              >
                <i className={`keyrune ss ss-${iconSize} ss-${set.code.toLowerCase()} w-[1.5em] text-center`} />
                <span className="whitespace-nowrap">{chineseSetNames[set.code] || set.code}</span>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
} 