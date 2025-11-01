'use client';

import { useMemo, useState, useEffect } from 'react';
import type { CardData } from '@/types/card';
import {
  calculateGrades,
  groupCardsByGrade,
  type GradeMetric,
  type CardWithGrade,
  type Grade,
  GRADE_METRICS
} from '@/lib/grades';
import CardTooltip from '@/components/card-tooltip';
import { useCardStore } from '@/lib/store';
import { useMediaQuery } from '@/hooks/use-media-query';
import { getCardArtCropUrl } from '@/lib/card-images';

interface CardGradesProps {
  data: CardData[];
  allCards?: CardData[];
  metric: GradeMetric;
  expansion: string;
  isLoading?: boolean;
}

// 颜色顺序定义
const COLOR_ORDER = ['W', 'U', 'B', 'R', 'G', 'M', 'C'] as const;
type ColorKey = typeof COLOR_ORDER[number];

// 颜色值到图标类名的映射
const COLOR_SYMBOL_CLASS: Record<ColorKey, string> = {
  'W': 'W',
  'U': 'U',
  'B': 'B',
  'R': 'R',
  'G': 'G',
  'M': 'M',  // 多色
  'C': 'C',  // 无色
};

export function CardGrades({ data, allCards, metric, expansion, isLoading }: CardGradesProps) {
  // 计算评分
  const cardsWithGrades = useMemo(() => {
    const source = allCards && allCards.length > 0 ? allCards : data;
    return calculateGrades(source, metric);
  }, [data, allCards, metric]);

  const visibleCardsWithGrades = useMemo(() => {
    const visibleNames = new Set(data.map(card => card.name));
    return cardsWithGrades.filter(card => visibleNames.has(card.name));
  }, [cardsWithGrades, data]);

  // 按评分分组
  const gradeGroups = useMemo(() => {
    return groupCardsByGrade(visibleCardsWithGrades);
  }, [visibleCardsWithGrades]);

  const metricLabel = GRADE_METRICS.find(m => m.value === metric)?.shortLabel || metric;

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="w-[calc(100vw-2rem)] lg:w-[calc(100vw-4rem)] xl:w-[calc(100vw-6rem)] mx-auto">
          <div className="card h-96 flex items-center justify-center text-[--muted-foreground]">
            加载中...
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="w-[calc(100vw-2rem)] lg:w-[calc(100vw-4rem)] xl:w-[calc(100vw-6rem)] mx-auto space-y-4">
        {/* 桌面端：表格视图（按颜色分列） */}
        <div className="hidden md:block overflow-x-auto">
          <div className="min-w-[1200px]">
            <div className="card">
              {/* 表头 */}
              <div className="grid border-b border-[--border]" style={{ gridTemplateColumns: '60px repeat(7, minmax(150px, 1fr))' }}>
                <div className="px-2 py-3 text-sm font-semibold text-[--foreground] text-center">
                  评分
                </div>
                {COLOR_ORDER.map((color) => (
                  <div key={color} className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center">
                      <div 
                        className={`
                          w-8 h-8 rounded-full flex items-center justify-center
                          card-symbol-${COLOR_SYMBOL_CLASS[color]}
                          bg-no-repeat bg-[length:100%_100%]
                          bg-[--component-background]
                        `}
                      />
                    </div>
                  </div>
                ))}
              </div>

              {/* 表格内容 */}
              {gradeGroups.map((gradeGroup) => (
                <GradeRow
                  key={gradeGroup.grade}
                  grade={gradeGroup.grade}
                cards={gradeGroup.cards}
                  metricLabel={metricLabel}
                  expansion={expansion}
                />
              ))}
            </div>
          </div>
        </div>

        {/* 移动端：简化视图（只按梯度） */}
        <div className="md:hidden space-y-2">
          {gradeGroups.map((gradeGroup) => (
            <MobileGradeSection
              key={gradeGroup.grade}
              grade={gradeGroup.grade}
              cards={gradeGroup.cards}
              metricLabel={metricLabel}
              expansion={expansion}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

interface GradeRowProps {
  grade: Grade;
  cards: CardWithGrade[];
  metricLabel: string;
  expansion: string;
}

function GradeRow({ grade, cards, metricLabel, expansion }: GradeRowProps) {
  // 按颜色分组卡牌
  const cardsByColor = useMemo(() => {
    const colorMap: Record<ColorKey, CardWithGrade[]> = {
      'W': [],
      'U': [],
      'B': [],
      'R': [],
      'G': [],
      'M': [],  // 多色
      'C': [],  // 无色
    };

    cards.forEach(card => {
      const color = card.color || '';
      if (color === '') {
        colorMap['C'].push(card);  // 无色
      } else if (color.length === 1) {
        if (colorMap[color as ColorKey]) {
          colorMap[color as ColorKey].push(card);
        }
      } else {
        colorMap['M'].push(card);  // 多色
      }
    });

    // 对每个颜色的卡牌按胜率降序排序
    Object.keys(colorMap).forEach(color => {
      colorMap[color as ColorKey].sort((a, b) => b.metricValue - a.metricValue);
    });

    return colorMap;
  }, [cards]);

  if (cards.length === 0) return null;

  return (
    <div className="grid border-b border-[--border] hover:bg-[--background-hover] transition-colors" style={{ gridTemplateColumns: '60px repeat(7, minmax(150px, 1fr))' }}>
      {/* 评分列 */}
      <div className="px-2 py-3 flex items-start justify-center">
        <div className="text-lg font-bold">
          {grade}
        </div>
      </div>

      {/* 颜色列 */}
      {COLOR_ORDER.map((color) => (
        <div key={color} className="px-2 py-3">
          <div className="space-y-1">
            {cardsByColor[color].map((card, idx) => (
              <CardGradeItem
                key={`${card.name}-${color}-${idx}`}
                card={card}
                grade={grade}
                metricLabel={metricLabel}
                expansion={expansion}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

interface MobileGradeSectionProps {
  grade: Grade;
  cards: CardWithGrade[];
  metricLabel: string;
  expansion: string;
}

function MobileGradeSection({ grade, cards, metricLabel, expansion }: MobileGradeSectionProps) {
  // 按胜率降序排序所有卡牌
  const sortedCards = useMemo(() => {
    return [...cards].sort((a, b) => b.metricValue - a.metricValue);
  }, [cards]);

  if (cards.length === 0) return null;

  return (
    <div className="card">
      <div className="px-4 py-3 border-b border-[--border]">
        <div className="flex items-center justify-between">
          <div className="text-lg font-bold">{grade}</div>
          <div className="text-sm text-[--foreground-muted]">{cards.length} 张卡牌</div>
        </div>
      </div>
      <div className="p-2 space-y-2">
        {sortedCards.map((card, idx) => (
          <CardGradeItem
            key={`${card.name}-mobile-${idx}`}
            card={card}
            grade={grade}
            metricLabel={metricLabel}
            expansion={expansion}
          />
        ))}
      </div>
    </div>
  );
}

interface CardGradeItemProps {
  card: CardWithGrade;
  grade: Grade;
  metricLabel: string;
  expansion: string;
}

function CardGradeItem({ card, metricLabel, expansion }: CardGradeItemProps) {
  const { chineseCards } = useCardStore();
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const isMobile = useMediaQuery("(max-width: 1024px)");
  const winRatePercent = (card.metricValue * 100).toFixed(1);
  const rarityStyles: Record<string, { border: string; gradient: string; glow: string }> = {
    mythic: {
      border: 'rgba(191, 68, 39, 0.9)',
      gradient: 'linear-gradient(180deg, rgba(216, 90, 60, 0.95) 0%, rgba(191, 68, 39, 0.95) 100%)',
      glow: 'rgba(191, 68, 39, 0.45)'
    },
    rare: {
      border: 'rgba(165, 142, 74, 0.95)',
      gradient: 'linear-gradient(180deg, rgba(192, 169, 107, 0.95) 0%, rgba(165, 142, 74, 0.95) 100%)',
      glow: 'rgba(165, 142, 74, 0.4)'
    },
    uncommon: {
      border: 'rgba(112, 120, 131, 0.9)',
      gradient: 'linear-gradient(180deg, rgba(142, 149, 158, 0.95) 0%, rgba(112, 120, 131, 0.95) 100%)',
      glow: 'rgba(112, 120, 131, 0.45)'
    },
    common: {
      border: 'rgba(25, 23, 27, 0.95)',
      gradient: 'linear-gradient(180deg, rgba(40, 36, 38, 0.95) 0%, rgba(19, 17, 18, 0.95) 100%)',
      glow: 'rgba(25, 23, 27, 0.5)'
    }
  };
  const rarityStyle = rarityStyles[card.rarity?.toLowerCase() || ''] || {
    border: 'rgba(107,114,128,0.9)',
    gradient: 'linear-gradient(180deg, rgba(156,163,175,0.95) 0%, rgba(107,114,128,0.95) 100%)',
    glow: 'rgba(107,114,128,0.45)'
  };
  
  const chineseCard = chineseCards[card.name];
  const chineseName = chineseCard?.atomic_official_name || chineseCard?.atomic_translated_name || chineseCard?.zhs_name;
  
  const cardImageUrl = getCardArtCropUrl(card.url, chineseCard?.id);
  
  // 在移动端，锁定 body 滚动
  useEffect(() => {
    if (isMobile && tooltipVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobile, tooltipVisible]);

  const handleMouseEnter = () => !isMobile && setTooltipVisible(true);
  const handleMouseLeave = () => !isMobile && setTooltipVisible(false);
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleClick = (e: React.MouseEvent) => {
    if (isMobile) {
      e.preventDefault();
      e.stopPropagation();
      const rect = (e.currentTarget as HTMLElement).getBoundingClientRect();
      setMousePos({ 
        x: rect.left, 
        y: rect.top + window.scrollY 
      });
      setTooltipVisible(!tooltipVisible);
    } else if (chineseCard?.set && chineseCard?.collector_number) {
      window.open(`https://mtgch.com/card/${chineseCard.set.toUpperCase()}/${chineseCard.collector_number}?utm_source=shiqidi`, '_blank');
    }
  };
  
  return (
    <>
      <div
        className="relative rounded border border-[--border] hover:brightness-110 transition-all cursor-pointer overflow-hidden"
        style={{
          backgroundImage: cardImageUrl ? `url(${cardImageUrl})` : 'none',
          backgroundSize: 'cover',
          backgroundPosition: '50% 20%',
          borderLeftColor: rarityStyle.border,
          borderLeftWidth: '4px',
          borderLeftStyle: 'solid'
        }}
        title={card.hasData ? `${metricLabel}: ${winRatePercent}% | Z-Score: ${card.stdDevFromMean.toFixed(2)}` : '无数据'}
        onMouseEnter={handleMouseEnter}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        <div className="relative z-1">
          <div className="bg-black/50 pl-2 pr-1.5 py-1.5 hover:bg-black/60 transition-colors" style={{
            boxShadow: `inset 5px 0 8px -4px ${rarityStyle.glow}`
          }}>
            <div className="flex items-start justify-between gap-1">
              <div className="flex-1 min-w-0">
                <div className="text-xs font-medium text-white truncate leading-tight">
                  {chineseName || card.name}
                </div>
                <div className="text-[10px] text-gray-300 truncate leading-tight">
                  {card.name}
                </div>
              </div>
              {card.hasData && (
                <div className="flex-shrink-0 flex items-center text-xs font-bold text-white" style={{ height: 'calc(1em * 1.2 + 0.625rem)' }}>
                  {winRatePercent}%
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <CardTooltip
        card={card}
        visible={tooltipVisible}
        x={mousePos.x}
        y={mousePos.y}
        expansion={expansion}
        isMobile={isMobile}
        onClose={() => setTooltipVisible(false)}
      />
    </>
  );
}
