"use client";

import { useState, useEffect, useMemo } from "react";
import { Table, Button, Checkbox, Popover, Space } from "antd";
import { SettingOutlined } from '@ant-design/icons';
import type { ColumnsType } from "antd/es/table";
import { CardNameCell } from "@/components/card-name-cell";
import { StatCell } from "@/components/stat-cell";
import { ManaSymbols } from "@/components/mana-symbols";
import { calculateStats } from "@/lib/stats";
import type { CardData } from "@/types/card";
import { CardInfoFilters } from "@/components/card-info-filters";

export interface Column {
  accessorKey: keyof CardData;
  header: string;
  title?: string;
  tooltip?: string;
}

interface CardTableProps {
  data: CardData[];
  columns: Column[];
  loading?: boolean;
  expansion: string;
  searchText: string;
  selectedColor: string;
  selectedRarity: string;
  chineseCards: ChineseCardMap;
  onColorFilter: (color: string) => void;
  onRarityFilter: (rarity: string) => void;
  onSearchFilter: (search: string) => void;
}

export function CardTable({ 
  data, 
  columns, 
  loading = false, 
  expansion = '',
  searchText,
  selectedColor,
  selectedRarity,
  chineseCards,
  onColorFilter,
  onRarityFilter,
  onSearchFilter,
}: CardTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [windowWidth, setWindowWidth] = useState(typeof window !== 'undefined' ? window.innerWidth : 0);

  const mobileDefaultColumns: Array<keyof CardData> = [
    'name',
    'color',
    'rarity',
    'drawn_improvement_win_rate'
  ];

  const desktopDefaultColumns: Array<keyof CardData> = [
    'name',
    'color',
    'rarity',
    'drawn_improvement_win_rate',
    'ever_drawn_win_rate',
    'avg_seen'
  ];

  const defaultVisibleColumns = windowWidth < 768 ? mobileDefaultColumns : desktopDefaultColumns;
  
  const [visibleColumns, setVisibleColumns] = useState<Array<keyof CardData>>(defaultVisibleColumns);

  useEffect(() => {
    const handleResize = () => {
      const width = window.innerWidth;
      setWindowWidth(width);
      if (width < 768) {
        if (visibleColumns.length > mobileDefaultColumns.length) {
          setVisibleColumns([...mobileDefaultColumns]);
        }
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [visibleColumns, mobileDefaultColumns]);

  const antColumns: ColumnsType<CardData> = columns.map(column => ({
    title: column.title || column.header,
    dataIndex: column.accessorKey,
    key: column.accessorKey,
    minWidth: getColumnMinWidth(column.accessorKey),
    width: 'auto',
    align: column.accessorKey === 'name' ? 'left' : 'center',
    showSorterTooltip: false,
    sorter: (a: CardData, b: CardData) => {
      if (column.accessorKey === "color") {
        return String(a.color).length - String(b.color).length;
      }
      
      if (column.accessorKey === "rarity") {
        const rarityOrder: Record<string, number> = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
        const aRarity = (a.rarity?.toLowerCase() || '') as keyof typeof rarityOrder;
        const bRarity = (b.rarity?.toLowerCase() || '') as keyof typeof rarityOrder;
        return (rarityOrder[aRarity] || 0) - (rarityOrder[bRarity] || 0);
      }
      
      if (typeof a[column.accessorKey] === 'number' && typeof b[column.accessorKey] === 'number') {
        return (a[column.accessorKey] as number) - (b[column.accessorKey] as number);
      }
      
      return String(a[column.accessorKey]).localeCompare(String(b[column.accessorKey]));
    },
    defaultSortOrder: column.accessorKey === 'name' ? 'ascend' : undefined,
    sortDirections: ['ascend', 'descend', 'ascend'],
    render: (value, record) => {
      if (column.accessorKey === "name") {
        return (
          <div className="whitespace-nowrap">
            <CardNameCell card={record} expansion={expansion} />
          </div>
        );
      }

      if (column.accessorKey === "color") {
        return (
          <div className="w-12 whitespace-nowrap mx-auto">
            <ManaSymbols color={String(value)} />
          </div>
        );
      }

      if (column.accessorKey === "rarity") {
        const rarity = String(value || '').toLowerCase();
        const processedSet = expansion?.startsWith("Y")
          ? `y${expansion.slice(expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
          : (expansion || '').toLowerCase();
        
        return (
          <div className="whitespace-nowrap text-center">
            <i 
              className={`keyrune ss ss-${processedSet} ss-${rarity} ss-2x`}
              aria-hidden="true"
              title={String(value)}
            />
          </div>
        );
      }
      
      const numericColumns = [
        "avg_seen", "avg_pick", "play_rate", "win_rate",
        "opening_hand_win_rate", "drawn_win_rate", "ever_drawn_win_rate",
        "never_drawn_win_rate", "drawn_improvement_win_rate"
      ];

      if (numericColumns.includes(column.accessorKey)) {
        const formatter = (v: number) => {
          if (column.accessorKey.includes("rate")) {
            return `${(v * 100).toFixed(1)}%`;
          }
          return v.toFixed(2);
        };

        return (
          <div className="whitespace-nowrap">
            <StatCell
              value={value}
              stats={calculateStats(data, column.accessorKey, value)}
              label={column.accessorKey}
              formatter={formatter}
            />
          </div>
        );
      }
      
      return <div className="whitespace-nowrap">{value}</div>;
    },
  }));

  function getColumnMinWidth(accessorKey: string): number {
    switch (accessorKey) {
      case 'color':
        return 80;
      case 'rarity':
        return 70;
      case 'name':
        return 150;
      case 'avg_seen':
      case 'avg_pick':
      case 'play_rate':
      case 'win_rate':
      case 'opening_hand_win_rate':
      case 'drawn_win_rate':
      case 'ever_drawn_win_rate':
      case 'never_drawn_win_rate':
      case 'drawn_improvement_win_rate':
        return 100;
      default:
        return 100;
    }
  }

  const filteredData = useMemo(() => {
    let result = data;

    // 搜索筛选
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(card => {
        // 英文名匹配
        const englishMatch = card.name.toLowerCase().includes(searchLower);
        // 中文名匹配
        const chineseCard = chineseCards[card.name];
        const chineseName = chineseCard?.zhs_name || chineseCard?.officialName || chineseCard?.translatedName;
        const chineseMatch = chineseName?.toLowerCase().includes(searchLower);
        
        return englishMatch || chineseMatch;
      });
    }

    // 颜色筛选
    if (selectedColor) {
      result = result.filter(card => {
        if (selectedColor === "Multicolor") {
          return card.color.length > 1;
        }
        if (selectedColor === "Colorless") {
          return card.color === "";
        }
        return card.color === selectedColor;
      });
    }

    // 稀有度筛选
    if (selectedRarity) {
      result = result.filter(card => 
        card.rarity.toLowerCase() === selectedRarity
      );
    }

    return result;
  }, [data, searchText, selectedColor, selectedRarity, chineseCards]);

  const visibleAntColumns = antColumns.filter(col => 
    visibleColumns.includes(col.key as keyof CardData)
  );

  const ColumnSelector = () => (
    <div className="p-4 min-w-[200px]">
      <div className="mb-2 flex justify-between items-center">
        <span className="text-[--foreground]">列展示</span>
        <Button 
          type="link" 
          size="small"
          onClick={() => setVisibleColumns(
            [...(windowWidth < 768 ? mobileDefaultColumns : desktopDefaultColumns)]
          )}
        >
          重置
        </Button>
      </div>
      <Checkbox.Group 
        value={visibleColumns}
        onChange={(checkedValues) => {
          if (!checkedValues.includes('name')) {
            checkedValues.push('name');
          }
          if (checkedValues.length === 0) {
            return;
          }
          setVisibleColumns(checkedValues.filter((value): value is keyof CardData => 
            typeof value === 'string' && value in data[0]
          ));
        }}
      >
        <Space direction="vertical">
          {columns.map(column => (
            <Checkbox 
              key={column.accessorKey} 
              value={column.accessorKey}
              disabled={
                column.accessorKey === 'name' || 
                (visibleColumns.length === 1 && visibleColumns.includes(column.accessorKey))
              }
            >
              {column.title || column.header}
            </Checkbox>
          ))}
        </Space>
      </Checkbox.Group>
    </div>
  );

  // 当筛选条件改变时重置页码
  useEffect(() => {
    setCurrentPage(1);
  }, [searchText, selectedColor, selectedRarity]);

  return (
    <div className="card w-full">
      <div className="flex justify-between p-2 border-b border-[--table-border]">
        <CardInfoFilters
          onColorFilter={onColorFilter}
          selectedColor={selectedColor}
          onRarityFilter={onRarityFilter}
          selectedRarity={selectedRarity}
          onSearchFilter={onSearchFilter}
          searchText={searchText}
        />
        <Popover 
          content={<ColumnSelector />} 
          trigger="click"
          placement="bottomRight"
          overlayClassName="column-selector-popover"
        >
          <Button 
            icon={<SettingOutlined />}
            className="flex items-center"
          >
            列设置
          </Button>
        </Popover>
      </div>
      <Table
        columns={visibleAntColumns}
        dataSource={filteredData.map((item, index) => ({
          ...item,
          key: item.name || `row-${index}`,
        }))}
        loading={loading}
        scroll={{ x: 'max-content' }}
        sticky={{
          offsetHeader: 64
        }}
        size="middle"
        rowKey="name"
        className="whitespace-nowrap [&_.ant-table-body]:!overflow-y-hidden table-scroll-top"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: filteredData.length,
          showSizeChanger: true,
          showQuickJumper: true,
          pageSizeOptions: ['10', '20', '50', '100'],
          position: ['bottomCenter'],
          showTotal: (total) => `共 ${total} 张卡牌`,
          onChange: (page, size) => {
            setCurrentPage(page);
            setPageSize(size);
          },
          onShowSizeChange: (current, size) => {
            setPageSize(size);
            setCurrentPage(1);
          },
          locale: {
            items_per_page: '条/页',
            jump_to: '跳转到',
            jump_to_confirm: '确定',
            page: '页',
            prev_page: '上一页',
            next_page: '下一页',
            prev_5: '向前 5 页',
            next_5: '向后 5 页',
          }
        }}
        tableLayout="auto"
      />
    </div>
  );
} 