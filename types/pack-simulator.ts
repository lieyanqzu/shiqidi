// 补充包数据结构
export interface BoosterData {
  name: string;
  code: string;
  set_code: string;
  set_name: string;
  boosters: BoosterType[];
  sheets: Sheets;
}

// 补充包类型
export interface BoosterType {
  sheets: {
    [key: string]: number;  // 卡牌表名称到数量的映射
  };
  weight: number;
}

// 卡牌表
export interface Sheets {
  [key: string]: Sheet;  // 表名称到表内容的映射
}

export interface Sheet {
  total_weight: number;
  cards: {
    [cardId: string]: number;  // 卡牌ID到权重的映射
  };
}

// 模拟器状态
export interface PackSimulatorState {
  selectedSet: string;
  packCount: number;
  results: PackSimulatorResults | null;
}

// 模拟结果
export interface PackSimulatorResults {
  packs: Pack[];
  statistics: PackStatistics;
}

// 单个补充包
export interface Pack {
  cards: Card[];
  type: string;
}

// 单张卡牌
export interface Card {
  id: string;
  sheet: string;  // 来自哪个卡牌表
  setCode: string;
  number: string;
  name?: string;
  zhs_name?: string;
  officialName?: string;
  translatedName?: string;
  scryfallId?: string;
  rarity?: string;
}

// 统计信息
export interface PackStatistics {
  totalCards: number;
  byRarity: {
    [rarity: string]: number;
  };
  bySheet: {
    [sheet: string]: number;
  };
}

// 卡牌信息响应
export interface CardInfoResponse {
  type: string;
  data: CardInfo[];
  rulings: any[];
}

export interface CardInfo {
  name: string;
  zhs_name: string;
  officialName?: string;
  translatedName?: string;
  scryfallId: string;
  rarity: string;
  setCode: string;
  number: string;
  [key: string]: any;  // 其他字段
}

export interface Set {
  code: string;
  boosters: {
    code: string;
    name: string;
  }[];
}

export interface BoosterConfig {
  sets: Set[];
} 