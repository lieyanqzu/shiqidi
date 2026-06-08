const { calculateSingle, calculateMulti, calculateBo1 } = require('../../utils/probability');
const { percent, number } = require('../../utils/format');
const { scrollToSelector, showToast } = require('../../utils/wx-actions');

function barWidth(probability) {
  if (!probability) return '0%';
  return `${Math.max(2, probability * 100)}%`;
}

Page({
  data: {
    tab: 'single',
    single: {
      populationSize: 60,
      sampleSize: 7,
      successesInPopulation: 4,
      successesInSample: 1,
    },
    singleResult: null,
    multi: {
      populationSize: 60,
      sampleSize: 7,
      targetCards: [
        {
          id: '1',
          name: '目标牌1',
          count: 4,
          expected: 1,
        },
      ],
    },
    multiResult: null,
    nextTargetId: 2,
    bo1: {
      deckSize: 60,
      landCount: 24,
    },
    bo1Result: null,
  },

  setTab(event) {
    this.setData({ tab: event.currentTarget.dataset.tab });
  },

  normalizeNumber(value) {
    const result = Number(value || 0);
    return Number.isFinite(result) ? result : 0;
  },

  updateSingle(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`single.${field}`]: this.normalizeNumber(event.detail.value),
      singleResult: null,
    });
  },

  updateMulti(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`multi.${field}`]: this.normalizeNumber(event.detail.value),
      multiResult: null,
    });
  },

  updateTargetCard(event) {
    const { index, field } = event.currentTarget.dataset;
    const value = field === 'name' ? event.detail.value : this.normalizeNumber(event.detail.value);
    this.setData({
      [`multi.targetCards[${index}].${field}`]: value,
      multiResult: null,
    });
  },

  updateBo1(event) {
    const { field } = event.currentTarget.dataset;
    this.setData({
      [`bo1.${field}`]: this.normalizeNumber(event.detail.value),
      bo1Result: null,
    });
  },

  quickSingle(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({
      [`single.${field}`]: Number(value),
      singleResult: null,
    });
  },

  quickMulti(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({
      [`multi.${field}`]: Number(value),
      multiResult: null,
    });
  },

  quickBo1(event) {
    const { field, value } = event.currentTarget.dataset;
    this.setData({
      [`bo1.${field}`]: Number(value),
      bo1Result: null,
    });
  },

  addTargetCard() {
    const nextTargetId = this.data.nextTargetId;
    const targetCards = this.data.multi.targetCards.concat({
      id: String(nextTargetId),
      name: `目标牌${nextTargetId}`,
      count: 4,
      expected: 1,
    });
    this.setData({
      'multi.targetCards': targetCards,
      nextTargetId: nextTargetId + 1,
      multiResult: null,
    });
  },

  removeTargetCard(event) {
    if (this.data.multi.targetCards.length <= 1) {
      showToast('至少保留一张目标牌');
      return;
    }
    const index = Number(event.currentTarget.dataset.index);
    this.setData({
      'multi.targetCards': this.data.multi.targetCards.filter((_, itemIndex) => itemIndex !== index),
      multiResult: null,
    });
  },

  scrollToResult(selector) {
    setTimeout(() => {
      scrollToSelector(selector);
    }, 80);
  },

  calculateSingle() {
    const result = calculateSingle(this.data.single);
    this.setData({
      singleResult: {
        exact: percent(result.exact, 2),
        orMore: percent(result.orMore, 2),
        orLess: percent(result.orLess, 2),
        zero: percent(result.zero, 2),
      },
    }, () => {
      this.scrollToResult('#single-result');
    });
  },

  calculateMulti() {
    const result = calculateMulti(this.data.multi);
    this.setData({
      multiResult: {
        all: percent(result.all, 2),
        atLeastOne: percent(result.atLeastOne, 2),
        error: result.error,
        individual: result.individual.map((item) => ({
          id: item.id,
          name: item.name,
          probability: percent(item.probability, 2),
        })),
      },
    }, () => {
      this.scrollToResult('#multi-result');
    });
  },

  calculateBo1() {
    const result = calculateBo1(this.data.bo1.deckSize, this.data.bo1.landCount);
    this.setData({
      bo1Result: {
        averageLands: number(result.averageLands, 2),
        distribution: result.distribution.map((item) => {
          const normalItem = result.normal.find((normal) => normal.lands === item.lands) || {};
          const normalProbability = normalItem.probability || 0;
          return {
            lands: item.lands,
            probability: percent(item.probability, 2),
            bo1Width: barWidth(item.probability),
            normal: percent(normalProbability, 2),
            normalWidth: barWidth(normalProbability),
          };
        }),
      },
    }, () => {
      this.scrollToResult('#bo1-result');
    });
  },
});
