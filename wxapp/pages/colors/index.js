const { fetchColorRatings, fetchFilterMetadata } = require('../../utils/api');
const { percent, number } = require('../../utils/format');
const { parseColorSymbols } = require('../../utils/mana');
const { loadManaFont } = require('../../utils/font');
const { toDisplayError } = require('../../utils/display-error');
const { fetchRemoteData } = require('../../utils/remote-data');

let expansionOptions = [];
let formatOptions = [];
let cardDataDefaults = {};

const emptyFilterMetadata = {
  formats_by_expansion: {},
  start_dates: {},
};

const colorNames = {
  W: '白',
  U: '蓝',
  B: '黑',
  R: '红',
  G: '绿',
  C: '无色',
};

const summaryLabels = {
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

function applyOptions(options = {}) {
  expansionOptions = Array.isArray(options.expansionOptions) ? options.expansionOptions : [];
  formatOptions = Array.isArray(options.formatOptions) ? options.formatOptions : [];
  cardDataDefaults = options.cardDataDefaults || {};
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function getFilterMetadata(data) {
  return data && data.formats_by_expansion && data.start_dates ? data : emptyFilterMetadata;
}

function getAvailableFormatOptions(expansion, metadata = emptyFilterMetadata) {
  const availableValues = getFilterMetadata(metadata).formats_by_expansion[expansion];
  if (!Array.isArray(availableValues) || !availableValues.length) {
    return formatOptions;
  }
  const options = formatOptions.filter((item) => availableValues.includes(item.value));
  return options.length ? options : formatOptions;
}

function getExpansionStartDate(expansion, metadata = emptyFilterMetadata) {
  const value = getFilterMetadata(metadata).start_dates[expansion];
  return value ? String(value).slice(0, 10) : '';
}

function getExpansionIndex(expansion) {
  const index = expansionOptions.indexOf(expansion);
  return index >= 0 ? index : 0;
}

function getFormatIndex(options, value) {
  const index = options.findIndex((item) => item.value === value);
  return index >= 0 ? index : 0;
}

function getDefaultExpansion() {
  const value = cardDataDefaults && cardDataDefaults.expansion;
  return expansionOptions.includes(value) ? value : (expansionOptions[0] || 'SOS');
}

function getDefaultEventType() {
  return (cardDataDefaults && cardDataDefaults.event_type) || 'PremierDraft';
}

function getDefaultStartDate(expansion, metadata) {
  return getExpansionStartDate(expansion, metadata)
    || '2016-01-01';
}

function buildInitialState(metadata = emptyFilterMetadata) {
  const expansion = getDefaultExpansion();
  const availableFormatOptions = getAvailableFormatOptions(expansion, metadata);
  const formatIndex = getFormatIndex(availableFormatOptions, getDefaultEventType());
  const formatOption = availableFormatOptions[formatIndex] || availableFormatOptions[0] || formatOptions[0];
  return {
    filterMetadata: getFilterMetadata(metadata),
    availableFormatOptions,
    params: {
      expansion,
      event_type: formatOption ? formatOption.value : 'PremierDraft',
      start_date: getDefaultStartDate(expansion, metadata),
      end_date: today(),
      combine_splash: true,
    },
    expansionIndex: getExpansionIndex(expansion),
    formatIndex,
    separateSplash: false,
  };
}

function getWinRate(row) {
  const games = Number(row.games || 0);
  return games ? Number(row.wins || 0) / games : 0;
}

function getColorTitle(shortName, fallback) {
  const text = String(shortName || '');
  const colorText = text.replace(/[^WUBRGC]/g, '');
  if (!colorText || /^\d+$/.test(colorText)) return fallback || '';
  const title = colorText.split('').map((symbol) => colorNames[symbol] || symbol).join('');
  return text.includes('+') ? `${title}混色` : title;
}

function getSummaryTitle(row) {
  return summaryLabels[String(row.short_name)] || summaryLabels[row.color_name] || row.color_name || '色组';
}

function getColorSymbolText(shortName) {
  return String(shortName || '').replace(/[^WUBRGC]/g, '');
}

function decorateColorRow(row, index) {
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
    colorSymbols: colorSymbolText ? parseColorSymbols(colorSymbolText) : [],
    wins,
    games,
    winsText: number(wins, 0),
    gamesText: number(games, 0),
    winRate,
    winRateText: percent(winRate),
  };
}

function buildColorGroups(rows) {
  const groups = [];
  let currentGroup = null;

  (rows || []).forEach((row, index) => {
    if (row.is_summary) {
      const winRate = getWinRate(row);
      currentGroup = {
        key: `summary-${row.short_name || row.color_name}`,
        title: getSummaryTitle(row),
        gamesText: number(row.games, 0),
        winsText: number(row.wins, 0),
        winRateText: percent(winRate),
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
      rows: group.rows.slice().sort((left, right) => {
        if (right.winRate !== left.winRate) return right.winRate - left.winRate;
        return right.games - left.games;
      }),
    }));
}

Page({
  data: {
    expansionOptions: [],
    formatOptions: [],
    ...buildInitialState(),
    queryPanelOpen: false,
    loading: false,
    error: '',
    colorGroups: [],
    manaFontReady: false,
  },

  onLoad() {
    this.loadManaIconFont();
    this.initializePage();
  },

  async initializePage() {
    this.setData({ loading: true, error: '' });
    try {
      const options = await fetchRemoteData('options');
      applyOptions(options);
      this.setData({
        expansionOptions,
        formatOptions,
        ...buildInitialState(),
      }, () => this.loadFilterMetadata());
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '筛选配置加载失败'),
      });
    }
  },

  loadManaIconFont() {
    loadManaFont(() => {
      this.setData({ manaFontReady: true });
    });
  },

  async loadFilterMetadata() {
    try {
      const metadata = await fetchFilterMetadata();
      const initialState = buildInitialState(metadata);
      this.setData(initialState, () => this.loadColors());
    } catch (error) {
      this.loadColors();
    }
  },

  reloadAfterParamChange(nextData) {
    this.colorLoadRequestId = '';
    this.setData({
      loading: false,
      error: '',
      colorGroups: [],
      ...nextData,
    }, () => {
      this.loadColors();
    });
  },

  onExpansionChange(event) {
    const index = Number(event.detail.value);
    const expansion = expansionOptions[index] || expansionOptions[0];
    const availableFormatOptions = getAvailableFormatOptions(expansion, this.data.filterMetadata);
    const currentFormat = this.data.params.event_type || getDefaultEventType();
    const formatIndex = getFormatIndex(availableFormatOptions, currentFormat);
    const formatOption = availableFormatOptions[formatIndex] || availableFormatOptions[0] || formatOptions[0];
    const startDate = getExpansionStartDate(expansion, this.data.filterMetadata);
    this.reloadAfterParamChange({
      expansionIndex: index,
      availableFormatOptions,
      formatIndex,
      'params.expansion': expansion,
      'params.event_type': formatOption ? formatOption.value : 'PremierDraft',
      ...(startDate ? { 'params.start_date': startDate } : {}),
    });
  },

  onFormatChange(event) {
    const index = Number(event.detail.value);
    const formatOption = this.data.availableFormatOptions[index] || this.data.availableFormatOptions[0];
    this.reloadAfterParamChange({
      formatIndex: index,
      'params.event_type': formatOption ? formatOption.value : 'PremierDraft',
    });
  },

  onDateChange(event) {
    const { field } = event.currentTarget.dataset;
    this.reloadAfterParamChange({
      [`params.${field}`]: event.detail.value,
    });
  },

  onSplashModeChange(event) {
    const separateSplash = Boolean(event.detail.value);
    this.reloadAfterParamChange({
      separateSplash,
      'params.combine_splash': !separateSplash,
    });
  },

  toggleQueryPanel() {
    this.setData({ queryPanelOpen: !this.data.queryPanelOpen });
  },

  async loadColors() {
    const requestId = `${Date.now()}-${Math.random()}`;
    this.colorLoadRequestId = requestId;
    this.setData({ loading: true, error: '' });
    try {
      const rows = await fetchColorRatings(this.data.params);
      if (this.colorLoadRequestId !== requestId) return;
      const colorGroups = buildColorGroups(Array.isArray(rows) ? rows : []);
      this.setData({
        loading: false,
        colorGroups,
        error: colorGroups.length ? '' : '暂无色组数据',
      });
    } catch (error) {
      if (this.colorLoadRequestId !== requestId) return;
      this.setData({
        loading: false,
        error: toDisplayError(error, '色组数据加载失败'),
      });
    }
  },
});
