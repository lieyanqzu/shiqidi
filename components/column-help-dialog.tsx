'use client';

import { useState } from 'react';
import { X, HelpCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ColumnDescription {
  header: string;
  title: string;
  description?: string;
}

const columnDescriptions: ColumnDescription[] = [
  {
    header: "# Seen",
    title: "轮抽中见过的次数",
    description: "这张卡在轮抽包中被看到的次数。如果一张卡传回来又被看到（\"轮回\"），只计算一次。注意：由于Arena限制，P1P1有时只记录选择的牌，该牌也会被计入\"见过\"的统计。"
  },
  {
    header: "ALSA",
    title: "平均最后见到的抓位",
    description: "Average Last Seen At - 这张卡在轮抽包中最后一次被看到时的平均顺位。如果卡片轮回，只有第二次看到时的顺位才会计入平均值。数值越小说明这张卡越受欢迎，因为它更早被选走而不会轮回。"
  },
  {
    header: "# Picked",
    title: "被选择的次数",
    description: "17Lands用户在轮抽中选择这张卡的总次数。"
  },
  {
    header: "ATA",
    title: "平均选择抓位",
    description: "Average Taken At - 17Lands用户选择这张卡时的平均顺位。数值越小说明这张卡的优先级越高，通常意味着更强力。"
  },
  {
    header: "# GP",
    title: "使用过的对局数量",
    description: "Games Played - 这张卡在主牌中被使用的对局数量，按副数加权。例如：主牌带3张该卡打8局，权重为24（3×8）。"
  },
  {
    header: "% GP",
    title: "主牌使用率",
    description: "Play Rate - 当卡池中有这张卡时，将其放入主牌的比率，按对局数和副数加权。高使用率说明这张卡更可能进入主牌而不是备牌。注意：Bo3赛制中，备牌局数也会影响此数据。"
  },
  {
    header: "GP WR",
    title: "主牌使用时的胜率",
    description: "Games Played Win Rate - 主牌中至少有一张该卡的套牌胜率，按副数加权。主牌带10张该卡的权重是带1张的10倍。"
  },
  {
    header: "# OH",
    title: "在起手的对局数量",
    description: "Opening Hand - 这张卡在起手手牌中出现的次数，每张单独计数。\"起手\"是指调度后决定保留的全部手牌（包括调度时置底的牌，以及如Leyline类在游戏开始时就进战场的牌）。"
  },
  {
    header: "OH WR",
    title: "在起手时的胜率",
    description: "Opening Hand Win Rate - 起手有这张卡时的胜率，按副数加权。注意：昂贵或难施放的牌可能因更容易导致调度而有偏差。"
  },
  {
    header: "# GD",
    title: "抽到的对局数量",
    description: "Game Drawn - 从牌库抽到这张卡的次数（不包括起手）。包括回合抽牌和抽牌效应，但不包括从战场/坟场返回手牌、检索、或从放逐区使用的牌。\"检索\"指任何从牌库中选择牌的效应（包括进化荒野等）。"
  },
  {
    header: "GD WR",
    title: "抽到时的胜率",
    description: "Game Drawn Win Rate - 从牌库抽到这张卡时的胜率（不包括起手），按副数加权。"
  },
  {
    header: "# GIH",
    title: "在手上的对局数量",
    description: "Game In Hand - 这张卡进入手牌的总次数（起手+抽到），每张单独计数。极少数情况下，同一张牌可能被多次抽到（如被洗回牌库）。"
  },
  {
    header: "GIH WR",
    title: "在手上时的胜率",
    description: "Game In Hand Win Rate - 这张卡进入手牌时的胜率（起手+抽到），按副数加权。这是评估卡牌强度最重要的指标之一，因为它反映了实际拿到牌时对胜率的影响。"
  },
  {
    header: "# GNS",
    title: "未见到的数量",
    description: "Game Not Seen - 主牌中的副数减去被抽到或检索到（\"见到\"）的副数。如果见到的副数超过主牌副数，此值为0。按未见到的副数加权。"
  },
  {
    header: "GNS WR",
    title: "未见到时的胜率",
    description: "Game Not Seen Win Rate - 主牌中有这张卡但整局都未见到时的胜率，按未见到的副数加权。"
  },
  {
    header: "IIH",
    title: "在手时的胜率提升",
    description: "Improvement In Hand - GIH WR与GNS WR的差值，表示拿到这张卡相比未拿到时的胜率提升。正值越大说明这张卡对胜利的贡献越大。注意：此指标是简单差值，未按对局数加权，可能高估强力后期牌的价值。"
  }
];

export function ColumnHelpDialog() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* 问号按钮 */}
      <Button
        variant="ghost"
        size="icon"
        onClick={() => setIsOpen(true)}
        title="查看指标说明"
        className="h-8 w-8 text-[--foreground-muted] hover:text-[--foreground]"
      >
        <HelpCircle className="h-4 w-4" />
      </Button>

      {/* 对话框 */}
      {isOpen && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setIsOpen(false)}
          />
          
          {/* 对话框内容 */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-[--component-background] rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-[--border]">
              <h2 className="text-lg font-semibold text-[--foreground]">
                指标说明
              </h2>
              <button
                onClick={() => setIsOpen(false)}
                className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="overflow-y-auto p-4 sm:p-6 flex-1">
              <div className="space-y-6">
                {/* 轮抽数据说明 */}
                <div>
                  <h3 className="text-base font-bold text-[--foreground] mb-3 pb-2 border-b border-[--border]">
                    轮抽数据 (In-Draft Statistics)
                  </h3>
                  <div className="space-y-3">
                    {columnDescriptions.slice(0, 4).map((col, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-md bg-[--background-subtle] hover:bg-[--background-hover] transition-colors"
                      >
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="font-semibold text-[--foreground] text-sm whitespace-nowrap">
                            {col.header}
                          </span>
                          <span className="text-xs text-[--foreground-muted]">
                            {col.title}
                          </span>
                        </div>
                        {col.description && (
                          <p className="text-sm text-[--foreground-muted] leading-relaxed">
                            {col.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                {/* 对局数据说明 */}
                <div>
                  <h3 className="text-base font-bold text-[--foreground] mb-3 pb-2 border-b border-[--border]">
                    对局数据 (In-Game Statistics)
                  </h3>
                  <div className="space-y-3">
                    {columnDescriptions.slice(4).map((col, index) => (
                      <div 
                        key={index}
                        className="p-3 rounded-md bg-[--background-subtle] hover:bg-[--background-hover] transition-colors"
                      >
                        <div className="flex items-baseline gap-2 mb-1.5">
                          <span className="font-semibold text-[--foreground] text-sm whitespace-nowrap">
                            {col.header}
                          </span>
                          <span className="text-xs text-[--foreground-muted]">
                            {col.title}
                          </span>
                        </div>
                        {col.description && (
                          <p className="text-sm text-[--foreground-muted] leading-relaxed">
                            {col.description}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>

            {/* 底部按钮 */}
            <div className="px-4 py-3 border-t border-[--border] flex justify-end">
              <Button
                variant="secondary"
                size="sm"
                onClick={() => setIsOpen(false)}
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

