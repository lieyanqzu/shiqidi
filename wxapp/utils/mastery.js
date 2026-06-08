const DAILY_WIN_XP = 25;
const DAILY_WIN_COUNT = 10;
const WEEKLY_WIN_XP = 250;
const WEEKLY_WIN_COUNT = 15;
const DAILY_QUEST_XP = 500;
const REFRESH_HOUR_UTC = 9;

function pad(value) {
  return String(value).padStart(2, '0');
}

function formatNumber(value) {
  const text = String(Math.max(0, Number(value || 0)));
  return text.replace(/\B(?=(\d{3})+(?!\d))/g, ',');
}

function formatMasteryDate(value) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value || '未知');
  return `${date.getFullYear()}/${pad(date.getMonth() + 1)}/${pad(date.getDate())}`;
}

function getLocalRefreshTimeString() {
  const date = new Date();
  date.setUTCHours(REFRESH_HOUR_UTC, 0, 0, 0);
  return `${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function getLocalRefreshTimeStringWithWeekday() {
  const date = new Date();
  date.setUTCHours(REFRESH_HOUR_UTC, 0, 0, 0);
  date.setUTCDate(date.getUTCDate() + ((7 - date.getUTCDay()) % 7));
  const weekdays = ['周日', '周一', '周二', '周三', '周四', '周五', '周六'];
  return `每${weekdays[date.getDay()]} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function calculateDaysLeft(currentDate, endDate) {
  const now = new Date(currentDate);
  const end = new Date(endDate);
  if (Number.isNaN(now.getTime()) || Number.isNaN(end.getTime())) return 0;
  end.setUTCHours(REFRESH_HOUR_UTC, 0, 0, 0);
  return Math.max(0, Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)));
}

function calculateCurrentXP(values) {
  return (
    (values.currentLevel - 1) * 1000 +
    values.excessXP +
    values.incompleteDailyWins * DAILY_WIN_XP +
    values.incompleteDailyQuests * DAILY_QUEST_XP +
    values.incompleteWeeklyWins * WEEKLY_WIN_XP
  );
}

function calculateExpectedDailyWinsXP(winsPerDay, daysLeft) {
  return Math.min(winsPerDay, DAILY_WIN_COUNT) * DAILY_WIN_XP * daysLeft;
}

function calculateExpectedDailyQuestsXP(totalQuests, daysLeft) {
  return Math.min(totalQuests, daysLeft) * DAILY_QUEST_XP;
}

function calculateExpectedWeeklyWinsXP(winsPerWeek, daysLeft) {
  const effectiveWins = Math.min(winsPerWeek, WEEKLY_WIN_COUNT);
  const now = new Date();
  const currentDay = now.getUTCDay();
  const currentHour = now.getUTCHours();
  const canCompleteThisWeek = currentDay === 0 && currentHour < REFRESH_HOUR_UTC;
  const fullWeeks = Math.max(0, Math.floor((daysLeft - (canCompleteThisWeek ? 0 : currentDay)) / 7));
  let totalXP = effectiveWins * WEEKLY_WIN_XP * fullWeeks;
  const daysUntilNextSunday = (7 - currentDay) % 7;
  const remainingDays = daysLeft - fullWeeks * 7;
  if (canCompleteThisWeek || remainingDays >= daysUntilNextSunday) {
    totalXP += effectiveWins * WEEKLY_WIN_XP;
  }
  return totalXP;
}

function calculateExpectedLevel(currentXP, expectedXP) {
  return Math.floor((currentXP + expectedXP) / 1000) + 1;
}

module.exports = {
  formatNumber,
  formatMasteryDate,
  getLocalRefreshTimeString,
  getLocalRefreshTimeStringWithWeekday,
  calculateDaysLeft,
  calculateCurrentXP,
  calculateExpectedDailyWinsXP,
  calculateExpectedDailyQuestsXP,
  calculateExpectedWeeklyWinsXP,
  calculateExpectedLevel,
};
