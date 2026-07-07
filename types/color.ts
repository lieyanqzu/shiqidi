// 17lands 色组数据原始行
export interface ColorRatingRow {
  color_name?: string;        // 色组全名，如 "Azorius (WU)"
  short_name?: string;        // 色组简写，如 "WU"、"WU+"、"1"、"1+"
  games?: number;             // 对局数
  wins?: number;              // 胜场数
  is_summary?: boolean;       // 是否为汇总行（单色/双色/三色等汇总）
}
