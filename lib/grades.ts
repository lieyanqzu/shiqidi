import type { CardData } from "@/types/card";

// 评分等级定义
export type Grade = 'A+' | 'A' | 'A-' | 'B+' | 'B' | 'B-' | 'C+' | 'C' | 'C-' | 'D+' | 'D' | 'D-' | 'F' | '-';

// 评分指标类型
export type GradeMetric = 'ever_drawn_win_rate' | 'opening_hand_win_rate' | 'drawn_win_rate' | 'drawn_improvement_win_rate' | 'custom';

// 自定义指标配置
export interface CustomMetricConfig {
  formula: string;              // 计算公式，例如 "win_rate * 0.7 + play_rate * 0.3"
  stdDevPerHalfGrade: number;    // 每个半级的标准差间隔，默认 0.33
}

// 获取默认的自定义指标配置
export function getDefaultCustomMetricConfig(): CustomMetricConfig {
  return {
    formula: 'ever_drawn_win_rate',
    stdDevPerHalfGrade: 0.33
  };
}

// 从 localStorage 加载自定义指标配置
export function loadCustomMetricConfig(): CustomMetricConfig | null {
  try {
    const saved = localStorage.getItem('customMetricConfig');
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load custom metric config:', e);
  }
  return null;
}

// 保存自定义指标配置到 localStorage
export function saveCustomMetricConfig(config: CustomMetricConfig): void {
  try {
    localStorage.setItem('customMetricConfig', JSON.stringify(config));
  } catch (e) {
    console.error('Failed to save custom metric config:', e);
  }
}

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
  },
  {
    value: 'custom' as GradeMetric,
    label: '自定义指标',
    shortLabel: '自定义',
    englishShortLabel: 'Custom'
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
function getGradeFromStdDev(stdDevFromMean: number, stdDevPerHalfGrade: number = 0.33): Grade {
  // 计算自定义阈值或使用默认阈值
  const thresholds = generateGradeThresholds(stdDevPerHalfGrade);
  
  for (const threshold of thresholds) {
    if (stdDevFromMean >= threshold.minStdDev) {
      return threshold.grade;
    }
  }
  return 'F';
}

// 生成评分阈值（基于标准差间隔）
function generateGradeThresholds(stdDevPerHalfGrade: number): Array<{ grade: Grade; minStdDev: number }> {
  const centerOffset = stdDevPerHalfGrade / 2;  // C 等级的中心偏移（0.165 for 0.33）
  
  return [
    { grade: 'A+' as Grade, minStdDev: centerOffset + stdDevPerHalfGrade * 6 },     // 0.165 + 0.33 * 6 = 2.145
    { grade: 'A' as Grade, minStdDev: centerOffset + stdDevPerHalfGrade * 5 },      // 0.165 + 0.33 * 5 = 1.815
    { grade: 'A-' as Grade, minStdDev: centerOffset + stdDevPerHalfGrade * 4 },     // 0.165 + 0.33 * 4 = 1.485
    { grade: 'B+' as Grade, minStdDev: centerOffset + stdDevPerHalfGrade * 3 },     // 0.165 + 0.33 * 3 = 1.155
    { grade: 'B' as Grade, minStdDev: centerOffset + stdDevPerHalfGrade * 2 },       // 0.165 + 0.33 * 2 = 0.825
    { grade: 'B-' as Grade, minStdDev: centerOffset + stdDevPerHalfGrade * 1 },      // 0.165 + 0.33 * 1 = 0.495
    { grade: 'C+' as Grade, minStdDev: centerOffset },                               // 0.165
    { grade: 'C' as Grade, minStdDev: -centerOffset },                               // -0.165
    { grade: 'C-' as Grade, minStdDev: -(centerOffset + stdDevPerHalfGrade * 1) },    // -0.495
    { grade: 'D+' as Grade, minStdDev: -(centerOffset + stdDevPerHalfGrade * 2) },   // -0.825
    { grade: 'D' as Grade, minStdDev: -(centerOffset + stdDevPerHalfGrade * 3) },   // -1.155
    { grade: 'D-' as Grade, minStdDev: -(centerOffset + stdDevPerHalfGrade * 4) },   // -1.485
    { grade: 'F' as Grade, minStdDev: -Infinity },
    { grade: '-' as Grade, minStdDev: -Infinity },
  ];
}

// 为所有卡牌计算评分
export interface CardWithGrade extends CardData {
  grade: Grade;
  stdDevFromMean: number;
  metricValue: number;
  hasData: boolean;
}

// 解析公式并计算自定义指标值
// 支持的字段：win_rate, play_rate, avg_seen, avg_pick, opening_hand_win_rate 等
export function evaluateCustomFormula(formula: string, card: CardData): number | null {
  try {
    // 定义所有可用字段及其在卡牌数据中的对应关系
    const fieldMap: Record<string, keyof CardData> = {
      win_rate: 'win_rate',
      play_rate: 'play_rate',
      avg_seen: 'avg_seen',
      avg_pick: 'avg_pick',
      opening_hand_win_rate: 'opening_hand_win_rate',
      drawn_win_rate: 'drawn_win_rate',
      ever_drawn_win_rate: 'ever_drawn_win_rate',
      never_drawn_win_rate: 'never_drawn_win_rate',
      drawn_improvement_win_rate: 'drawn_improvement_win_rate',
      seen_count: 'seen_count',
      pick_count: 'pick_count',
      game_count: 'game_count',
      opening_hand_game_count: 'opening_hand_game_count',
      drawn_game_count: 'drawn_game_count',
      ever_drawn_game_count: 'ever_drawn_game_count',
      never_drawn_game_count: 'never_drawn_game_count',
    };

    // 创建计算上下文和原始数据映射
    const context: Record<string, number> = {};
    const rawData: Record<string, number | undefined> = {};

    Object.keys(fieldMap).forEach(key => {
      const cardKey = fieldMap[key];
      const rawValue = card[cardKey];
      // 只处理数字类型的值
      if (typeof rawValue === 'number') {
        rawData[key] = rawValue;
        context[key] = (!isNaN(rawValue) && isFinite(rawValue)) ? rawValue : 0;
      } else {
        rawData[key] = undefined;
        context[key] = 0;
      }
    });

    // 如果公式是单个字段名，直接返回该值
    const trimmedFormula = formula.trim();
    if (fieldMap.hasOwnProperty(trimmedFormula)) {
      const rawValue = rawData[trimmedFormula];
      if (rawValue === undefined || rawValue === null || isNaN(rawValue) || !isFinite(rawValue)) {
        return null;
      }
      return rawValue;
    }

    // 提取公式中使用的所有变量名
    const usedVariables = new Set<string>();
    Object.keys(fieldMap).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      if (regex.test(trimmedFormula)) {
        usedVariables.add(key);
      }
    });

    // 检查所有使用的变量是否都有有效数据
    for (const varName of usedVariables) {
      const rawValue = rawData[varName];
      if (rawValue === undefined || rawValue === null || isNaN(rawValue) || !isFinite(rawValue)) {
        // 如果任何变量缺失数据，返回 null
        return null;
      }
    }

    // 替换变量名和运算符
    let expression = trimmedFormula;
    
    // 先替换幂运算符 ^ 为 Math.pow
    expression = expression.replace(/\^/g, '**');
    
    // 然后替换变量名
    Object.keys(context).forEach(key => {
      const regex = new RegExp(`\\b${key}\\b`, 'g');
      expression = expression.replace(regex, `context.${key}`);
    });

    // 使用 Function 构造函数安全地计算表达式
    // 注意：** 是 JavaScript 的幂运算符（ES2016）
    const func = new Function('context', `return ${expression}`);
    const result = func(context);

    // 检查结果是否有效
    if (typeof result !== 'number' || !isFinite(result) || isNaN(result)) {
      return null;
    }

    return result;
  } catch (error) {
    console.error('Error evaluating custom formula:', error);
    return null;
  }
}

