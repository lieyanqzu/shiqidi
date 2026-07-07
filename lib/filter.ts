import { fetchPublicJson } from '@/lib/public-data-client';

export interface ExpansionMetadata {
  colors: (string | null)[];
  expansions: string[];
  formats: string[];
  formats_by_expansion: Record<string, string[]>;
  live_formats_by_expansion: Record<string, string[]>;
  groups: (string | null)[];
  ranked_formats: string[];
  start_dates: Record<string, string>;
  time_periods: Record<string, string[]>;
}

// 懒加载元数据
let cachedMetadata: ExpansionMetadata | null = null;

function getMetadata(): ExpansionMetadata {
  if (!cachedMetadata) {
    cachedMetadata = {
      colors: [],
      expansions: [],
      formats: [],
      formats_by_expansion: {},
      live_formats_by_expansion: {},
      groups: [],
      ranked_formats: [],
      start_dates: {},
      time_periods: {},
    };
  }
  return cachedMetadata;
}

export async function loadExpansionMetadata(): Promise<ExpansionMetadata> {
  cachedMetadata = await fetchPublicJson<ExpansionMetadata>('filter.json');
  return cachedMetadata;
}

// 获取系列支持的赛制列表
export function getFormatsForExpansion(expansion: string): string[] {
  const data = getMetadata();
  return data.formats_by_expansion[expansion] || [];
}

// 获取系列的起始日期
export function getStartDateForExpansion(expansion: string): string | null {
  const data = getMetadata();
  return data.start_dates[expansion] || null;
}

// 获取系列支持的时间段列表
// 17lands 卡牌数据 API 已用 time_period 替代 start_date/end_date。
// 元数据中按系列提供了可用时间段，未配置时回退到通用列表（key 为空字符串）。
export function getTimePeriodsForExpansion(expansion: string): string[] {
  const data = getMetadata();
  return data.time_periods?.[expansion]
    || data.time_periods?.['']
    || [];
}

// 获取所有系列列表
export function getAllExpansions(): string[] {
  const data = getMetadata();
  return data.expansions;
}

// 获取所有赛制列表
export function getAllFormats(): string[] {
  const data = getMetadata();
  return data.formats;
}

// 检查系列是否支持某个赛制
export function isFormatSupportedByExpansion(expansion: string, format: string): boolean {
  const formats = getFormatsForExpansion(expansion);
  return formats.includes(format);
}

// 获取当前进行中的系列列表
export function getLiveExpansions(): string[] {
  const data = getMetadata();
  return Object.keys(data.live_formats_by_expansion || {});
}

// 获取所有排位赛制
export function getRankedFormats(): string[] {
  const data = getMetadata();
  return data.ranked_formats;
}

// 获取所有颜色选项
export function getAllColors(): (string | null)[] {
  const data = getMetadata();
  return data.colors;
}

// 获取所有分组
export function getAllGroups(): (string | null)[] {
  const data = getMetadata();
  return data.groups;
}

export function getExpansionMetadata(): ExpansionMetadata {
  return getMetadata();
}
