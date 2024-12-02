"use client";

import { useState } from "react";
import { Table } from "antd";
import type { ColumnsType } from "antd/es/table";
import { CardNameCell } from "@/components/card-name-cell";
import { StatCell } from "@/components/stat-cell";
import type { Stats } from "@/lib/stats";
import { ManaSymbols } from "@/components/mana-symbols";

export interface Column {
  accessorKey: string;
  header: string;
  title?: string;
}

interface CardTableProps {
  data: any[];
  columns: Column[];
  loading?: boolean;
  expansion: string;
}

export function CardTable({ data, columns, loading = false, expansion = '' }: CardTableProps) {
  const antColumns: ColumnsType<any> = columns.map(column => ({
    title: column.title || column.header,
    dataIndex: column.accessorKey,
    key: column.accessorKey,
    render: (value, record) => {
      if (column.accessorKey === "name") {
        return <CardNameCell card={record} expansion={expansion} />;
      }

      if (column.accessorKey === "color") {
        return (
          <div className="w-12">
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
          <i 
            className={`keyrune ss ss-${processedSet} ss-${rarity} ss-2x`}
            aria-hidden="true"
            title={String(value)}
          />
        );
      }
      
      if (record.stats?.[column.accessorKey]) {
        return (
          <StatCell
            value={value}
            stats={record.stats[column.accessorKey] as Stats}
            label={column.accessorKey}
          />
        );
      }
      
      return value;
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
        size="middle"
        pagination={false}
        rowKey="name"
      />
    </div>
  );
} 