import type { CardData } from "@/types/card";

// 评分等级定义
export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' | '-';

// 评分指标类型
export type GradeMetric = 'ever_drawn_win_rate' | 'opening_hand_win_rate' | 'drawn_win_rate' | 'drawn_improvement_win_rate';

// 评分指标选项
export const GRADE_METRICS = [
  {
    value: 'ever_drawn_win_rate' as GradeMetric,
    label: '在手胜率（起手或抽到）',
    shortLabel: '在手胜率',
    englishShortLabel: 'GIH WR'
  },
  {
    value: 'opening_hand_win_rate' as GradeMetric,
    label: '起手胜率',
    shortLabel: '起手胜率',
    englishShortLabel: 'OH WR'
  },
  {
    value: 'drawn_win_rate' as GradeMetric,
    label: '抽到胜率（第一回合或之后）',
    shortLabel: '抽到胜率',
    englishShortLabel: 'GD WR'
  },
  {
    value: 'drawn_improvement_win_rate' as GradeMetric,
    label: '在手胜率提升',
    shortLabel: '在手胜率提升',
    englishShortLabel: 'IIH'
  }
] as const;

// 评分等级映射（基于标准差）
// 正态分布以 C 为中心（C 本身跨越 0.33 SD，从 -0.165 到 +0.165）
// 每个半级（如 C 到 C+）代表 0.33 标准差的间隔
const GRADE_THRESHOLDS = [
  { grade: 'A+' as Grade, minStdDev: 2.145 },     // > 2.145 SD
  { grade: 'A' as Grade, minStdDev: 1.815 },      // 1.815 - 2.145 SD
  { grade: 'A-' as Grade, minStdDev: 1.485 },     // 1.485 - 1.815 SD
  { grade: 'B+' as Grade, minStdDev: 1.155 },     // 1.155 - 1.485 SD
  { grade: 'B' as Grade, minStdDev: 0.825 },      // 0.825 - 1.155 SD
  { grade: 'B-' as Grade, minStdDev: 0.495 },     // 0.495 - 0.825 SD
  { grade: 'C+' as Grade, minStdDev: 0.165 },     // 0.165 - 0.495 SD
  { grade: 'C' as Grade, minStdDev: -0.165 },     // -0.165 - 0.165 SD (均值 0 在此)
  { grade: 'C-' as Grade, minStdDev: -0.495 },    // -0.495 - -0.165 SD
  { grade: 'D+' as Grade, minStdDev: -0.825 },    // -0.825 - -0.495 SD
  { grade: 'D' as Grade, minStdDev: -1.155 },     // -1.155 - -0.825 SD
  { grade: 'D-' as Grade, minStdDev: -1.485 },    // -1.485 - -1.155 SD
  { grade: 'F' as Grade, minStdDev: -Infinity },  // < -1.485 SD
  { grade: '-' as Grade, minStdDev: -Infinity },  // No data
];

// 计算标准差和均值
function calculateStats(values: number[]): { mean: number; stdDev: number } {
  if (values.length === 0) {
    return { mean: 0, stdDev: 0 };
  }

  const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
  const variance = values.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0) / values.length;
  const stdDev = Math.sqrt(variance);

  return { mean, stdDev };
}

// 根据标准差获取评分
function getGradeFromStdDev(stdDevFromMean: number): Grade {
  for (const threshold of GRADE_THRESHOLDS) {
    if (stdDevFromMean >= threshold.minStdDev) {
      return threshold.grade;
    }
  }
  return 'F';
}

// 为所有卡牌计算评分
export interface CardWithGrade extends CardData {
  grade: Grade;
  stdDevFromMean: number;
  metricValue: number;
  hasData: boolean;
}

export function calculateGrades(
  cards: CardData[],
  metric: GradeMetric
): CardWithGrade[] {
  // 分离有数据和无数据的卡牌
  const validCards = cards.filter(card => {
    const value = card[metric];
    return value !== undefined && value !== null && !isNaN(value);
  });

  const noDataCards = cards.filter(card => {
    const value = card[metric];
    return value === undefined || value === null || isNaN(value);
  });

  const cardsWithGrades: CardWithGrade[] = [];

  // 处理有数据的卡牌
  if (validCards.length > 0) {
    // 提取指标值
    const values = validCards.map(card => card[metric] as number);

    // 计算统计数据
    const { mean, stdDev } = calculateStats(values);

    // 为每张卡分配评分
    validCards.forEach(card => {
      const metricValue = card[metric] as number;
      const stdDevFromMean = stdDev > 0 ? (metricValue - mean) / stdDev : 0;
      const grade = getGradeFromStdDev(stdDevFromMean);

      cardsWithGrades.push({
        ...card,
        grade,
        stdDevFromMean,
        metricValue,
        hasData: true
      });
    });
  }

  // 处理无数据的卡牌，赋予 '-' 等级
  noDataCards.forEach(card => {
    cardsWithGrades.push({
      ...card,
      grade: '-' as Grade,
      stdDevFromMean: 0,
      metricValue: 0,
      hasData: false
    });
  });

  return cardsWithGrades;
}


// 按评分分组卡牌
export interface GradeGroup {
  grade: Grade;
  cards: CardWithGrade[];
}

export function groupCardsByGrade(cards: CardWithGrade[]): GradeGroup[] {
  const gradeMap = new Map<Grade, CardWithGrade[]>();

  // 初始化所有评分组
  GRADE_THRESHOLDS.forEach(({ grade }) => {
    gradeMap.set(grade, []);
  });

  // 分配卡牌到对应评分组
  cards.forEach(card => {
    const existing = gradeMap.get(card.grade) || [];
    existing.push(card);
    gradeMap.set(card.grade, existing);
  });

  // 转换为数组并过滤空组
  return Array.from(gradeMap.entries())
    .map(([grade, cards]) => ({ grade, cards }))
    .filter(group => group.cards.length > 0);
}


