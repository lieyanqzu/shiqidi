import { CardData, ChineseCardData } from "@/types/card";

export interface CardDataParams {
  expansion: string;           // 系列代码，如 "FDN"
  format: string;             // 游戏格式，如 "PremierDraft"
  user_group?: string;        // 玩家分组，如 "middle"，为空时表示所有用户
  start_date: string;         // 开始日期，如 "2016-01-01"
  end_date: string;           // 结束日期，如 "2024-03-14"
  colors?: string;           // 套牌颜色筛选
}

interface SearchQuery {
  type: string;
  key: string;
  operator: string;
  value: string;
}

interface SearchElement {
  type: string;
  elements: SearchQuery[];
}

interface SearchRequest {
  type: string;
  elements: SearchElement[];
}

export async function fetchCardData(params: CardDataParams): Promise<CardData[]> {
  const searchParams = new URLSearchParams({
    expansion: params.expansion,
    format: params.format,
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
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch card data');
  }

  return response.json();
}

// 转换系列代号，处理年份前缀
function convertSetCode(setCode: string): string {
  // 匹配 Y + 两位数字 + 剩余字符 的模式
  const match = setCode.match(/^Y\d{2}(.+)$/);
  if (match) {
    // 如果匹配成功，返回 Y + 剩余字符
    return 'Y' + match[1];
  }
  return setCode;
}

interface ChineseCardResponse {
  results: ChineseCardData[];
}

export async function fetchChineseCardData(setCode: string): Promise<ChineseCardResponse> {
  const query: SearchQuery = {
    type: "basic",
    key: "setCode",
    operator: "=",
    value: convertSetCode(setCode)
  };

  const searchParams = new URLSearchParams({
    page: "1",
    page_size: "9999",
    get_total: "1",
    q: JSON.stringify(query)
  });

  const response = await fetch(
    `https://api.sbwsz.com/search?${searchParams}`,
    {
      headers: {
        'accept': 'application/json',
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to fetch Chinese card data');
  }

  return response.json();
}

// 构建卡牌名称的搜索查询
function buildCardNameQuery(cardName: string): SearchElement {
  const words = cardName.split(' ');
  return {
    type: "and",
    elements: words.map(word => ({
      type: "basic",
      key: "name",
      operator: ":",
      value: word
    }))
  };
}

// 批量搜索卡牌，支持回调函数
export async function searchChineseCards(
  cardNames: string[],
  onResults?: (results: ChineseCardData[]) => void
): Promise<ChineseCardResponse> {
  // 构建搜索查询
  const searchQuery: SearchRequest = {
    type: "or",
    elements: cardNames.map(buildCardNameQuery)
  };

  const searchParams = new URLSearchParams({
    page: '1',
    page_size: '9999',
    get_total: '1',
    q: JSON.stringify(searchQuery)
  });

  const response = await fetch(
    `https://api.sbwsz.com/search?${searchParams}`,
    {
      headers: {
        'accept': 'application/json',
      }
    }
  );

  if (!response.ok) {
    throw new Error('Failed to search Chinese card data');
  }

  const data = await response.json();
  if (onResults && data.results) {
    onResults(data.results);
  }
  return data;
}

// 记录 SPG 数据是否已加载
let spgLoaded = false;

// 缓存各系列的数据
const setDataCache: { [key: string]: ChineseCardData[] } = {};

// 将数组分成指定大小的组
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

export async function fetchAllChineseCardData(
  setCode: string, 
  cards: CardData[],
  onResults?: (results: ChineseCardData[]) => void
): Promise<ChineseCardData[]> {
  try {
    // 获取当前系列的数据（优先从缓存获取）
    let currentSetData: ChineseCardResponse;
    if (setDataCache[setCode]) {
      currentSetData = { results: setDataCache[setCode] };
    } else {
      currentSetData = await fetchChineseCardData(setCode);
      if (currentSetData.results) {
        setDataCache[setCode] = currentSetData.results;
      }
    }

    // 如果是 YXXX 系列，也获取 XXX 系列的数据（优先从缓存获取）
    let originalSetData: ChineseCardResponse = { results: [] };
    if (setCode.startsWith('Y')) {
      const originalSetCode = setCode.replace(/^Y\d{0,2}/, '');
      if (setDataCache[originalSetCode]) {
        originalSetData = { results: setDataCache[originalSetCode] };
      } else {
        originalSetData = await fetchChineseCardData(originalSetCode);
        if (originalSetData.results) {
          setDataCache[originalSetCode] = originalSetData.results;
        }
      }
    }

    // 获取 SPG 数据（优先从缓存获取）
    let spgData: ChineseCardResponse = { results: [] };
    if (!spgLoaded) {
      spgData = await fetchChineseCardData('SPG');
      if (spgData.results?.length > 0) {
        setDataCache['SPG'] = spgData.results;
        spgLoaded = true;
      }
    } else if (setDataCache['SPG']) {
      spgData = { results: setDataCache['SPG'] };
    }

    // 合并所有系列数据
    const allResults = [
      ...(currentSetData.results || []),
      ...(originalSetData.results || []),
      ...(spgData.results || [])
    ];

    // 如果有回调函数，先返回已有数据
    if (onResults && allResults.length > 0) {
      onResults(allResults);
    }

    // 创建一个映射来快速查找已有的中文数据
    const existingCards = new Map(allResults.map(card => [card.name, card]));

    // 检查哪些卡牌没有中文数据
    const missingCards = cards.filter(card => !existingCards.has(card.name));

    // 如果有缺失的卡牌，分组搜索获取
    if (missingCards.length > 0) {
      // 将缺失的卡牌分成每组10张
      const cardGroups = chunkArray(missingCards, 10);

      // 依次搜索每组卡牌
      for (let i = 0; i < cardGroups.length; i++) {
        const group = cardGroups[i];
        try {
          const result = await searchChineseCards(group.map(card => card.name));
          if (result.results) {
            // 将搜索到的卡牌加入结果和缓存
            allResults.push(...result.results);
            result.results.forEach(card => {
              if (card.setCode && !setDataCache[card.setCode]) {
                setDataCache[card.setCode] = [];
              }
              if (card.setCode && !setDataCache[card.setCode].some(c => c.name === card.name)) {
                setDataCache[card.setCode].push(card);
              }
            });

            // 每组搜索完成后立即更新界面
            if (onResults) {
              onResults([...allResults]);
            }
          }
        } catch (error) {
          console.error('Failed to search Chinese card data:', error);
        }
      }
    }

    return allResults;
  } catch (error) {
    console.error('Failed to fetch all Chinese card data:', error);
    return [];
  }
}