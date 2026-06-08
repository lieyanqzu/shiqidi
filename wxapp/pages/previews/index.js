const {
  toSiteUrl,
  searchMtgchCards,
  buildScryfallImageUrl,
} = require('../../utils/api');
const { parseManaCost, parseManaTextSegments } = require('../../utils/mana');
const { copyText, previewImages, showInfoModal } = require('../../utils/wx-actions');
const { canvasToTempFilePath, createCanvasContext } = require('../../utils/canvas');
const { toDisplayError } = require('../../utils/display-error');
const { loadKeyruneFont, loadManaFont } = require('../../utils/font');
const { getSetIconGlyph } = require('../../data/set-icons');
const { fetchRemoteData } = require('../../utils/remote-data');

const cardRefCache = {};
const REFERENCE_COLLAPSE_LIMIT = 12;
const cardShareCanvas = {
  id: 'cardShareCanvas',
  width: 600,
  height: 480,
};

const rarityLabels = {
  common: '普通',
  uncommon: '非普通',
  rare: '稀有',
  mythic: '秘稀',
};

function buildAbilityDescriptionMap(items) {
  const map = {};
  (items || []).forEach((item) => {
    if (!item || !item.name || !item.text) return;
    const names = [item.name].concat(Array.isArray(item.alias) ? item.alias : []);
    names.forEach((name) => {
      const key = String(name || '').trim().toLowerCase();
      if (key) map[key] = item.text;
    });
  });
  return map;
}

let syncedAbilityDescriptions = {};

