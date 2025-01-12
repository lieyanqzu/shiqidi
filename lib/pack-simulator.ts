import type { BoosterData, Sheet, Pack, Card, PackSimulatorResults, PackStatistics, CardInfo, CardInfoResponse, Sheets } from '@/types/pack-simulator';
import sealedData from '@/data/sealed_basic_data.json';
import boosterConfig from '@/data/booster-config.json';

// 支持的补充包类型列表
const SUPPORTED_BOOSTERS = boosterConfig.boosters;

// 缓存卡牌信息
const cardInfoCache: Map<string, CardInfo> = new Map();

// 获取卡牌信息
async function fetchCardInfo(setCode: string, number: string): Promise<CardInfo | null> {
  const cacheKey = `${setCode}:${number}`;
  
  // 检查缓存
  if (cardInfoCache.has(cacheKey)) {
    return cardInfoCache.get(cacheKey)!;
  }

  async function tryFetch(cardNumber: string): Promise<CardInfo | null> {
    const url = `https://api.sbwsz.com/card/${setCode}/${cardNumber}`;
    
    try {
      const response = await fetch(url);
      const responseText = await response.text();
      
      if (!response.ok) {
        return null;
      }

      try {
        const data: CardInfoResponse = JSON.parse(responseText);
        if ((data.type === 'normal' || data.type === 'double') && data.data.length > 0) {
          // 对于双面牌，使用第一面（正面）的信息
          const cardInfo = data.data[0];
          // 如果是双面牌，合并名称
          if (data.type === 'double') {
            cardInfo.name = cardInfo.name || `${cardInfo.faceName} // ${data.data[1]?.faceName}`;
            cardInfo.zhs_name = cardInfo.zhs_name || `${cardInfo.zhs_faceName} // ${data.data[1]?.zhs_faceName}`;
            cardInfo.translatedName = cardInfo.translatedName || `${cardInfo.zhs_faceName} // ${data.data[1]?.zhs_faceName}`;
          }
          return cardInfo;
        }
      } catch (parseError) {
        console.error(`[Error] JSON parse error for ${url}:`, parseError);
      }
    } catch (error) {
      console.error(`[Error] Network error for ${url}:`, error);
    }
    return null;
  }

  // 首先尝试原始卡牌号
  let cardInfo = await tryFetch(number);

  // 如果获取失败且卡牌号带有 a 或 b 后缀，尝试不带后缀的卡牌号
  if (!cardInfo && /^(\d+)[ab]$/.test(number)) {
    const baseNumber = number.slice(0, -1);
    cardInfo = await tryFetch(baseNumber);
  }

  // 如果获取成功，存入缓存
  if (cardInfo) {
    cardInfoCache.set(cacheKey, cardInfo);
  }

  return cardInfo;
}

// 解析卡牌ID
function parseCardId(id: string): { setCode: string; number: string } {
  const [setCode, number] = id.split(':');
  return { setCode, number };
}

// 根据权重随机选择一个元素
function weightedRandom<T>(items: T[], weights: number[]): T {
  const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
  let random = Math.random() * totalWeight;
  
  for (let i = 0; i < items.length; i++) {
    random -= weights[i];
    if (random <= 0) {
      return items[i];
    }
  }
  
  return items[items.length - 1];
}

// 从卡牌表中抽取指定数量的卡牌
function drawFromSheet(sheet: Sheet, count: number): Card[] {
  const cards: Card[] = [];
  const cardIds = Object.keys(sheet.cards);
  const weights = cardIds.map(id => sheet.cards[id]);
  
  for (let i = 0; i < count; i++) {
    const cardId = weightedRandom(cardIds, weights);
    const { setCode, number } = parseCardId(cardId);
    cards.push({
      id: cardId,
      sheet: 'unknown', // 在实际使用时会被替换为正确的表名
      setCode,
      number
    });
  }
  
  return cards;
}

