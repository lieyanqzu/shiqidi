import { useEffect, useRef, useCallback, useMemo } from 'react';

interface Column<T> {
  header: string;
  accessorKey: keyof T;
  title?: string;
  cell?: (value: T[keyof T], row: T, data: T[], expansion: string) => React.ReactNode;
  sortable?: boolean;
}

interface TableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyText?: string;
  sortColumn?: keyof T;
  sortDirection?: 'asc' | 'desc';
  onSort?: (column: keyof T) => void;
  expansion?: string;
}

export function Table<T>({ 
  data,
  columns,
  isLoading,
  emptyText = "暂无数据",
  sortColumn,
  sortDirection,
  onSort,
  expansion = '',
}: TableProps<T>) {
  const headerRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);

  // 缓存计算列宽的函数
  const calculateColumnWidths = useCallback(() => {
    if (!bodyRef.current) return;
    
    const bodyCells = bodyRef.current.querySelectorAll('td');
    if (!bodyCells.length) return;
    
    const firstRowCells = Array.from(bodyCells).slice(0, columns.length);
    const newWidths = firstRowCells.map(cell => cell.getBoundingClientRect().width);
    
    // 比较新旧列宽是否有变化
    const hasChanged = newWidths.some((width, index) => {
      const oldWidth = headerRef.current?.querySelectorAll('th')[index]?.getBoundingClientRect().width;
      return Math.abs((oldWidth || 0) - width) > 0.1;
    });
    
    if (!hasChanged) return;
    
    // 直接更新表头列宽
    const headerCells = headerRef.current?.querySelectorAll('th');
    if (headerCells) {
      headerCells.forEach((th, index) => {
        (th as HTMLElement).style.width = `${newWidths[index]}px`;
        (th as HTMLElement).style.maxWidth = `${newWidths[index]}px`;
        (th as HTMLElement).style.minWidth = `${newWidths[index]}px`;
      });
    }
  }, [columns.length]);

  // 缓存滚动处理函数
  const handleScroll = useCallback((headerScrollEl: HTMLDivElement, bodyScrollEl: HTMLDivElement) => (e: Event) => {
    const target = e.target as HTMLDivElement;
    
    if (target === headerScrollEl) {
      requestAnimationFrame(() => {
        bodyScrollEl.scrollLeft = target.scrollLeft;
      });
    } else {
      requestAnimationFrame(() => {
        headerScrollEl.scrollLeft = target.scrollLeft;
      });
    }
  }, []);

  // 缓存表头渲染
  const tableHeader = useMemo(() => (
    <tr>
      {columns.map((column) => (
        <th
          key={String(column.accessorKey)}
          className={`
            px-4 py-3 text-left text-sm font-medium text-[--table-header-foreground] whitespace-nowrap
            ${column.sortable ? 'cursor-pointer hover:text-[--primary]' : ''}
          `}
          title={column.title}
          onClick={() => column.sortable && onSort?.(column.accessorKey)}
        >
          <div className="flex items-center gap-1">
            {column.header}
            {column.sortable && sortColumn === column.accessorKey && (
              <span className="text-[--primary]">
                {sortDirection === 'asc' ? '↑' : '↓'}
              </span>
            )}
          </div>
        </th>
      ))}
    </tr>
  ), [columns, sortColumn, sortDirection, onSort]) as React.ReactNode;

  // 同步水平滚动
  useEffect(() => {
    const headerScrollEl = headerRef.current;
    const bodyScrollEl = bodyRef.current;

    if (!headerScrollEl || !bodyScrollEl) return;

    const scrollHandler = handleScroll(headerScrollEl, bodyScrollEl);

    headerScrollEl.addEventListener('scroll', scrollHandler);
    bodyScrollEl.addEventListener('scroll', scrollHandler);

    return () => {
      headerScrollEl.removeEventListener('scroll', scrollHandler);
      bodyScrollEl.removeEventListener('scroll', scrollHandler);
    };
  }, [handleScroll, headerRef.current, bodyRef.current]);

  // 计算并同步列宽
  useEffect(() => {
    // 初始计算一次
    calculateColumnWidths();

    // 监听窗口大小变化
    window.addEventListener('resize', calculateColumnWidths);

    // 使用 ResizeObserver 监听表格列宽变化
    const resizeObserver = new ResizeObserver(calculateColumnWidths);
    
    const cells = bodyRef.current?.querySelectorAll('td');
    if (cells) {
      const firstRowCells = Array.from(cells).slice(0, columns.length);
      firstRowCells.forEach(cell => {
        resizeObserver.observe(cell);
      });
    }

    return () => {
      window.removeEventListener('resize', calculateColumnWidths);
      resizeObserver.disconnect();
    };
  }, [data, calculateColumnWidths]);

  if (isLoading) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-[--muted-foreground]">
        加载中...
      </div>
    );
  }

  if (!data.length) {
    return (
      <div className="w-full h-96 flex items-center justify-center text-[--muted-foreground]">
        {emptyText}
      </div>
    );
  }

  return (
    <div className="w-full relative">
      {/* 表头容器 */}
      <div 
        ref={headerRef}
        className="w-full overflow-x-auto border-b border-[--table-border] bg-[--background]"
        style={{ position: 'sticky', top: '64px', zIndex: 1 }}
      >
        <table className="min-w-full w-max border-collapse">
          <thead>
            {tableHeader}
          </thead>
        </table>
      </div>

      {/* 表体容器 */}
      <div 
        ref={bodyRef}
        className="w-full overflow-x-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden"
      >
        <table className="min-w-full w-max border-collapse">
          <tbody>
            {data.map((row, rowIndex) => (
              <tr
                key={rowIndex}
                className="border-b border-[--table-border] hover:bg-[--table-row-hover]"
              >
                {columns.map((column) => (
                  <td
                    key={String(column.accessorKey)}
                    className="px-4 py-3 text-sm text-[--foreground] whitespace-nowrap"
                  >
                    {column.cell ? column.cell(row[column.accessorKey], row, data, expansion) : String(row[column.accessorKey])}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
} 