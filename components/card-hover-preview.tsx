'use client';

import { useState, useEffect } from 'react';
import { useCardStore } from '@/lib/store';

interface CardHoverPreviewProps {
  cardName: string;
  visible: boolean;
  x: number;
  y: number;
  children: React.ReactNode;
}

export function CardHoverPreview({
  cardName,
  visible,
  x,
  y,
  children
}: CardHoverPreviewProps) {
  const { chineseCards } = useCardStore();
  const [imageUrl, setImageUrl] = useState<string>('');
  const [imageError, setImageError] = useState(false);

  const chineseCard = chineseCards[cardName];

  useEffect(() => {
    setImageError(false);
    
    if (chineseCard?.id) {
      // 使用 Scryfall 图片
      const url = `https://cards.scryfall.io/normal/front/${chineseCard.id.slice(0, 1)}/${chineseCard.id.slice(1, 2)}/${chineseCard.id}.jpg`;
      setImageUrl(url);
    } else {
      setImageUrl('');
    }
  }, [cardName, chineseCard]);

  if (!visible || !imageUrl) {
    return <>{children}</>;
  }

  // 调整位置以防止溢出
  const tooltipWidth = 250;
  const tooltipHeight = 350;
  const margin = 10;

  let adjustedX = x;
  let adjustedY = y;

  // 防止右侧溢出
  if (typeof window !== 'undefined') {
    if (adjustedX + tooltipWidth > window.innerWidth - margin) {
      adjustedX = window.innerWidth - tooltipWidth - margin;
    }
    // 防止左侧溢出
    if (adjustedX < margin) {
      adjustedX = margin;
    }
    // 防止底部溢出
    if (adjustedY + tooltipHeight > window.innerHeight - margin) {
      adjustedY = window.innerHeight - tooltipHeight - margin;
    }
    // 防止顶部溢出
    if (adjustedY < margin) {
      adjustedY = margin;
    }
  }

  return (
    <>
      {children}
      {!imageError && (
        <div
          className="fixed z-[9999] pointer-events-none"
          style={{
            left: `${adjustedX}px`,
            top: `${adjustedY}px`,
          }}
        >
          <div className="bg-[--component-background] border-2 border-[--border] rounded-lg shadow-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={imageUrl}
              alt={cardName}
              className="w-[250px] h-auto"
              onError={() => setImageError(true)}
              loading="lazy"
            />
          </div>
        </div>
      )}
    </>
  );
}

