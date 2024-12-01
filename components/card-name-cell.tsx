'use client';

import React from 'react';
import { useCardStore } from "@/lib/store";
import type { CardData } from "@/types/card";

interface CardNameCellProps {
  card: CardData;
}

export function CardNameCell({ card }: CardNameCellProps) {
  const { chineseCards } = useCardStore();
  const chineseCard = chineseCards[card.name];
  const chineseName = chineseCard?.zhs_name || chineseCard?.officialName || chineseCard?.translatedName;

  const cardImageUrl = chineseCard?.scryfallId 
    ? `https://cards.scryfall.io/large/front/${chineseCard.scryfallId.slice(0, 1)}/${chineseCard.scryfallId.slice(1, 2)}/${chineseCard.scryfallId}.jpg`
    : null;

  return (
    <div 
      className="relative max-w-[300px]"
      style={{
        backgroundImage: cardImageUrl ? `url(${cardImageUrl})` : 'none',
        backgroundSize: '150%',
        backgroundPosition: '-50px -100px',
      }}
    >
      <div className="relative z-10 bg-black/50 p-1 rounded">
        <div className="font-medium text-white truncate">
          {chineseName || card.name}
        </div>
        <div className="text-sm text-gray-300 truncate">
          {card.name}
        </div>
      </div>
    </div>
  );
} 