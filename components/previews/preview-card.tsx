'use client';

import Image from 'next/image';
import { useState, useEffect } from 'react';
import type { PreviewCard } from '@/types/previews';
import { ManaText } from '@/components/mana-text';

interface PreviewCardProps {
  card: PreviewCard;
  isEnglish: boolean;
  logoCode: string;
}

interface CardRef {
  setCode: string;
  number: string;
  zhs_name?: string;
  officialName?: string;
  translatedName?: string;
}

export function PreviewCard({ card, isEnglish, logoCode }: PreviewCardProps) {
  const [spellbookCards, setSpellbookCards] = useState<CardRef[]>([]);
  const [relatedCards, setRelatedCards] = useState<CardRef[]>([]);
  const [isImageExpanded, setIsImageExpanded] = useState(false);
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const [hoveredCard, setHoveredCard] = useState<CardRef | null>(null);

  // 获取卡牌中文名的通用函数
  const fetchCardNames = async (cardRefs: string[]) => {
    if (!cardRefs.length) return [];

    try {
      // 构建搜索条件
      const elements = cardRefs.map(ref => {
        const [setCode, number] = ref.split(':');
        return {
          type: "and" as const,
          elements: [
            {
              type: "basic" as const,
              key: "setCode",
              operator: "=",
              value: setCode,
            },
            {
              type: "basic" as const,
              key: "number",
              operator: "=",
              value: number,
            },
          ],
        };
      });

      const response = await fetch(
        `https://api.sbwsz.com/search?page=1&page_size=100&get_total=1&q=${encodeURIComponent(
          JSON.stringify({ type: "or", elements })
        )}`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.results.map((result: any) => ({
        setCode: result.setCode,
        number: result.number,
        zhs_name: result.zhs_name,
        officialName: result.officialName,
        translatedName: result.translatedName
      }));
    } catch (error) {
      console.error('Failed to fetch card names:', error);
      return cardRefs.map(ref => {
        const [setCode, number] = ref.split(':');
        return { setCode, number };
      });
    }
  };

  useEffect(() => {
    if (card.spellbook && card.spellbook.length > 0) {
      fetchCardNames(card.spellbook).then(setSpellbookCards);
    }
  }, [card.spellbook]);

  useEffect(() => {
    if (card.related && card.related.length > 0) {
      fetchCardNames(card.related).then(setRelatedCards);
    }
  }, [card.related]);

  const getRarityIcon = (rarity: string): string => {
    switch (rarity) {
      case 'mythic':
        return 'ss-mythic';
      case 'rare':
        return 'ss-rare';
      case 'uncommon':
        return 'ss-uncommon';
      default:
        return 'ss-common';
    }
  };

  // 处理文本，保持换行的同时渲染法术力符号
  const renderText = (text: string) => {
    return text.split('\n').map((line, index, array) => (
      <div key={index} className="inline-block w-full">
        <ManaText text={line} />
        {index < array.length - 1 && <br />}
      </div>
    ));
  };

  // 获取卡牌详情页面URL
  const getCardDetailUrl = (setCode: string, number: string): string => {
    // 如果卡牌号带有 a 或 b 后缀，使用基础卡牌号
    const baseNumber = /^(\d+)[ab]$/.test(number) ? number.slice(0, -1) : number;
    return `https://sbwsz.com/card/${setCode}/${baseNumber}`;
  };

  // 获取卡图URL
  const getCardImageUrl = (setCode: string, number: string, scryfallId?: string): string => {
    return `https://sbwsz.com/image/large/${setCode.toUpperCase()}/${setCode.toUpperCase()}_${number}.jpg`;
  };

  // 处理鼠标事件
  const handleMouseEnter = (card: CardRef) => {
    setHoveredCard(card);
    setTooltipVisible(true);
  };

  const handleMouseLeave = () => {
    setTooltipVisible(false);
    setHoveredCard(null);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    // 获取视口尺寸
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    
    // 卡片预览的尺寸
    const tooltipWidth = 300;
    const tooltipHeight = 420;
    
    // 默认显示在鼠标右侧
    let x = e.clientX + 20;
    
    // 如果右侧空间不足，尝试显示在左侧
    if (x + tooltipWidth > viewportWidth - 20) {
      x = e.clientX - tooltipWidth - 20;
      
      // 如果左侧空间也不足，则贴靠左侧边界
      if (x < 20) {
        x = 20;
      }
    }
    
    // 计算 y 坐标
    let y = e.clientY - 100;
    
    // 处理下边界
    if (y + tooltipHeight > viewportHeight - 20) {
      y = viewportHeight - tooltipHeight - 20;
    }
    
    // 处理上边界
    if (y < 20) {
      y = 20;
    }

    setMousePos({ x, y });
  };

  // 渲染卡牌引用列表
  const renderCardRefs = (cards: CardRef[], title: string) => (
    <div className="mt-4 pt-2 border-t border-[--border]">
      <div className="text-sm font-medium mb-2">{title}</div>
      <div className="flex flex-wrap gap-2">
        {cards.map((card, index) => (
          <a
            key={index}
            href={getCardDetailUrl(card.setCode, card.number)}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-[--primary] hover:opacity-80 transition-opacity"
            onMouseEnter={() => handleMouseEnter(card)}
            onMouseLeave={handleMouseLeave}
            onMouseMove={handleMouseMove}
          >
            {card.zhs_name || card.officialName || card.translatedName || `${card.setCode}:${card.number}`}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <>
      <div className="bg-[--card] rounded-lg overflow-hidden border border-[--border] flex flex-col md:flex-row">
        <div className="px-4 md:p-0 pt-4 md:pt-0">
          <div 
            className="relative w-full md:w-[300px] aspect-[488/680] md:h-[420px] bg-black mx-auto max-w-[300px] cursor-pointer"
            onClick={() => setIsImageExpanded(true)}
          >
            <Image
              src={isEnglish ? card.image_url_en : card.image_url_zh}
              alt={isEnglish ? card.name : card.zhs_name}
              fill
              className="object-cover"
              unoptimized
            />
          </div>
        </div>
        
        {/* 卡牌大图模态框 */}
        {isImageExpanded && (
          <div 
            className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4"
            onClick={() => setIsImageExpanded(false)}
          >
            <div 
              className="relative bg-black rounded-lg overflow-hidden" 
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative" style={{ width: 'min(85vw, 85vh * 488/680)', height: 'min(85vh, 85vw * 680/488)' }}>
                <Image
                  src={isEnglish ? card.image_url_en : card.image_url_zh}
                  alt={isEnglish ? card.name : card.zhs_name}
                  fill
                  className="object-contain"
                  unoptimized
                  sizes="85vw"
                />
              </div>
              <button
                className="absolute top-2 right-2 w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                onClick={() => setIsImageExpanded(false)}
              >
                ✕
              </button>
            </div>
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col min-w-0">
          <div className="flex items-start gap-4">
            <div className="flex items-center gap-1.5 min-w-0 flex-1">
              <div className="font-medium break-words leading-none pt-0.5">
                {card.zhs_name === card.name ? (
                  <h3>{card.name}</h3>
                ) : isEnglish ? (
                  <>
                    <h3>{card.name}</h3>
                    <div className="text-xs font-light text-[--muted-foreground] mt-1">{card.zhs_name}</div>
                  </>
                ) : (
                  <>
                    <h3>{card.zhs_name}</h3>
                    <div className="text-xs font-light text-[--muted-foreground] mt-1">{card.name}</div>
                  </>
                )}
              </div>
            </div>
            <div className="flex-shrink-0">
              <ManaText text={card.mana_cost} />
            </div>
          </div>

          <div className="mt-1 flex-1 divide-y divide-[--border]">
            <div className="text-sm flex items-center justify-between">
              <ManaText text={isEnglish ? card.type : card.zhs_type} />
              <i className={`ss ${getRarityIcon(card.rarity)} ss-fw ss-3x ss-${logoCode}`} />
            </div>
            <div className="text-sm whitespace-pre-wrap pt-1 leading-normal">
              {renderText(isEnglish ? card.text : card.zhs_text)}
            </div>
          </div>

          {card.spellbook && card.spellbook.length > 0 && renderCardRefs(spellbookCards, '法术书')}
          {card.spellbook && card.spellbook.length === 0 && (
            <div className="mt-4 pt-2 border-t border-[--border]">
              <div className="text-sm font-medium mb-2">法术书</div>
              <div className="text-sm text-[--muted-foreground]">暂未公布</div>
            </div>
          )}
          {card.related && card.related.length > 0 && renderCardRefs(relatedCards, '相关卡牌')}

          <div className="flex items-center justify-between gap-1 mt-4 pt-2 border-t border-[--border]">
            <div className="text-xs text-[--muted-foreground] flex items-center gap-1">
              <i className="ms ms-artist-nib ms-fw" />
              <span>{card.artist}</span>
            </div>
            {card.pow_tough && (
              <div className="text-sm font-medium">
                {card.pow_tough}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* 卡牌悬浮提示 */}
      {tooltipVisible && hoveredCard && (
        <div 
          className="fixed z-50 pointer-events-none"
          style={{
            left: mousePos.x,
            top: mousePos.y,
          }}
        >
          <div className="relative bg-[--card] rounded-lg overflow-hidden shadow-xl border border-[--border]">
            <div className="w-[300px] aspect-[488/680]">
              <Image
                src={getCardImageUrl(hoveredCard.setCode, hoveredCard.number)}
                alt={hoveredCard.zhs_name || hoveredCard.officialName || hoveredCard.translatedName || `${hoveredCard.setCode}:${hoveredCard.number}`}
                fill
                className="object-contain"
                unoptimized
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('scryfall.io')) {
                    // 尝试从API获取scryfallId
                    fetch(`https://api.sbwsz.com/card/${hoveredCard.setCode}/${hoveredCard.number}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data.type === 'normal' && data.data?.[0]?.scryfallId) {
                          const scryfallId = data.data[0].scryfallId;
                          img.src = `https://cards.scryfall.io/large/front/${scryfallId.slice(0, 1)}/${scryfallId.slice(1, 2)}/${scryfallId}.jpg`;
                        } else {
                          img.src = '/image/back.png';
                        }
                      })
                      .catch(() => {
                        img.src = '/image/back.png';
                      });
                  }
                }}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
} 