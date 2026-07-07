'use client';

import { ManaSymbols } from "@/components/mana/mana-symbols";
import type { ColorGroup } from "@/lib/colors";

interface ColorGroupsProps {
  groups: ColorGroup[];
  isLoading: boolean;
  error: string | null;
  expansion: string;
}

export function ColorGroups({ groups, isLoading, error, expansion }: ColorGroupsProps) {
  if (isLoading) {
    return (
      <div className="rounded-lg border border-[--border] bg-[--component-background] p-8 text-center text-sm text-[--muted-foreground]">
        正在加载 17Lands 色组数据，可能需要数秒...
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-[--border] bg-[--component-background] p-8 text-center text-sm text-[--muted-foreground]">
        {error}
      </div>
    );
  }

  if (!groups.length) {
    return (
      <div className="rounded-lg border border-[--border] bg-[--component-background] p-8 text-center text-sm text-[--muted-foreground]">
        暂无色组数据
      </div>
    );
  }

  return (
    <div className="rounded-lg border border-[--border] bg-[--component-background] overflow-hidden">
      <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
        <h2 className="text-lg font-semibold">色组表现</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-[--accent]/10 text-[--muted-foreground]">
          {expansion}
        </span>
      </div>

      <div className="divide-y divide-[--border]">
        {groups.map((group) => (
          <div key={group.key} className="px-4 py-3">
            {/* 分组标题 */}
            <div className="flex items-baseline justify-between gap-4 mb-2">
              <h3 className="text-base font-bold">{group.title}</h3>
              <span className="text-xs text-[--muted-foreground] font-medium whitespace-nowrap">
                {group.winRateText} · {group.winsText} / {group.gamesText}
              </span>
            </div>

            {/* 色组行列表 */}
            <div className="divide-y divide-[--border]/50">
              {group.rows.map((row) => (
                <div
                  key={row.key}
                  className="flex items-center justify-between gap-4 py-2.5"
                >
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 min-w-0">
                      <ManaSymbols color={row.colorSymbolText} />
                      <span className="font-medium text-[--foreground] truncate">
                        {row.title}
                      </span>
                    </div>
                    <div className="text-xs text-[--muted-foreground] mt-0.5 truncate">
                      {row.colorName}
                    </div>
                  </div>
                  <div className="shrink-0 text-right min-w-[100px]">
                    <div className="text-lg font-bold text-[--primary]">
                      {row.winRateText}
                    </div>
                    <div className="text-xs text-[--muted-foreground]">
                      {row.winsText} / {row.gamesText}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
