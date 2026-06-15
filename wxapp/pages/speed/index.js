const { percent, number } = require('../../utils/format');
const { loadKeyruneFont } = require('../../utils/font');
const { getSetIconGlyph } = require('../../data/set-icons');
const { readStorage, writeStorage } = require('../../utils/storage');
const { nextRender, queryElementInfo } = require('../../utils/canvas');
const { fetchPlayDrawData } = require('../../utils/api');
const { toDisplayError } = require('../../utils/display-error');
const { fetchRemoteData } = require('../../utils/remote-data');
const { generatePageShareImage } = require('../../utils/share-image');

let expansionOptions = [];
let formatOptions = [];
let speedDefaults = {};

const storageKeys = {
  selectedExpansions: 'speed.selectedExpansions.v3',
  selectedFormats: 'speed.selectedFormats.v3',
};

const fallbackRecentExpansionCount = 8;
const fallbackDefaultSpeedFormats = ['PremierDraft', 'Sealed'];

const formatStyles = {
  PremierDraft: { color: '#2563eb', shortLabel: '竞轮', shape: 'circle' },
  PickTwoDraft: { color: '#0891b2', shortLabel: '双抓', shape: 'diamond' },
  PickTwoTradDraft: { color: '#0e7490', shortLabel: '双抓 BO3', shape: 'diamond' },
  QuickDraft: { color: '#16a34a', shortLabel: '快轮', shape: 'square' },
  Sealed: { color: '#dc2626', shortLabel: '现开', shape: 'triangle' },
  TradDraft: { color: '#d97706', shortLabel: '传统轮', shape: 'circle' },
  TradSealed: { color: '#be123c', shortLabel: '传统现', shape: 'diamond' },
};

const speedFormatLabels = {
  PickTwoTradDraft: '选两张轮抽 BO3',
  PremierDraftRemixArtifacts: '神器混合真人轮抽',
  DraftChallenge: '轮抽挑战赛',
  CubeDraft: '混沌轮抽',
  Omniscience_Draft: '全知轮抽',
  MidWeekQuickDraft: '周中快速轮抽',
  MidWeekSealed: '周中现开',
  Emblem_QuickDraft: '徽记快速轮抽',
  DecathlonFinals2022: '十项全能决赛 2022',
  DecathlonTradDraft: '十项全能真人轮抽',
  DecathlonQuickDraft: '十项全能快速轮抽',
  OpenDraft_D1_Bo1: '公开赛第一日轮抽 BO1',
  OpenDraft_D1_Bo3: '公开赛第一日轮抽 BO3',
  OpenDraft_D2_Bo3: '公开赛第二日轮抽 BO3',
  OpenDraft_D2_Draft1_Bo3: '公开赛第二日轮抽 1 BO3',
  OpenSealed_D1_Bo1: '公开赛第一日现开 BO1',
  OpenSealed_D1_Bo3: '公开赛第一日现开 BO3',
  OpenSealed_D2_Bo3: '公开赛第二日现开 BO3',
  ArenaDirect_Draft: '竞技场直邮赛轮抽',
  ArenaDirect_Sealed: '竞技场直邮赛现开',
  QualifierPlayInSealed: '资格赛预选现开',
  QualifierPlayInTradSealed: '资格赛预选现开 BO3',
  Qualifier_D1_Sealed: '资格赛第一日现开',
  LimitedChampionshipQualifier_Draft1: '限制冠军资格轮抽',
};

let formatLabelMap = { ...speedFormatLabels };

function applyOptions(options = {}) {
  expansionOptions = Array.isArray(options.expansionOptions) ? options.expansionOptions : [];
  formatOptions = Array.isArray(options.formatSpeedOptions)
    ? options.formatSpeedOptions
    : (Array.isArray(options.formatOptions) ? options.formatOptions : []);
  speedDefaults = options.speedDefaults || {};
  formatLabelMap = formatOptions.reduce((map, item) => {
    map[item.value] = item.label;
    return map;
  }, { ...speedFormatLabels });
}

