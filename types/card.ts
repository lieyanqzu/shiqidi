export interface CardData {
  name: string;                 // 卡牌名称
  color: string;               // 颜色
  rarity: string;              // 稀有度
  seen_count?: number;          // 见过次数
  avg_seen?: number;            // 平均见过位置
  pick_count?: number;          // 选择次数
  avg_pick?: number;            // 平均选择位置
  game_count?: number;          // 游戏次数
  play_rate?: number;            // 使用率
  win_rate?: number;             // 胜率
  opening_hand_game_count?: number;           // 起手数量
  opening_hand_win_rate?: number;      // 起手胜率
  drawn_game_count?: number;                  // 抽到数量
  drawn_win_rate?: number;             // 抽到胜率
  ever_drawn_game_count?: number;             // 总抽到数量
  ever_drawn_win_rate?: number;        // 总抽到胜率
  never_drawn_game_count?: number;            // 未抽到数量
  never_drawn_win_rate?: number;       // 未抽到胜率
  drawn_improvement_win_rate?: number; // 抽到改善胜率
  url?: string;                       // 卡牌链接
}

export interface ChineseCardData {
  name: string;               // 英文名
  face_name: string | null;    // 英文面名（双面牌）
  zhs_name: string;          // 中文名
  atomic_official_name: string | null; // 官方名称
  atomic_translated_name: string;    // 翻译名称
  set: string;           // 系列代码
  collector_number: string;            // 收藏编号
  id: string;        // Scryfall ID
}

export interface ChineseCardMap {
  [key: string]: ChineseCardData;  // 以英文名为key的映射
} 