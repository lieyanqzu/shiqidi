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
  const [renderedRelatedCardIndices, setRenderedRelatedCardIndices] = useState<Set<number>>(new Set());
  const [showBackface, setShowBackface] = useState(false);

  // 获取卡牌中文名的通用函数
  const fetchCardNames = async (cardRefs: string[]) => {
    if (!cardRefs.length) return [];

    try {
      // 构建搜索条件
      const query = cardRefs.map(ref => {
        const [setCode, number] = ref.split(':');
        return `(s=${setCode} number=${number})`;
      }).join(' or ');

      const response = await fetch(
        `https://www.sbwsz.com/api/v1/result?q=${encodeURIComponent(query)}&page=1&page_size=100&unique=oracle_id&priority_chinese=true`
      );

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      return data.items.map((result: {
        set: string;
        collector_number: string;
        name: string;
        zhs_name?: string;
        atomic_official_name?: string;
        atomic_translated_name?: string;
      }) => ({
        setCode: result.set,
        number: result.collector_number,
        zhs_name: result.atomic_official_name || result.atomic_translated_name || result.zhs_name || result.name
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

  // 使用useEffect来处理相关卡牌引用的检测
  useEffect(() => {
    if (card.related && card.related.length > 0 && relatedCards.length > 0) {
      const newRenderedIndices = new Set<number>();
      const text = isEnglish ? card.text : card.zhs_text;
      
      // 检查文本中的所有行
      text.split('\n').forEach(line => {
        // 使用正则表达式匹配反引号中的卡牌引用
        const regex = /`([^`]+)`/g;
        let match;
        
        while ((match = regex.exec(line)) !== null) {
          const cardRefText = match[1];
          const cardRefMatch = cardRefText.match(/([^:]+):(\d+)/);
          
          if (cardRefMatch) {
            const cardIdx = parseInt(cardRefMatch[2], 10);
            if (relatedCards[cardIdx]) {
              newRenderedIndices.add(cardIdx);
            }
          }
        }
      });
      
      setRenderedRelatedCardIndices(newRenderedIndices);
    }
  }, [card.related, card.text, card.zhs_text, relatedCards, isEnglish]);

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
        <ManaText 
          text={line} 
          renderCardRef={(text, index) => {
            // 检查是否是卡牌引用格式 卡名:索引
            const match = text.match(/([^:]+):(\d+)/);
            if (match) {
              const [, cardName, cardIndex] = match;
              const cardIdx = parseInt(cardIndex, 10);
              const refCard = relatedCards[cardIdx];
              
              if (refCard) {
                return (
                  <a
                    key={index}
                    href={getCardDetailUrl(refCard.setCode, refCard.number)}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-[--primary] hover:opacity-80 transition-opacity"
                    onMouseEnter={() => handleMouseEnter(refCard)}
                    onMouseLeave={handleMouseLeave}
                    onMouseMove={handleMouseMove}
                  >
                    {cardName}
                  </a>
                );
              }
            }
            return null;
          }}
        />
        {index < array.length - 1 && <br />}
      </div>
    ));
  };

  // 获取卡牌详情页面URL
  const getCardDetailUrl = (setCode: string, number: string): string => {
    // 如果卡牌号带有 a 或 b 后缀，使用基础卡牌号
    const baseNumber = /^(\d+)[ab]$/.test(number) ? number.slice(0, -1) : number;
    return `https://www.sbwsz.com/card/${setCode.toUpperCase()}/${baseNumber}?utm_source=shiqidi`;
  };

  // 获取卡图URL
  const getCardImageUrl = (setCode: string, number: string): string => {
    return `https://www.sbwsz.com/image/large/${setCode.toUpperCase()}/${setCode.toUpperCase()}_${number}.jpg`;
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
    const margin = 20;
    
    let x = e.clientX + margin;
    let y = e.clientY - tooltipHeight / 2;
    
    // 如果右侧空间不足
    if (x + tooltipWidth > viewportWidth - margin) {
      // 尝试显示在左侧
      x = e.clientX - tooltipWidth - margin;
    }
    
    // 如果左侧空间不足
    if (x < margin) {
      // 贴靠在左侧边界
      x = margin;
    }
    
    // 处理垂直方向
    // 确保不超出顶部
    if (y < margin) {
      y = margin;
    }
    
    // 确保不超出底部
    if (y + tooltipHeight > viewportHeight - margin) {
      y = viewportHeight - tooltipHeight - margin;
    }

    setMousePos({ x, y });
  };

  // 渲染卡牌引用列表，只显示未在文本中渲染的卡牌
  const renderCardRefs = (cards: CardRef[], title: string) => {
    // 过滤出未在文本中渲染的卡牌
    const unreferencedCards = cards.filter((_, index) => !renderedRelatedCardIndices.has(index));
    
    // 如果没有未渲染的卡牌，不显示区域
    if (unreferencedCards.length === 0) {
      return null;
    }
    
    return (
      <div className="mt-4 pt-2 border-t border-[--border]">
        <div className="text-sm font-medium mb-2">{title}</div>
        <div className="flex flex-wrap gap-2">
          {unreferencedCards.map((card, index) => (
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
              {card.zhs_name || `${card.setCode}:${card.number}`}
            </a>
          ))}
        </div>
      </div>
    );
  };

  // 获取当前显示的卡牌数据
  const currentCard = showBackface && card.backface ? card.backface : card;

  return (
    <>
      <div className="bg-[--card] rounded-lg overflow-hidden border border-[--border] flex flex-col md:flex-row">
        <div className="px-4 md:p-0 pt-4 md:pt-0">
          <div 
            className="relative w-full md:w-[300px] aspect-[488/680] md:h-[420px] bg-black mx-auto max-w-[300px] cursor-pointer"
            onClick={() => setIsImageExpanded(true)}
          >
            <Image
              src={isEnglish ? currentCard.image_url_en : currentCard.image_url_zh}
              alt={isEnglish ? currentCard.name : currentCard.zhs_name}
              fill
              className="object-cover"
              unoptimized
            />
            {card.backface && (
              <button
                className="absolute bottom-2 left-1/2 -translate-x-1/2 w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                onClick={(e) => {
                  e.stopPropagation();
                  setShowBackface(!showBackface);
                }}
              >
                <svg className="w-6 h-6" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                  <path fill="currentColor" d="M884.3,357.6c116.8,117.7,151.7,277-362.2,320V496.4L243.2,763.8L522,1031.3V860.8C828.8,839.4,1244.9,604.5,884.3,357.6z" />
                  <path fill="currentColor" d="M557.8,288.2v138.4l230.8-213.4L557.8,0v142.8c-309.2,15.6-792.1,253.6-426.5,503.8C13.6,527.9,30,330.1,557.8,288.2z" />
                </svg>
              </button>
            )}
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
                  src={isEnglish ? currentCard.image_url_en : currentCard.image_url_zh}
                  alt={isEnglish ? currentCard.name : currentCard.zhs_name}
                  fill
                  className="object-contain"
                  unoptimized
                  sizes="85vw"
                />
              </div>
              <div className="absolute top-2 right-2 flex gap-2">
                {card.backface && (
                  <button
                    className="w-10 h-10 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80 transition-colors"
                    onClick={() => setShowBackface(!showBackface)}
                  >
                    <svg className="w-6 h-6" focusable="false" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024">
                      <path fill="currentColor" d="M884.3,357.6c116.8,117.7,151.7,277-362.2,320V496.4L243.2,763.8L522,1031.3V860.8C828.8,839.4,1244.9,604.5,884.3,357.6z" />
                      <path fill="currentColor" d="M557.8,288.2v138.4l230.8-213.4L557.8,0v142.8c-309.2,15.6-792.1,253.6-426.5,503.8C13.6,527.9,30,330.1,557.8,288.2z" />
                    </svg>
                  </button>
                )}
                <button
                  className="w-8 h-8 bg-black/60 text-white rounded-full flex items-center justify-center hover:bg-black/80"
                  onClick={() => setIsImageExpanded(false)}
                >
                  ✕
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="p-4 flex-1 flex flex-col min-w-0">
          {/* 卡牌内容 */}
          <div>
            <div className="flex items-start gap-4">
              <div className="flex items-center gap-1.5 min-w-0 flex-1">
                <div className="font-medium break-words leading-none pt-0.5">
                  {currentCard.zhs_name === currentCard.name ? (
                    <h3>{currentCard.name}</h3>
                  ) : isEnglish ? (
                    <>
                      <h3>{currentCard.name}</h3>
                      <div className="text-xs font-light text-[--muted-foreground] mt-1">{currentCard.zhs_name}</div>
                    </>
                  ) : (
                    <>
                      <h3>{currentCard.zhs_name}</h3>
                      <div className="text-xs font-light text-[--muted-foreground] mt-1">{currentCard.name}</div>
                    </>
                  )}
                </div>
              </div>
              <div className="flex-shrink-0">
                <ManaText text={currentCard.mana_cost} />
              </div>
            </div>

            <div className="mt-1 divide-y divide-[--border]">
              <div className="text-sm flex items-center justify-between">
                <ManaText text={isEnglish ? currentCard.type : currentCard.zhs_type} />
                <i className={`ss ${getRarityIcon(currentCard.rarity)} ss-fw ss-3x ss-${logoCode}`} />
              </div>
              <div className="text-sm whitespace-pre-wrap pt-1 leading-normal">
                {renderText(isEnglish ? currentCard.text : currentCard.zhs_text)}
              </div>
            </div>
          </div>

          {/* 卡牌第二部分 */}
          {currentCard.name2 && (
            <div className="mt-2 pt-2 border-t-2 border-[--border]">
              <div className="flex items-start gap-4">
                <div className="flex items-center gap-1.5 min-w-0 flex-1">
                  <div className="font-medium break-words leading-none pt-0.5">
                    {currentCard.zhs_name2 === currentCard.name2 ? (
                      <h3>{currentCard.name2}</h3>
                    ) : isEnglish ? (
                      <>
                        <h3>{currentCard.name2}</h3>
                        <div className="text-xs font-light text-[--muted-foreground] mt-1">{currentCard.zhs_name2}</div>
                      </>
                    ) : (
                      <>
                        <h3>{currentCard.zhs_name2}</h3>
                        <div className="text-xs font-light text-[--muted-foreground] mt-1">{currentCard.name2}</div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex-shrink-0">
                  <ManaText text={currentCard.mana_cost2 || ''} />
                </div>
              </div>

              <div className="mt-1 divide-y divide-[--border]">
                <div className="text-sm flex items-center justify-between">
                  <ManaText text={isEnglish ? (currentCard.type2 || '') : (currentCard.zhs_type2 || '')} />
                  <i className={`ss ss-fw ss-3x ss-${logoCode} invisible`} />
                </div>
                <div className="text-sm whitespace-pre-wrap pt-1 leading-normal">
                  {renderText(isEnglish ? (currentCard.text2 || '') : (currentCard.zhs_text2 || ''))}
                </div>
              </div>
            </div>
          )}

          <div className="mt-auto">
            {currentCard.spellbook && currentCard.spellbook.length > 0 && renderCardRefs(spellbookCards, '法术书')}
            {currentCard.spellbook && currentCard.spellbook.length === 0 && (
              <div className="mt-4 pt-2 border-t border-[--border]">
                <div className="text-sm font-medium mb-2">法术书</div>
                <div className="text-sm text-[--muted-foreground]">暂未公布</div>
              </div>
            )}
            {currentCard.related && currentCard.related.length > 0 && renderCardRefs(relatedCards, '相关卡牌')}

            <div className="flex items-center justify-between gap-1 mt-4 pt-2 border-t border-[--border]">
              <div className="text-xs text-[--muted-foreground] flex items-center gap-1">
                <i className="ms ms-artist-nib ms-fw" />
                <span>{currentCard.artist}</span>
              </div>
              {currentCard.pow_tough && (
                <div className="text-sm font-medium">
                  {currentCard.pow_tough}
                </div>
              )}
            </div>
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
                    fetch(`https://www.sbwsz.com/api/v1/card/${hoveredCard.setCode.toUpperCase()}/${hoveredCard.number}`)
                      .then(res => res.json())
                      .then(data => {
                        if (data?.id) {
                          const scryfallId = data.id;
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