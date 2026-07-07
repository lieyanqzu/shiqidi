import type { ColorRatingRow } from "@/types/color";

// 色组名称中文映射
const colorNames: Record<string, string> = {
  W: '白',
  U: '蓝',
  B: '黑',
  R: '红',
  G: '绿',
  C: '无色',
};

// 汇总行标题映射
const summaryLabels: Record<string, string> = {
  1: '单色',
  '1+': '单色混色',
  2: '双色',
  '2+': '双色混色',
  3: '三色',
  '3+': '三色混色',
  4: '四色',
  '4+': '四色混色',
  5: '五色',
  All: '全部套牌',
  'Mono-color': '单色',
  'Mono-color + Splash': '单色混色',
  'Two-color': '双色',
  'Two-color + Splash': '双色混色',
  'Three-color': '三色',
  'Three-color + Splash': '三色混色',
  'Four-color': '四色',
  'Four-color + Splash': '四色混色',
  'Five-color': '五色',
  'All Decks': '全部套牌',
};

// 处理后的色组行
export interface ColorRow {
  key: string;
  colorName: string;
  shortName: string;
  title: string;
  colorSymbolText: string;
  wins: number;
  games: number;
  winsText: string;
  gamesText: string;
  winRate: number;
  winRateText: string;
}

// 处理后的色组分组
export interface ColorGroup {
  key: string;
  title: string;
  gamesText: string;
  winsText: string;
  winRateText: string;
  rows: ColorRow[];
}

// 计算胜率
function getWinRate(row: ColorRatingRow): number {
  const games = Number(row.games || 0);
  return games ? Number(row.wins || 0) / games : 0;
}

// 格式化百分比
function formatPercent(value: number): string {
  if (!Number.isFinite(value)) return '-';
  return `${(value * 100).toFixed(1)}%`;
}

// 格式化数字
function formatNumber(value: number): string {
  if (!Number.isFinite(value)) return '-';
  return Math.round(value).toLocaleString('zh-CN');
}

// 从短名提取色符号文本（仅保留 WUBRGC）
export function getColorSymbolText(shortName: string | undefined): string {
  return String(shortName || '').replace(/[^WUBRGC]/g, '');
}

// 根据短名生成色组标题，如 "WU" -> "白蓝"，"WU+" -> "白蓝混色"
function getColorTitle(shortName: string | undefined, fallback: string | undefined): string {
  const text = String(shortName || '');
  const colorText = text.replace(/[^WUBRGC]/g, '');
  if (!colorText || /^\d+$/.test(colorText)) return fallback || '';
  const title = colorText.split('').map((symbol) => colorNames[symbol] || symbol).join('');
  return text.includes('+') ? `${title}混色` : title;
}

// 获取汇总行标题
function getSummaryTitle(row: ColorRatingRow): string {
  return summaryLabels[String(row.short_name)] || summaryLabels[row.color_name || ''] || row.color_name || '色组';
}

// 装饰单行色组数据
function decorateColorRow(row: ColorRatingRow, index: number): ColorRow {
  const shortName = String(row.short_name || '');
  const colorSymbolText = getColorSymbolText(shortName);
  const games = Number(row.games || 0);
  const wins = Number(row.wins || 0);
  const winRate = getWinRate(row);
  return {
    key: `${index}-${shortName || row.color_name}`,
    colorName: row.color_name || shortName,
    shortName,
    title: getColorTitle(shortName, row.color_name),
    colorSymbolText,
    wins,
    games,
    winsText: formatNumber(wins),
    gamesText: formatNumber(games),
    winRate,
    winRateText: formatPercent(winRate),
  };
}

// 将原始行列表构建为分组结构
// 17lands 返回的数据按汇总行（is_summary=true）分节，每个汇总行后跟该类别下的具体色组
export function buildColorGroups(rows: ColorRatingRow[] | null | undefined): ColorGroup[] {
  const groups: ColorGroup[] = [];
  let currentGroup: ColorGroup | null = null;

  (rows || []).forEach((row, index) => {
    if (row.is_summary) {
      const winRate = getWinRate(row);
      currentGroup = {
        key: `summary-${row.short_name || row.color_name}`,
        title: getSummaryTitle(row),
        gamesText: formatNumber(Number(row.games || 0)),
        winsText: formatNumber(Number(row.wins || 0)),
        winRateText: formatPercent(winRate),
        rows: [],
      };
      groups.push(currentGroup);
      return;
    }

    if (!currentGroup) {
      currentGroup = {
        key: 'summary-other',
        title: '色组',
        gamesText: '-',
        winsText: '-',
        winRateText: '-',
        rows: [],
      };
      groups.push(currentGroup);
    }
    currentGroup.rows.push(decorateColorRow(row, index));
  });

  return groups
    .filter((group) => group.rows.length)
    .map((group) => ({
      ...group,
      // 组内按胜率降序，胜率相同按对局数降序
      rows: group.rows.slice().sort((left, right) => {
        if (right.winRate !== left.winRate) return right.winRate - left.winRate;
        return right.games - left.games;
      }),
    }));
}
