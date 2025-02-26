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

  // 获取卡牌中文名的通用函数
  const fetchCardNames = async (cardRefs: string[]) => {
    // 将每个 cardRef 转换为 CardRef 对象
    const cards = cardRefs.map(cardRef => {
      const [setCode, number] = cardRef.split(':');
      return { setCode, number };
    });

    // 获取每张卡的中文名
    return Promise.all(
      cards.map(async card => {
        try {
          const response = await fetch(`https://api.sbwsz.com/card/${card.setCode}/${card.number}`);
          const data = await response.json();
          if (data.type === 'normal' && data.data?.[0]) {
            return {
              ...card,
              zhs_name: data.data[0].zhs_name,
              officialName: data.data[0].officialName,
              translatedName: data.data[0].translatedName
            };
          }
          return card;
        } catch (error) {
          console.error('Failed to fetch card name:', error);
          return card;
        }
      })
    );
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
          >
            {card.zhs_name || card.officialName || card.translatedName || `${card.setCode}:${card.number}`}
          </a>
        ))}
      </div>
    </div>
  );

  return (
    <div className="bg-[--card] rounded-lg overflow-hidden border border-[--border] flex flex-col md:flex-row">
      <div className="px-4 md:p-0 pt-4 md:pt-0">
        <div 
          className="relative w-full md:w-[240px] aspect-[488/680] md:h-[340px] bg-black mx-auto max-w-[280px] cursor-pointer"
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
            <img
              src={isEnglish ? card.image_url_en : card.image_url_zh}
              alt={isEnglish ? card.name : card.zhs_name}
              className="max-h-[85vh] max-w-[85vw] object-contain"
            />
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

        <div className="mt-4 flex-1 divide-y divide-[--border]">
          <div className="text-sm pb-2 flex items-center justify-between">
            <ManaText text={isEnglish ? card.type : card.zhs_type} />
            <i className={`ss ${getRarityIcon(card.rarity)} ss-fw ss-3x ss-${logoCode}`} />
          </div>
          <div className="text-sm whitespace-pre-wrap pt-2 leading-normal">
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
  );
} 