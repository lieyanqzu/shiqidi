const {
  fetchChineseSetNames,
  searchMtgchCards,
  buildScryfallImageUrl,
} = require('../../utils/api');
const { toDisplayError } = require('../../utils/display-error');
const { loadRemoteDataMap } = require('../../utils/remote-data');
const { generatePageShareImage } = require('../../utils/share-image');

function weightedRandom(items, weights) {
  const totalWeight = weights.reduce((sum, weight) => sum + Number(weight || 0), 0);
  let random = Math.random() * totalWeight;
  for (let index = 0; index < items.length; index += 1) {
    random -= Number(weights[index] || 0);
    if (random <= 0) return items[index];
  }
  return items[items.length - 1];
}

function parseCardId(id) {
  const [setCode, number] = String(id).split(':');
  return { setCode, number };
}

function isFoilCardId(id) {
  const parts = String(id || '').split(':');
  return parts.length >= 3 && parts[2] === 'foil';
}

function drawFromSheet(sheet, count, sheetName) {
  const ids = Object.keys(sheet.cards || {});
  const weights = ids.map((id) => sheet.cards[id]);
  const cards = [];
  for (let index = 0; index < count; index += 1) {
    const id = weightedRandom(ids, weights);
    const parsed = parseCardId(id);
    cards.push({
      id,
      sheet: sheetName,
      setCode: parsed.setCode,
      number: parsed.number,
      displayName: id,
      displayTitle: id,
      rarityOrSheet: formatCardRarityOrSheet('', sheetName),
      rarity: '',
      zhsName: '',
      imageUrl: '',
      fallbackImageUrl: '',
      imageFailed: false,
    });
  }
  return cards;
}

function normalizeNumber(number) {
  const text = String(number || '');
  return /\d+[a-z]$/i.test(text) ? text.slice(0, -1) : text;
}

const rarityLabels = {
  mythic: '秘稀',
  rare: '稀有',
  uncommon: '非普通',
  common: '普通',
};

const sheetLabels = {
  common: '普通',
  uncommon: '非普通',
  rare: '稀有',
  mythic: '秘稀',
  rare_mythic: '稀有/秘稀',
  wildcard: '随机',
  foil: '闪卡',
  foil_common: '闪普通',
  foil_uncommon: '闪非普通',
  foil_rare_mythic: '闪稀有/秘稀',
  foil_land: '闪地',
  foil_basic: '闪基本地',
  non_foil_land: '非闪地',
  non_foil_u_mystical_archive: '非闪非普通档案',
  foil_u_mystical_archive: '闪非普通档案',
  non_foil_r_m_mystical_archive: '非闪稀有/秘稀档案',
  foil_r_m_mystical_archive: '闪稀有/秘稀档案',
  mystical_archive: '档案',
  enchanting_tales: '奇谭秘录',
  commander: '指挥官',
  boosterfun: '特殊框',
  foil_boosterfun: '闪特殊框',
  special_guest: '特邀卡',
  the_list: '特选列表',
  foil_with_showcase: '闪展示框',
};

function formatSheetLabel(sheetName) {
  const key = String(sheetName || '');
  if (!key) return '未知类别';
  if (sheetLabels[key]) return sheetLabels[key];
  return '特殊类别';
}

function formatCardRarityOrSheet(rarity, sheetName) {
  const key = String(rarity || '').toLowerCase();
  return rarityLabels[key] || formatSheetLabel(sheetName);
}

function shouldAutoFlip(card, autoFlipLowRarity) {
  return autoFlipLowRarity && (card.rarity === 'common' || card.rarity === 'uncommon');
}

function buildSetNameMap(response) {
  const names = {};
  (response || []).forEach((item) => {
    if (!item || !item.code || !item.translated_name) return;
    const code = String(item.code);
    names[code] = item.translated_name;
    names[code.toUpperCase()] = item.translated_name;
    names[code.toLowerCase()] = item.translated_name;
  });
  return names;
}

function applyChineseSetNames(sets, names) {
  return sets.map((set) => ({
    ...set,
    displayName: names[set.code] || set.name || set.code,
  }));
}