const abilityDescriptions = {
  '幻变': '将一张牌幻变加入游戏。',
  conjure: '将一张牌加入游戏。',
  conjures: '将一张牌加入游戏。',
  '永久': '标注「永久」的效应，不会因牌张改变区域而移除。',
  perpetual: '标注「永久」的效应，不会因牌张改变区域而移除。',
  perpetually: '标注「永久」的效应，不会因牌张改变区域而移除。',
  '取出': '取出牌的流程是，随机将一张相应牌张从你的牌库置于你手上。',
  seek: '取出牌的流程是，随机将一张相应牌张从你的牌库置于你手上。',
  '抽选': '从法术书中抽选牌的流程为，从该牌的法术书内随机的三张牌中选择一张并加入你的手牌。',
  draft: '从法术书中抽选牌的流程为，从该牌的法术书内随机的三张牌中选择一张并加入你的手牌。',
  '双打': '当一个具双打异能的生物攻击时，若它不是衍生物，则将一个副本幻变进你手上，然后这两者均永久性失去双打异能。',
  'double team': '当一个具双打异能的生物攻击时，若它不是衍生物，则将一个副本幻变进你手上，然后这两者均永久性失去双打异能。',
  '发动引擎！': '如果你没有速度，则从 1 开始。于你的每个回合中，当有对手失去生命时，此数值便会增加，但每回合限一次。速度极限为 4。',
  'start your engines!': '如果你没有速度，则从 1 开始。于你的每个回合中，当有对手失去生命时，此数值便会增加，但每回合限一次。速度极限为 4。',
  '再起': '你可以从你的坟墓场施放此牌，但必须支付其所需费用并额外弃一张牌。然后放逐此牌。',
  'jump-start': '你可以从你的坟墓场施放此牌，但必须支付其所需费用并额外弃一张牌。然后放逐此牌。',
  '竭绝': '每个竭绝异能只能起动一次。',
  exhaust: '每个竭绝异能只能起动一次。',
  '超载': '你可以支付此咒语的超载费用来施放它。若你如此作，则将其叙述中的「目标」更改为「每个」。',
  overload: '你可以支付此咒语的超载费用来施放它。若你如此作，则将其叙述中的「目标」更改为「每个」。',
  '飞行': '此生物只能被具飞行或延势异能的生物阻挡。',
  flying: '此生物只能被具飞行或延势异能的生物阻挡。',
  '威慑': '此生物只能被两个或更多生物阻挡。',
  menace: '此生物只能被两个或更多生物阻挡。',
  '敏捷': '此生物受你操控时便能攻击与横置。',
  haste: '此生物受你操控时便能攻击与横置。',
  '践踏': '此生物造成之过量战斗伤害能对所攻击的牌手或鹏洛客造成。',
  trample: '此生物造成之过量战斗伤害能对所攻击的牌手或鹏洛客造成。',
  '警戒': '此生物攻击时不需横置。',
  vigilance: '此生物攻击时不需横置。',
  '搭载': '横置任意数量由你操控且力量总和等于或大于 X 的生物：此载具成为神器生物直到回合结束。',
  crew: '横置任意数量由你操控且力量总和等于或大于 X 的生物：此载具成为神器生物直到回合结束。',
  crews: '横置任意数量由你操控且力量总和等于或大于 X 的生物：此载具成为神器生物直到回合结束。',
  '死触': '它对生物造成的任何数量伤害都足以消灭后者。',
  deathtouch: '它对生物造成的任何数量伤害都足以消灭后者。',
  '系命': '此生物所造成的伤害会让你获得等量的生命。',
  lifelink: '此生物所造成的伤害会让你获得等量的生命。',
  '先攻': '此生物会比不具先攻异能的生物提前造成战斗伤害。',
  'first strike': '此生物会比不具先攻异能的生物提前造成战斗伤害。',
  '连击': '此生物能造成先攻伤害以及普通战斗伤害。',
  'double strike': '此生物能造成先攻伤害以及普通战斗伤害。',
  '蓄势': '横置另一个由你操控的生物：依其力量在此永久物上放置等量的充电指示物。蓄势的时机视同法术。',
  station: '横置另一个由你操控的生物：依其力量在此永久物上放置等量的充电指示物。蓄势的时机视同法术。',
  stations: '横置另一个由你操控的生物：依其力量在此永久物上放置等量的充电指示物。蓄势的时机视同法术。',
  '跃迁': '你可以支付跃迁费用来从手上施放此牌。在下一个结束步骤开始时将其放逐，过了该回合后，便可再从放逐区施放之。',
  warp: '你可以支付跃迁费用来从手上施放此牌。在下一个结束步骤开始时将其放逐，过了该回合后，便可再从放逐区施放之。',
  '续战': '在生物上放置 X 个 +1/+1 指示物或派出一个 X/X 白色精怪衍生生物。',
  endure: '在生物上放置 X 个 +1/+1 指示物或派出一个 X/X 白色精怪衍生生物。',
  endures: '在生物上放置 X 个 +1/+1 指示物或派出一个 X/X 白色精怪衍生生物。',
  '显化': '显化某张牌的流程，是将该牌面朝下地放进战场，当成 2/2 生物。如果该牌是生物牌，则可随时支付其法术力费用使其翻回正面。',
  manifest: '显化某张牌的流程，是将该牌面朝下地放进战场，当成 2/2 生物。如果该牌是生物牌，则可随时支付其法术力费用使其翻回正面。',
  '延势': '此生物能阻挡具飞行异能的生物。',
  reach: '此生物能阻挡具飞行异能的生物。',
  '逸脱': '你可以从你坟墓场中施放此牌，并支付其逸脱费用。',
  escape: '你可以从你坟墓场中施放此牌，并支付其逸脱费用。',
  '温习': '你可以从游戏外展示一张由你拥有的课程牌并置于你手上，或弃一张牌来抓一张牌。',
  learn: '你可以从游戏外展示一张由你拥有的课程牌并置于你手上，或弃一张牌来抓一张牌。',
  '覆诵': '当你施放此咒语时，每支付一次覆诵费用，便将它复制一次。你可以为每个复制品选择新的目标。',
  replicate: '当你施放此咒语时，每支付一次覆诵费用，便将它复制一次。你可以为每个复制品选择新的目标。',
  '备法': '于其已备法期间，你可以施放其上咒语的复制品。施放之后其便撤法。',
  '已备法': '于其已备法期间，你可以施放其上咒语的复制品。施放之后其便撤法。',
  prepared: '于其已备法期间，你可以施放其上咒语的复制品。施放之后其便撤法。',
  '添补': '以此法添补的牌张需要更多法术力来施放，获得添补的颜色，且仍具有原本颜色。',
  '永久添补': '以此法添补的牌张需要更多法术力来施放，获得添补的颜色，且仍具有原本颜色。',
  incorporate: '以此法添补的牌张需要更多法术力来施放，获得添补的颜色，且仍具有原本颜色。',
};

function uniqueValues(values) {
  const seen = {};
  return values.filter((value) => {
    const key = String(value || '').toLowerCase();
    if (!key || seen[key]) return false;
    seen[key] = true;
    return true;
  });
}

