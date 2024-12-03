'use client';
import { Input } from "@/components/ui/input";
import { Select } from "antd";

// 卡牌颜色选项
const colors = [
  { label: "卡牌颜色", value: "" },
  { label: "W", value: "W" },
  { label: "U", value: "U" },
  { label: "B", value: "B" },
  { label: "R", value: "R" },
  { label: "G", value: "G" },
  { label: "多色", value: "Multicolor" },
  { label: "无色", value: "Colorless" },
];

// 稀有度选项
const rarities = [
  { label: "稀有度", value: "" },
  { label: "普通", value: "common" },
  { label: "非普通", value: "uncommon" },
  { label: "稀有", value: "rare" },
  { label: "秘稀", value: "mythic" },
];

interface CardInfoFiltersProps {
  onColorFilter: (color: string) => void;
  selectedColor: string;
  onRarityFilter: (rarity: string) => void;
  selectedRarity: string;
  onSearchFilter: (search: string) => void;
  searchText: string;
}

export function CardInfoFilters({
  onColorFilter,
  selectedColor,
  onRarityFilter,
  selectedRarity,
  onSearchFilter,
  searchText,
}: CardInfoFiltersProps) {
  return (
    <div className="flex flex-wrap gap-2 items-center">
      <Input
        placeholder="搜索卡牌名称..."
        value={searchText}
        onChange={(e) => onSearchFilter(e.target.value)}
        className="w-32 sm:w-64"
      />
      <Select
        options={colors}
        value={selectedColor}
        onChange={onColorFilter}
        placeholder="卡牌颜色"
        style={{ width: 128 }}
      />
      <Select
        options={rarities}
        value={selectedRarity}
        onChange={onRarityFilter}
        placeholder="稀有度"
        style={{ width: 112 }}
      />
    </div>
  );
} 