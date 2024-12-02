"use client";

import { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CardNameCell } from "@/components/card-name-cell";
import { StatCell } from "@/components/stat-cell";
import type { Stats } from "@/lib/stats";
import { ManaSymbols } from "@/components/mana-symbols";
import { calculateStats } from "@/lib/stats";

export interface Column {
  accessorKey: string;
  header: string;
  title?: string;
  tooltip?: string;
}

interface CardTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  expansion: string;
}

export function CardTable({ data, columns, loading = false, expansion = '' }: CardTableProps) {
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);

  const antColumns: ColumnsType<any> = columns.map(column => ({
    title: column.title || column.header,
    dataIndex: column.accessorKey,
    key: column.accessorKey,
    ellipsis: true,
    sorter: (a: any, b: any) => {
      if (column.accessorKey === "color") {
        return String(a.color).length - String(b.color).length;
      }
      
      if (column.accessorKey === "rarity") {
        const rarityOrder = { mythic: 4, rare: 3, uncommon: 2, common: 1 };
        return (rarityOrder[a.rarity.toLowerCase()] || 0) - (rarityOrder[b.rarity.toLowerCase()] || 0);
      }
      
      if (typeof a[column.accessorKey] === 'number' && typeof b[column.accessorKey] === 'number') {
        return a[column.accessorKey] - b[column.accessorKey];
      }
      
      return String(a[column.accessorKey]).localeCompare(String(b[column.accessorKey]));
    },
    defaultSortOrder: column.accessorKey === 'name' ? 'ascend' : undefined,
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
          <div className="w-12 whitespace-nowrap">
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
          <div className="whitespace-nowrap">
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

  const dataWithKeys = data.map((item, index) => ({
    ...item,
    key: item.name || `row-${index}`,
  }));

  return (
    <div className="card w-full">
      <Table
        columns={antColumns}
        dataSource={dataWithKeys}
        loading={loading}
        scroll={{ x: true }}
        sticky={{
          offsetHeader: 64
        }}
        size="middle"
        rowKey="name"
        className="whitespace-nowrap [&_.ant-table-body]:!overflow-y-hidden"
        pagination={{
          current: currentPage,
          pageSize: pageSize,
          total: data.length,
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
      />
    </div>
  );
} 