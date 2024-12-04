'use client';

import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import { ChevronDown, ChevronUp } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);

  // 使用 useMemo 缓存可选列
  const optionalColumns = useMemo(() => {
    const baseColumns = ["name", "color", "rarity"];
    return columns.filter(col => !baseColumns.includes(col.accessorKey));
  }, [columns]);

  // 计算已显示的列数
  const visibleCount = useMemo(() => {
    return Array.from(visibleColumns).filter(col => 
      !["name", "color", "rarity"].includes(col)
    ).length;
  }, [visibleColumns]);

  return (
    <div className="mb-4">
      {/* 移动端折叠按钮 */}
      <div className="sm:hidden mb-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full flex items-center justify-between bg-[--component-background]"
        >
          <span>显示/隐藏列（{visibleCount}/{optionalColumns.length}）</span>
          {isExpanded ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
        </Button>
      </div>

      {/* 桌面端标题和列选项 */}
      <div className="hidden sm:flex sm:items-center sm:gap-2 mb-2">
        <span className="text-sm text-[--component-foreground-muted]">显示/隐藏列：</span>
        <div className="flex flex-wrap gap-2">
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
                className="bg-[--component-background] justify-center"
              >
                {column.header}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 移动端展开的列选项 */}
      <div className={`sm:hidden ${!isExpanded ? 'hidden' : ''}`}>
        <div className="grid grid-cols-3 gap-2">
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
                className="w-full bg-[--component-background] justify-start"
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