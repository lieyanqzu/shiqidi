export interface CardData {
  name: string;                 // 卡牌名称
  mtga_id: number;             // Arena ID
  color: string;               // 颜色
  rarity: string;              // 稀有度
  url: string;                 // 卡图URL
  url_back: string;            // 背面卡图URL(双面牌)
  types: string[];             // 类型

  // 选择数据
  seen_count: number;          // 见过次数
  avg_seen: number | null;     // 平均见过位置
  pick_count: number;          // 选择次数
  avg_pick: number | null;     // 平均选择位置
  
  // 游戏数据
  game_count: number;          // 游戏次数
  pool_count: number;          // 卡池数量
  play_rate: number | null;    // 使用率
  win_rate: number | null;     // 胜率

  // 起手与抽到数据
  opening_hand_game_count: number;           // 起手数量
  opening_hand_win_rate: number | null;      // 起手胜率
  drawn_game_count: number;                  // 抽到数量
  drawn_win_rate: number | null;             // 抽到胜率
  ever_drawn_game_count: number;             // 总抽到数量
  ever_drawn_win_rate: number | null;        // 总抽到胜率
  never_drawn_game_count: number;            // 未抽到数量
  never_drawn_win_rate: number | null;       // 未抽到胜率
  drawn_improvement_win_rate: number | null; // 抽到改善胜率
}

export interface ChineseCardData {
  name: string;               // 英文名
  faceName: string | null;    // 英文面名（双面牌）
  flavorName: string | null;  // 英文风味名
  type: string;              // 英文类型
  zhs_name: string;          // 中文名
  zhs_faceName: string | null; // 中文面名
  zhs_flavorName: string | null; // 中文风味名
  zhs_type: string;          // 中文类型
  zhs_language: string;      // 中文语言来源
  officialName: string | null; // 官方名称
  translatedName: string;    // 翻译名称
  setCode: string;           // 系列代码
  keyruneCode: string;       // Keyrune代码
  number: string;            // 收藏编号
  int_number: number;        // 数字编号
  manaCost: string;          // 法术力费用
  rarity: string;            // 稀有度
  releaseDate: string;       // 发布日期
  release_date: string;      // 发布日期（重复）
  side: string | null;       // 牌面（双面牌）
  scryfallId: string;        // Scryfall ID
  multiverseid: string | null; // 万智牌多重宇宙ID
  layout: string;            // 版面布局
}

export interface ChineseCardMap {
  [key: string]: ChineseCardData;  // 以英文名为key的映射
} 