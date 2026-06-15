const {
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
} = require('../../utils/mastery');
const { getSetIconGlyph } = require('../../data/set-icons');
const { loadKeyruneFont } = require('../../utils/font');
const { fetchRemoteData } = require('../../utils/remote-data');
const { toDisplayError } = require('../../utils/display-error');
const { generatePageShareImage } = require('../../utils/share-image');

let masteryConfig = null;

function buildControlConfigs(config) {
  return {
    currentLevel: { min: 1, max: config.maxLevel, step: 1 },
    excessXP: { min: 0, max: 1000, step: 25 },
    incompleteDailyWins: { min: 0, max: 10, step: 1 },
    incompleteDailyQuests: { min: 0, max: 3, step: 1 },
    incompleteWeeklyWins: { min: 0, max: 15, step: 1 },
    dailyWinsPerDay: { min: 0, max: 10, step: 1 },
    dailyQuestsLeft: { min: 0, max: 0, step: 1 },
    weeklyWinsPerWeek: { min: 0, max: 15, step: 1 },
  };
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function clampNumber(value, min, max, step) {
  const numericValue = Number(value || 0);
  const numericMin = Number.isFinite(Number(min)) ? Number(min) : 0;
  const numericMax = Number.isFinite(Number(max)) ? Number(max) : numericValue;
  const numericStep = Number.isFinite(Number(step)) && Number(step) > 0 ? Number(step) : 1;
  const clamped = Math.min(Math.max(numericValue, numericMin), numericMax);
  const stepped = Math.round(clamped / numericStep) * numericStep;
  return Math.min(Math.max(stepped, numericMin), numericMax);
}

function buildNumberOptions(min, max, step) {
  const options = [];
  const numericMin = Number(min || 0);
  const numericMax = Math.max(numericMin, Number(max || 0));
  const numericStep = Number(step || 1);
  for (let value = numericMin; value <= numericMax; value += numericStep) {
    options.push(String(value));
  }
  return options;
}

function buildPickerState(values, daysLeft, configs) {
  const options = {};
  const indexes = {};
  Object.keys(configs).forEach((field) => {
    const config = {
      ...configs[field],
      max: field === 'dailyQuestsLeft' ? daysLeft : configs[field].max,
    };
    options[field] = buildNumberOptions(config.min, config.max, config.step);
    const valueText = String(values[field] || 0);
    indexes[field] = Math.max(0, options[field].indexOf(valueText));
  });
  return { options, indexes };
}

Page({
  data: {
    config: {},
    values: {
      currentDate: today(),
      endDate: '',
      currentLevel: 1,
      excessXP: 0,
      incompleteDailyWins: 0,
      incompleteDailyQuests: 0,
      incompleteWeeklyWins: 0,
      dailyWinsPerDay: 0,
      dailyQuestsLeft: 0,
      weeklyWinsPerWeek: 0,
    },
    result: {},
    numberOptions: {},
    numberOptionIndexes: {},
    seasonText: '',
    loading: true,
    error: '',
    shareImageUrl: '',
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    loadKeyruneFont();
    this.initializePage();
    this.prepareShareImage();
  },

  async prepareShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: '精研通行证计算器',
        subtitle: '实用工具',
        description: '计算精研通行证等级进度',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  async initializePage() {
    this.setData({ loading: true, error: '' });
    try {
      masteryConfig = await fetchRemoteData('mastery');
      const values = {
        currentDate: today(),
        endDate: masteryConfig.endDate,
        currentLevel: 1,
        excessXP: 0,
        incompleteDailyWins: 0,
        incompleteDailyQuests: 0,
        incompleteWeeklyWins: 0,
        dailyWinsPerDay: masteryConfig.defaultDailyWins,
        dailyQuestsLeft: 0,
        weeklyWinsPerWeek: masteryConfig.defaultWeeklyWins,
      };
      this.setData({
        loading: false,
        error: '',
        config: {
          ...masteryConfig,
          setGlyph: getSetIconGlyph(masteryConfig.setCode),
        },
        values,
        seasonText: `${formatMasteryDate(masteryConfig.startDate)} ~ ${formatMasteryDate(masteryConfig.endDate)}`,
      }, () => this.recalculate());
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '通行证配置加载失败'),
      });
    }
  },

  pickValue(event) {
    const { field } = event.currentTarget.dataset;
    const options = this.data.numberOptions[field] || [];
    const value = Number(options[Number(event.detail.value)] || 0);
    this.setData({
      [`values.${field}`]: value,
    }, () => this.recalculate());
  },

  adjustValue(event) {
    const { field, min, max, step, direction } = event.currentTarget.dataset;
    const currentValue = Number(this.data.values[field] || 0);
    const delta = Number(step || 1) * Number(direction || 1);
    const value = clampNumber(currentValue + delta, min, max, step);
    this.setData({
      [`values.${field}`]: value,
    }, () => this.recalculate());
  },

  updateDate(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`values.${field}`]: event.detail.value,
    }, () => this.recalculate());
  },

  recalculate() {
    if (!masteryConfig) return;
    const values = this.data.values;
    const daysLeft = calculateDaysLeft(values.currentDate, values.endDate);
    const safeDailyQuestsLeft = Math.min(values.dailyQuestsLeft, daysLeft);
    const currentXP = calculateCurrentXP(values);
    const dailyWinXP = calculateExpectedDailyWinsXP(values.dailyWinsPerDay, daysLeft);
    const questXP = calculateExpectedDailyQuestsXP(safeDailyQuestsLeft, daysLeft);
    const weeklyXP = calculateExpectedWeeklyWinsXP(values.weeklyWinsPerWeek, daysLeft);
    const expectedXP = dailyWinXP + questXP + weeklyXP;
    const finalXP = currentXP + expectedXP;
    const maxXP = (masteryConfig.maxLevel - 1) * 1000;
    const remainingXP = Math.max(0, maxXP - finalXP);
    const expectedLevel = calculateExpectedLevel(currentXP, expectedXP);
    const updates = {
      result: {
        daysLeft,
        currentXP,
        currentXPText: formatNumber(currentXP),
        dailyWinXP,
        dailyWinXPText: formatNumber(dailyWinXP),
        questXP,
        questXPText: formatNumber(questXP),
        weeklyXP,
        weeklyXPText: formatNumber(weeklyXP),
        expectedXP,
        expectedXPText: formatNumber(expectedXP),
        finalXP,
        finalXPText: formatNumber(finalXP),
        remainingXP,
        remainingXPText: formatNumber(remainingXP),
        expectedLevel,
        maxLevel: masteryConfig.maxLevel,
        completionText: remainingXP ? `距离满级还差 ${formatNumber(remainingXP)} 经验` : '预计可以达到满级',
        dailyRefreshText: getLocalRefreshTimeString(),
        weeklyRefreshText: getLocalRefreshTimeStringWithWeekday(),
      },
    };
    if (safeDailyQuestsLeft !== values.dailyQuestsLeft) {
      updates['values.dailyQuestsLeft'] = safeDailyQuestsLeft;
    }
    const pickerState = buildPickerState({ ...values, dailyQuestsLeft: safeDailyQuestsLeft }, daysLeft, buildControlConfigs(masteryConfig));
    this.setData({
      ...updates,
      numberOptions: pickerState.options,
      numberOptionIndexes: pickerState.indexes,
    });
  },

  onShareAppMessage() {
    return {
      title: '精研通行证计算器 - 十七地小助手',
      path: '/pages/mastery/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: '精研通行证计算器 - 十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },
});