function buildSpeedOptions(data) {
  const speedExpansionValues = Array.from(new Set(data.map((item) => item.expansion)));
  const speedFormatValues = Array.from(new Set(data.map((item) => item.event_type)));
  const optionExpansionValues = Array.isArray(expansionOptions) ? expansionOptions : [];
  const allSpeedExpansions = optionExpansionValues
    .filter((value) => speedExpansionValues.includes(value))
    .concat(speedExpansionValues.filter((value) => !optionExpansionValues.includes(value)));
  const allSpeedFormats = formatOptions
    .filter((item) => speedFormatValues.includes(item.value))
    .concat(speedFormatValues
      .filter((value) => !formatOptions.some((item) => item.value === value))
      .map((value) => ({ value, label: formatLabelMap[value] || value })));
  return {
    allSpeedExpansions,
    allSpeedFormats,
  };
}

function loadSelection(key, validValues, defaultValues) {
  const fallback = (defaultValues || validValues).filter((value) => validValues.includes(value));
  const saved = readStorage(key);
  if (!Array.isArray(saved) || !saved.length) return fallback.length ? fallback : validValues;
  const selected = saved.filter((value) => validValues.includes(value));
  return selected.length ? selected : (fallback.length ? fallback : validValues);
}

function getSelectAllText(selectedValues, allValues) {
  return selectedValues.length === allValues.length ? '全不选' : '全选';
}

function getRecentExpansions(allSpeedExpansions) {
  const configuredExpansions = Array.isArray(speedDefaults.expansions)
    ? speedDefaults.expansions.filter((value) => allSpeedExpansions.includes(value))
    : [];
  if (configuredExpansions.length) return configuredExpansions;

  const configuredCount = Number(speedDefaults.recentExpansionCount);
  const recentExpansionCount = Number.isFinite(configuredCount) && configuredCount > 0
    ? Math.floor(configuredCount)
    : fallbackRecentExpansionCount;
  return allSpeedExpansions.slice(0, recentExpansionCount);
}

function getDefaultSpeedFormats(allSpeedFormats) {
  const validFormats = allSpeedFormats.map((item) => item.value);
  const configuredFormats = Array.isArray(speedDefaults.event_types) && speedDefaults.event_types.length
    ? speedDefaults.event_types
    : fallbackDefaultSpeedFormats;
  return configuredFormats.filter((value) => validFormats.includes(value));
}

function decorateOptions(options, selectedValues) {
  return options.map((item) => ({
    ...item,
    active: selectedValues.includes(item.value),
  }));
}

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : values.concat(value);
}

function getFormatStyle(value) {
  if (formatStyles[value]) return formatStyles[value];
  if (String(value).includes('ArenaDirect')) return { color: '#be185d', shortLabel: '直邮', shape: 'diamond' };
  if (String(value).includes('Qualifier') || String(value).includes('Championship')) return { color: '#4f46e5', shortLabel: '资格赛', shape: 'triangle' };
  if (String(value).includes('Open')) return { color: '#0f766e', shortLabel: '公开赛', shape: 'diamond' };
  if (String(value).includes('Decathlon')) return { color: '#ca8a04', shortLabel: '十项', shape: 'square' };
  if (String(value).includes('Cube')) return { color: '#475569', shortLabel: '方盒', shape: 'square' };
  if (String(value).includes('MidWeek')) return { color: '#15803d', shortLabel: '周中', shape: 'square' };
  if (String(value).includes('Sealed')) return { color: '#dc2626', shortLabel: '现开', shape: 'triangle' };
  if (String(value).includes('Draft')) return { color: '#2563eb', shortLabel: '轮抽', shape: 'circle' };
  return { color: '#6b7280', shortLabel: '特殊', shape: 'circle' };
}

function buildLegendItems(selectedFormats, allSpeedFormats) {
  return allSpeedFormats
    .filter((item) => selectedFormats.includes(item.value))
    .map((item) => {
      const style = getFormatStyle(item.value);
      return {
        ...item,
        color: style.color,
        shape: style.shape,
        shortLabel: style.shortLabel,
      };
    });
}