function normalizeCardRef(ref) {
  const parts = String(ref || '').split(':');
  const setCode = String(parts[0] || '').trim().toUpperCase();
  const number = String(parts[1] || '').trim();
  return {
    key: `${setCode}:${number}`,
    setCode,
    number,
    baseNumber: /^(\d+)[ab]$/i.test(number) ? number.slice(0, -1) : number,
  };
}

function buildCardDetailUrl(ref) {
  if (!ref.setCode || !ref.baseNumber) return '';
  return `https://mtgch.com/card/${ref.setCode}/${ref.baseNumber}?utm_source=shiqidi`;
}

function decodeHtmlEntities(text) {
  return String(text || '')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"');
}

function stripHtmlMarkup(text) {
  return decodeHtmlEntities(String(text || '')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<[^>]+>/g, ''));
}

function parseInlineText(text) {
  const source = stripHtmlMarkup(text);
  const segments = [];
  const regex = /`([^`]+)`/g;
  let lastIndex = 0;
  let match;

  function pushSegment(type, value, extra = {}) {
    if (!value) return;
    segments.push({
      key: `${segments.length}-${type}-${value}`,
      type,
      text: value,
      ...extra,
    });
  }

  function pushTextWithMana(value) {
    parseManaTextSegments(value).forEach((segment) => {
      if (segment.type === 'mana') {
        pushSegment('mana', segment.text, {
          raw: segment.raw,
          tone: segment.tone,
          className: segment.className,
          glyph: segment.glyph,
          secondaryGlyph: segment.secondaryGlyph,
          split: segment.split,
          phyrexian: segment.phyrexian,
        });
        return;
      }
      pushSegment('text', segment.text);
    });
  }

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      pushTextWithMana(source.slice(lastIndex, match.index));
    }

    const inner = String(match[1] || '').trim();
    const cardMatch = inner.match(/^([^:]+):(\d+)$/);
    if (cardMatch) {
      pushSegment('card-ref', cardMatch[1], {
        raw: inner,
        refIndex: Number(cardMatch[2]),
      });
    } else {
      pushSegment('ability', inner);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    pushTextWithMana(source.slice(lastIndex));
  }

  return segments;
}

function collectRenderedRelatedIndices(...lineGroups) {
  const indices = {};
  lineGroups.forEach((lines) => {
    (lines || []).forEach((line) => {
      (line.segments || []).forEach((segment) => {
        if (segment.type !== 'card-ref') return;
        if (!Number.isFinite(segment.refIndex)) return;
        indices[segment.refIndex] = true;
      });
    });
  });
  return indices;
}

function stripInlineMarkup(text) {
  return parseInlineText(text).map((segment) => segment.text).join('');
}

function decorateRulesLine(line) {
  const segments = parseInlineText(line);
  const text = segments.map((segment) => segment.text).join('');
  const trimmed = text.trim();
  return {
    text,
    segments,
    isClass: /^CLASS\s+/i.test(trimmed),
    isStation: /^STATION\s+/i.test(trimmed),
    isFlavorMarker: trimmed === 'FLAVOR',
  };
}

function splitRulesText(text) {
  const lines = stripHtmlMarkup(text).split('\n');
  const flavorIndex = lines.findIndex((line) => line.trim() === 'FLAVOR');
  const rulesLines = flavorIndex >= 0 ? lines.slice(0, flavorIndex) : lines;
  const flavorLines = flavorIndex >= 0 ? lines.slice(flavorIndex + 1) : [];

  return {
    rulesLines: rulesLines.map(decorateRulesLine).filter((line) => line.text.trim()),
    flavorLines: flavorLines.map(stripInlineMarkup).filter((line) => line.trim()),
  };
}

function trimPreviewText(value, limit = 48) {
  const text = String(value || '').replace(/\s+/g, ' ').trim();
  if (text.length <= limit) return text;
  return `${text.slice(0, limit)}...`;
}

function buildPreviewRulesLines(lines) {
  return (lines || [])
    .filter((line) => line && line.text && !line.isFlavorMarker)
    .slice(0, 2)
    .map((line) => trimPreviewText(line.text));
}

function extractAbilityTerms(card, language) {
  const texts = [
    language === 'en' ? card.text : card.zhs_text,
    language === 'en' ? card.text2 : card.zhs_text2,
  ].filter(Boolean);
  const terms = [];
  texts.forEach((text) => {
    const regex = /`([^`]+)`/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const value = match[1].trim();
      if (value && !value.includes(':')) terms.push(value);
    }
  });
  return uniqueValues(terms).slice(0, 12);
}

