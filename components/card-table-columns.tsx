'use client';

import { useMemo } from 'react';
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/card-table";

interface CardTableColumnsProps {
  columns: Column[];
  visibleColumns: Set<string>;
  onColumnToggle: (columnKey: string) => void;
}

export function CardTableColumns({
  columns,
  visibleColumns,
  onColumnToggle,
}: CardTableColumnsProps) {
  // 使用 useMemo 缓存可选列
  const optionalColumns = useMemo(() => {
    const baseColumns = ["name", "color", "rarity"];
    return columns.filter(col => !baseColumns.includes(col.accessorKey));
  }, [columns]);

  return (
    <div className="mb-4">
      <div className="flex items-center gap-4 flex-wrap">
        <span className="text-sm text-[--component-foreground-muted]">
          显示/隐藏列：
        </span>
        <div className="flex items-center gap-2 flex-wrap">
          {optionalColumns.map((column) => {
            const columnKey = String(column.accessorKey);
            const isVisible = visibleColumns.has(columnKey);
            
            return (
              <Button
                key={columnKey}
                variant={isVisible ? "secondary" : "ghost"}
                size="sm"
                onClick={() => onColumnToggle(columnKey)}
                title={column.title}
                className="bg-[--component-background]"
              >
                {column.header}
              </Button>
            );
          })}
        </div>
      </div>
    </div>
  );
} 