'use client';

import { Select } from "@/components/ui/select";
import { DateRangePicker } from "@/components/ui/date-range-picker";
import { Input } from "@/components/ui/input";
import type { CardDataParams } from "@/lib/api";

// 系列选项
const sets = [
  { label: "FDN", value: "FDN" },
  { label: "DSK", value: "DSK" },
  { label: "Y25DSK", value: "Y25DSK" },
  { label: "BLB", value: "BLB" },
  { label: "Y25BLB", value: "Y25BLB" },
  { label: "MH3", value: "MH3" },
  { label: "OTJ", value: "OTJ" },
  { label: "Y24OTJ", value: "Y24OTJ" },
  { label: "MKM", value: "MKM" },
  { label: "Y24MKM", value: "Y24MKM" },
  { label: "LCI", value: "LCI" },
  { label: "Y24LCI", value: "Y24LCI" },
  { label: "WOE", value: "WOE" },
  { label: "Y24WOE", value: "Y24WOE" },
  { label: "LTR", value: "LTR" },
  { label: "MOM", value: "MOM" },
  { label: "MAT", value: "MAT" },
  { label: "SIR", value: "SIR" },
  { label: "ONE", value: "ONE" },
  { label: "Y23ONE", value: "Y23ONE" },
  { label: "BRO", value: "BRO" },
  { label: "Y23BRO", value: "Y23BRO" },
  { label: "DMU", value: "DMU" },
  { label: "Y23DMU", value: "Y23DMU" },
  { label: "HBG", value: "HBG" },
  { label: "SNC", value: "SNC" },
  { label: "Y22SNC", value: "Y22SNC" },
  { label: "NEO", value: "NEO" },
  { label: "DBL", value: "DBL" },
  { label: "VOW", value: "VOW" },
  { label: "RAVM", value: "RAVM" },
  { label: "MID", value: "MID" },
  { label: "AFR", value: "AFR" },
  { label: "STX", value: "STX" },
  { label: "CORE", value: "CORE" },
  { label: "KHM", value: "KHM" },
  { label: "KLR", value: "KLR" },
  { label: "ZNR", value: "ZNR" },
  { label: "AKR", value: "AKR" },
  { label: "M21", value: "M21" },
  { label: "IKO", value: "IKO" },
  { label: "THB", value: "THB" },
  { label: "ELD", value: "ELD" },
  { label: "Ravnica", value: "Ravnica" },
  { label: "M20", value: "M20" },
  { label: "WAR", value: "WAR" },
  { label: "M19", value: "M19" },
  { label: "DOM", value: "DOM" },
  { label: "RIX", value: "RIX" },
  { label: "GRN", value: "GRN" },
  { label: "RNA", value: "RNA" },
  { label: "KTK", value: "KTK" },
  { label: "XLN", value: "XLN" },
  { label: "Cube", value: "Cube" },
  { label: "Chaos", value: "Chaos" },
];

// 游戏模式
const formats = [
  { label: "Premier Draft", value: "PremierDraft" },
  { label: "Traditional Draft", value: "TradDraft" },
  { label: "Quick Draft", value: "QuickDraft" },
  { label: "Sealed", value: "Sealed" },
  { label: "Traditional Sealed", value: "TradSealed" },
  { label: "Arena Direct Sealed", value: "ArenaDirect_Sealed" },
  { label: "Open Sealed D1 Bo1", value: "OpenSealed_D1_Bo1" },
  { label: "Open Sealed D1 Bo3", value: "OpenSealed_D1_Bo3" },
  { label: "Qualifier Play-In Sealed", value: "QualifierPlayInSealed" },
];

// 玩家分组
const userGroups = [
  { label: "所有用户", value: "" },
  { label: "低级", value: "bottom" },
  { label: "中级", value: "middle" },
  { label: "顶级", value: "top" },
];

// 卡牌颜色
const colors = [
  { label: "卡牌颜色", value: "" },
  { label: "W", value: "W" },
  { label: "U", value: "U" },
  { label: "B", value: "B" },
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  { label: "Multicolor", value: "Multicolor" },
  { label: "Colorless", value: "Colorless" },
];

