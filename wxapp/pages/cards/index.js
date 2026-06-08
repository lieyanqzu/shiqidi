const {
  fetchCardData,
  fetchChineseNames,
  fetchCardDetailById,
  fetchFilterMetadata,
  buildMtgchImageUrl,
  buildScryfallImageUrl,
} = require('../../utils/api');
const { percent, number, normalizeCardName, denormalizeCardName } = require('../../utils/format');
const { parseManaCost, parseColorSymbols, parseManaTextSegments } = require('../../utils/mana');
const { copyText, showActionMenu, showToast } = require('../../utils/wx-actions');
const { toDisplayError } = require('../../utils/display-error');
const { readStorage, writeStorage } = require('../../utils/storage');
const { loadKeyruneFont, loadManaFont } = require('../../utils/font');
const { getSetIconGlyph } = require('../../data/set-icons');
const { fetchRemoteData } = require('../../utils/remote-data');
const {
  gradeMetrics,
  calculateGrades,
  groupCardsByGrade,
} = require('../../utils/grades');

const storageKeys = {
  gradeMetric: 'cards.gradeMetric',
};

const cardDetailCache = {};

let expansionOptions = [];
let formatOptions = [];
let cardDataDefaults = {};
let userGroupOptions = [];
let deckColorOptions = [];
let rarityLabels = {};
let colorOptions = [];
let rarityOptions = [];

const emptyFilterMetadata = {
  formats_by_expansion: {},
  start_dates: {},
};

const gradeHelpItems = [
  '评分基于当前查询返回的全部卡牌计算均值和标准差，再把可见卡牌放入对应等级。',
  'C 等级对应均值附近，相邻半级默认相差 0.33 个标准差，和 Web 端评分规则一致。',
  '系列、赛制、日期等查询条件会重新拉取并重新计算整体分布。',
  '颜色、稀有度和搜索只过滤展示结果，不改变已经计算出的等级。',
];

const rarityShortLabels = {
  common: 'C',
  uncommon: 'U',
  rare: 'R',
  mythic: 'M',
};

