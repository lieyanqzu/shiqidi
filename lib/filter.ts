import filterData from '@/data/filter.json';

export interface ExpansionMetadata {
  colors: (string | null)[];
  expansions: string[];
  formats: string[];
  formats_by_expansion: Record<string, string[]>;
  live_formats_by_expansion: Record<string, string[]>;
  groups: (string | null)[];
  ranked_formats: string[];
  start_dates: Record<string, string>;
}

// 懒加载元数据
let cachedMetadata: ExpansionMetadata | null = null;

function getMetadata(): ExpansionMetadata {
  if (!cachedMetadata) {
    // 使用 ES6 import 加载 JSON
    cachedMetadata = filterData as ExpansionMetadata;
  }
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

