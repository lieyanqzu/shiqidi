'use client';

import React, { useState, useMemo, useEffect, useRef } from "react";
import { SpeedFilters } from "./speed-filters";
import { ScatterChart, Scatter, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { useMediaQuery } from "@/hooks/use-media-query";
import { SetIcon } from "@/components/logo/set-icon";
import { formatLabels } from "@/lib/options";

type Rarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'timeshifted';

const getRarity = (eventType: string): Rarity => {
  const value = formatRarities[eventType as keyof typeof formatRarities];
  return (value ?? 'timeshifted') as Rarity;
};

const STORAGE_KEY_SELECTED_EXPANSIONS = 'speed-chart-selected-expansions';
const STORAGE_KEY_SELECTED_FORMATS = 'speed-chart-selected-formats';

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
  
  // 图标宽高比为 1.5:1,高度 32px,宽度需要 48px
  const foProps = { x: cx - 24, y: cy - 16, width: 48, height: 32 } as unknown as React.SVGProps<SVGElement>;
  return React.createElement(
    'foreignObject',
    foProps,
    <div
      style={{
        width: '48px',
        height: '32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        overflow: 'visible',
      }}
      onClick={(e) => {
        e.stopPropagation();
        onClick?.(cx, cy, payload);
      }}
    >
      <SetIcon
        set={payload.expansion}
        size="2x"
        rarity={getRarity(payload.event_type)}
      />
    </div>
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

// 格式化为一位小数
const formatToOneDecimal = (value: number): string => {
  return value.toFixed(1);
};

const CustomTooltip = ({ active, payload, isMobile, selectedPoint }: CustomTooltipProps) => {
  if ((!isMobile && active && payload?.length) || (isMobile && selectedPoint)) {
    const data = isMobile ? selectedPoint! : payload![0].payload;

    return (
      <div className="bg-[--background] border border-[--border] rounded-lg p-3 shadow-lg whitespace-nowrap">
        <p className="font-medium flex items-center gap-1.5">
          <SetIcon
            set={data.expansion}
            size="2x"
            rarity={getRarity(data.event_type)}
          />
          {data.expansion} - {formatLabels[data.event_type] || data.event_type}
        </p>
        <p className="text-sm text-[--muted-foreground]">
          先手胜率: {(data.win_rate_on_play * 100).toFixed(1)}%
        </p>
        <p className="text-sm text-[--muted-foreground]">
          平均回合数: {formatToOneDecimal(data.average_game_length)}
        </p>
      </div>
    );
  }
  return null;
};

// 默认选中的赛制（移到组件外部，避免每次渲染都是新引用）
const defaultFormats = ['PremierDraft', 'PickTwoDraft', 'QuickDraft', 'Sealed', 'TradDraft', 'TradSealed'];

export function SpeedChart({ initialData }: SpeedChartProps) {
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const [selectedPoint, setSelectedPoint] = useState<SpeedData | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });
  const [tooltipAlign, setTooltipAlign] = useState<'center' | 'left' | 'right'>('center');

  // 获取所有可用的系列
  const allExpansions = useMemo(() => {
    return Array.from(new Set(initialData.map(item => item.expansion))).sort();
  }, [initialData]);

  // 从 localStorage 读取保存的选择
  const loadFromStorage = (key: string, defaultValue: string[], validValues?: string[]): string[] => {
    if (typeof window === 'undefined') return defaultValue;
    try {
      const stored = localStorage.getItem(key);
      if (stored) {
        const parsed = JSON.parse(stored);
        // 验证数据有效性，确保所有值都在可用列表中
        if (Array.isArray(parsed) && parsed.length > 0) {
          if (validValues) {
            // 验证值是否在有效列表中
            const valid = parsed.filter((item: string) => validValues.includes(item));
            return valid.length > 0 ? valid : defaultValue;
          }
          return parsed;
        }
      }
    } catch (e) {
      console.error(`Failed to load ${key} from localStorage:`, e);
    }
    return defaultValue;
  };

  // 初始化状态，从 localStorage 读取或使用默认值
  const [selectedExpansions, setSelectedExpansions] = useState<string[]>([]);
  const [selectedFormats, setSelectedFormats] = useState<string[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  // 用于跟踪上一次的 allExpansions 字符串，避免不必要的更新
  const prevAllExpansionsStrRef = useRef<string>('');

  // 保存到 localStorage
  const saveToStorage = (key: string, value: string[]) => {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(key, JSON.stringify(value));
    } catch (e) {
      console.error(`Failed to save ${key} to localStorage:`, e);
    }
  };

  // 初始化时从 localStorage 加载（只执行一次）
  useEffect(() => {
    if (allExpansions.length === 0 || isInitialized) return; // 等待 allExpansions 准备好，且只初始化一次
    
    const loadedExpansions = loadFromStorage(STORAGE_KEY_SELECTED_EXPANSIONS, allExpansions, allExpansions);
    const loadedFormats = loadFromStorage(STORAGE_KEY_SELECTED_FORMATS, defaultFormats, defaultFormats);
    
    // 在初始化时，同时设置 ref，避免后续的更新逻辑触发
    prevAllExpansionsStrRef.current = JSON.stringify(allExpansions);
    
    setSelectedExpansions(loadedExpansions);
    setSelectedFormats(loadedFormats);
    setIsInitialized(true);
  }, [allExpansions, isInitialized]);

  // 当选择改变时，保存到 localStorage（只在初始化完成后保存）
  useEffect(() => {
    if (!isInitialized) return;
    // 只要初始化完成，就保存用户的选择（包括空数组）
    saveToStorage(STORAGE_KEY_SELECTED_EXPANSIONS, selectedExpansions);
  }, [selectedExpansions, isInitialized]);

  useEffect(() => {
    if (!isInitialized) return;
    // 移除 length === 0 的检查，允许保存空数组
    saveToStorage(STORAGE_KEY_SELECTED_FORMATS, selectedFormats);
  }, [selectedFormats, isInitialized]);

  // 当所有系列列表更新时，更新选中状态（处理新系列添加的情况）
  // 只在初始化完成后执行，避免覆盖 localStorage 加载的值
  useEffect(() => {
    if (!isInitialized || allExpansions.length === 0) return;
    
    // 检查 allExpansions 是否真的变化了（通过字符串比较）
    const currentAllExpansionsStr = JSON.stringify(allExpansions);
    if (currentAllExpansionsStr === prevAllExpansionsStrRef.current) {
      // 没有变化，不执行更新
      return;
    }
    
    // 更新 ref
    prevAllExpansionsStrRef.current = currentAllExpansionsStr;
    
    // 如果有新的系列，添加到选中列表中
    setSelectedExpansions(prev => {
      if (prev.length === 0) return prev; // 如果还没初始化完成，不执行
      
      const newExpansions = allExpansions.filter(exp => !prev.includes(exp));
      if (newExpansions.length > 0) {
        // 有新系列，添加到选中列表
        return [...prev, ...newExpansions];
      } else {
        // 移除不再存在的系列，但保持其他选择不变
        const validExpansions = prev.filter(exp => allExpansions.includes(exp));
        // 只有当有无效系列被移除时才更新，否则保持原样
        if (validExpansions.length !== prev.length) {
          return validExpansions.length > 0 ? validExpansions : allExpansions;
        }
        return prev; // 没有变化，保持原样
      }
    });
  }, [allExpansions, isInitialized]);

  // 根据选择的系列和赛制筛选数据
  const filteredSpeedData = useMemo(() => {
    const filtered = initialData.filter(item => {
      const expansionMatch = selectedExpansions.includes(item.expansion);
      const formatMatch = selectedFormats.includes(item.event_type);
      return expansionMatch && formatMatch;
    });
    
    return filtered;
  }, [initialData, selectedExpansions, selectedFormats]);

  // 计算数据范围，用于优化图表显示
  const dataRange = useMemo(() => {
    if (filteredSpeedData.length === 0) {
      return {
        xMin: 0.48,
        xMax: 0.56,
        yMin: 6,
        yMax: 11,
        xTicks: [],
        yTicks: [],
      };
    }

    const xValues = filteredSpeedData.map(d => d.win_rate_on_play);
    const yValues = filteredSpeedData.map(d => d.average_game_length);
    
    const xMin = Math.min(...xValues);
    const xMax = Math.max(...xValues);
    const yMin = Math.min(...yValues);
    const yMax = Math.max(...yValues);
    
    // 添加5%的边距，但不要添加太多空白
    const xRange = xMax - xMin;
    const yRange = yMax - yMin;
    
    const finalXMin = Math.max(0.47, xMin - xRange * 0.05);
    const finalXMax = Math.min(0.57, xMax + xRange * 0.05);
    const finalYMin = Math.max(6, yMin - yRange * 0.05);
    const finalYMax = Math.min(11, yMax + yRange * 0.05);
    
    // 生成更多的刻度点（根据尺寸决定）
    const xStep = (finalXMax - finalXMin) / (isMobile ? 6 : 10);
    const yStep = (finalYMax - finalYMin) / (isMobile ? 6 : 8);
    
    const xTicks: number[] = [];
    const yTicks: number[] = [];
    
    // 生成X轴刻度
    for (let i = 0; i <= (isMobile ? 6 : 10); i++) {
      const tick = finalXMin + i * xStep;
      xTicks.push(Math.round(tick * 1000) / 1000); // 保留3位小数精度
    }
    
    // 生成Y轴刻度
    for (let i = 0; i <= (isMobile ? 6 : 8); i++) {
      const tick = finalYMin + i * yStep;
      yTicks.push(Math.round(tick * 10) / 10); // 保留1位小数
    }
    
    return {
      xMin: finalXMin,
      xMax: finalXMax,
      yMin: finalYMin,
      yMax: finalYMax,
      xTicks,
      yTicks,
    };
  }, [filteredSpeedData, isMobile]);

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
                ? { top: 10, right: 5, bottom: 40, left: 12 }
                : { top: 20, right: 20, bottom: 50, left: 50 }
              }
            >
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(128, 128, 128, 0.2)" />
              <XAxis 
                type="number"
                dataKey="win_rate_on_play"
                name="先手胜率"
                domain={[dataRange.xMin, dataRange.xMax]}
                ticks={dataRange.xTicks}
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
                domain={[dataRange.yMin, dataRange.yMax]}
                ticks={dataRange.yTicks}
                tickFormatter={(value) => formatToOneDecimal(value)}
                label={{ 
                  value: '平均回合数', 
                  angle: -90, 
                  position: 'left',
                  offset: isMobile ? 5 : 30,
                  style: { 
                    fill: 'var(--foreground)',
                    fontSize: isMobile ? 12 : 14
                  }
                }}
                tick={{ fontSize: isMobile ? 10 : 12 }}
                width={isMobile ? 40 : 50}
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