function getAbilityDescription(term) {
  const key = String(term || '').trim().toLowerCase();
  return syncedAbilityDescriptions[key] || abilityDescriptions[term] || abilityDescriptions[key] || '';
}

function buildRefFallback(refText) {
  const ref = normalizeCardRef(refText);
  return {
    key: ref.key,
    setCode: ref.setCode,
    number: ref.number,
    codeText: ref.key,
    displayName: ref.key,
    url: buildCardDetailUrl(ref),
    imageUrl: '',
    fallbackImageUrl: '',
  };
}

function applyImageFallback(item) {
  if (!item) return item;
  if (item.fallbackImageUrl && item.imageUrl !== item.fallbackImageUrl) {
    return {
      ...item,
      imageUrl: item.fallbackImageUrl,
      fallbackImageUrl: '',
      imageLoading: true,
    };
  }
  return {
    ...item,
    imageUrl: '',
    fallbackImageUrl: '',
    imageLoading: false,
    imageFailed: true,
  };
}

function decorateReferenceDisplay(card) {
  const spellbookCards = card.spellbookCards || [];
  const renderedRelatedIndices = card.renderedRelatedIndices || {};
  const relatedCards = (card.relatedCards || []).filter((item, index) => !renderedRelatedIndices[index]);
  const spellbookExpanded = !!card.spellbookExpanded;
  const relatedExpanded = !!card.relatedExpanded;
  const spellbookHiddenCount = Math.max(0, spellbookCards.length - REFERENCE_COLLAPSE_LIMIT);
  const relatedHiddenCount = Math.max(0, relatedCards.length - REFERENCE_COLLAPSE_LIMIT);
  return {
    ...card,
    spellbookExpanded,
    relatedExpanded,
    visibleSpellbookCards: spellbookExpanded
      ? spellbookCards
      : spellbookCards.slice(0, REFERENCE_COLLAPSE_LIMIT),
    visibleRelatedCards: relatedExpanded
      ? relatedCards
      : relatedCards.slice(0, REFERENCE_COLLAPSE_LIMIT),
    spellbookHiddenCount: spellbookExpanded ? 0 : spellbookHiddenCount,
    relatedHiddenCount: relatedExpanded ? 0 : relatedHiddenCount,
    spellbookToggleText: spellbookExpanded ? '收起' : `展开 ${spellbookHiddenCount}`,
    relatedToggleText: relatedExpanded ? '收起' : `展开 ${relatedHiddenCount}`,
    referenceSummaryText: spellbookCards.length || relatedCards.length
      ? `已回填 ${spellbookCards.length + relatedCards.length} 张关联卡牌`
      : '正在获取卡牌信息',
    hasVisibleReferences: !!(spellbookCards.length || relatedCards.length),
  };
}

