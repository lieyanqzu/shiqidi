import { CardData, ChineseCardData } from "@/types/card";

export interface CardDataParams {
  expansion: string;           // 系列代码，如 "FDN"
  event_type: string;         // 游戏格式，如 "PremierDraft"
  user_group?: string;        // 玩家分组，如 "middle"，为空时表示所有用户
  start_date: string;         // 开始日期，如 "2016-01-01"
  end_date: string;           // 结束日期，如 "2024-03-14"
  colors?: string;           // 套牌颜色筛选
}

// 静态卡名数据类型: [英文名, 中文名, 图片URL(不用), scryfallId(不用), oracleId(不用)]
export type StaticCardName = [string, string, string, string, string];

// 中文卡名映射 - 只存储英文名到中文名的映射
let chineseNameCache: Map<string, string> | null = null;

// LRU缓存类
class LRUCache<K, V> {
  private cache: Map<K, V>;
  private maxSize: number;

  constructor(maxSize: number) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  get(key: K): V | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    
    // 访问时，删除并重新插入以更新为最近使用
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    return value;
  }

  set(key: K, value: V): void {
    // 如果已存在，先删除（更新位置）
    if (this.cache.has(key)) {
      this.cache.delete(key);
    } else if (this.cache.size >= this.maxSize) {
      // 如果达到容量上限，删除最久未使用的项（Map的第一个项）
      const firstKey = this.cache.keys().next().value as K;
      if (firstKey !== undefined) {
        this.cache.delete(firstKey);
      }
    }
    
    // 添加到末尾（最近使用）
    this.cache.set(key, value);
  }

  has(key: K): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
  }

  size(): number {
    return this.cache.size;
  }
}

// 卡牌详细信息缓存 - 使用LRU策略，最多缓存100张卡
const cardDetailCache = new LRUCache<string, DetailedCardData>(100);

