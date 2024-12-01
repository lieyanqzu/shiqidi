export interface CardDataParams {
  expansion: string;           // 系列代码，如 "FDN"
  format: string;             // 游戏格式，如 "PremierDraft"
  user_group?: string;        // 玩家分组，如 "middle"，为空时表示所有用户
  start_date: string;         // 开始日期，如 "2016-01-01"
  end_date: string;           // 结束日期，如 "2024-03-14"
  colors?: string;           // 套牌颜色筛选
}

export async function fetchCardData(params: CardDataParams) {
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

export async function fetchChineseCardData(setCode: string) {
  const query = {
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