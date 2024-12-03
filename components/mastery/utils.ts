// 每日胜场经验值（每天09:00 UTC刷新）
const DAILY_WIN_XP = 25;  // 每场胜利获得25经验值
const DAILY_WIN_COUNT = 10;  // 每天最多10场胜利

// 每周胜场经验值（每周日09:00 UTC刷新）
const WEEKLY_WIN_XP = 250;  // 每场胜利获得250经验值
const WEEKLY_WIN_COUNT = 15;  // 每周最多15场胜利

// 每日任务经验值
const DAILY_QUEST_XP = 500;  // 每个任务500经验值

// 刷新时间（UTC）
const REFRESH_HOUR_UTC = 9;  // GMT+8 的 17:00 对应 UTC 9:00

/**
 * 获取格式化的本地刷新时间字符串
 * @returns 格式化的时间字符串，如 "12:00"
 */
export function getLocalRefreshTimeString(): string {
  const utcRefresh = new Date();
  utcRefresh.setUTCHours(REFRESH_HOUR_UTC, 0, 0, 0);
  return utcRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}

/**
 * 获取格式化的本地刷新时间字符串，包含星期
 * @returns 格式化的时间字符串，如 "每周日 17:00"
 */
export function getLocalRefreshTimeStringWithWeekday(): string {
  const utcRefresh = new Date();
  // 设置为 UTC 9:00（固定在周日）
  utcRefresh.setUTCHours(REFRESH_HOUR_UTC, 0, 0, 0);
  // 设置为周日
  utcRefresh.setUTCDate(utcRefresh.getUTCDate() + (7 - utcRefresh.getUTCDay()) % 7);
  const weekday = utcRefresh.toLocaleDateString([], { weekday: 'long' });
  const time = utcRefresh.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return `${weekday} ${time}`;
}

/**
 * 计算当前总经验值
 * @param params 计算参数
 * @returns 当前总经验值
 */
export function calculateCurrentXP(params: {
  currentLevel: number;
  excessXP: number;
  incompleteDailyWins: number;
  incompleteDailyQuests: number;
  incompleteWeeklyWins: number;
}): number {
  const { currentLevel, excessXP, incompleteDailyWins, incompleteDailyQuests, incompleteWeeklyWins } = params;
  
  // 基础经验值：(当前等级-1) * 1000
  const baseXP = (currentLevel - 1) * 1000;
  
  // 额外经验值
  const extraXP = excessXP;
  
  // 未完成每日胜场经验：每场25经验
  const dailyWinsXP = incompleteDailyWins * DAILY_WIN_XP;
  
  // 未完成每日任务经验：每个500经验
  const dailyQuestsXP = incompleteDailyQuests * DAILY_QUEST_XP;
  
  // 未完成每周胜场经验：每场250经验
  const weeklyWinsXP = incompleteWeeklyWins * WEEKLY_WIN_XP;
  
  // 总经验值
  return baseXP + extraXP + dailyWinsXP + dailyQuestsXP + weeklyWinsXP;
}

/**
 * 计算每日胜场预期经验值
 * @param winsPerDay 每天预计完成的胜场数
 * @param daysLeft 剩余天数
 * @returns 预期可获得的经验值
 */
export function calculateExpectedDailyWinsXP(winsPerDay: number, daysLeft: number): number {
  // 每天最多10场胜利，每场25经验
  const effectiveWins = Math.min(winsPerDay, DAILY_WIN_COUNT);
  return effectiveWins * DAILY_WIN_XP * daysLeft;
}

/**
 * 计算每周胜场预期经验值
 * @param winsPerWeek 每周预计完成的胜场数
 * @param daysLeft 剩余天数
 * @returns 预期可获得的经验值
 */
export function calculateExpectedWeeklyWinsXP(winsPerWeek: number, daysLeft: number): number {
  // 每周最多15场胜利，每场250经验
  const effectiveWins = Math.min(winsPerWeek, WEEKLY_WIN_COUNT);
  
  // 获取当前 UTC 时间
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();
  
  // 如果是周日且在刷新时间之前，本周还可以完成
  const canCompleteThisWeek = currentDay === 0 && currentHour < REFRESH_HOUR_UTC;
  
  // 计算完整的周数（不包括当前周）
  const fullWeeks = Math.floor((daysLeft - (canCompleteThisWeek ? 0 : currentDay)) / 7);
  
  // 计算总经验值（完整周数的经验值）
  let totalXP = effectiveWins * WEEKLY_WIN_XP * fullWeeks;
  
  // 计算剩余天数是否会跨过下一个周日的刷新时间
  const daysUntilNextSunday = (7 - currentDay) % 7;
  const remainingDays = daysLeft - (fullWeeks * 7);
  
  // 如果当前是周日且在刷新前，或者剩余天数足够达到下一个周日，可以再完成一次
  if (canCompleteThisWeek || (remainingDays >= daysUntilNextSunday)) {
    totalXP += effectiveWins * WEEKLY_WIN_XP;
  }

  return totalXP;
}

/**
 * 计算每日任务预期经验值
 * @param totalQuests 预计完成的总任务数
 * @param daysLeft 剩余天数
 * @returns 预期可获得的经验值
 */
export function calculateExpectedDailyQuestsXP(totalQuests: number, daysLeft: number): number {
  // 每个任务500经验，总任务数不能超过剩余天数
  const effectiveQuests = Math.min(totalQuests, daysLeft);
  return effectiveQuests * DAILY_QUEST_XP;
}

/**
 * 计算预期等级
 * @param currentXP 当前总经验值
 * @param expectedXP 预期可获得的经验值
 * @returns 预期等级
 */
export function calculateExpectedLevel(currentXP: number, expectedXP: number): number {
  const totalXP = currentXP + expectedXP;
  return Math.floor(totalXP / 1000) + 1;
}

/**
 * 计算剩余天数
 * @param currentDate 当前日期
 * @param endDate 结束日期（UTC）
 * @returns 剩余天数（向上取整）
 */
export function calculateDaysLeft(currentDate: string, endDate: string): number {
  const now = new Date(currentDate);
  const end = new Date(endDate);
  end.setUTCHours(REFRESH_HOUR_UTC, 0, 0, 0);  // 设置为刷新时间
  return Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
} 