export async function fetchCardData(params: CardDataParams, signal?: AbortSignal): Promise<CardData[]> {
  const searchParams = new URLSearchParams({
    expansion: params.expansion,
    event_type: params.event_type,
    start_date: params.start_date,
    end_date: params.end_date,
  });
  
  if (params.user_group) {
    searchParams.append('user_group', params.user_group);
  }

  if (params.colors) {
    searchParams.append('colors', params.colors);
  }

  const response = await fetch(
    `https://www.17lands.com/card_ratings/data?${searchParams}`,
    {
      headers: {
        'accept': 'application/json',
      },
      signal
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch card data');
  }

  return response.json();
}


// 详细的卡牌信息（用于tooltip等需要完整信息的场景）
export interface DetailedCardData {
  id: string;
  set: string;
  collector_number: string;
  display_name: string;                    // 英文名
  display_name_zh: string;                 // 中文名
  display_flavor_name?: string;            // 英文风味名
  display_flavor_name_zh?: string;         // 中文风味名
  display_type_line: string;               // 类型行（中文）
  oracle_text_html: string;                // 规则文本（HTML，中文）
  flavor_text_html?: string;               // 风味文本（HTML）
  power_toughness_loyalty_defense?: string; // 攻防/忠诚度
  mana_cost_html?: string;                 // 法术力费用（HTML）
  other_faces: Array<DetailedCardData>;    // 其他面
  is_double_faced: boolean;                // 是否双面
  rarity: string;
}

// 从Scryfall URL中提取ID
// 例如: https://cards.scryfall.io/large/front/4/a/4a6976f2-0bd5-449a-8fcf-f5a732ce22c1.jpg?1748705976
// 返回: 4a6976f2-0bd5-449a-8fcf-f5a732ce22c1
export function extractScryfallIdFromUrl(url: string): string | null {
  try {
    const match = url.match(/\/([a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12})\./i);
    return match ? match[1] : null;
  } catch (error) {
    console.error('Failed to extract Scryfall ID from URL:', url, error);
    return null;
  }
}

// 加载静态中文卡名数据
export async function loadStaticChineseNames(): Promise<Map<string, string>> {
  if (chineseNameCache) {
    return chineseNameCache;
  }

  try {
    const response = await fetch('https://mtgch.com/static/card_names.json');
    if (!response.ok) {
      throw new Error('Failed to fetch card names');
    }
    
    const data: StaticCardName[] = await response.json();
    
    // 构建英文名到中文名的映射
    const nameMap = new Map<string, string>();
    for (const [englishName, chineseName] of data) {
      if (englishName && chineseName) {
        nameMap.set(englishName, chineseName);
      }
    }
    
    chineseNameCache = nameMap;
    return nameMap;
  } catch (error) {
    console.error('Failed to load static Chinese names:', error);
    return new Map();
  }
}

// 通过Scryfall ID查询卡牌详细信息（带LRU缓存）
export async function fetchCardDetailByScryfallId(scryfallId: string): Promise<DetailedCardData | null> {
  // 先检查LRU缓存
  const cachedData = cardDetailCache.get(scryfallId);
  if (cachedData) {
    return cachedData;
  }

  try {
    const response = await fetch(
      `https://mtgch.com/api/v1/result?q=id%3D${scryfallId}&page=1&page_size=1&unique=oracle_id&priority_chinese=true&view=1`,
      {
        headers: {
          'accept': 'application/json',
        }
      }
    );

    if (!response.ok) {
      throw new Error('Failed to fetch card detail');
    }

    const data = await response.json();
    if (data.items && data.items.length > 0) {
      const cardDetail = data.items[0];
      // 存入LRU缓存
      cardDetailCache.set(scryfallId, cardDetail);
      return cardDetail;
    }
    return null;
  } catch (error) {
    console.error('Failed to fetch card detail by Scryfall ID:', scryfallId, error);
    return null;
  }
}

// 清除卡牌详细信息缓存（可选，用于需要刷新数据的场景）
export function clearCardDetailCache(): void {
  cardDetailCache.clear();
}


// 标准化卡名格式（处理双面牌）
// 17lands: "Card A // Card B" → 静态数据: "Card A/Card B"
function normalizeCardName(name: string): string {
  return name.replace(/\s*\/\/\s*/g, '/');
}

// 反标准化卡名格式（用于显示）
// 静态数据: "Card A/Card B" → 显示: "Card A // Card B"
function denormalizeCardName(name: string): string {
  // 如果已经包含 " // "，直接返回（避免重复转换）
  if (name.includes(' // ')) {
    return name;
  }
  // 将单斜杠替换为 " // "
  return name.replace(/\//g, ' // ');
}

// 使用静态数据获取中文卡名
export async function fetchAllChineseCardData(
  setCode: string, 
  cards: CardData[],
  onResults?: (results: ChineseCardData[]) => void
): Promise<ChineseCardData[]> {
  try {
    // 加载静态中文卡名数据（只需要一次网络请求）
    const nameMap = await loadStaticChineseNames();
    
    // 构建结果数组
    const results: ChineseCardData[] = cards.map(card => {
      // 标准化卡名以匹配静态数据格式
      const normalizedName = normalizeCardName(card.name);
      let chineseName = nameMap.get(normalizedName) || nameMap.get(card.name) || card.name;
      
      // 反标准化中文名用于显示（将 "/" 转换回 " // "）
      chineseName = denormalizeCardName(chineseName);
      
      // 从URL中提取Scryfall ID
      let scryfallId = '';
      if (card.url) {
        scryfallId = extractScryfallIdFromUrl(card.url) || '';
      }
      
      // 构建简化的ChineseCardData对象
      return {
        name: card.name,
        zhs_name: chineseName,
        atomic_official_name: chineseName,
        atomic_translated_name: chineseName,
        id: scryfallId,
      };
    });
    
    // 立即返回结果
    if (onResults && results.length > 0) {
      onResults(results);
    }
    
    return results;
  } catch (error) {
    console.error('Failed to fetch all Chinese card data:', error);
    return [];
  }
}
