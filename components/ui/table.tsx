import { useEffect, useRef, useState } from 'react';

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
  const [columnWidths, setColumnWidths] = useState<number[]>([]);

  // 同步水平滚动
  useEffect(() => {
    const headerEl = headerRef.current;
    const bodyEl = bodyRef.current;

    if (!headerEl || !bodyEl) return;

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLDivElement;
      if (target === headerEl) {
        bodyEl.scrollLeft = target.scrollLeft;
      } else {
        headerEl.scrollLeft = target.scrollLeft;
      }
    };

    headerEl.addEventListener('scroll', handleScroll);
    bodyEl.addEventListener('scroll', handleScroll);

    return () => {
      headerEl.removeEventListener('scroll', handleScroll);
      bodyEl.removeEventListener('scroll', handleScroll);
    };
  }, []);

  // 计算并同步列宽
  useEffect(() => {
    if (!bodyRef.current) return;
    
    const bodyCells = bodyRef.current.querySelectorAll('td');
    if (!bodyCells.length) return;
    
    const firstRowCells = Array.from(bodyCells).slice(0, columns.length);
    const widths = firstRowCells.map(cell => cell.getBoundingClientRect().width);
    setColumnWidths(widths);
  }, [data, columns]);

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
        className="w-full overflow-hidden border-b border-[--table-border] bg-[--background]"
        style={{ position: 'sticky', top: '64px', zIndex: 10 }}
      >
        <table className="w-full border-collapse">
          <thead>
            <tr>
              {columns.map((column, index) => (
                <th
                  key={String(column.accessorKey)}
                  className={`
                    px-4 py-3 text-left text-sm font-medium text-[--table-header-foreground] whitespace-nowrap
                    ${column.sortable ? 'cursor-pointer hover:text-[--primary]' : ''}
                  `}
                  style={{ width: columnWidths[index] }}
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
          </thead>
        </table>
      </div>

      {/* 表体容器 */}
      <div 
        ref={bodyRef}
        className="w-full overflow-auto"
      >
        <table className="w-full border-collapse">
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