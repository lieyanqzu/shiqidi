'use client';

import { useState, useMemo, useCallback, useEffect } from 'react';
import { Table } from "@/components/ui/table";
import { CardTableColumns } from "@/components/card-table-columns";
import { CardNameCell } from "@/components/card-name-cell";
import { StatCell } from "@/components/stat-cell";
import { ManaSymbols } from "@/components/mana-symbols";
import { calculateStats } from "@/lib/stats";
import type { CardData } from "@/types/card";

// 导出 Column 类型供其他组件使用
export type Column = {
  header: string;
  accessorKey: keyof CardData;
  title?: string;
  sortable?: boolean;
  cell?: (value: CardData[keyof CardData], row: CardData, data: CardData[], expansion: string) => React.ReactNode;
};

// 添加排序方向类型
type SortDirection = 'asc' | 'desc';

// 稀有度映射
const rarityMap: Record<string, string> = {
  'common': '普通',
  'uncommon': '非普通',
  'rare': '稀有',
  'mythic': '秘稀',
};

// 稀有度排序权重
const rarityWeight: Record<string, number> = {
  'common': 1,
  'uncommon': 2,
  'rare': 3,
  'mythic': 4,
};

// 颜色排序权重
// 无色 < 单色(WUBRG) < 多色 < 五色
const getColorWeight = (color: string): number => {
  if (color === '') return 0;  // 无色
  if (color === 'WUBRG') return 7;  // 五色

  const singleColorWeight: Record<string, number> = {
    'W': 1, // 白
    'U': 2, // 蓝
    'B': 3, // 黑
    'R': 4, // 红
    'G': 5, // 绿
  };

  // 多色
  if (color.length > 1) {
    return 6;
  }

  // 单色
  return singleColorWeight[color] || 0;
};

