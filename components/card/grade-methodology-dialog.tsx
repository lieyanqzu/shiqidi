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
        title="查看评分计算说明"
        className="h-8 w-8 text-[--foreground-muted] hover:text-[--foreground]"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {open && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />
          
          {/* 对话框内容 */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-[--component-background] rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-[--border]">
              <h2 className="text-lg font-semibold text-[--foreground]">
                评分计算说明
              </h2>
              <button
                onClick={() => setOpen(false)}
                className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
              <div className="space-y-3 text-sm leading-relaxed text-[--foreground-muted]">
                <ul className="list-disc list-inside space-y-2">
                  <li>
                    评分视图基于所选胜率指标（在手胜率、起手胜率、抽到胜率或在手胜率提升）计算所有卡牌在该指标上的均值和标准差。
                    每张卡的评分由其相对于均值的标准差位置决定：<span className="font-semibold text-[--foreground]">C</span> 等级对应均值附近（-0.165 到 +0.165 个标准差），相邻半级之间相差 <span className="font-semibold text-[--foreground]">0.33 个标准差</span>。
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
            </div>

            {/* 底部按钮 */}
            <div className="px-4 py-3 border-t border-[--border] flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setOpen(false)}
              >
                我知道了
              </Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}

