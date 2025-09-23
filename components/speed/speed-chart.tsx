'use client';

import React, { useState, useMemo } from "react";
import { SpeedFilters } from "./speed-filters";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMediaQuery } from "@/hooks/use-media-query";
import { formatLabels } from "@/lib/options";

interface SpeedData {
  expansion: string;
  event_type: string;
  win_rate_on_play: number;
  average_game_length: number;
}

interface SpeedChartProps {
  initialData: SpeedData[];
}

// 赛制对应的稀有度
const formatRarities = {
  'PremierDraft': 'uncommon',
  'PickTwoDraft': 'uncommon',
  'QuickDraft': 'common',
  'Sealed': 'mythic',
  'TradDraft': 'rare',
  'TradSealed': 'mythic',
} as const;

interface CustomScatterProps {
  cx?: number;
  cy?: number;
  payload?: SpeedData;
  onClick?: (cx: number, cy: number, data: SpeedData) => void;
}

// 自定义渲染器，用于显示系列标志
const CustomScatter = (props: CustomScatterProps) => {
  const { cx, cy, payload, onClick } = props;
  if (!cx || !cy || !payload) return null;
  
  const processedSet = payload.expansion.startsWith('Y') 
    ? `y${payload.expansion.slice(payload.expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
    : payload.expansion.toLowerCase();
  
  return (
    <foreignObject x={cx - 12} y={cy - 12} width={24} height={24}>
      <i
        className={`keyrune ss ss-${processedSet} ss-${formatRarities[payload.event_type as keyof typeof formatRarities] || 'timeshifted'}`}
        style={{
          fontSize: '24px',
          display: 'block',
          lineHeight: '24px',
          textAlign: 'center',
          cursor: 'pointer'
        }}
        onClick={(e) => {
          e.stopPropagation();
          onClick?.(cx, cy, payload);
        }}
      />
    </foreignObject>
  );
};

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    payload: SpeedData;
  }>;
  isMobile?: boolean;
  selectedPoint?: SpeedData | null;
}

const CustomTooltip = ({ active, payload, isMobile, selectedPoint }: CustomTooltipProps) => {
  if ((!isMobile && active && payload?.length) || (isMobile && selectedPoint)) {
    const data = isMobile ? selectedPoint! : payload![0].payload;
    const processedSet = data.expansion.startsWith('Y') 
      ? `y${data.expansion.slice(data.expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
      : data.expansion.toLowerCase();

    return (
      <div className="bg-[--background] border border-[--border] rounded-lg p-3 shadow-lg whitespace-nowrap">
        <p className="font-medium">
          <i 
            className={`keyrune ss ss-2x ss-${processedSet} ss-${formatRarities[data.event_type as keyof typeof formatRarities] || 'uncommon'}`}
          /> {data.expansion} - {formatLabels[data.event_type] || data.event_type}
        </p>
        <p className="text-sm text-[--muted-foreground]">
          先手胜率: {(data.win_rate_on_play * 100).toFixed(1)}%
        </p>
        <p className="text-sm text-[--muted-foreground]">
          平均回合数: {data.average_game_length.toFixed(1)}
        </p>
      </div>
    );
  }
  return null;
};

export function SpeedChart({ initialData }: SpeedChartProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [selectedPoint, setSelectedPoint] = useState<SpeedData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipAlign, setTooltipAlign] = useState<'center' | 'left' | 'right'>('center');
  
  // 获取所有可用的系列
  const allExpansions = useMemo(() => {
    return Array.from(new Set(initialData.map(item => item.expansion))).sort();
  }, [initialData]);

  // 默认选中的赛制
  const defaultFormats = ['PremierDraft', 'QuickDraft', 'Sealed', 'TradDraft', 'TradSealed'];

  // 默认选中所有系列和指定赛制
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>(allExpansions);
  const [selectedFormats, setSelectedFormats] = useState<string[]>(defaultFormats);

  // 根据选择的系列和赛制筛选数据
  const filteredSpeedData = useMemo(() => {
    const filtered = initialData.filter(item => {
      const expansionMatch = selectedExpansions.includes(item.expansion);
      const formatMatch = selectedFormats.includes(item.event_type);
      return expansionMatch && formatMatch;
    });
    
    return filtered;
  }, [initialData, selectedExpansions, selectedFormats]);

  const handlePointClick = (cx: number, cy: number, data: SpeedData) => {
    if (isMobile) {
      // 获取图表容器的宽度
      const chartContainer = document.querySelector('.recharts-wrapper');
      if (chartContainer) {
        const containerWidth = chartContainer.clientWidth;
        const tooltipWidth = 280; // 预估的悬浮窗宽度
        const margin = 20; // 边距

        // 根据点击位置决定悬浮窗的对齐方式
        if (cx < tooltipWidth / 2 + margin) {
          setTooltipAlign('left');
        } else if (cx > containerWidth - tooltipWidth / 2 - margin) {
          setTooltipAlign('right');
        } else {
          setTooltipAlign('center');
        }
      }

      setTooltipPosition({ x: cx, y: cy });
      setSelectedPoint(selectedPoint?.expansion === data.expansion && selectedPoint?.event_type === data.event_type ? null : data);
    }
  };

  const handleChartClick = () => {
    if (isMobile) {
      setSelectedPoint(null);
    }
  };

  return (
    <>
      <div className="mb-8">
        <SpeedFilters 
          selectedExpansions={selectedExpansions}
          onExpansionsChange={setSelectedExpansions}
          selectedFormats={selectedFormats}
          onFormatsChange={setSelectedFormats}
        />
      </div>

      <div className="bg-[--component-background] rounded-lg p-4">
        <div className="h-[600px] relative" onClick={handleChartClick}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart
              margin={isMobile 
                ? { top: 10, right: 5, bottom: 40, left: -20 }
                : { top: 20, right: 20, bottom: 50, left: 50 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis 
                type="number"
                dataKey="win_rate_on_play"
                name="先手胜率"
                domain={['auto', 'auto']}
                tickFormatter={(value) => `${(value * 100).toFixed(1)}%`}
                label={{ 
                  value: '先手胜率', 
                  position: 'bottom',
                  offset: isMobile ? 15 : 30,
                  style: { 
                    fill: 'var(--foreground)',
                    fontSize: isMobile ? 12 : 14
                  }
                }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              <YAxis
                type="number"
                dataKey="average_game_length"
                name="平均回合数"
                domain={['auto', 'auto']}
                label={{ 
                  value: '平均回合数', 
                  angle: -90, 
                  position: 'left',
                  offset: isMobile ? -30 : 30,
                  style: { 
                    fill: 'var(--foreground)',
                    fontSize: isMobile ? 12 : 14
                  }
                }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
              />
              {!isMobile && <Tooltip content={<CustomTooltip />} />}
              <Scatter 
                data={filteredSpeedData} 
                shape={(props: CustomScatterProps) => (
                  <CustomScatter 
                    {...props} 
                    onClick={handlePointClick} 
                  />
                )}
              />
            </ScatterChart>
          </ResponsiveContainer>
          {isMobile && selectedPoint && (
            <div 
              className="absolute pointer-events-none"
              style={{ 
                left: `${tooltipPosition.x}px`, 
                top: `${tooltipPosition.y - 24}px`,
                transform: tooltipAlign === 'center' ? 'translate(-50%, -100%)' :
                          tooltipAlign === 'left' ? 'translate(0, -100%)' :
                          'translate(-100%, -100%)'
              }}
            >
              <CustomTooltip isMobile selectedPoint={selectedPoint} />
            </div>
          )}
        </div>
      </div>
    </>
  );
} 