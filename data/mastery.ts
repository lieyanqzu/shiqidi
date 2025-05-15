/**
 * 精研通行证配置
 */
export const masteryConfig = {
  // 系列代号
  setCode: 'FIN',
  // 当前赛季开始日期（UTC）
  startDate: '2025-06-10',
  // 当前赛季结束日期（UTC）
  endDate: '2025-07-29',
  // 最高等级
  maxLevel: 50,
  // 默认每日胜场数
  defaultDailyWins: 4,
  // 默认每周胜场数
  defaultWeeklyWins: 15,
} as const;
  