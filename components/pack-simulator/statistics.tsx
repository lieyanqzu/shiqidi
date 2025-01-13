'use client';

import { useEffect } from 'react';
import type { Card } from '@/types/pack-simulator';
import boosterConfig from '@/data/booster-config.json';
import { useSetStore } from '@/lib/store';

interface StatisticsProps {
  cards: Card[];
  setCode: string;
  boosterCode: string;
  packCount: number;
}

export function Statistics({ cards, setCode, boosterCode, packCount }: StatisticsProps) {
  const { chineseSetNames, fetchChineseSetNames } = useSetStore();

  useEffect(() => {
    fetchChineseSetNames();
  }, [fetchChineseSetNames]);

  // 获取系列名称
  const setName = chineseSetNames[setCode] || setCode;

  // 获取补充包名称
  const boosterName = boosterConfig.sets
    .find(set => set.code === setCode)
    ?.boosters.find(booster => booster.code === boosterCode)
    ?.name;

  // 按稀有度统计
  const rarityStats = cards.reduce((acc, card) => {
    const rarity = card.rarity || 'unknown';
    acc[rarity] = (acc[rarity] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // 按闪卡统计
  const foilCount = cards.filter(card => card.sheet.includes('foil')).length;

  // 获取稀有和秘稀卡牌
  const rareAndMythicCards = cards.filter(card => 
    card.rarity === 'rare' || card.rarity === 'mythic'
  ).sort((a, b) => {
    // 先按稀有度排序（秘稀在前）
    if (a.rarity !== b.rarity) {
      return a.rarity === 'mythic' ? -1 : 1;
    }
    // 再按闪卡排序（闪卡在前）
    if (a.sheet.includes('foil') !== b.sheet.includes('foil')) {
      return a.sheet.includes('foil') ? -1 : 1;
    }
    // 最后按名称排序
    return (a.zhs_name || a.name || '').localeCompare(b.zhs_name || b.name || '');
  });

  // 获取稀有度颜色
  const getRarityColor = (rarity: string | undefined): string => {
    if (!rarity) return 'text-[--muted-foreground]';
    switch (rarity.toLowerCase()) {
      case 'mythic':
        return 'text-orange-500 font-medium';
      case 'rare':
        return 'text-yellow-500 font-medium';
      case 'uncommon':
        return 'text-blue-500';
      default:
        return 'text-[--muted-foreground]';
    }
  };

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { color: #ff0000; }
          17% { color: #ff8800; }
          33% { color: #ffff00; }
          50% { color: #00ff00; }
          67% { color: #0088ff; }
          83% { color: #8800ff; }
          100% { color: #ff0000; }
        }
        .rainbow-text {
          animation: rainbow 4s linear infinite;
        }
      `}</style>
      <div className="bg-[--card] border border-[--border] rounded-lg p-4">
        <h3 className="font-medium mb-4">
          获得卡牌统计
          {setName && boosterName && (
            <span className="ml-2 text-sm text-[--muted-foreground] inline-flex items-center gap-1">
              （<i className={`keyrune ss ss-${setCode.toLowerCase()}`} />{setName} - {boosterName}）
            </span>
          )}
        </h3>
        
        <div className="grid grid-cols-4 gap-4 mb-4">
          {/* 稀有度统计卡片 */}
          {['mythic', 'rare', 'uncommon', 'common'].map(rarity => (
            <div 
              key={rarity} 
              className="bg-[--background] border border-[--border] rounded-lg p-3 flex flex-col items-center"
            >
              <div className={`text-2xl font-bold mb-1 ${getRarityColor(rarity)}`}>
                {rarityStats[rarity] || 0}
              </div>
              <div className="text-xs text-center">
                <span className={getRarityColor(rarity)}>
                  {rarity === 'mythic' ? '秘稀' :
                   rarity === 'rare' ? '稀有' :
                   rarity === 'uncommon' ? '非普通' : '普通'}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-3 gap-4 mb-4">
          {/* 开包数量 */}
          <div className="bg-[--background] border border-[--border] rounded-lg p-3 flex flex-col items-center">
            <div className="text-2xl font-bold mb-1">
              {packCount}
            </div>
            <div className="text-xs text-center">
              <span>已开启</span>
              <span className="text-[--muted-foreground] ml-1">补充包</span>
            </div>
          </div>

          {/* 闪卡统计 */}
          <div className="bg-[--background] border border-[--border] rounded-lg p-3 flex flex-col items-center">
            <div className="text-2xl font-bold mb-1">
              {foilCount}
            </div>
            <div className="text-xs text-center">
              <span>闪卡</span>
              <span className="text-[--muted-foreground] ml-1">数量</span>
            </div>
          </div>

          {/* 总计 */}
          <div className="bg-[--background] border border-[--border] rounded-lg p-3 flex flex-col items-center">
            <div className="text-2xl font-bold mb-1">
              {cards.length}
            </div>
            <div className="text-xs text-center">
              <span>总计</span>
              <span className="text-[--muted-foreground] ml-1">卡牌</span>
            </div>
          </div>
        </div>

        {/* 稀有和秘稀卡牌列表 */}
        <div className="bg-[--background] border border-[--border] rounded-lg p-4">
          <h4 className="text-sm font-medium mb-3">稀有和秘稀卡牌</h4>
          <div className="flex flex-wrap gap-1">
            {rareAndMythicCards.length > 0 ? (
              rareAndMythicCards.map((card, index) => (
                <div 
                  key={`${card.id}-${index}`} 
                  className="flex items-center gap-1 bg-[--card] border border-[--border] rounded-lg px-2 py-1"
                >
                  <span className={`${getRarityColor(card.rarity)} shrink-0 text-xs`}>
                    {card.rarity === 'mythic' ? '[秘稀]' : '[稀有]'}
                  </span>
                  <span className="truncate text-sm">
                    {card.zhs_name || card.officialName || card.translatedName || card.name || card.id}
                  </span>
                  {card.sheet.includes('foil') && (
                    <span className="text-xs rainbow-text shrink-0">闪卡</span>
                  )}
                </div>
              ))
            ) : (
              <div className="text-sm text-[--muted-foreground] w-full text-center py-4">暂无</div>
            )}
          </div>
        </div>
      </div>
    </>
  );
} 