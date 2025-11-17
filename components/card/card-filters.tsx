'use client';

import { Input } from "@/components/ui/input";
import type { CardDataParams } from "@/lib/api";
import { useState, useRef, useMemo } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Popper } from "@/components/ui/popper";
import { parseISO } from 'date-fns';
import { 
  expansionOptions, 
  formatOptions, 
  userGroupOptions, 
  deckColorOptions, 
  cardColorOptions, 
  rarityOptions 
} from "@/lib/options";
import { getFormatsForExpansion, getStartDateForExpansion, getLiveExpansions } from "@/lib/filter";

interface CardFiltersProps {
  params: CardDataParams;
  onParamsChange: (params: Partial<CardDataParams>) => void;
  onColorFilter: (colors: string[]) => void;
  selectedColors: string[];
  onRarityFilter: (rarities: string[]) => void;
  selectedRarities: string[];
  onSearchFilter: (search: string) => void;
  searchText: string;
}

export function CardFilters({ 
  params, 
  onParamsChange,
  onColorFilter,
  selectedColors,
  onRarityFilter,
  selectedRarities,
  onSearchFilter,
  searchText,
}: CardFiltersProps) {
  const startDate = parseISO(params.start_date);
  const endDate = parseISO(params.end_date);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [showFilters, setShowFilters] = useState(false);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const liveExpansions = useMemo(() => new Set(getLiveExpansions()), []);

  const expansionGroups = useMemo(() => {
    const activeOptions = expansionOptions.filter(option => liveExpansions.has(option.value));
    const inactiveOptions = expansionOptions.filter(option => !liveExpansions.has(option.value));

    return [
      { label: '进行中', options: activeOptions },
      { label: '未进行', options: inactiveOptions },
    ];
  }, [liveExpansions]);

  // 根据选择的系列获取可用的赛制
  const availableFormats = useMemo(() => {
    const formats = getFormatsForExpansion(params.expansion);
    // 将赛制代码转换为选项格式，并只保留在formatOptions中有定义的
    return formatOptions.filter(option => formats.includes(option.value));
  }, [params.expansion]);

  // 当系列变化时，检查当前选择的赛制是否可用，如果不可用则选择第一个可用的赛制
  const handleExpansionChange = (expansion: string) => {
    const formats = getFormatsForExpansion(expansion);
    const newParams: Partial<CardDataParams> = { expansion };
    
    // 如果当前赛制不在新系列的可用赛制列表中，选择第一个可用的赛制
    if (!formats.includes(params.format) && formats.length > 0) {
      // 优先选择在 formatOptions 中定义的第一个可用赛制
      const firstAvailableFormat = formatOptions.find(option => formats.includes(option.value));
      if (firstAvailableFormat) {
        newParams.format = firstAvailableFormat.value;
      } else {
        newParams.format = formats[0];
      }
    }
    
    // 获取系列的起始日期
    const startDate = getStartDateForExpansion(expansion);
    if (startDate) {
      newParams.start_date = startDate.split('T')[0];
    }
    
    onParamsChange(newParams);
  };

  // 移动端临时筛选状态
  const [tempParams, setTempParams] = useState<CardDataParams>(params);
  const [tempColors, setTempColors] = useState<string[]>(selectedColors);
  const [tempRarities, setTempRarities] = useState<string[]>(selectedRarities);

  // 处理移动端确认
  const handleConfirm = () => {
    // 检查除了颜色和稀有度之外的参数是否有变化
    const hasParamsChanged = Object.entries(tempParams).some(([key, value]) => {
      return params[key as keyof CardDataParams] !== value;
    });

    // 如果有参数变化，才调用 onParamsChange
    if (hasParamsChanged) {
      onParamsChange(tempParams);
    }

    // 颜色和稀有度的变化不会触发数据重新获取
    onColorFilter(tempColors);
    onRarityFilter(tempRarities);
    setShowFilters(false);
  };

  // 每次打开筛选面板时，初始化临时状态
  const handleOpenFilters = () => {
    if (showFilters) {
      // 如果已经打开，则关闭
      setShowFilters(false);
    } else {
      // 如果关闭，则打开并初始化临时状态
      setTempParams(params);
      setTempColors(selectedColors);
      setTempRarities(selectedRarities);
      setShowFilters(true);
    }
  };

  return (
    <div className="space-y-4">
      {/* 移动端：搜索、系列和筛选按钮 */}
      {isMobile ? (
        <div className="flex items-center gap-2">
          <Input
            placeholder="搜索卡牌名称..."
            value={searchText}
            onChange={(e) => onSearchFilter(e.target.value)}
            className="flex-1"
          />
          <Select
            groups={expansionGroups}
            value={params.expansion}
            onChange={(e) => handleExpansionChange(e.target.value)}
            title="系列"
            className="w-32 shrink-0"
          />
          <button
            ref={filterButtonRef}
            onClick={handleOpenFilters}
            className={`
              p-2 rounded-md transition-colors shrink-0
              ${showFilters 
                ? 'bg-[--primary] text-white' 
                : 'bg-[--component-background] hover:bg-[--component-background-hover]'}
            `}
            aria-label="显示筛选选项"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-5 h-5">
              <path d="M10 3.75a2 2 0 10-4 0 2 2 0 004 0zM17.25 4.5a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM5 3.75a.75.75 0 01-.75.75h-1.5a.75.75 0 010-1.5h1.5a.75.75 0 01.75.75zM4.25 17a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM17.25 17a.75.75 0 000-1.5h-5.5a.75.75 0 000 1.5h5.5zM9 10a.75.75 0 01-.75.75h-5.5a.75.75 0 010-1.5h5.5A.75.75 0 019 10zM17.25 10.75a.75.75 0 000-1.5h-1.5a.75.75 0 000 1.5h1.5zM14 10a2 2 0 10-4 0 2 2 0 004 0zM10 16.25a2 2 0 10-4 0 2 2 0 004 0z" />
            </svg>
          </button>
        </div>
      ) : (
        <>
          {/* 桌面端：第一行 - 搜索和时间范围 */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Input
              placeholder="搜索卡牌名称..."
              value={searchText}
              onChange={(e) => onSearchFilter(e.target.value)}
              className="w-full sm:w-64"
            />
            <div className="w-full sm:w-auto">
              <DateRangePicker
                startDate={startDate}
                endDate={endDate}
                onStartDateChange={(date) => onParamsChange({ start_date: date.toISOString().split('T')[0] })}
                onEndDateChange={(date) => onParamsChange({ end_date: date.toISOString().split('T')[0] })}
              />
            </div>
          </div>

          {/* 桌面端：第二行 - 其他筛选选项 */}
          <div className="flex flex-wrap gap-2 sm:gap-4">
            <Select
              groups={expansionGroups}
              value={params.expansion}
              onChange={(e) => handleExpansionChange(e.target.value)}
              title="系列"
              className="w-full sm:w-32 shrink-0"
            />
            <Select
              options={availableFormats}
              value={params.format}
              onChange={(e) => onParamsChange({ format: e.target.value })}
              title="模式"
              className="w-full sm:w-auto sm:min-w-[140px]"
            />
            <Select
              options={userGroupOptions}
              value={params.user_group}
              onChange={(e) => onParamsChange({ user_group: e.target.value })}
              title="用户组"
              className="w-full sm:w-auto sm:min-w-[100px]"
            />
            <Select
              options={deckColorOptions}
              value={params.colors || ""}
              onChange={(e) => onParamsChange({ colors: e.target.value })}
              title="套牌颜色"
              className="w-full sm:w-auto sm:min-w-[120px]"
            />
            <div className="flex items-center gap-2">
              <span className="text-sm text-[--component-foreground-muted] whitespace-nowrap">卡牌颜色:</span>
              <div className="flex gap-1">
                {cardColorOptions.map((color) => (
                  <button
                    key={color.value}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      card-symbol-${color.value}
                      bg-no-repeat bg-[length:100%_100%]
                      ${selectedColors.includes(color.value) 
                        ? 'ring-2 ring-[#FFB000] ring-opacity-80' 
                        : 'hover:ring-2 hover:ring-[#FFB000] hover:ring-opacity-50 brightness-75'}
                      bg-[--component-background] hover:bg-[--component-background-hover]
                      transition-all
                    `}
                    onClick={() => {
                      const newColors = selectedColors.includes(color.value)
                        ? selectedColors.filter(c => c !== color.value)
                        : [...selectedColors, color.value];
                      onColorFilter(newColors);
                    }}
                  />
                ))}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-sm text-[--component-foreground-muted] whitespace-nowrap">稀有度:</span>
              <div className="flex gap-1">
                {rarityOptions.map((rarity) => {
                  const expansion = params.expansion;
                  const processedSet = expansion.toLowerCase().startsWith('y') 
                    ? `y${expansion.slice(expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase() 
                    : expansion.toLowerCase();
                  return (
                    <button
                      key={rarity.value}
                      className={`
                        w-8 h-8 rounded-full flex items-center justify-center
                        ${selectedRarities.includes(rarity.value)
                          ? 'ring-2 ring-[#FFB000] ring-opacity-80' 
                          : 'hover:ring-2 hover:ring-[#FFB000] hover:ring-opacity-50 brightness-75'}
                        transition-all
                      `}
                      onClick={() => {
                        const newRarities = selectedRarities.includes(rarity.value)
                          ? selectedRarities.filter(r => r !== rarity.value)
                          : [...selectedRarities, rarity.value];
                        onRarityFilter(newRarities);
                      }}
                      title={rarity.label}
                    >
                      <i 
                        className={`keyrune ss ss-${processedSet} ss-${rarity.value} ss-2x`}
                        aria-hidden="true"
                        style={{ backgroundColor: 'transparent' }}
                      />
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 移动端筛选 Popper */}
      {isMobile && (
        <Popper
          open={showFilters}
          onClose={() => setShowFilters(false)}
          anchor={filterButtonRef.current}
        >
          <div className="space-y-4">
            <DateRangePicker
              startDate={parseISO(tempParams.start_date)}
              endDate={parseISO(tempParams.end_date)}
              onStartDateChange={(date) => setTempParams({ 
                ...tempParams, 
                start_date: date.toISOString().split('T')[0] 
              })}
              onEndDateChange={(date) => setTempParams({ 
                ...tempParams, 
                end_date: date.toISOString().split('T')[0] 
              })}
            />
            
            <Select
              options={availableFormats}
              value={tempParams.format}
              onChange={(e) => setTempParams({ ...tempParams, format: e.target.value })}
              title="模式"
              className="w-full"
            />
            
            <Select
              options={userGroupOptions}
              value={tempParams.user_group}
              onChange={(e) => setTempParams({ ...tempParams, user_group: e.target.value })}
              title="用户组"
              className="w-full"
            />
            
            <Select
              options={deckColorOptions}
              value={tempParams.colors || ""}
              onChange={(e) => setTempParams({ ...tempParams, colors: e.target.value })}
              title="套牌颜色"
              className="w-full"
            />
            
            <div className="space-y-2">
              <span className="text-sm text-[--component-foreground-muted] whitespace-nowrap">卡牌颜色:</span>
              <div className="flex flex-wrap gap-1">
                {cardColorOptions.map((color) => (
                  <button
                    key={color.value}
                    className={`
                      w-8 h-8 rounded-full flex items-center justify-center
                      card-symbol-${color.value}
                      bg-no-repeat bg-[length:100%_100%]
                      ${tempColors.includes(color.value) 
                        ? 'ring-2 ring-[#FFB000] ring-opacity-80' 
                        : 'hover:ring-2 hover:ring-[#FFB000] hover:ring-opacity-50 brightness-75'}
                      bg-[--component-background] hover:bg-[--component-background-hover]
                      transition-all
                    `}
                    onClick={() => {
                      const newColors = tempColors.includes(color.value)
                        ? tempColors.filter(c => c !== color.value)
                        : [...tempColors, color.value];
                      setTempColors(newColors);
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex items-end justify-between gap-2">
              <div className="flex-1 space-y-2">
                <span className="text-sm text-[--component-foreground-muted] whitespace-nowrap">稀有度:</span>
                <div className="flex flex-wrap gap-1">
                  {rarityOptions.map((rarity) => {
                    const expansion = params.expansion;
                    const processedSet = expansion.toLowerCase().startsWith('y') 
                      ? `y${expansion.slice(expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase() 
                      : expansion.toLowerCase();
                    return (
                      <button
                        key={rarity.value}
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          ${tempRarities.includes(rarity.value)
                            ? 'ring-2 ring-[#FFB000] ring-opacity-80' 
                            : 'hover:ring-2 hover:ring-[#FFB000] hover:ring-opacity-50 brightness-75'}
                          transition-all
                        `}
                        onClick={() => {
                          const newRarities = tempRarities.includes(rarity.value)
                            ? tempRarities.filter(r => r !== rarity.value)
                            : [...tempRarities, rarity.value];
                          setTempRarities(newRarities);
                        }}
                        title={rarity.label}
                      >
                        <i 
                          className={`keyrune ss ss-${processedSet} ss-${rarity.value} ss-2x`}
                          aria-hidden="true"
                          style={{ backgroundColor: 'transparent' }}
                        />
                      </button>
                    );
                  })}
                </div>
              </div>
              <button
                onClick={handleConfirm}
                className="px-4 py-2 bg-[--primary] text-white rounded-md hover:bg-[--primary]/90 transition-colors shrink-0"
              >
                确定
              </button>
            </div>
          </div>
        </Popper>
      )}
    </div>
  );
} 