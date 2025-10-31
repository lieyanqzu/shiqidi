'use client';

import { useState } from 'react';
import { HelpCircle, X } from 'lucide-react';
import { Button } from '@/components/ui/button';

export function GradeMethodologyDialog() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setOpen(true)}
        className="h-6 w-6 text-[--foreground-muted] hover:text-[--foreground]"
        title="评分计算说明"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {open && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="relative z-10 w-full max-w-lg mx-4 rounded-xl bg-[--component-background] border border-[--border] shadow-2xl">
            <div className="flex items-center justify-between px-4 py-3 border-b border-[--border]">
              <h2 className="text-base font-semibold text-[--foreground]">评分计算说明</h2>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="text-[--foreground-muted] hover:text-[--foreground]"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="px-4 py-4 space-y-3 text-sm leading-relaxed text-[--foreground-muted]">
              <ul className="list-disc list-inside space-y-2">
                <li>
                  评分视图基于所选胜率指标（GIH、OH、GD 或 IIH）构建正态分布，并以 <span className="font-semibold text-[--foreground]">C</span> 为中心。
                  每一个字母等级的半级差异（例如 C 与 C+）代表相对于均值 <span className="font-semibold text-[--foreground]">±0.33 个标准差</span> 的区间。
                  根据我们对用户牌表的分析，这与限制赛社区常见的评分方式最为贴近。
                </li>
                <li>
                  应用会影响卡牌具体数据的筛选条件（例如：赛制、用户、套牌、日期范围）时，整体分布会被重新计算，等级也会随之重新分配。
                </li>
                <li>
                  对于不会改变卡牌数据的筛选条件（例如：颜色、稀有度），仅会隐藏不符合条件的卡牌，不会影响已计算的评分。
                </li>
              </ul>
            </div>
            <div className="px-4 py-3 border-t border-[--border] flex justify-end">
              <Button variant="secondary" size="sm" onClick={() => setOpen(false)}>
                我知道了
              </Button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

