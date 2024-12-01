import type { CardData } from "@/types/card";

export interface Stats {
  rank: number;
  total: number;
  value: number;
  zScore: number;
  mean: number;
  stdDev: number;
}

// 计算平均值
function calculateMean(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

// 计算标准差
function calculateStdDev(values: number[], mean: number): number {
  if (values.length === 0) return 0;
  const squareDiffs = values.map(value => Math.pow(value - mean, 2));
  const avgSquareDiff = calculateMean(squareDiffs);
  return Math.sqrt(avgSquareDiff);
}

// 计算Z分数
function calculateZScore(value: number, mean: number, stdDev: number): number {
  if (stdDev === 0) return 0;
  return (value - mean) / stdDev;
}

// 计算排名（从高到低，或从低到高）
function calculateRank(value: number, values: number[], isLowerBetter: boolean = false): number {
  const sortedValues = [...values].sort((a, b) => isLowerBetter ? a - b : b - a);
  return sortedValues.indexOf(value) + 1;
}

// 从卡牌数据中提取有效数值
function extractValidValues(cards: CardData[], key: keyof CardData): number[] {
  return cards
    .map(card => card[key])
    .filter((value): value is number => 
      value !== null && 
      typeof value === 'number' && 
      !isNaN(value) &&
      isFinite(value)
    );
}

// 计算统计数据
export function calculateStats(cards: CardData[], key: keyof CardData, value: number | null): Stats | null {
  if (value === null || typeof value !== 'number' || isNaN(value) || !isFinite(value)) {
    return null;
  }

  const validValues = extractValidValues(cards, key);
  if (validValues.length === 0) {
    return null;
  }

  const isLowerBetter = key === 'avg_seen' || key === 'avg_pick';
  const mean = calculateMean(validValues);
  const stdDev = calculateStdDev(validValues, mean);
  const zScore = calculateZScore(value, mean, stdDev);
  const rank = calculateRank(value, validValues, isLowerBetter);

  return {
    rank,
    total: validValues.length,
    value,
    zScore,
    mean,
    stdDev,
  };
} 