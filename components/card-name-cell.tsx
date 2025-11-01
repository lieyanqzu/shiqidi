'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useCardStore } from "@/lib/store";
import type { CardData } from "@/types/card";
import CardTooltip from '@/components/card-tooltip';
import { useMediaQuery } from "@/hooks/use-media-query";
import { getCardArtCropUrl } from '@/lib/card-images';
import { extractScryfallIdFromUrl } from '@/lib/api';

interface CardNameCellProps {
  card: CardData;
  expansion: string;
}

export function CardNameCell({ card, expansion }: CardNameCellProps) {
  const { chineseCards } = useCardStore();
  const chineseCard = chineseCards[card.name];
  const chineseName = chineseCard?.atomic_official_name || chineseCard?.atomic_translated_name || chineseCard?.zhs_name;
  const isMobile = useMediaQuery("(max-width: 1024px)");
  
  const [tooltipVisible, setTooltipVisible] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const showTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const cardImageUrl = getCardArtCropUrl(card.url, chineseCard?.id);

  // 在移动端，点击时阻止事件冒泡
  useEffect(() => {
    if (isMobile && tooltipVisible) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
      }
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
      }
    };
  }, [isMobile, tooltipVisible]);

  const handleMouseEnter = () => {
    if (!isMobile) {
      // 清除可能存在的隐藏计时器
      if (hideTimeoutRef.current) {
        clearTimeout(hideTimeoutRef.current);
        hideTimeoutRef.current = null;
      }
      
      // 如果tooltip已经显示，不需要延迟
      if (tooltipVisible) {
        return;
      }
      
      // 延迟300ms显示，避免快速扫过时弹出
      showTimeoutRef.current = setTimeout(() => {
        setTooltipVisible(true);
        showTimeoutRef.current = null;
      }, 300);
    }
  };

  const handleMouseLeave = () => {
    if (!isMobile) {
      // 清除显示计时器
      if (showTimeoutRef.current) {
        clearTimeout(showTimeoutRef.current);
        showTimeoutRef.current = null;
      }
      
      // 如果tooltip没有显示，不需要隐藏
      if (!tooltipVisible) {
        return;
      }
      
      // 延迟200ms隐藏，给鼠标时间移动到tooltip上
      hideTimeoutRef.current = setTimeout(() => {
        setTooltipVisible(false);
      }, 200);
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isMobile) {
      setMousePos({ x: e.clientX, y: e.clientY });
    }
  };

  const handleTooltipMouseEnter = () => {
    if (!isMobile && hideTimeoutRef.current) {
      clearTimeout(hideTimeoutRef.current);
      hideTimeoutRef.current = null;
    }
  };

  const handleTooltipMouseLeave = () => {
    if (!isMobile) {
      setTooltipVisible(false);
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
    } else {
      const scryfallId = chineseCard?.id || (card.url ? extractScryfallIdFromUrl(card.url) : null);
      if (scryfallId) {
        window.open(`https://mtgch.com/result?q=id=${scryfallId}&utm_source=shiqidi`, '_blank');
      }
    }
  };

  return (
    <div 
      className="relative max-w-[300px] cursor-pointer"
      style={{
        backgroundImage: cardImageUrl ? `url(${cardImageUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: '50% 20%',
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
      onClick={handleClick}
    >
      <div className="relative z-1 bg-black/50 p-1 rounded hover:bg-black/60 transition-colors">
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
        onClose={() => setTooltipVisible(false)}
        onMouseEnter={handleTooltipMouseEnter}
        onMouseLeave={handleTooltipMouseLeave}
      />
    </div>
  );
} 