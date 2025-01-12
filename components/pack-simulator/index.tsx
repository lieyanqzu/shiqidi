'use client';

import { useState } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PackDisplay } from './pack-display';
import { Statistics } from './statistics';
import { getAvailableSets, simulatePacks } from '@/lib/pack-simulator';
import type { Card } from '@/types/pack-simulator';

const sets = getAvailableSets();
const setOptions = sets.map(set => ({
  label: set.name,
  value: set.code
}));

export function PackSimulator() {
  const [selectedSet, setSelectedSet] = useState<string>(setOptions[0]?.value || '');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<{ packs: any[] }>({ packs: [] });
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [autoFlipCommon, setAutoFlipCommon] = useState(false);

  // 开新包
  const handleNewPack = async () => {
    if (!selectedSet) return;

    setIsLoading(true);
    try {
      const results = await simulatePacks(selectedSet, 1);
      setResults(results);
      setFlippedCards([]); // 清空已翻开卡牌
    } catch (error) {
      console.error('模拟开包失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 清空结果
  const handleClear = () => {
    setResults({ packs: [] });
    setFlippedCards([]); // 清空已翻开卡牌
  };

  // 再来一包（追加结果）
  const handleMorePack = async () => {
    if (!selectedSet) return;

    setIsLoading(true);
    try {
      const newResults = await simulatePacks(selectedSet, 1);
      setResults(prev => ({
        packs: [...prev.packs, ...newResults.packs]
      }));
    } catch (error) {
      console.error('模拟开包失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理卡牌翻开状态变化
  const handleFlippedCardsChange = (cards: Card[]) => {
    setFlippedCards(cards);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedSet}
            onChange={(e) => {
              setSelectedSet(e.target.value);
              handleClear();
            }}
            title="支持卡包陆续更新中..."
            disabled={isLoading}
            options={setOptions}
          />
        </div>

        {results.packs.length > 0 ? (
          <Button 
            onClick={handleClear}
            variant="secondary"
            className="w-full sm:w-auto"
          >
            重新开始
          </Button>
        ) : (
          <>
            <Button 
              onClick={handleNewPack}
              disabled={!selectedSet || isLoading}
              className="w-full sm:w-auto"
            >
              {isLoading ? '补充包正在赶来...' : '我现在就要开包'}
            </Button>
            <div className="flex items-center gap-2 w-full sm:w-auto">
              <input
                type="checkbox"
                id="auto-flip"
                checked={autoFlipCommon}
                onChange={(e) => setAutoFlipCommon(e.target.checked)}
                className="cursor-pointer"
              />
              <label htmlFor="auto-flip" className="text-sm cursor-pointer whitespace-nowrap">
                自动翻开普通和非普通卡牌
              </label>
            </div>
          </>
        )}
      </div>

      {results.packs.length > 0 ? (
        <div className="space-y-4">
          <PackDisplay 
            packs={results.packs} 
            onFlippedCardsChange={handleFlippedCardsChange}
            autoFlipCommon={autoFlipCommon}
          />
          <div className="space-y-4">
            <div className="flex justify-center">
              <Button
                onClick={handleMorePack}
                disabled={isLoading}
                variant="secondary"
                className="w-full sm:w-auto"
              >
                {isLoading ? '补充包正在赶来...' : '再来一包'}
              </Button>
            </div>
            <Statistics 
              cards={flippedCards} 
              setCode={selectedSet}
              packCount={results.packs.length}
            />
          </div>
        </div>
      ) : (
        <Statistics 
          cards={[]} 
          setCode={selectedSet}
          packCount={0}
        />
      )}
    </div>
  );
} 