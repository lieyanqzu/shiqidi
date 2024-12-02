'use client';

import { useState, useRef, useEffect } from 'react';
import { StatTooltip } from '@/components/stat-tooltip';
import { ArrowUpRight, ArrowDown, ArrowDownRight, ArrowUp } from 'lucide-react';
import type { Stats } from '@/lib/stats';

interface StatCellProps {
  value: number | null;
  stats: Stats | null;
  label: string;
  formatter?: (value: number) => string;
}

export function StatCell({ value, stats, label, formatter = (v) => v.toFixed(2) }: StatCellProps) {
  const [showTooltip, setShowTooltip] = useState(false);
  const [tooltipPosition, setTooltipPosition] = useState<'left' | 'right'>('right');
  const cellRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (showTooltip && cellRef.current) {
      const cell = cellRef.current;
      const rect = cell.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // 假设tooltip宽度为200px，加上一些边距
      const tooltipWidth = 220;
      const spaceOnRight = viewportWidth - rect.right;
      
      setTooltipPosition(spaceOnRight >= tooltipWidth ? 'right' : 'left');
    }
  }, [showTooltip]);

  if (value === null || stats === null) {
    return <span>-</span>;
  }

  const getZScoreIndicator = (zScore: number) => {
    const adjustedZScore = ['ALSA', 'ATA'].includes(label) ? -zScore : zScore;

    if (adjustedZScore >= 2.5) return <ArrowUp className="inline-block w-3 h-3 text-green-500" />;
    if (adjustedZScore >= 1.5) return <ArrowUpRight className="inline-block w-3 h-3 text-green-500" />;
    if (adjustedZScore <= -2.5) return <ArrowDown className="inline-block w-3 h-3 text-red-500" />;
    if (adjustedZScore <= -1.5) return <ArrowDownRight className="inline-block w-3 h-3 text-red-500" />;
    return null;
  };

  return (
    <div 
      className="relative" 
      ref={cellRef}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
    >
      <span className="cursor-help whitespace-nowrap">
        {formatter(value)}
        {getZScoreIndicator(stats.zScore)}
      </span>
      {showTooltip && (
        <div 
          className={`fixed z-[9999] ${
            tooltipPosition === 'right' 
              ? 'translate-x-2' 
              : '-translate-x-[210px]'
          }`}
          style={{
            top: cellRef.current ? cellRef.current.getBoundingClientRect().top - 10 : 0,
            left: cellRef.current ? cellRef.current.getBoundingClientRect().right : 0,
          }}
        >
          <StatTooltip {...stats} label={label} isLowerBetter={['ALSA', 'ATA'].includes(label)} />
        </div>
      )}
    </div>
  );
} 