// 模拟开一个补充包
async function simulateBoosterPack(boosterData: BoosterData): Promise<Pack> {
  // 根据权重选择补充包类型
  const boosterTypes = boosterData.boosters;
  const boosterType = weightedRandom(
    boosterTypes,
    boosterTypes.map(type => type.weight)
  );
  
  // 从每个表中抽取卡牌
  const cards: Card[] = [];
  for (const [sheetName, count] of Object.entries(boosterType.sheets)) {
    const sheet = boosterData.sheets[sheetName];
    if (sheet) {
      const drawnCards = drawFromSheet(sheet, count);
      // 设置正确的表名
      drawnCards.forEach(card => card.sheet = sheetName);
      cards.push(...drawnCards);
    }
  }

  // 获取卡牌信息
  await Promise.all(cards.map(async (card) => {
    const cardInfo = await fetchCardInfo(card.setCode, card.number);
    if (cardInfo) {
      card.name = cardInfo.name;
      card.zhs_name = cardInfo.zhs_name;
      card.officialName = cardInfo.officialName;
      card.translatedName = cardInfo.translatedName;
      card.scryfallId = cardInfo.scryfallId;
      card.rarity = cardInfo.rarity;
    }
  }));
  
  return {
    cards,
    type: boosterType.sheets.special_guest ? 'special_guest' : 'normal'
  };
}

// 计算开包统计信息
function calculateStatistics(packs: Pack[]): PackStatistics {
  const stats: PackStatistics = {
    totalCards: 0,
    byRarity: {},
    bySheet: {}
  };
  
  if (!packs || packs.length === 0) {
    return stats;
  }
  
  for (const pack of packs) {
    if (!pack.cards) continue;
    
    stats.totalCards += pack.cards.length;
    
    for (const card of pack.cards) {
      // 按表统计
      if (card.sheet) {
        stats.bySheet[card.sheet] = (stats.bySheet[card.sheet] || 0) + 1;
      }
      
      // 按稀有度统计
      if (card.rarity) {
        stats.byRarity[card.rarity] = (stats.byRarity[card.rarity] || 0) + 1;
      }
    }
  }
  
  return stats;
}

// 获取可用的系列列表
export function getAvailableSets() {
  return SUPPORTED_BOOSTERS.map(booster => ({
    code: booster.code,
    name: booster.name
  }));
}

interface RawSheet {
  total_weight: number;
  cards: { [key: string]: number | undefined };
  allow_duplicates?: boolean;
}

interface RawBoosterData {
  name: string;
  code: string;
  set_code: string;
  set_name: string;
  boosters: Array<{
    sheets: { [key: string]: number };
    weight: number;
  }>;
  sheets: { [key: string]: RawSheet };
  source_set_codes?: string[];
}

// 模拟开包
export async function simulatePacks(setCode: string, count: number): Promise<PackSimulatorResults> {
  // 检查是否是支持的补充包类型
  const supportedBooster = SUPPORTED_BOOSTERS.find(booster => booster.code === setCode);
  if (!supportedBooster) {
    throw new Error(`不支持的补充包类型: ${setCode}`);
  }

  // 找到对应系列的数据
  const rawBoosterData = (sealedData as unknown as RawBoosterData[]).find((data: RawBoosterData) => data.code === setCode);
  if (!rawBoosterData) {
    throw new Error(`找不到系列 ${setCode} 的数据`);
  }

  // 转换数据结构
  const boosterData: BoosterData = {
    name: rawBoosterData.name,
    code: rawBoosterData.code,
    set_code: rawBoosterData.set_code,
    set_name: rawBoosterData.set_name,
    boosters: rawBoosterData.boosters.map(booster => ({
      sheets: booster.sheets,
      weight: booster.weight
    })),
    sheets: Object.entries(rawBoosterData.sheets).reduce<Sheets>((acc, [key, sheet]) => {
      acc[key] = {
        total_weight: sheet.total_weight,
        cards: Object.entries(sheet.cards).reduce((cardAcc, [cardId, weight]) => {
          if (weight !== undefined) {
            cardAcc[cardId] = weight;
          }
          return cardAcc;
        }, {} as { [key: string]: number })
      };
      return acc;
    }, {})
  };
  
  // 模拟指定数量的补充包
  const packs: Pack[] = [];
  for (let i = 0; i < count; i++) {
    packs.push(await simulateBoosterPack(boosterData));
  }
  
  // 计算统计信息
  const statistics = calculateStatistics(packs);
  
  return { packs, statistics };
} 