const chartPadding = { left: 48, right: 18, top: 22, bottom: 46 };

function clampChartValue(value, min, max) {
  return Math.min(max, Math.max(min, value));
}

function spreadOverlappingPoints(points, bounds) {
  const clusters = {};
  return points.map((point) => {
    const clusterKey = `${Math.round(point.x / 14)}:${Math.round(point.y / 14)}`;
    const clusterIndex = clusters[clusterKey] || 0;
    clusters[clusterKey] = clusterIndex + 1;
    if (!clusterIndex) return point;

    const ring = Math.ceil(clusterIndex / 8);
    const angle = ((clusterIndex - 1) % 8) * (Math.PI / 4) + ring * 0.28;
    const distance = 7 + ring * 4;
    return {
      ...point,
      x: clampChartValue(point.x + Math.cos(angle) * distance, bounds.left, bounds.right),
      y: clampChartValue(point.y + Math.sin(angle) * distance, bounds.top, bounds.bottom),
    };
  });
}

Page({
  data: {
    expansionOptions: [],
    formatOptions: [],
    allSpeedExpansions: [],
    allSpeedFormats: [],
    speedData: [],
    selectedExpansions: [],
    selectedFormats: [],
    expansionSelectAllText: '全选',
    formatSelectAllText: '全选',
    legendItems: [],
    setIconFontReady: false,
    loading: true,
    error: '',
    items: [],
    chartItems: [],
    chartOverlayPoints: [],
    xAxisTicks: [],
    yAxisTicks: [],
    chartFrame: {
      left: chartPadding.left,
      right: chartPadding.right,
      top: chartPadding.top,
      bottom: chartPadding.bottom,
      labelWidth: chartPadding.left - 8,
    },
    chartTooltip: null,
    chartStatus: '正在加载速度数据...',
    summary: {
      count: 0,
      averageLength: '-',
      averageWinRate: '-',
    },
    filterPanelOpen: false,
    shareImageUrl: '',
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    this.loadSetIconFont();
    this.initializePage();
    this.prepareShareImage();
  },

  async prepareShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: '赛制速度',
        subtitle: '轮抽数据',
        description: '了解各个系列限制赛的速度和先手胜率',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  async initializePage() {
    this.setData({ loading: true, error: '', chartStatus: '正在加载筛选配置...' });
    try {
      const options = await fetchRemoteData('options');
      applyOptions(options);
      this.loadSpeedData();
    } catch (error) {
      const message = toDisplayError(error, '筛选配置加载失败');
      this.setData({
        loading: false,
        error: message,
        chartStatus: message,
      });
    }
  },

  async loadSpeedData() {
    this.setData({ loading: true, error: '', chartStatus: '正在加载速度数据...' });
    try {
      const speedData = await fetchPlayDrawData();
      if (!speedData.length) {
        throw new Error('未获取到赛制速度数据');
      }
      const { allSpeedExpansions, allSpeedFormats } = buildSpeedOptions(speedData);
      const selectedExpansions = loadSelection(storageKeys.selectedExpansions, allSpeedExpansions, getRecentExpansions(allSpeedExpansions));
      const allFormatValues = allSpeedFormats.map((item) => item.value);
      const selectedFormats = loadSelection(storageKeys.selectedFormats, allFormatValues, getDefaultSpeedFormats(allSpeedFormats));
      this.setData({
        loading: false,
        error: '',
        speedData,
        allSpeedExpansions,
        allSpeedFormats,
        selectedExpansions,
        selectedFormats,
        expansionOptions: decorateOptions(allSpeedExpansions.map((value) => ({ value, label: value })), selectedExpansions),
        formatOptions: decorateOptions(allSpeedFormats, selectedFormats),
        expansionSelectAllText: getSelectAllText(selectedExpansions, allSpeedExpansions),
        formatSelectAllText: getSelectAllText(selectedFormats, allFormatValues),
        legendItems: buildLegendItems(selectedFormats, allSpeedFormats),
      }, () => this.applyFilter());
    } catch (error) {
      const message = toDisplayError(error, '速度数据加载失败');
      this.setData({
        loading: false,
        error: message,
        chartStatus: message,
      });
    }
  },

  onReady() {
    this.drawChart();
  },

  loadSetIconFont() {
    loadKeyruneFont(() => {
      this.setData({ setIconFontReady: true }, () => this.drawChart());
    });
  },

  toggleExpansion(event) {
    const value = event.currentTarget.dataset.value;
    const selectedExpansions = toggleValue(this.data.selectedExpansions, value);
    const allSpeedExpansions = this.data.allSpeedExpansions;
    writeStorage(storageKeys.selectedExpansions, selectedExpansions);
    this.setData({
      selectedExpansions,
      expansionOptions: decorateOptions(allSpeedExpansions.map((item) => ({ value: item, label: item })), selectedExpansions),
      expansionSelectAllText: getSelectAllText(selectedExpansions, allSpeedExpansions),
    }, () => this.applyFilter());
  },

  toggleFormat(event) {
    const value = event.currentTarget.dataset.value;
    const selectedFormats = toggleValue(this.data.selectedFormats, value);
    const allSpeedFormats = this.data.allSpeedFormats;
    const allFormatValues = allSpeedFormats.map((item) => item.value);
    writeStorage(storageKeys.selectedFormats, selectedFormats);
    this.setData({
      selectedFormats,
      formatOptions: decorateOptions(allSpeedFormats, selectedFormats),
      formatSelectAllText: getSelectAllText(selectedFormats, allFormatValues),
      legendItems: buildLegendItems(selectedFormats, allSpeedFormats),
    }, () => this.applyFilter());
  },

  selectAllExpansions() {
    const allSpeedExpansions = this.data.allSpeedExpansions;
    const selectedExpansions = this.data.selectedExpansions.length === allSpeedExpansions.length ? [] : allSpeedExpansions;
    writeStorage(storageKeys.selectedExpansions, selectedExpansions);
    this.setData({
      selectedExpansions,
      expansionOptions: decorateOptions(allSpeedExpansions.map((item) => ({ value: item, label: item })), selectedExpansions),
      expansionSelectAllText: getSelectAllText(selectedExpansions, allSpeedExpansions),
    }, () => this.applyFilter());
  },

  selectRecentExpansions() {
    const allSpeedExpansions = this.data.allSpeedExpansions;
    const recent = getRecentExpansions(allSpeedExpansions);
    writeStorage(storageKeys.selectedExpansions, recent);
    this.setData({
      selectedExpansions: recent,
      expansionOptions: decorateOptions(allSpeedExpansions.map((item) => ({ value: item, label: item })), recent),
      expansionSelectAllText: getSelectAllText(recent, allSpeedExpansions),
    }, () => this.applyFilter());
  },

  selectAllFormats() {
    const allSpeedFormats = this.data.allSpeedFormats;
    const allFormatValues = allSpeedFormats.map((item) => item.value);
    const selectedFormats = this.data.selectedFormats.length === allFormatValues.length ? [] : allFormatValues;
    writeStorage(storageKeys.selectedFormats, selectedFormats);
    this.setData({
      selectedFormats,
      formatOptions: decorateOptions(allSpeedFormats, selectedFormats),
      formatSelectAllText: getSelectAllText(selectedFormats, allFormatValues),
      legendItems: buildLegendItems(selectedFormats, allSpeedFormats),
    }, () => this.applyFilter());
  },

  toggleFilterPanel() {
    this.setData({ filterPanelOpen: !this.data.filterPanelOpen });
  },

  applyFilter() {
    const selectedExpansions = this.data.selectedExpansions;
    const selectedFormats = this.data.selectedFormats;
    const filtered = this.data.speedData.filter((item) => {
      const expansionMatched = selectedExpansions.includes(item.expansion);
      const formatMatched = selectedFormats.includes(item.event_type);
      return expansionMatched && formatMatched;
    }).map((item) => ({
      ...item,
      key: `${item.expansion}-${item.event_type}`,
      eventTypeText: formatLabelMap[item.event_type] || item.event_type,
      markerColor: getFormatStyle(item.event_type).color,
      markerShape: getFormatStyle(item.event_type).shape,
      shortFormatLabel: getFormatStyle(item.event_type).shortLabel,
      setGlyph: getSetIconGlyph(item.expansion),
      winRateText: percent(item.win_rate_on_play),
      lengthText: number(item.average_game_length, 1),
    })).sort((a, b) => b.win_rate_on_play - a.win_rate_on_play);

    const averageLength = filtered.length
      ? filtered.reduce((sum, item) => sum + Number(item.average_game_length || 0), 0) / filtered.length
      : 0;
    const averageWinRate = filtered.length
      ? filtered.reduce((sum, item) => sum + Number(item.win_rate_on_play || 0), 0) / filtered.length
      : 0;
    this.setData({
      items: filtered.slice(0, 80),
      chartItems: filtered,
      chartTooltip: null,
      chartStatus: filtered.length ? '' : '暂无可绘制数据',
      legendItems: buildLegendItems(selectedFormats, this.data.allSpeedFormats),
      summary: {
        count: filtered.length,
        averageLength: number(averageLength, 1),
        averageWinRate: percent(averageWinRate),
      },
    }, () => {
      nextRender(() => this.drawChart());
    });
  },

  drawChart() {
    const items = this.data.chartItems || [];
    queryElementInfo(this, '#speedChartPlot', (chartInfo) => {
      if (!chartInfo) {
        this.chartPoints = [];
        this.setData({
          chartOverlayPoints: [],
          xAxisTicks: [],
          yAxisTicks: [],
          chartStatus: '当前微信版本暂不支持此图表，已保留下方数据列表',
        });
        return;
      }

      const width = chartInfo.width;
      const height = chartInfo.height;
      this.chartRect = {
        left: Number(chartInfo.left || 0),
        top: Number(chartInfo.top || 0),
      };
      if (!width || !height) {
        this.chartPoints = [];
        this.setData({
          chartOverlayPoints: [],
          xAxisTicks: [],
          yAxisTicks: [],
          chartStatus: '图表区域暂未准备好，已保留下方数据列表',
        });
        return;
      }

      try {
        if (items.length && this.data.chartStatus) {
          this.setData({ chartStatus: '' });
        }
        this.drawChartContent(width, height, items);
      } catch (error) {
        this.chartPoints = [];
        this.setData({
          chartOverlayPoints: [],
          xAxisTicks: [],
          yAxisTicks: [],
          chartStatus: '图表绘制失败，已保留下方数据列表',
        });
      }
    });
  },

  drawChartContent(width, height, items) {
    if (!items.length) {
      this.chartPoints = [];
      this.setData({
        chartOverlayPoints: [],
        xAxisTicks: [],
        yAxisTicks: [],
      });
      return;
    }

    const padding = chartPadding;
    const plotWidth = Math.max(1, width - padding.left - padding.right);
    const plotHeight = Math.max(1, height - padding.top - padding.bottom);
    const xValues = items.map((item) => Number(item.win_rate_on_play));
    const yValues = items.map((item) => Number(item.average_game_length));
    let xMin = Math.min(...xValues);
    let xMax = Math.max(...xValues);
    let yMin = Math.min(...yValues);
    let yMax = Math.max(...yValues);
    const xPad = Math.max(0.002, (xMax - xMin) * 0.08);
    const yPad = Math.max(0.2, (yMax - yMin) * 0.08);
    xMin -= xPad;
    xMax += xPad;
    yMin -= yPad;
    yMax += yPad;

    const yAxisTicks = [];
    for (let index = 0; index <= 4; index += 1) {
      const y = padding.top + (plotHeight * index) / 4;
      const value = yMax - ((yMax - yMin) * index) / 4;
      yAxisTicks.push({
        key: `y-${index}`,
        top: Math.round(y * 10) / 10,
        label: value.toFixed(1),
      });
    }

    const xAxisTicks = [];
    for (let index = 0; index <= 4; index += 1) {
      const x = padding.left + (plotWidth * index) / 4;
      const value = xMin + ((xMax - xMin) * index) / 4;
      xAxisTicks.push({
        key: `x-${index}`,
        left: Math.round(x * 10) / 10,
        label: `${(value * 100).toFixed(1)}%`,
      });
    }

    const selectedKey = this.data.chartTooltip && this.data.chartTooltip.key;
    const rawPoints = items.map((item, index) => {
      const x = padding.left + ((Number(item.win_rate_on_play) - xMin) / (xMax - xMin)) * plotWidth;
      const y = padding.top + ((yMax - Number(item.average_game_length)) / (yMax - yMin)) * plotHeight;
      const key = `${item.expansion}-${item.event_type}-${index}`;
      return { x, y, key, item };
    });
    const points = spreadOverlappingPoints(rawPoints, {
      left: padding.left + 5,
      right: width - padding.right - 5,
      top: padding.top + 5,
      bottom: height - padding.bottom - 5,
    });

    points.forEach((point) => {
      point.selected = point.key === selectedKey;
    });

    this.chartPoints = points;
    this.setData({
      chartFrame: {
        left: padding.left,
        right: padding.right,
        top: padding.top,
        bottom: padding.bottom,
        labelWidth: padding.left - 8,
        xTitleLeft: Math.round((padding.left + plotWidth / 2) * 10) / 10,
        yTitleTop: Math.round((padding.top + plotHeight / 2) * 10) / 10,
      },
      xAxisTicks,
      yAxisTicks,
      chartOverlayPoints: points.map((point) => {
        const style = getFormatStyle(point.item.event_type);
        const isSelected = point.selected;
        return {
          key: point.key,
          left: Math.round(point.x * 10) / 10,
          top: Math.round(point.y * 10) / 10,
          color: isSelected ? '#f59e0b' : style.color,
          shape: style.shape,
          setGlyph: point.item.setGlyph,
          selected: isSelected,
        };
      }),
    });
  },

  showChartTooltip(point) {
    if (!point || !point.item) return;
    const item = point.item;
    this.setData({
      chartTooltip: {
        key: point.key,
        title: `${item.expansion} · ${item.eventTypeText || item.event_type}`,
        winRate: item.winRateText,
        length: `${item.lengthText} 回合`,
        color: item.markerColor,
        shape: item.markerShape,
        format: item.shortFormatLabel,
        setGlyph: item.setGlyph,
      },
    }, () => this.drawChart());
  },

  onMarkerTap(event) {
    const key = event.currentTarget.dataset.key;
    const point = (this.chartPoints || []).find((item) => item.key === key);
    this.showChartTooltip(point);
  },

  onChartTouch(event) {
    const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
    if (!touch || !this.chartPoints || !this.chartPoints.length) return;
    const chartLeft = (this.chartRect && this.chartRect.left) || 0;
    const chartTop = (this.chartRect && this.chartRect.top) || 0;
    let touchX = touch.x;
    let touchY = touch.y;
    if (touchX === undefined && touch.clientX !== undefined) touchX = touch.clientX - chartLeft;
    if (touchY === undefined && touch.clientY !== undefined) touchY = touch.clientY - chartTop;
    if (touchX === undefined || touchY === undefined || Number.isNaN(touchX) || Number.isNaN(touchY)) return;

    let nearest = null;
    let nearestDistance = Infinity;
    this.chartPoints.forEach((point) => {
      const distance = Math.sqrt((point.x - touchX) ** 2 + (point.y - touchY) ** 2);
      if (distance < nearestDistance) {
        nearest = point;
        nearestDistance = distance;
      }
    });

    if (!nearest || nearestDistance > 28) {
      this.setData({ chartTooltip: null }, () => this.drawChart());
      return;
    }

    this.showChartTooltip(nearest);
  },

  onShareAppMessage() {
    return {
      title: '赛制速度 - 十七地小助手',
      path: '/pages/speed/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: '赛制速度 - 十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },

});
