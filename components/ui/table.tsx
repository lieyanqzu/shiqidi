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
    <div className="w-full overflow-auto">
      <table className="w-full border-collapse">
        <thead>
          <tr className="border-b border-[--table-border]">
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
        </thead>
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
  );
} 