export function CardTable({ data, isLoading, expansion }: { 
  data: CardData[]; 
  isLoading?: boolean;
  expansion: string;
}) {
  // 将 columns 定义移到组件内部
  const columns: Column[] = useMemo(() => [
    {
      header: "卡牌名称",
      accessorKey: "name",
      sortable: true,
      cell: (_, row) => <CardNameCell card={row as CardData} expansion={expansion} />,
    },
    {
      header: "颜色",
      accessorKey: "color",
      sortable: true,
      cell: (value) => (
        <div className="w-12">
          <ManaSymbols color={String(value)} />
        </div>
      ),
    },
    {
      header: "稀有度",
      accessorKey: "rarity",
      sortable: true,
      cell: (value, _row, _allData, expansion) => {
        const rarity = String(value).toLowerCase();
        const processedSet = expansion.startsWith('Y')
          ? `y${expansion.slice(expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
          : expansion.toLowerCase();
        
        return (
          <i 
            className={`keyrune ss ss-${processedSet} ss-${rarity} ss-2x`}
            aria-hidden="true"
            title={String(rarityMap[rarity] || value)}
          />
        );
      },
    },
    {
      header: "# Seen",
      accessorKey: "seen_count",
      title: "轮抽中见过的次数",
      sortable: true,
    },
    {
      header: "ALSA",
      accessorKey: "avg_seen",
      title: "平均最后见到的抓位",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'avg_seen', value as number)}
          label="ALSA"
        />
      ),
    },
    {
      header: "# Picked",
      accessorKey: "pick_count",
      title: "被选择的次数",
      sortable: true,
    },
    {
      header: "ATA",
      accessorKey: "avg_pick",
      title: "平均选择抓位",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'avg_pick', value as number)}
          label="ATA"
        />
      ),
    },
    {
      header: "# GP",
      accessorKey: "game_count",
      title: "使用过的对局数量",
      sortable: true,
    },
    {
      header: "% GP",
      accessorKey: "play_rate",
      title: "主牌使用率",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'play_rate', value as number)}
          label="% GP"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      header: "GP WR",
      accessorKey: "win_rate",
      title: "主牌使用时的胜率",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'win_rate', value as number)}
          label="GP WR"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      header: "# OH",
      accessorKey: "opening_hand_game_count",
      title: "在起手的对局数量",
      sortable: true,
    },
    {
      header: "OH WR",
      accessorKey: "opening_hand_win_rate",
      title: "在起手时的胜率",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'opening_hand_win_rate', value as number)}
          label="OH WR"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      header: "# GD",
      accessorKey: "drawn_game_count",
      title: "第一回合后抽到的对局数量",
      sortable: true,
    },
    {
      header: "GD WR",
      accessorKey: "drawn_win_rate",
      title: "第一回合后抽到的胜率",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'drawn_win_rate', value as number)}
          label="GD WR"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      header: "# GIH",
      accessorKey: "ever_drawn_game_count",
      title: "在手上的对局数量(起手或抽到)",
      sortable: true,
    },
    {
      header: "GIH WR",
      accessorKey: "ever_drawn_win_rate",
      title: "在手上时的胜率(起手或抽到)",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'ever_drawn_win_rate', value as number)}
          label="GIH WR"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      header: "# GNS",
      accessorKey: "never_drawn_game_count",
      title: "未见到的对局数量",
      sortable: true,
    },
    {
      header: "GNS WR",
      accessorKey: "never_drawn_win_rate",
      title: "未见到的胜率",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'never_drawn_win_rate', value as number)}
          label="GNS WR"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
    {
      header: "IIH",
      accessorKey: "drawn_improvement_win_rate",
      title: "在手时的胜率提升",
      sortable: true,
      cell: (value, row, allData) => (
        <StatCell
          value={value as number}
          stats={calculateStats(allData, 'drawn_improvement_win_rate', value as number)}
          label="IIH"
          formatter={(v) => `${(v * 100).toFixed(1)}%`}
        />
      ),
    },
  ], [expansion]);  // 添加 expansion 作为依赖

  // 排序状态
  const [sortConfig, setSortConfig] = useState<{
    column: keyof CardData | undefined;
    direction: SortDirection;
  }>({
    column: undefined,
    direction: 'desc'
  });

  // 可见列状态，默认显示所有列
  const [visibleColumns, setVisibleColumns] = useState<Set<string>>(
    new Set(columns.map(col => String(col.accessorKey)))
  );

  // 从 localStorage 读取保存的列设置
  useEffect(() => {
    const saved = localStorage.getItem('visibleColumns');
    if (saved) {
      setVisibleColumns(new Set(JSON.parse(saved)));
    }
  }, []);

  // 处理列显示切换
  const handleColumnToggle = useCallback((columnKey: string) => {
    setVisibleColumns(prev => {
      const next = new Set(prev);
      if (next.has(columnKey)) {
        next.delete(columnKey);
      } else {
        next.add(columnKey);
      }
      localStorage.setItem('visibleColumns', JSON.stringify([...next]));
      return next;
    });
  }, []);

  // 过滤显示的列
  const visibleColumnsList = useMemo(() => {
    return columns.filter(col => visibleColumns.has(String(col.accessorKey)));
  }, [visibleColumns, columns]);  // 添加 columns 作为依赖

  // 排序数据
  const sortedData = useMemo(() => {
    if (!sortConfig.column) return data;

    return [...data].sort((a, b) => {
      const aValue = a[sortConfig.column!];
      const bValue = b[sortConfig.column!];

      if (aValue === null) return 1;
      if (bValue === null) return -1;
      if (aValue === bValue) return 0;

      // 特殊处理稀有度排序
      if (sortConfig.column === 'rarity') {
        const aWeight = rarityWeight[String(aValue).toLowerCase()] || 0;
        const bWeight = rarityWeight[String(bValue).toLowerCase()] || 0;
        const result = aWeight - bWeight;
        return sortConfig.direction === 'asc' ? result : -result;
      }

      // 特殊处理颜色排序
      if (sortConfig.column === 'color') {
        const aWeight = getColorWeight(String(aValue));
        const bWeight = getColorWeight(String(bValue));
        const result = aWeight - bWeight;
        return sortConfig.direction === 'asc' ? result : -result;
      }

      // 添加 undefined 检查
      if (aValue === undefined) return 1;
      if (bValue === undefined) return -1;

      const result = aValue < bValue ? -1 : 1;
      return sortConfig.direction === 'asc' ? result : -result;
    });
  }, [data, sortConfig]);

  const handleSort = useCallback((column: keyof CardData) => {
    setSortConfig(prev => ({
      column,
      direction: 
        prev.column === column && prev.direction === 'asc' 
          ? 'desc' 
          : 'asc'
    }));
  }, []);

  return (
    <div className="space-y-4">
      <div className="w-[calc(100vw-2rem)] lg:w-[calc(100vw-4rem)] xl:w-[calc(100vw-6rem)] mx-auto">
        <CardTableColumns
          columns={columns}
          visibleColumns={visibleColumns}
          onColumnToggle={handleColumnToggle}
        />
        <div className="card">
          <Table
            data={sortedData}
            columns={visibleColumnsList}
            isLoading={isLoading}
            emptyText="暂无卡牌数据"
            sortColumn={sortConfig.column}
            sortDirection={sortConfig.direction}
            onSort={handleSort}
            expansion={expansion}
          />
        </div>
      </div>
    </div>
  );
} 