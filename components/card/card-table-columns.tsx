'use client';

import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import type { Column } from "@/components/card/card-table";
import { ColumnHelpDialog } from "@/components/card/column-help-dialog";

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

  const selectedCount = useMemo(() => {
    return optionalColumns.filter(column => visibleColumns.has(String(column.accessorKey))).length;
  }, [optionalColumns, visibleColumns]);

  return (
    <div className="w-full">
      {/* 移动端折叠按钮 */}
      <div className="sm:hidden mb-2 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between bg-[--component-background]"
        >
          <span>显示/隐藏列</span>
          <span className="text-xs text-[--foreground-muted]">
            {selectedCount}/{optionalColumns.length}
          </span>
        </Button>
        <ColumnHelpDialog />
      </div>

      {/* 桌面端标题和列选项 */}
      <div className="hidden sm:flex sm:items-center sm:gap-3">
        <span className="text-sm text-[--component-foreground-muted] flex items-center gap-1">
          显示/隐藏列：
          <ColumnHelpDialog />
        </span>
        <div className="flex-1 min-w-[240px] overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap pb-1">
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
                  className={`inline-flex justify-center text-sm rounded-full px-4 border transition-all ${
                    isVisible
                      ? 'bg-gradient-to-r from-[--accent]/20 to-[--accent]/10 text-[--foreground] border-[--accent]/60 font-medium shadow-sm hover:border-[--accent]'
                      : 'bg-[--component-background] text-[--foreground-muted] border-[--border] hover:text-[--foreground] hover:border-[--accent]/50'
                  }`}
                >
                  {column.header}
                </Button>
              );
            })}
          </div>
        </div>
      </div>

      {/* 移动端展开的列选项 */}
      <div className={`sm:hidden ${!isExpanded ? 'hidden' : ''}`}>
        <div className="grid grid-cols-2 gap-2">
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
                className={`w-full justify-start text-sm rounded-full border transition-all ${
                  isVisible
                    ? 'bg-gradient-to-r from-[--accent]/20 to-[--accent]/10 text-[--foreground] border-[--accent]/60 font-medium shadow-sm hover:border-[--accent]'
                    : 'bg-[--component-background] text-[--foreground-muted] border-[--border] hover:text-[--foreground] hover:border-[--accent]/50'
                }`}
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