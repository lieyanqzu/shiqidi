import { CardData, ChineseCardData } from "@/types/card";

export interface CardDataParams {
  expansion: string;           // 系列代码，如 "FDN"
  format: string;             // 游戏格式，如 "PremierDraft"
  user_group?: string;        // 玩家分组，如 "middle"，为空时表示所有用户
  start_date: string;         // 开始日期，如 "2016-01-01"
  end_date: string;           // 结束日期，如 "2024-03-14"
  colors?: string;           // 套牌颜色筛选
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

interface ChineseCardResponse {
  items: ChineseCardData[];
}

export async function fetchChineseCardData(setCode: string): Promise<ChineseCardResponse> {
  const response = await fetch(
    `https://mtgch.com/api/v1/set/${setCode}/cards/?unique=oracle_id&priority_chinese=true`,
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

// 批量搜索卡牌，支持回调函数
export async function searchChineseCards(
  cardNames: string[],
  onResults?: (results: ChineseCardData[]) => void
): Promise<ChineseCardResponse> {
  // 构建搜索查询
  const searchQuery = cardNames.map(name => `name="${name}"`).join(' or ');

  const searchParams = new URLSearchParams({
    page: '1',
    page_size: '100',
    unique: 'oracle_id',
    priority_chinese: 'true',
    q: searchQuery
  });

  const response = await fetch(
    `https://mtgch.com/api/v1/result?${searchParams}`,
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

// 记录哪些系列已经完整加载
const fullyLoadedSets = new Set<string>();

// 将数组分成指定大小的组
function chunkArray<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size));
  }
  return chunks;
}

async function loadSetDataWithCache(setCode: string): Promise<ChineseCardResponse> {
  if (!setCode) {
    return { items: [] };
  }

  if (fullyLoadedSets.has(setCode) && setDataCache[setCode]) {
    return { items: setDataCache[setCode] };
  }

  const data = await fetchChineseCardData(setCode);
  if (data.items) {
    setDataCache[setCode] = data.items;
    fullyLoadedSets.add(setCode);
  }
  return data;
}

async function loadOptionalSetData(setCode: string): Promise<ChineseCardResponse> {
  if (!setCode) {
    return { items: [] };
  }

  try {
    return await loadSetDataWithCache(setCode);
  } catch (error) {
    console.warn(`Failed to fetch Chinese data for optional set ${setCode}:`, error);
    return { items: [] };
  }
}

export async function fetchAllChineseCardData(
  setCode: string, 
  cards: CardData[],
  onResults?: (results: ChineseCardData[]) => void
): Promise<ChineseCardData[]> {
  try {
    // 获取当前系列的数据
    const currentSetData = await loadSetDataWithCache(setCode);

    // 计算需要额外加载的系列
    const extraSetCodes = new Set<string>();

    const numericVariantMatch = setCode.match(/^Y\d{1,2}([A-Z]+)/);
    if (numericVariantMatch) {
      const baseCode = numericVariantMatch[1];
      const canonicalYSetCode = `Y${baseCode}`;
      if (canonicalYSetCode && canonicalYSetCode !== setCode) {
        extraSetCodes.add(canonicalYSetCode);
      }
    }

    if (setCode.startsWith('Y')) {
      const originalSetCode = setCode.replace(/^Y\d{0,2}/, '');
      if (originalSetCode && originalSetCode !== setCode) {
        extraSetCodes.add(originalSetCode);
      }
    }

    const extraSetDataResponses = await Promise.all(
      Array.from(extraSetCodes).map(code => loadOptionalSetData(code))
    );

    // 获取 SPG 数据（优先从缓存获取）
    let spgData: ChineseCardResponse = { items: [] };
    if (!spgLoaded) {
      spgData = await fetchChineseCardData('SPG');
      if (spgData.items?.length > 0) {
        setDataCache['SPG'] = spgData.items;
        spgLoaded = true;
      }
    } else if (setDataCache['SPG']) {
      spgData = { items: setDataCache['SPG'] };
    }

    // 合并所有系列数据
    const allResults = [
      ...(currentSetData.items || []),
      ...extraSetDataResponses.flatMap(data => data.items || []),
      ...(spgData.items || [])
    ];

    // 如果有回调函数，先返回已有数据
    if (onResults && allResults.length > 0) {
      onResults(allResults);
    }

    // 创建一个映射来快速查找已有的中文数据
    const existingCards = new Map(allResults.flatMap(card => 
      card.face_name 
        ? [[card.name, card], [card.face_name, card]]
        : [[card.name, card]]
    ));

    // 检查哪些卡牌没有中文数据
    const missingCards = cards.filter(card => !existingCards.has(card.name));

    // 如果有缺失的卡牌，分组搜索获取
    if (missingCards.length > 0) {
      // 将缺失的卡牌分成每组10张
      const cardGroups = chunkArray(missingCards, 30);

      // 依次搜索每组卡牌
      for (let i = 0; i < cardGroups.length; i++) {
        const group = cardGroups[i];
        try {
          const result = await searchChineseCards(group.map(card => card.name));
          if (result.items) {
            // 将搜索到的卡牌加入结果和缓存
            allResults.push(...result.items);
            result.items.forEach(card => {
              if (card.set && !setDataCache[card.set]) {
                setDataCache[card.set] = [];
              }
              if (card.set && !setDataCache[card.set].some(c => c.name === card.name)) {
                setDataCache[card.set].push(card);
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