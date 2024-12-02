'use client';

import React, { useState, useEffect } from 'react';
import { useCardStore } from "@/lib/store";
import type { CardData } from "@/types/card";
import CardTooltip from '@/components/card-tooltip';
import { useMediaQuery } from "@/hooks/use-media-query";

interface CardNameCellProps {
  card: CardData;
  expansion?: string;
}

export function CardNameCell({ card, expansion = '' }: CardNameCellProps) {
  const { chineseCards } = useCardStore();
  const chineseCard = chineseCards[card.name];
  const chineseName = chineseCard?.zhs_name || chineseCard?.officialName || chineseCard?.translatedName;
  const isMobile = useMediaQuery("(max-width: 768px)");
  
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });

  const cardImageUrl = chineseCard?.scryfallId 
    ? `https://cards.scryfall.io/large/front/${chineseCard.scryfallId.slice(0, 1)}/${chineseCard.scryfallId.slice(1, 2)}/${chineseCard.scryfallId}.jpg`
    : null;

  // 在移动端，点击时阻止事件冒泡
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
    } else if (chineseCard?.setCode && chineseCard?.number) {
      window.open(`https://sbwsz.com/card/${chineseCard.setCode}/${chineseCard.number}`, '_blank');
    }
  };

  return (
    <div 
      className="relative max-w-[300px] cursor-pointer"
      style={{
        backgroundImage: cardImageUrl ? `url(${cardImageUrl})` : 'none',
        backgroundSize: '150%',
        backgroundPosition: '-50px -100px',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className="relative z-10 bg-black/50 p-1 rounded hover:bg-black/60 transition-colors">
        <div className="font-medium text-white truncate">
          {chineseName || card.name}
        </div>
        <div className="text-sm text-gray-300 truncate">
          {card.name}
        </div>
      </div>

      <CardTooltip
        card={card}
        visible={tooltipVisible}
        x={mousePos.x}
        y={mousePos.y}
        expansion={expansion}
        isMobile={isMobile}
      />
    </div>
  );
} 