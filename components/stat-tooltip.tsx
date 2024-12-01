'use client';

interface StatTooltipProps {
  rank: number;
  total: number;
  value: number;
  zScore: number;
  mean: number;
  stdDev: number;
  label: string;
  isLowerBetter?: boolean;
}

export function StatTooltip({ rank, total, value, zScore, mean, stdDev, label, isLowerBetter = false }: StatTooltipProps) {
  const isPercentage = ['% GP', 'GP WR', 'OH WR', 'GD WR', 'GIH WR', 'GNS WR', 'IWD'].includes(label);
  const formatValue = (val: number) => {
    if (isPercentage) {
      return `${(val * 100).toFixed(1)}%`;
    }
    if (['ALSA', 'ATA'].includes(label)) {
      return val.toFixed(2);
    }
    return val.toFixed(1);
  };

  const displayZScore = isLowerBetter ? -zScore : zScore;

  return (
    <div className="absolute z-[100] bg-[--component-background] border border-[--border] rounded-md shadow-lg p-2 text-sm min-w-[180px]">
      <div className="space-y-0.5">
        <div className="font-medium text-[--component-foreground] mb-1">{label} 统计</div>
        <div className="text-[--component-foreground-muted]">
          <div className="grid grid-cols-[3.5rem,1fr] gap-x-1">
            <span>排名：</span>
            <span className="text-right">{rank} / {total}</span>
            <span>数值：</span>
            <span className="text-right">{formatValue(value)}</span>
            <span>Z分数：</span>
            <span className="text-right">{displayZScore.toFixed(1)}</span>
            <span>平均值：</span>
            <span className="text-right">{formatValue(mean)} ± {formatValue(stdDev)}</span>
          </div>
        </div>
      </div>
    </div>
  );
} 