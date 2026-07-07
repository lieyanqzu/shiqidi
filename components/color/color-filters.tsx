'use client';

import type { ColorRatingParams } from "@/lib/api";
import { useEffect, useMemo, useRef, useState } from 'react';
import { useMediaQuery } from '@/hooks/use-media-query';
import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Popper } from "@/components/ui/popper";
import { parseISO } from 'date-fns';
import { toExpansionOptions, type PublicOptionsData } from "@/lib/options";
import { getFormatsForExpansion, getLiveExpansions, loadExpansionMetadata } from "@/lib/filter";

interface ColorFiltersProps {
  params: ColorRatingParams;
  onParamsChange: (params: Partial<ColorRatingParams>) => void;
  separateSplash: boolean;
  onSeparateSplashChange: (separate: boolean) => void;
  options: PublicOptionsData;
}

export function ColorFilters({
  params,
  onParamsChange,
  separateSplash,
  onSeparateSplashChange,
  options,
}: ColorFiltersProps) {
  const startDate = parseISO(params.start_date);
  const endDate = parseISO(params.end_date);
  const isMobile = useMediaQuery('(max-width: 1024px)');
  const [showFilters, setShowFilters] = useState(false);
  const [metadataVersion, setMetadataVersion] = useState(0);
  const filterButtonRef = useRef<HTMLButtonElement>(null);
  const expansionOptions = useMemo(() => toExpansionOptions(options.expansionOptions), [options.expansionOptions]);
  const formatOptions = options.formatOptions;
  const userGroupOptions = options.userGroupOptions;
  const liveExpansions = useMemo(() => {
    void metadataVersion;
    return new Set(getLiveExpansions());
  }, [metadataVersion]);

  useEffect(() => {
    loadExpansionMetadata()
      .then(() => setMetadataVersion(version => version + 1))
      .catch(error => console.error('加载筛选元数据失败:', error));
  }, []);

  const expansionGroups = useMemo(() => {
    const activeOptions = expansionOptions.filter(option => liveExpansions.has(option.value));
    const inactiveOptions = expansionOptions.filter(option => !liveExpansions.has(option.value));

    return [
      { label: '进行中', options: activeOptions },
      { label: '未进行', options: inactiveOptions },
    ];
  }, [expansionOptions, liveExpansions]);

  // 根据选择的系列获取可用的赛制
  const availableFormats = useMemo(() => {
    void metadataVersion;
    const formats = getFormatsForExpansion(params.expansion);
    return formatOptions.filter(option => formats.includes(option.value));
  }, [formatOptions, params.expansion, metadataVersion]);

  // 当系列变化时，检查当前赛制是否可用，不可用则选第一个
  const handleExpansionChange = (expansion: string) => {
    const formats = getFormatsForExpansion(expansion);
    const newParams: Partial<ColorRatingParams> = { expansion };

    if (!formats.includes(params.event_type) && formats.length > 0) {
      const firstAvailableFormat = formatOptions.find(option => formats.includes(option.value));
      if (firstAvailableFormat) {
        newParams.event_type = firstAvailableFormat.value;
      } else {
        newParams.event_type = formats[0];
      }
    }

    onParamsChange(newParams);
  };

  // 移动端临时状态
  const [tempParams, setTempParams] = useState<ColorRatingParams>(params);

  const handleConfirm = () => {
    const hasParamsChanged = Object.entries(tempParams).some(([key, value]) => {
      return params[key as keyof ColorRatingParams] !== value;
    });

    if (hasParamsChanged) {
      onParamsChange(tempParams);
    }

    setShowFilters(false);
  };

  const handleOpenFilters = () => {
    if (showFilters) {
      setShowFilters(false);
    } else {
      setTempParams(params);
      setShowFilters(true);
    }
  };

  // 混色开关
  const SplashSwitch = ({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) => (
    <label className="flex items-center gap-2 cursor-pointer select-none whitespace-nowrap">
      <span className="text-sm text-[--component-foreground-muted]">区分混色</span>
      <button
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${checked ? 'bg-[--primary]' : 'bg-[--border]'}`}
      >
        <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${checked ? 'translate-x-4' : 'translate-x-0.5'}`} />
      </button>
    </label>
  );

  return (
    <div className="space-y-4">
      {/* 移动端：系列、区分混色和筛选按钮 */}
      {isMobile ? (
        <div className="flex items-center gap-2">
          <Select
            groups={expansionGroups}
            value={params.expansion}
            onChange={(e) => handleExpansionChange(e.target.value)}
            title="系列"
            className="w-32 shrink-0"
          />
          <SplashSwitch checked={separateSplash} onChange={onSeparateSplashChange} />
          <button
            ref={filterButtonRef}
            onClick={handleOpenFilters}
            className={`
              p-2 rounded-md transition-colors shrink-0 ml-auto
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
          {/* 桌面端：单行筛选，区分混色靠右 */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-4">
            <Select
              groups={expansionGroups}
              value={params.expansion}
              onChange={(e) => handleExpansionChange(e.target.value)}
              title="系列"
              className="w-32 shrink-0"
            />
            <Select
              options={availableFormats}
              value={params.event_type}
              onChange={(e) => onParamsChange({ event_type: e.target.value })}
              title="模式"
              className="w-auto sm:min-w-[140px] shrink-0"
            />
            <Select
              options={userGroupOptions}
              value={params.user_group || ""}
              onChange={(e) => onParamsChange({ user_group: e.target.value })}
              title="用户组"
              className="w-auto sm:min-w-[100px] shrink-0"
            />
            <DateRangePicker
              startDate={startDate}
              endDate={endDate}
              onStartDateChange={(date) => onParamsChange({ start_date: date.toISOString().split('T')[0] })}
              onEndDateChange={(date) => onParamsChange({ end_date: date.toISOString().split('T')[0] })}
            />
            <div className="ml-auto">
              <SplashSwitch checked={separateSplash} onChange={onSeparateSplashChange} />
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
              value={tempParams.event_type}
              onChange={(e) => setTempParams({ ...tempParams, event_type: e.target.value })}
              title="模式"
              className="w-full"
            />

            <Select
              options={userGroupOptions}
              value={tempParams.user_group || ""}
              onChange={(e) => setTempParams({ ...tempParams, user_group: e.target.value })}
              title="用户组"
              className="w-full"
            />

            <div className="flex justify-end">
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
