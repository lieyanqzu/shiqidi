import type { BoosterData, Sheet, Pack, Card, PackSimulatorResults, PackStatistics, Sheets, Set, BoosterConfig } from '@/types/pack-simulator';
import sealedData from '@/data/sealed_basic_data.json';
import boosterConfig from '@/data/booster-config.json';

interface CardSearchResult {
  name: string;
  zhs_name: string;
  officialName: string;
  translatedName: string | null;
  setCode: string;
  number: string;
  scryfallId: string;
  rarity: string;
}

const config = boosterConfig as BoosterConfig;

// 支持的补充包类型列表
const SUPPORTED_BOOSTERS = config.sets.flatMap(set => 
  set.boosters.map(booster => ({
    ...booster,
    setCode: set.code
  }))
);

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
  try {
    // 构建查询条件
    const elements = cards.map(card => {
      // 检查编号是否包含字母后缀
      const hasLetterSuffix = /\d+[a-z]$/i.test(card.number);
      const baseNumber = hasLetterSuffix ? card.number.slice(0, -1) : card.number;

      if (hasLetterSuffix) {
        // 如果有字母后缀，同时搜索完整编号和基础编号
        return {
          type: "or" as const,
          elements: [
            {
              type: "and" as const,
              elements: [
                {
                  type: "basic" as const,
                  key: "setCode",
                  operator: "=",
                  value: card.setCode,
                },
                {
                  type: "basic" as const,
                  key: "number",
                  operator: "=",
                  value: card.number,
                },
              ],
            },
            {
              type: "and" as const,
              elements: [
                {
                  type: "basic" as const,
                  key: "setCode",
                  operator: "=",
                  value: card.setCode,
                },
                {
                  type: "basic" as const,
                  key: "number",
                  operator: "=",
                  value: baseNumber,
                },
              ],
            },
          ],
        };
      } else {
        // 如果没有字母后缀，使用原来的搜索条件
        return {
          type: "and" as const,
          elements: [
            {
              type: "basic" as const,
              key: "setCode",
              operator: "=",
              value: card.setCode,
            },
            {
              type: "basic" as const,
              key: "number",
              operator: "=",
              value: card.number,
            },
          ],
        };
      }
    });

    const response = await fetch(
      `https://api.sbwsz.com/search?page=1&page_size=100&get_total=1&q=${encodeURIComponent(
        JSON.stringify({ type: "or", elements })
      )}`
    );

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();
    const cardResults = data.results;

    // 记录未找到的卡牌
    const notFoundCards = cards.filter(card => 
      !cardResults.some((info: CardSearchResult) => 
        info.setCode.toLowerCase() === card.setCode.toLowerCase() && 
        info.number.toString() === card.number.toString()
      )
    );

    // 如果有未找到的卡牌，进行单独搜索
    if (notFoundCards.length > 0) {
      console.log('部分卡牌未找到，进行二次搜索:', notFoundCards);
      
      // 对每张未找到的卡牌进行单独搜索
      const additionalResults = await Promise.all(
        notFoundCards.map(async card => {
          const query = {
            type: "and" as const,
            elements: [
              {
                type: "basic" as const,
                key: "setCode",
                operator: "=",
                value: card.setCode,
              },
              {
                type: "basic" as const,
                key: "number",
                operator: "=",
                value: card.number,
              },
            ],
          };

          const retryResponse = await fetch(
            `https://api.sbwsz.com/search?page=1&page_size=1&get_total=1&q=${encodeURIComponent(
              JSON.stringify(query)
            )}`
          );

          if (!retryResponse.ok) {
            console.warn(`二次搜索失败: ${card.setCode}:${card.number}`);
            return null;
          }

          const retryData = await retryResponse.json();
          return retryData.results[0];
        })
      );

      // 将找到的结果添加到cardResults中
      cardResults.push(...additionalResults.filter(Boolean));
    }

    // 更新卡牌信息
    cards.forEach(card => {
      // 检查编号是否包含字母后缀
      const hasLetterSuffix = /\d+[a-z]$/i.test(card.number);
      const baseNumber = hasLetterSuffix ? card.number.slice(0, -1) : card.number;

      // 首先尝试匹配完整编号
      let cardInfo = cardResults.find(
        (info: CardSearchResult) => info.setCode.toLowerCase() === card.setCode.toLowerCase() && 
          info.number.toString() === card.number.toString()
      );

      // 如果有字母后缀且找不到完整编号的卡牌，尝试匹配基础编号
      if (!cardInfo && hasLetterSuffix) {
        cardInfo = cardResults.find(
          (info: CardSearchResult) => info.setCode.toLowerCase() === card.setCode.toLowerCase() && 
            info.number.toString() === baseNumber.toString()
        );
      }

      if (!cardInfo) {
        console.warn(`未找到卡牌信息: ${card.setCode}:${card.number}`);
        return;
      }

      card.name = cardInfo.name;
      card.zhs_name = cardInfo.zhs_name;
      card.officialName = cardInfo.officialName;
      card.translatedName = cardInfo.translatedName;
      card.scryfallId = cardInfo.scryfallId;
      card.rarity = cardInfo.rarity?.toLowerCase();
    });
  } catch (error) {
    console.error('批量获取卡牌信息失败:', error);
  }
  
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

// 获取可用系列
export function getAvailableSets(): Set[] {
  return config.sets;
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
  const booster = SUPPORTED_BOOSTERS.find(booster => booster.code === setCode);
  if (!booster) {
    throw new Error(`不支持的补充包类型: ${setCode}`);
  }

  // 找到对应系列的数据
  const rawBoosterData = (sealedData as unknown as RawBoosterData[]).find((data: RawBoosterData) => data.code === setCode);
  if (!rawBoosterData) {
    throw new Error(`找不到系列 ${booster.setCode} 的数据`);
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