function applyOptions(options = {}) {
  expansionOptions = Array.isArray(options.expansionOptions) ? options.expansionOptions : [];
  formatOptions = Array.isArray(options.formatOptions) ? options.formatOptions : [];
  cardDataDefaults = options.cardDataDefaults || {};
  userGroupOptions = Array.isArray(options.userGroupOptions) ? options.userGroupOptions : [];
  deckColorOptions = Array.isArray(options.deckColorOptions) ? options.deckColorOptions : [];
  rarityLabels = options.rarityLabels || {};
  colorOptions = Array.isArray(options.colorOptions) ? options.colorOptions : [];
  rarityOptions = Array.isArray(options.rarityOptions) ? options.rarityOptions : [];
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

function getOptionIndex(options, value) {
  const index = options.findIndex((item) => item.value === value);
  return index >= 0 ? index : 0;
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
  const userGroupValue = '';
  const deckColorValue = '';
  return {
    filterMetadata: getFilterMetadata(metadata),
    availableFormatOptions,
    params: {
      expansion,
      event_type: formatOption ? formatOption.value : 'PremierDraft',
      user_group: userGroupValue,
      colors: deckColorValue,
      start_date: getDefaultStartDate(expansion, metadata),
      end_date: today(),
    },
    expansionIndex: getExpansionIndex(expansion),
    formatIndex,
    userGroupIndex: getOptionIndex(userGroupOptions, userGroupValue),
    deckColorIndex: getOptionIndex(deckColorOptions, deckColorValue),
    currentSetGlyph: getSetIconGlyph(expansion),
  };
}

function resetResultState() {
  return {
    loading: false,
    error: '',
    cardCount: 0,
    filteredCount: 0,
    gradeGroups: [],
    selectedCard: null,
    selectedCardDetail: null,
    selectedCardDetailLoading: false,
    selectedCardDetailError: '',
  };
}

function extractScryfallId(url) {
  const match = String(url || '').match(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\./i);
  return match ? match[1] : '';
}

function colorBucket(card) {
  const color = card.color || '';
  if (!color) return 'C';
  if (color.length > 1) return 'M';
  return color;
}

function matchSelectedColors(card, selectedColors) {
  if (!selectedColors.length) return true;

  const cardColors = card.color ? String(card.color).split('') : [];
  const isMulticolor = cardColors.length > 1;
  const isColorless = cardColors.length === 0;
  const hasMulticolorSelected = selectedColors.includes('M');
  const hasColorlessSelected = selectedColors.includes('C');

  if (isColorless && hasColorlessSelected) {
    return true;
  }

  if (hasMulticolorSelected) {
    if (!isMulticolor) {
      return false;
    }

    const selectedBasicColors = selectedColors.filter((color) => 'WUBRG'.includes(color));
    if (selectedBasicColors.length) {
      return selectedBasicColors.every((color) => cardColors.includes(color));
    }
    return true;
  }

  const selectedBasicColors = selectedColors.filter((color) => 'WUBRG'.includes(color));
  if (selectedBasicColors.length) {
    return selectedBasicColors.some((color) => cardColors.includes(color));
  }

  return false;
}

function normalizeRarity(value) {
  return String(value || '').toLowerCase().replace(/[^a-z]/g, '') || 'unknown';
}

function toggleValue(values, value) {
  return values.includes(value)
    ? values.filter((item) => item !== value)
    : values.concat(value);
}

function decorateToggleOptions(options, selectedValues) {
  return options.map((item) => ({
    ...item,
    active: selectedValues.includes(item.value),
  }));
}

function stripHtml(html) {
  return String(html || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .trim();
}

function buildDetailFace(detail, fallbackName) {
  const manaCostText = stripHtml(detail.mana_cost_html);
  const oracleText = stripHtml(detail.oracle_text_html);
  return {
    name: detail.display_name_zh || detail.display_name || fallbackName || '',
    typeLine: detail.display_type_line || '',
    oracleText,
    oracleSegments: parseManaTextSegments(oracleText),
    flavorText: stripHtml(detail.flavor_text_html),
    powerText: detail.power_toughness_loyalty_defense || '',
    manaCostText,
    manaCostSymbols: parseManaCost(manaCostText),
  };
}

function buildCardDetail(detail, fallbackName) {
  const faces = [buildDetailFace(detail, fallbackName)];
  if (Array.isArray(detail.other_faces) && detail.other_faces.length) {
    detail.other_faces.forEach((face) => {
      faces.push(buildDetailFace(face, face.display_name_zh || face.display_name));
    });
  }
  return {
    isDoubleFaced: faces.length > 1,
    faces,
  };
}

function loadMetricIndex() {
  const savedMetric = readStorage(storageKeys.gradeMetric);
  const index = gradeMetrics.findIndex((item) => item.value === savedMetric);
  return index >= 0 ? index : 0;
}

Page({
  data: {
    expansionOptions: [],
    formatOptions: [],
    userGroupOptions: [],
    deckColorOptions: [],
    gradeMetricOptions: gradeMetrics,
    gradeHelpItems,
    colorFilterOptions: [],
    rarityFilterOptions: [],
    ...buildInitialState(),
    metricIndex: 0,
    currentMetricLabel: gradeMetrics[0].shortLabel,
    searchText: '',
    selectedColors: [],
    selectedRarities: [],
    queryPanelOpen: false,
    filterPanelOpen: false,
    chineseNameMap: {},
    setIconFontReady: false,
    manaFontReady: false,
    gradeHelpOpen: false,
    ...resetResultState(),
  },

  onLoad() {
    this.loadSetIconFont();
    this.loadManaIconFont();
    const metricIndex = loadMetricIndex();
    const metricOption = gradeMetrics[metricIndex] || gradeMetrics[0];
    this.setData({
      metricIndex,
      currentMetricLabel: metricOption.shortLabel,
    });
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
        userGroupOptions,
        deckColorOptions,
        colorFilterOptions: decorateToggleOptions(colorOptions, []),
        rarityFilterOptions: decorateToggleOptions(rarityOptions, []),
        ...buildInitialState(),
      }, () => this.loadFilterMetadata());
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '筛选配置加载失败'),
      });
    }
  },

  async loadFilterMetadata() {
    try {
      const metadata = await fetchFilterMetadata();
      const initialState = buildInitialState(metadata);
      this.setData(initialState, () => this.loadCards());
    } catch (error) {
      this.loadCards();
    }
  },

  loadSetIconFont() {
    loadKeyruneFont(() => {
      this.setData({ setIconFontReady: true });
    });
  },

  loadManaIconFont() {
    loadManaFont(() => {
      this.setData({ manaFontReady: true });
    });
  },

  reloadAfterParamChange(nextData) {
    this.cardLoadRequestId = '';
    this.allCards = [];
    this.setData({
      ...resetResultState(),
      ...nextData,
    }, () => {
      this.loadCards();
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
      currentSetGlyph: getSetIconGlyph(expansion),
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

  onUserGroupChange(event) {
    const index = Number(event.detail.value);
    this.reloadAfterParamChange({
      userGroupIndex: index,
      'params.user_group': userGroupOptions[index].value,
    });
  },

  onDeckColorChange(event) {
    const index = Number(event.detail.value);
    this.reloadAfterParamChange({
      deckColorIndex: index,
      'params.colors': deckColorOptions[index].value,
    });
  },

  onDateChange(event) {
    const { field } = event.currentTarget.dataset;
    this.reloadAfterParamChange({
      [`params.${field}`]: event.detail.value,
    });
  },

  toggleQueryPanel() {
    this.setData({ queryPanelOpen: !this.data.queryPanelOpen });
  },

  toggleFilterPanel() {
    this.setData({ filterPanelOpen: !this.data.filterPanelOpen });
  },

  onMetricChange(event) {
    const metricIndex = Number(event.detail.value);
    const metricOption = gradeMetrics[metricIndex] || gradeMetrics[0];
    writeStorage(storageKeys.gradeMetric, metricOption.value);
    this.setData({
      metricIndex,
      currentMetricLabel: metricOption.shortLabel,
    }, () => this.applyFilter());
  },

  openGradeHelp() {
    this.setData({ gradeHelpOpen: true });
  },

  closeGradeHelp() {
    this.setData({ gradeHelpOpen: false });
  },

  onSearch(event) {
    this.setData({ searchText: event.detail.value }, () => this.applyFilter());
  },

  toggleColor(event) {
    const value = event.currentTarget.dataset.value;
    const selectedColors = toggleValue(this.data.selectedColors, value);
    this.setData({
      selectedColors,
      colorFilterOptions: decorateToggleOptions(colorOptions, selectedColors),
    }, () => this.applyFilter());
  },

  toggleRarity(event) {
    const value = event.currentTarget.dataset.value;
    const selectedRarities = toggleValue(this.data.selectedRarities, value);
    this.setData({
      selectedRarities,
      rarityFilterOptions: decorateToggleOptions(rarityOptions, selectedRarities),
    }, () => this.applyFilter());
  },

  clearFilters() {
    this.setData({
      searchText: '',
      selectedColors: [],
      selectedRarities: [],
      colorFilterOptions: decorateToggleOptions(colorOptions, []),
      rarityFilterOptions: decorateToggleOptions(rarityOptions, []),
    }, () => this.applyFilter());
  },

  async loadCards() {
    const requestId = `${Date.now()}-${Math.random()}`;
    this.cardLoadRequestId = requestId;
    this.setData({ loading: true, error: '', selectedCard: null });
    try {
      const [cards, chineseNames] = await Promise.all([
        fetchCardData(this.data.params),
        this.ensureChineseNames(),
      ]);
      if (this.cardLoadRequestId !== requestId) return;
      const mappedCards = cards.map((card) => {
        const id = extractScryfallId(card.url);
        const normalizedName = normalizeCardName(card.name);
        const chineseName = chineseNames[normalizedName] || chineseNames[card.name] || card.name;
        const displayChineseName = denormalizeCardName(chineseName);
        const rarityClass = normalizeRarity(card.rarity);
        return {
          ...card,
          id,
          chineseName: displayChineseName,
          rarityClass,
          rarityText: rarityLabels[rarityClass] || card.rarity,
          rarityShort: rarityShortLabels[rarityClass] || String(card.rarity || '?').slice(0, 1).toUpperCase(),
          colorText: card.color || '无色',
          colorSymbols: parseColorSymbols(card.color),
          colorBucket: colorBucket(card),
          gihText: percent(card.ever_drawn_win_rate),
          ohText: percent(card.opening_hand_win_rate),
          gdText: percent(card.drawn_win_rate),
          iihText: percent(card.drawn_improvement_win_rate),
          gpText: percent(card.win_rate),
          playText: percent(card.play_rate),
          ataText: number(card.avg_pick, 2),
          alsaText: number(card.avg_seen, 2),
          seenText: number(card.seen_count, 0),
          pickedText: number(card.pick_count, 0),
          gameText: number(card.game_count, 0),
          ohCountText: number(card.opening_hand_game_count, 0),
          gdCountText: number(card.drawn_game_count, 0),
          gihCountText: number(card.ever_drawn_game_count, 0),
          gnsText: percent(card.never_drawn_win_rate),
          gnsCountText: number(card.never_drawn_game_count, 0),
          imageUrl: id ? buildMtgchImageUrl(id) : '',
          fallbackImageUrl: id ? buildScryfallImageUrl(id) : card.url,
          imageFailed: false,
          artCropImageUrl: id ? buildScryfallImageUrl(id, 'art_crop') : '',
          artCropFailed: false,
          metricText: '',
          grade: '',
        };
      });

      this.allCards = mappedCards;
      this.setData({
        cardCount: mappedCards.length,
        loading: false,
      }, () => this.applyFilter());
    } catch (error) {
      if (this.cardLoadRequestId !== requestId) return;
      this.setData({
        loading: false,
        error: toDisplayError(error, '卡牌数据加载失败'),
      });
    }
  },

  async ensureChineseNames() {
    if (Object.keys(this.data.chineseNameMap).length) {
      return this.data.chineseNameMap;
    }
    const data = await fetchChineseNames();
    const map = {};
    data.forEach((item) => {
      if (item[0] && item[1]) {
        map[item[0]] = item[1];
      }
    });
    this.setData({ chineseNameMap: map });
    return map;
  },

  applyFilter() {
    const keyword = this.data.searchText.trim().toLowerCase();
    const selectedColors = this.data.selectedColors;
    const selectedRarities = this.data.selectedRarities;
    const metricOption = gradeMetrics[this.data.metricIndex] || gradeMetrics[0];
    const cards = this.allCards || [];
    const gradedCards = calculateGrades(cards, metricOption.value);
    const gradeMap = {};
    gradedCards.forEach((card) => {
      gradeMap[card.name] = card;
    });

    const filtered = cards.filter((card) => {
      if (keyword && !String(card.name).toLowerCase().includes(keyword) && !String(card.chineseName).toLowerCase().includes(keyword)) {
        return false;
      }
      if (!matchSelectedColors(card, selectedColors)) {
        return false;
      }
      if (selectedRarities.length && !selectedRarities.includes(String(card.rarity).toLowerCase())) {
        return false;
      }
      return true;
    }).map((card) => {
      const graded = gradeMap[card.name] || card;
      const detailSource = {
        ...card,
        grade: graded.grade || '-',
        metricText: graded.metricText || '-',
        stdDevText: graded.stdDevText || '-',
        metricValue: Number.isFinite(Number(graded.metricValue)) ? Number(graded.metricValue) : 0,
        hasGradeData: graded.hasGradeData !== false,
      };
      return {
        name: detailSource.name,
        chineseName: detailSource.chineseName,
        id: detailSource.id,
        color: detailSource.color,
        colorBucket: detailSource.colorBucket,
        colorSymbols: detailSource.colorSymbols,
        rarityClass: detailSource.rarityClass,
        rarityText: detailSource.rarityText,
        rarityShort: detailSource.rarityShort,
        imageUrl: detailSource.imageUrl,
        fallbackImageUrl: detailSource.fallbackImageUrl,
        imageFailed: detailSource.imageFailed,
        artCropImageUrl: detailSource.artCropImageUrl,
        artCropFailed: detailSource.artCropFailed,
        grade: detailSource.grade,
        metricText: detailSource.metricText,
        metricValue: detailSource.metricValue,
        stdDevText: detailSource.stdDevText,
        hasGradeData: detailSource.hasGradeData,
        alsaText: detailSource.alsaText,
        ataText: detailSource.ataText,
        seenText: detailSource.seenText,
        pickedText: detailSource.pickedText,
        gameText: detailSource.gameText,
        playText: detailSource.playText,
        gpText: detailSource.gpText,
        ohText: detailSource.ohText,
        gdText: detailSource.gdText,
        gihText: detailSource.gihText,
        iihText: detailSource.iihText,
        gnsText: detailSource.gnsText,
        ohCountText: detailSource.ohCountText,
        gdCountText: detailSource.gdCountText,
        gihCountText: detailSource.gihCountText,
        gnsCountText: detailSource.gnsCountText,
      };
    });

    this.setData({
      filteredCount: filtered.length,
      gradeGroups: groupCardsByGrade(filtered),
    });
  },

  showCard(event) {
    const { index, source, grade } = event.currentTarget.dataset;
    let selectedCard = null;
    if (source === 'grade') {
      const group = this.data.gradeGroups.find((item) => item.grade === grade);
      selectedCard = group && group.cards ? group.cards[index] : null;
    }
    if (!selectedCard) return;
    this.setData({
      selectedCard,
      selectedCardDetail: null,
      selectedCardDetailLoading: !!selectedCard.id,
      selectedCardDetailError: '',
    });
    this.loadSelectedCardDetail(selectedCard);
  },

  async loadSelectedCardDetail(card) {
    if (!card || !card.id) {
      this.setData({
        selectedCardDetailLoading: false,
        selectedCardDetailError: card ? '缺少卡牌 ID，无法加载规则文本' : '',
      });
      return;
    }

    if (cardDetailCache[card.id]) {
      this.setData({
        selectedCardDetail: cardDetailCache[card.id],
        selectedCardDetailLoading: false,
        selectedCardDetailError: '',
      });
      return;
    }

    const requestId = `${card.id}-${Date.now()}`;
    this.cardDetailRequestId = requestId;
    try {
      const response = await fetchCardDetailById(card.id);
      if (this.cardDetailRequestId !== requestId) return;
      const detail = response && response.items && response.items[0];
      if (!detail) {
        this.setData({
          selectedCardDetailLoading: false,
          selectedCardDetailError: '未找到卡牌规则文本',
        });
        return;
      }
      const selectedCardDetail = buildCardDetail(detail, card.chineseName || card.name);
      cardDetailCache[card.id] = selectedCardDetail;
      this.setData({
        selectedCardDetail,
        selectedCardDetailLoading: false,
        selectedCardDetailError: '',
      });
    } catch (error) {
      if (this.cardDetailRequestId !== requestId) return;
      this.setData({
        selectedCardDetailLoading: false,
        selectedCardDetailError: toDisplayError(error, '卡牌规则文本加载失败'),
      });
    }
  },

  closeCard() {
    this.cardDetailRequestId = '';
    this.setData({
      selectedCard: null,
      selectedCardDetail: null,
      selectedCardDetailLoading: false,
      selectedCardDetailError: '',
    });
  },

  noop() {},

  handleImageError() {
    const card = this.data.selectedCard;
    if (!card) return;
    if (card.fallbackImageUrl && card.imageUrl !== card.fallbackImageUrl) {
      this.setData({
        'selectedCard.imageUrl': card.fallbackImageUrl,
      });
      return;
    }
    this.setData({
      'selectedCard.imageUrl': '',
      'selectedCard.fallbackImageUrl': '',
      'selectedCard.imageFailed': true,
    });
  },

  handleListArtError(event) {
    const groupIndex = Number(event.currentTarget.dataset.groupIndex);
    const cardIndex = Number(event.currentTarget.dataset.cardIndex);
    const group = this.data.gradeGroups[groupIndex];
    const card = group && group.cards && group.cards[cardIndex];
    if (!card) return;

    const basePath = `gradeGroups[${groupIndex}].cards[${cardIndex}]`;
    this.setData({
      [`${basePath}.artCropImageUrl`]: '',
      [`${basePath}.artCropFailed`]: true,
    });
  },

  copySelectedCardField(field) {
    if (!this.data.selectedCard) return;
    const text = field === 'chineseName'
      ? this.data.selectedCard.chineseName
      : this.data.selectedCard.name;
    copyText(text, '卡名已复制', '卡名复制失败');
  },

  copySelectedCardLink() {
    const card = this.data.selectedCard;
    if (!card || !card.id) {
      showToast('缺少卡牌 ID');
      return;
    }
    copyText(`https://mtgch.com/result?q=id=${card.id}&utm_source=shiqidi`, '卡牌地址已复制', '卡牌地址复制失败');
  },

  openSelectedCardActions() {
    if (!this.data.selectedCard) return;
    showActionMenu(['复制中文名', '复制英文名', '复制卡牌地址'], (tapIndex) => {
      if (tapIndex === 0) {
        this.copySelectedCardField('chineseName');
      } else if (tapIndex === 1) {
        this.copySelectedCardField('name');
      } else if (tapIndex === 2) {
        this.copySelectedCardLink();
      }
    });
  },
});