function formatReleaseDate(value) {
  if (!value) return '待定';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getFullYear()}年${date.getMonth() + 1}月${date.getDate()}日`;
}

function isReleased(value) {
  if (!value) return false;
  const date = new Date(value);
  return !Number.isNaN(date.getTime()) && date.getTime() <= Date.now();
}

function decorateSet(set) {
  const total = Number(set.total_cards || 0);
  const count = Array.isArray(set.cards) ? set.cards.length : 0;
  const progress = total ? Math.min(100, (count / total) * 100) : 100;
  return {
    code: set.code,
    name: set.name,
    description: set.description,
    total,
    count,
    logoCode: set.logo_code || set.code,
    setGlyph: getSetIconGlyph(set.logo_code || set.code),
    releaseDate: set.release_date,
    releaseDateText: formatReleaseDate(set.release_date),
    releaseText: isReleased(set.release_date) ? '已上线' : '预览中',
    progressText: total && count !== total ? `${count} / ${total} 张` : `共 ${total || count} 张`,
    progressWidth: `${progress.toFixed(1)}%`,
  };
}

Page({
  data: {
    sets: [],
    currentSet: null,
    selectedIndex: 0,
    progressText: '',
    progressWidth: '0%',
    releaseText: '',
    cards: [],
    selectedCard: null,
    selectedShareImage: '',
    setIconFontReady: false,
    manaFontReady: false,
    loading: true,
    error: '',
  },

  onLoad() {
    this.loadSetIconFont();
    this.loadManaIconFont();
    this.loadPreviewData();
  },

  async loadPreviewData() {
    this.setData({ loading: true, error: '' });
    try {
      const [abilityItems, previewFiles] = await Promise.all([
        fetchRemoteData('previews/abilities'),
        fetchRemoteData('previews/index'),
      ]);
      syncedAbilityDescriptions = buildAbilityDescriptionMap(abilityItems);
      const previewSets = await Promise.all((previewFiles || [])
        .filter((file) => /^Y.+\.json$/.test(file))
        .map((file) => fetchRemoteData(`previews/${String(file).replace(/\.json$/i, '')}`)));
      this.previewSets = previewSets
        .filter((set) => set && set.code && Array.isArray(set.cards))
        .sort((left, right) => new Date(right.release_date) - new Date(left.release_date));
      this.setData({
        loading: false,
        error: '',
        sets: this.previewSets.map(decorateSet),
      }, () => this.selectSetByIndex(0));
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '炼金预览数据加载失败'),
      });
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

  onSetChange(event) {
    this.selectSetByIndex(Number(event.detail.value));
  },

  getCardNumber(card) {
    const match = String(card.id || '').match(/-(\d+)$/);
    return match ? Number(match[1]) : 0;
  },

  decorateCard(card) {
    const title = card.zhs_name || card.name || '';
    const title2 = card.zhs_name2 || card.name2 || '';
    const rules = splitRulesText(card.zhs_text || card.text);
    const secondaryRules = splitRulesText(card.zhs_text2 || card.text2);
    const renderedRelatedIndices = collectRenderedRelatedIndices(rules.rulesLines, secondaryRules.rulesLines);
    const spellbookRefs = Array.isArray(card.spellbook) ? card.spellbook : [];
    const relatedRefs = Array.isArray(card.related) ? card.related : [];
    const rarityClass = String(card.rarity || '').toLowerCase();
    const rarityText = rarityLabels[rarityClass] || card.rarity || '未知稀有度';
    return decorateReferenceDisplay({
      ...card,
      rawCard: card.rawCard || card,
      imageUrl: toSiteUrl(card.image_url_zh || card.image_url_en),
      fallbackImageUrl: card.image_url_zh && card.image_url_en ? toSiteUrl(card.image_url_en) : '',
      imageLoading: !!(card.image_url_zh || card.image_url_en),
      imageFailed: false,
      title,
      subtitle: '',
      manaCostText: card.mana_cost || '',
      manaCostSymbols: parseManaCost(card.mana_cost),
      typeText: card.zhs_type || card.type || '',
      rulesText: stripInlineMarkup(card.zhs_text || card.text),
      rulesLines: rules.rulesLines,
      flavorLines: rules.flavorLines,
      previewRulesLines: buildPreviewRulesLines(rules.rulesLines),
      previewMoreText: '',
      title2,
      manaCostText2: card.mana_cost2 || '',
      manaCostSymbols2: parseManaCost(card.mana_cost2),
      typeText2: card.zhs_type2 || card.type2 || '',
      rulesText2: stripInlineMarkup(card.zhs_text2 || card.text2),
      rulesLines2: secondaryRules.rulesLines,
      flavorLines2: secondaryRules.flavorLines,
      artistText: card.artist ? `画师：${card.artist}` : '',
      powerToughnessText: card.pow_tough || '',
      rarityClass,
      rarityText,
      numberText: `#${this.getCardNumber(card) || '-'}`,
      abilityTerms: [],
      spellbookRefs,
      relatedRefs,
      renderedRelatedIndices,
      spellbookCards: [],
      relatedCards: [],
      refsLoading: false,
      refsError: '',
      tagText: '',
      previewTagsText: '',
    });
  },

  selectSetByIndex(index) {
    const set = (this.previewSets || [])[index];
    if (!set) return;
    const total = Number(set.total_cards || 0);
    const rawCards = (set.cards || []).slice().sort((a, b) => {
      const complete = total && set.cards.length === total;
      return complete ? this.getCardNumber(a) - this.getCardNumber(b) : this.getCardNumber(b) - this.getCardNumber(a);
    });
    const cards = rawCards.map((card) => this.decorateCard(card));
    const progress = total ? Math.min(100, (cards.length / total) * 100) : 100;
    const released = set.release_date && new Date(set.release_date).getTime() <= Date.now();
    const currentSet = decorateSet(set);
    this.setData({
      selectedIndex: index,
      currentSet,
      cards,
      selectedCard: null,
      selectedShareImage: '',
      progressText: total ? `${cards.length}/${total} 张卡牌` : `${cards.length} 张卡牌`,
      progressWidth: `${progress.toFixed(1)}%`,
      releaseText: released ? '已上线' : '预览中',
    });
  },

  showCard(event) {
    const { index } = event.currentTarget.dataset;
    const selectedCard = decorateReferenceDisplay(this.data.cards[index]);
    this.setData({ selectedCard, selectedShareImage: '' }, () => {
      this.prepareCardShareImage(selectedCard);
      this.loadSelectedCardRefs(selectedCard);
    });
  },

  async fetchCardRefs(refs) {
    const normalized = refs.map(normalizeCardRef).filter((ref) => ref.setCode && ref.number);
    const missingRefs = normalized.filter((ref) => !cardRefCache[ref.key]);

    if (missingRefs.length) {
      const query = missingRefs
        .map((ref) => `(s=${ref.setCode} number=${ref.baseNumber || ref.number})`)
        .join(' or ');
      const response = await searchMtgchCards(query, Math.max(100, missingRefs.length), { unique: 'prints' });
      const items = response && Array.isArray(response.items) ? response.items : [];
      missingRefs.forEach((ref) => {
        const found = items.find((item) => {
          const setCode = String(item.set || '').toUpperCase();
          const number = String(item.collector_number || '');
          return setCode === ref.setCode && number === (ref.baseNumber || ref.number);
        });
        cardRefCache[ref.key] = found ? {
          key: ref.key,
          setCode: ref.setCode,
          number: ref.number,
          codeText: ref.key,
          displayName: found.display_name_zh || found.display_name || ref.key,
          url: buildCardDetailUrl(ref),
          imageUrl: found.image_url || (found.id ? buildScryfallImageUrl(found.id) : ''),
          fallbackImageUrl: found.image_url && found.id ? buildScryfallImageUrl(found.id) : '',
        } : buildRefFallback(ref.key);
      });
    }

    return normalized.map((ref) => cardRefCache[ref.key] || buildRefFallback(ref.key));
  },

  async loadSelectedCardRefs(card) {
    const spellbookRefs = card && card.spellbookRefs ? card.spellbookRefs : [];
    const relatedRefs = card && card.relatedRefs ? card.relatedRefs : [];
    if (!spellbookRefs.length && !relatedRefs.length) return;

    const requestId = `${card.id}-${Date.now()}`;
    this.cardRefRequestId = requestId;
    this.setData({
      selectedCard: decorateReferenceDisplay({
        ...this.data.selectedCard,
        refsLoading: true,
        refsError: '',
        spellbookCards: spellbookRefs.map(buildRefFallback),
        relatedCards: relatedRefs.map(buildRefFallback),
      }),
    });

    try {
      const [spellbookCards, relatedCards] = await Promise.all([
        this.fetchCardRefs(spellbookRefs),
        this.fetchCardRefs(relatedRefs),
      ]);
      if (this.cardRefRequestId !== requestId) return;
      this.setData({
        selectedCard: decorateReferenceDisplay({
          ...this.data.selectedCard,
          spellbookCards,
          relatedCards,
          refsLoading: false,
          refsError: '',
        }),
      });
    } catch (error) {
      if (this.cardRefRequestId !== requestId) return;
      this.setData({
        selectedCard: decorateReferenceDisplay({
          ...this.data.selectedCard,
          refsLoading: false,
          refsError: toDisplayError(error, '相关卡牌加载失败'),
        }),
      });
    }
  },

  toggleReferenceSection(event) {
    const { section } = event.currentTarget.dataset;
    const selectedCard = this.data.selectedCard;
    if (!selectedCard) return;
    const field = section === 'spellbook' ? 'spellbookExpanded' : 'relatedExpanded';
    this.setData({
      selectedCard: decorateReferenceDisplay({
        ...selectedCard,
        [field]: !selectedCard[field],
      }),
    });
  },

  previewSelectedImage() {
    if (!this.data.selectedCard || !this.data.selectedCard.imageUrl) return;
    const urls = [
      this.data.selectedCard.imageUrl,
      this.data.selectedCard.fallbackImageUrl,
    ].filter(Boolean);
    previewImages(this.data.selectedCard.imageUrl, urls);
  },

  previewReferenceImage(event) {
    const { imageUrl, fallbackImageUrl, url } = event.currentTarget.dataset;
    const currentImageUrl = imageUrl || fallbackImageUrl;
    if (!currentImageUrl) {
      this.copyUrl(url);
      return;
    }
    const selectedCard = this.data.selectedCard || {};
    const urls = []
      .concat(selectedCard.spellbookCards || [])
      .concat(selectedCard.relatedCards || [])
      .reduce((result, card) => result.concat([card.imageUrl, card.fallbackImageUrl]), [])
      .filter(Boolean);
    if (fallbackImageUrl && !urls.includes(fallbackImageUrl)) {
      urls.push(fallbackImageUrl);
    }
    previewImages(currentImageUrl, urls.length ? urls : [currentImageUrl]);
  },

  previewInlineReference(event) {
    const refIndex = Number(event.currentTarget.dataset.refIndex);
    const selectedCard = this.data.selectedCard || {};
    const refCard = (selectedCard.relatedCards || [])[refIndex];
    if (!refCard) {
      showInfoModal({
        title: '关联卡牌',
        content: '关联卡牌信息仍在加载。',
      });
      return;
    }

    const currentImageUrl = refCard.imageUrl || refCard.fallbackImageUrl;
    if (!currentImageUrl) {
      this.copyUrl(refCard.url);
      return;
    }

    const urls = (selectedCard.relatedCards || [])
      .reduce((result, card) => result.concat([card.imageUrl, card.fallbackImageUrl]), [])
      .filter(Boolean);
    previewImages(currentImageUrl, urls.length ? urls : [currentImageUrl]);
  },

  handlePreviewImageLoad(event) {
    const { index } = event.currentTarget.dataset;
    if (index === undefined) return;
    this.setData({
      [`cards[${index}].imageLoading`]: false,
    });
  },

  handlePreviewImageError(event) {
    const { index } = event.currentTarget.dataset;
    const card = this.data.cards[Number(index)];
    if (!card) return;
    this.setData({
      [`cards[${index}]`]: applyImageFallback(card),
    });
  },

  handleSelectedImageError() {
    const card = this.data.selectedCard;
    if (!card) return;
    this.setData({
      selectedCard: applyImageFallback(card),
    });
  },

  handleSelectedImageLoad() {
    const card = this.data.selectedCard;
    if (!card) return;
    this.setData({
      'selectedCard.imageLoading': false,
    });
  },

  copyReferenceLink(event) {
    const { url } = event.currentTarget.dataset;
    this.copyUrl(url);
  },

  showAbilityDescription(event) {
    const { term } = event.currentTarget.dataset;
    const description = getAbilityDescription(term);
    showInfoModal({
      title: term || '异能说明',
      content: description || '暂未收录该关键词说明。',
    });
  },

  copyUrl(url) {
    if (!url) return;
    copyText(url, '资料地址已复制');
  },

  closeCard() {
    this.cardRefRequestId = '';
    this.setData({ selectedCard: null, selectedShareImage: '' });
  },

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const chars = String(text || '').split('');
    const lines = [];
    let line = '';
    chars.forEach((char) => {
      const nextLine = `${line}${char}`;
      const width = ctx.measureText ? ctx.measureText(nextLine).width : nextLine.length * 22;
      if (width > maxWidth && line) {
        lines.push(line);
        line = char;
        return;
      }
      line = nextLine;
    });
    if (line) lines.push(line);
    const visibleLines = lines.slice(0, maxLines);
    visibleLines.forEach((item, index) => {
      const suffix = index === maxLines - 1 && lines.length > maxLines ? '...' : '';
      ctx.fillText(`${item}${suffix}`, x, y + index * lineHeight);
    });
    return y + Math.max(visibleLines.length - 1, 0) * lineHeight;
  },

  drawShareTag(ctx, text, x, y, options = {}) {
    if (!text) return 0;
    const paddingX = options.paddingX || 14;
    const height = options.height || 34;
    const fontSize = options.fontSize || 20;
    const width = Math.min(options.maxWidth || 190, Math.max(66, String(text).length * fontSize + paddingX * 2));
    ctx.setFillStyle(options.bg || '#eef4ff');
    ctx.fillRect(x, y, width, height);
    ctx.setFillStyle(options.color || '#0f5ce8');
    ctx.setFontSize(fontSize);
    ctx.fillText(text, x + paddingX, y + height - 11);
    return width;
  },

  buildShareRulesText(card) {
    const lines = []
      .concat(card.rulesLines || [])
      .concat(card.title2 ? card.rulesLines2 || [] : [])
      .filter((line) => line && line.text && !line.isFlavorMarker)
      .map((line) => String(line.text || '').replace(/\s+/g, ' ').trim())
      .filter(Boolean);
    return lines.join(' ');
  },

  drawCardShareImage(card) {
    const ctx = createCanvasContext(this, cardShareCanvas.id);
    if (!ctx || !card) return;
    try {
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(0, 0, cardShareCanvas.width, cardShareCanvas.height);

      ctx.setFillStyle('#0f5ce8');
      ctx.fillRect(0, 0, 600, 8);
      ctx.setFillStyle('#f8fafc');
      ctx.fillRect(0, 8, 600, 62);
      ctx.setFillStyle('#111827');
      ctx.setFontSize(22);
      ctx.fillText('十七地 · 炼金预览', 34, 47);
      ctx.setFillStyle('#64748b');
      ctx.setFontSize(18);
      ctx.fillText(this.data.currentSet.name || this.data.currentSet.code || '', 398, 47);

      const infoX = 34;
      ctx.setFillStyle('#111827');
      ctx.setFontSize(42);
      const titleBottom = this.drawWrappedText(ctx, card.title, infoX, 126, 532, 52, 2);

      const tagY = titleBottom + 34;
      let tagX = infoX;
      const rarityWidth = this.drawShareTag(ctx, card.rarityText, tagX, tagY, {
        bg: '#f8fafc',
        color: '#344054',
        maxWidth: 126,
      });
      tagX += rarityWidth + 10;
      const numberWidth = this.drawShareTag(ctx, card.numberText, tagX, tagY, {
        bg: '#eef4ff',
        color: '#0f5ce8',
        maxWidth: 126,
      });
      tagX += numberWidth + 10;
      if (card.powerToughnessText) {
        this.drawShareTag(ctx, card.powerToughnessText, tagX, tagY, {
          bg: '#fef3c7',
          color: '#92400e',
          maxWidth: 116,
        });
      }

      ctx.setFillStyle('#344054');
      ctx.setFontSize(26);
      const typeBottom = this.drawWrappedText(ctx, card.typeText, infoX, tagY + 78, 532, 35, 2);

      const costText = card.manaCostText || '';
      if (costText) {
        ctx.setFillStyle('#111827');
        ctx.setFontSize(24);
        this.drawWrappedText(ctx, costText, infoX, typeBottom + 44, 532, 32, 2);
      }

      ctx.setFillStyle('#e2e8f0');
      ctx.fillRect(34, 320, 532, 1);

      const rulesText = this.buildShareRulesText(card);
      if (rulesText) {
        ctx.setFillStyle('#1f2937');
        ctx.setFontSize(24);
        this.drawWrappedText(ctx, rulesText, 34, 362, 532, 34, 3);
      }

      ctx.setFillStyle('#94a3b8');
      ctx.setFontSize(18);
      ctx.fillText('打开小程序查看完整卡牌预览', 34, 462);

      ctx.draw(false, () => {
        canvasToTempFilePath(this, {
          canvasId: cardShareCanvas.id,
          width: cardShareCanvas.width,
          height: cardShareCanvas.height,
          destWidth: cardShareCanvas.width,
          destHeight: cardShareCanvas.height,
          fileType: 'png',
        }, {
          success: (result) => {
            if (result && result.tempFilePath) {
              this.setData({ selectedShareImage: result.tempFilePath });
            }
          },
          fail: () => {
            this.setData({ selectedShareImage: card.imageUrl || '' });
          },
        });
      });
    } catch (error) {
      this.setData({ selectedShareImage: card.imageUrl || '' });
    }
  },

  prepareCardShareImage(card) {
    if (!card) return;
    this.drawCardShareImage(card);
  },

  onShareAppMessage(event) {
    const card = this.data.selectedCard;
    if (event && event.from === 'button' && card) {
      return {
        title: `${card.title} · 炼金预览`,
        path: `/pages/previews/index?set=${this.data.currentSet.code}&card=${encodeURIComponent(card.id || card.title)}`,
        imageUrl: this.data.selectedShareImage || '',
      };
    }
    return {
      title: '炼金系列预览 - 十七地',
      path: '/pages/previews/index',
      imageUrl: this.data.selectedShareImage || '',
    };
  },

  noop() {},
});