// 套牌颜色
const deckColors = [
  { label: "全部套牌", value: "" },
  // 单色
  { label: "W", value: "W" },
  { label: "U", value: "U" },
  { label: "B", value: "B" },
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  // 双色
  { label: "WU", value: "WU" },
  { label: "WB", value: "WB" },
  { label: "WR", value: "WR" },
  { label: "WG", value: "WG" },
  { label: "UB", value: "UB" },
  { label: "UR", value: "UR" },
  { label: "UG", value: "UG" },
  { label: "BR", value: "BR" },
  { label: "BG", value: "BG" },
  { label: "RG", value: "RG" },
  // 三色
  { label: "WUB", value: "WUB" },
  { label: "WUR", value: "WUR" },
  { label: "WUG", value: "WUG" },
  { label: "WBR", value: "WBR" },
  { label: "WBG", value: "WBG" },
  { label: "WRG", value: "WRG" },
  { label: "UBR", value: "UBR" },
  { label: "UBG", value: "UBG" },
  { label: "URG", value: "URG" },
  { label: "BRG", value: "BRG" },
  // 四色
  { label: "WUBR", value: "WUBR" },
  { label: "WUBG", value: "WUBG" },
  { label: "WURG", value: "WURG" },
  { label: "WBRG", value: "WBRG" },
  { label: "UBRG", value: "UBRG" },
  // 五色
  { label: "WUBRG", value: "WUBRG" },
];

// 稀有度
const rarities = [
  { label: "稀有度", value: "" },
  { label: "普通", value: "common" },
  { label: "非普通", value: "uncommon" },
  { label: "稀有", value: "rare" },
  { label: "秘稀", value: "mythic" },
];

interface CardFiltersProps {
  params: CardDataParams;
  onParamsChange: (params: Partial<CardDataParams>) => void;
  onColorFilter: (color: string) => void;
  selectedColor: string;
  onRarityFilter: (rarity: string) => void;
  selectedRarity: string;
  onSearchFilter: (search: string) => void;
  searchText: string;
}

export function CardFilters({ 
  params, 
  onParamsChange,
  onColorFilter,
  selectedColor,
  onRarityFilter,
  selectedRarity,
  onSearchFilter,
  searchText,
}: CardFiltersProps) {
  const startDate = new Date(params.start_date);
  const endDate = new Date(params.end_date);

  return (
    <div className="space-y-4">
      {/* 第一行：搜索和时间范围 */}
      <div className="flex flex-wrap items-center gap-4">
        <Input
          placeholder="搜索卡牌名称..."
          value={searchText}
          onChange={(e) => onSearchFilter(e.target.value)}
          className="w-64"
        />
        <DateRangePicker
          startDate={startDate}
          endDate={endDate}
          onStartDateChange={(date) => 
            onParamsChange({ 
              start_date: date.toISOString().split('T')[0] 
            })
          }
          onEndDateChange={(date) => 
            onParamsChange({ 
              end_date: date.toISOString().split('T')[0] 
            })
          }
        />
      </div>

      {/* 第二行：其他筛选项 */}
      <div className="flex flex-wrap items-center gap-4">
        <Select
          options={sets}
          value={params.expansion}
          onChange={(e) => onParamsChange({ expansion: e.target.value })}
          title="Select Set"
          className="min-w-[120px]"
        />
        <Select
          options={formats}
          value={params.format}
          onChange={(e) => onParamsChange({ format: e.target.value })}
          title="Select Format"
          className="min-w-[140px]"
        />
        <Select
          options={userGroups}
          value={params.user_group}
          onChange={(e) => onParamsChange({ user_group: e.target.value })}
          title="Select User Group"
          className="min-w-[100px]"
        />
        <Select
          options={colors}
          value={selectedColor}
          onChange={(e) => onColorFilter(e.target.value)}
          title="Select Card Color"
          className="min-w-[120px]"
        />
        <Select
          options={deckColors}
          value={params.colors || ""}
          onChange={(e) => onParamsChange({ colors: e.target.value })}
          title="Select Deck Color"
          className="min-w-[120px]"
        />
        <Select
          options={rarities}
          value={selectedRarity}
          onChange={(e) => onRarityFilter(e.target.value)}
          title="Select Rarity"
          className="min-w-[100px]"
        />
      </div>
    </div>
  );
} 