export function calculateGrades(
  cards: CardData[],
  metric: GradeMetric,
  customConfig?: CustomMetricConfig
): CardWithGrade[] {
  // 如果是自定义指标，使用自定义配置
  const config = metric === 'custom' 
    ? (customConfig || loadCustomMetricConfig() || getDefaultCustomMetricConfig())
    : null;

  const stdDevPerHalfGrade = config?.stdDevPerHalfGrade ?? 0.33;

  // 分离有数据和无数据的卡牌
  const validCards: CardData[] = [];
  const noDataCards: CardData[] = [];

  cards.forEach(card => {
    let value: number | null = null;
    
    if (metric === 'custom' && config) {
      // 使用自定义公式计算
      value = evaluateCustomFormula(config.formula, card);
    } else {
      // 使用标准指标
      const metricKey = metric as keyof CardData;
      const rawValue = card[metricKey];
      if (typeof rawValue === 'number' && !isNaN(rawValue)) {
        value = rawValue;
      } else {
        value = null;
      }
    }

    if (value !== null && isFinite(value) && !isNaN(value)) {
      validCards.push(card);
    } else {
      noDataCards.push(card);
    }
  });

  const cardsWithGrades: CardWithGrade[] = [];

  // 处理有数据的卡牌
  if (validCards.length > 0) {
    // 提取指标值
    const values = validCards.map(card => {
      if (metric === 'custom' && config) {
        return evaluateCustomFormula(config.formula, card) ?? 0;
      } else {
        const metricKey = metric as keyof CardData;
        const rawValue = card[metricKey];
        return typeof rawValue === 'number' ? rawValue : 0;
      }
    });

    // 计算统计数据
    const { mean, stdDev } = calculateStats(values);

    // 为每张卡分配评分
    validCards.forEach(card => {
      let metricValue: number;
      
      if (metric === 'custom' && config) {
        metricValue = evaluateCustomFormula(config.formula, card) ?? 0;
      } else {
        const metricKey = metric as keyof CardData;
        const rawValue = card[metricKey];
        metricValue = typeof rawValue === 'number' ? rawValue : 0;
      }

      const stdDevFromMean = stdDev > 0 ? (metricValue - mean) / stdDev : 0;
      const grade = getGradeFromStdDev(stdDevFromMean, stdDevPerHalfGrade);

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

export function groupCardsByGrade(cards: CardWithGrade[], stdDevPerHalfGrade: number = 0.33): GradeGroup[] {
  const gradeMap = new Map<Grade, CardWithGrade[]>();
  const thresholds = generateGradeThresholds(stdDevPerHalfGrade);

  // 初始化所有评分组
  thresholds.forEach(({ grade }) => {
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