Page({
  data: {
    sets: [],
    selectedIndex: 0,
    boosterIndex: 0,
    boosters: [],
    loading: false,
    dataLoading: true,
    error: '',
    pack: [],
    autoFlipLowRarity: false,
    selectedPreviewCard: null,
    selectedPreviewIndex: -1,
    previewImageLoading: false,
    shareImageUrl: '',
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    this.loadSimulatorData();
    this.prepareShareImage();
  },

  async prepareShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: '开包模拟器',
        subtitle: '实用工具',
        description: '模拟开启补充包，体验开包乐趣',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  async loadSimulatorData() {
    this.setData({ dataLoading: true, error: '' });
    try {
      const data = await loadRemoteDataMap(['booster-config', 'sealed-basic-data']);
      this.boosterConfig = data['booster-config'];
      this.sealedBasicData = data['sealed-basic-data'];
      this.setData({
        sets: ((this.boosterConfig && this.boosterConfig.sets) || []).map((set) => ({
          ...set,
          displayName: set.name || set.code,
        })),
        dataLoading: false,
      }, () => {
        this.selectSet(0);
        this.loadChineseSetNames();
      });
    } catch (error) {
      this.setData({
        dataLoading: false,
        error: toDisplayError(error, '开包数据加载失败'),
      });
    }
  },

  async loadChineseSetNames() {
    try {
      const response = await fetchChineseSetNames();
      const names = buildSetNameMap(response);
      this.setData({
        sets: applyChineseSetNames(this.data.sets, names),
      });
    } catch (error) {
      // 系列名本地化失败不影响开包主流程，保留原始系列代码展示。
    }
  },

  onSetChange(event) {
    this.selectSet(Number(event.detail.value));
  },

  onBoosterChange(event) {
    this.setData({
      boosterIndex: Number(event.detail.value),
      pack: [],
      selectedPreviewCard: null,
      selectedPreviewIndex: -1,
      previewImageLoading: false,
    });
  },

  selectSet(index) {
    const set = this.data.sets[index] || {};
    this.setData({
      selectedIndex: index,
      boosterIndex: 0,
      boosters: set.boosters || [],
      pack: [],
      selectedPreviewCard: null,
      selectedPreviewIndex: -1,
      previewImageLoading: false,
    });
  },

  onAutoFlipChange(event) {
    this.setData({
      autoFlipLowRarity: event.detail.value,
    });
  },

  async ensureSealedData() {
    if (!Array.isArray(this.sealedBasicData)) {
      throw new Error('开包出率数据未加载');
    }
    return this.sealedBasicData;
  },

  async openPack() {
    const booster = this.data.boosters[this.data.boosterIndex];
    if (!booster) return;

    this.setData({ loading: true, error: '', pack: [], selectedPreviewCard: null, selectedPreviewIndex: -1, previewImageLoading: false });
    try {
      const sealedData = await this.ensureSealedData();
      const boosterData = (sealedData || []).find((item) => item.code === booster.code);
      if (!boosterData) {
        throw new Error(`找不到补充包数据：${booster.code}`);
      }

      const boosterType = weightedRandom(
        boosterData.boosters,
        boosterData.boosters.map((item) => item.weight),
      );

      let cards = [];
      Object.keys(boosterType.sheets || {}).forEach((sheetName) => {
        const sheet = boosterData.sheets[sheetName];
        const count = boosterType.sheets[sheetName];
        if (sheet && count) {
          cards = cards.concat(drawFromSheet(sheet, count, sheetName));
        }
      });

      cards = await this.enrichCards(cards);
      const packKey = Date.now();
      cards = cards.map((card, index) => ({
        ...card,
        uid: `${packKey}-${index}-${card.id}`,
        packNumber: 1,
        cardIndex: index,
        isFoil: isFoilCardId(card.id),
        flipped: shouldAutoFlip(card, this.data.autoFlipLowRarity),
      }));

      this.setData({
        pack: cards,
        loading: false,
      });
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '开包失败'),
      });
    }
  },

  flipCard(event) {
    const index = Number(event.currentTarget.dataset.index);
    const card = this.data.pack[index];
    if (!card) return;
    if (card.flipped) {
      this.previewPackCard(card);
      return;
    }

    const nextPack = this.data.pack.map((item, itemIndex) => (
      itemIndex === index ? { ...item, flipped: true } : item
    ));
    this.setData({
      pack: nextPack,
    });
  },

  previewPackCard(card) {
    const current = card.imageUrl || card.fallbackImageUrl;
    if (!current) return;
    const previewCards = this.getPreviewCards();
    const previewIndex = previewCards.findIndex((item) => item.uid === card.uid);
    this.setData({
      selectedPreviewCard: {
        ...card,
        previewImageUrl: current,
      },
      selectedPreviewIndex: previewIndex,
      previewImageLoading: true,
    });
  },

  getPreviewCards() {
    return this.data.pack
      .filter((item) => item.flipped && !item.imageFailed && (item.imageUrl || item.fallbackImageUrl))
      .map((item) => ({
        ...item,
        previewImageUrl: item.imageUrl || item.fallbackImageUrl,
      }));
  },

  switchPreviewCard(offset) {
    const previewCards = this.getPreviewCards();
    if (!previewCards.length) return;
    const currentIndex = this.data.selectedPreviewIndex >= 0 ? this.data.selectedPreviewIndex : 0;
    const nextIndex = (currentIndex + offset + previewCards.length) % previewCards.length;
    this.setData({
      selectedPreviewCard: previewCards[nextIndex],
      selectedPreviewIndex: nextIndex,
      previewImageLoading: true,
    });
  },

  onPreviewTouchStart(event) {
    const touch = event.touches && event.touches[0];
    if (!touch) return;
    this.previewTouchStart = {
      x: touch.clientX,
      y: touch.clientY,
    };
  },

  onPreviewTouchEnd(event) {
    const start = this.previewTouchStart;
    const touch = (event.changedTouches && event.changedTouches[0]) || (event.touches && event.touches[0]);
    this.previewTouchStart = null;
    if (!start || !touch) return;
    const deltaX = touch.clientX - start.x;
    const deltaY = touch.clientY - start.y;
    if (Math.abs(deltaX) < 60 || Math.abs(deltaX) < Math.abs(deltaY) * 1.2) return;
    this.switchPreviewCard(deltaX < 0 ? 1 : -1);
  },

  noop() {},

  handlePreviewImageLoad() {
    this.setData({ previewImageLoading: false });
  },

  handlePreviewImageError() {
    this.setData({ previewImageLoading: false });
  },

  closePreviewCard() {
    this.setData({ selectedPreviewCard: null, selectedPreviewIndex: -1, previewImageLoading: false });
  },

  async enrichCards(cards) {
    const query = cards.map((card) => {
      const baseNumber = normalizeNumber(card.number);
      if (baseNumber !== card.number) {
        return `(s=${card.setCode} number=${card.number}) or (s=${card.setCode} number=${baseNumber})`;
      }
      return `(s=${card.setCode} number=${card.number})`;
    }).join(' or ');

    try {
      const response = await searchMtgchCards(query, 100, { unique: 'prints' });
      const items = response.items || [];
      return cards.map((card) => {
        const baseNumber = normalizeNumber(card.number);
        const info = items.find((item) => (
          String(item.set).toLowerCase() === String(card.setCode).toLowerCase() &&
          (String(item.collector_number) === String(card.number) || String(item.collector_number) === String(baseNumber))
        ));
        if (!info) return card;
        const rarity = String(info.rarity || '').toLowerCase();
        return {
          ...card,
          displayName: info.display_name || card.id,
          zhsName: info.display_name_zh || info.display_name || card.id,
          displayTitle: info.display_name_zh || info.display_name || card.id,
          rarity,
          rarityOrSheet: formatCardRarityOrSheet(rarity, card.sheet),
          scryfallId: info.id,
          imageUrl: info.image_url || (info.id ? buildScryfallImageUrl(info.id) : ''),
          fallbackImageUrl: info.image_url && info.id ? buildScryfallImageUrl(info.id) : '',
          imageFailed: false,
        };
      });
    } catch (error) {
      return cards;
    }
  },

  handleImageError(event) {
    const { index } = event.currentTarget.dataset;
    const card = this.data.pack[index];
    if (!card) return;
    if (card.fallbackImageUrl && card.imageUrl !== card.fallbackImageUrl) {
      this.setData({
        [`pack[${index}].imageUrl`]: card.fallbackImageUrl,
      });
      return;
    }
    this.setData({
      [`pack[${index}].imageUrl`]: '',
      [`pack[${index}].fallbackImageUrl`]: '',
      [`pack[${index}].imageFailed`]: true,
    });
  },

  onShareAppMessage() {
    return {
      title: '开包模拟器 - 十七地小助手',
      path: '/pages/simulator/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: '开包模拟器 - 十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },

});
