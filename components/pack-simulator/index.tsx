'use client';

import { useState, useCallback, useEffect, useMemo } from 'react';
import { Select } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { PackDisplay } from './pack-display';
import { Statistics } from './statistics';
import { SetSelect } from './set-select';
import { getAvailableSets, simulatePacks } from '@/lib/pack-simulator';
import { useSetStore } from '@/lib/store';
import type { Card, PackSimulatorResults } from '@/types/pack-simulator';

export function PackSimulator() {
  const { fetchChineseSetNames } = useSetStore();
  const [selectedSetCode, setSelectedSetCode] = useState<string>('');
  const [selectedBoosterCode, setSelectedBoosterCode] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [results, setResults] = useState<PackSimulatorResults>({ packs: [], statistics: { totalCards: 0, byRarity: {}, bySheet: {} } });
  const [flippedCards, setFlippedCards] = useState<Card[]>([]);
  const [autoFlipCommon, setAutoFlipCommon] = useState(false);

  useEffect(() => {
    fetchChineseSetNames();
  }, [fetchChineseSetNames]);

  const sets = getAvailableSets();

  // 获取当前选中系列的补充包选项
  const boosterOptions = useMemo(() => selectedSetCode
    ? sets
        .find(set => set.code === selectedSetCode)
        ?.boosters.map(booster => ({
          label: booster.name,
          value: booster.code,
        })) || []
    : [], [selectedSetCode, sets]);

  // 当选择系列时，自动选择该系列的第一个补充包
  useEffect(() => {
    if (sets.length > 0 && !selectedSetCode) {
      setSelectedSetCode(sets[0].code);
    }
  }, [sets, selectedSetCode]);

  // 当系列改变时，重置补充包选择
  useEffect(() => {
    if (selectedSetCode && boosterOptions.length > 0 && !selectedBoosterCode) {
      setSelectedBoosterCode(boosterOptions[0].value);
    }
  }, [selectedSetCode, boosterOptions, selectedBoosterCode]);

  // 开新包
  const handleNewPack = async () => {
    if (!selectedBoosterCode) return;

    setIsLoading(true);
    try {
      const results = await simulatePacks(selectedBoosterCode, 1);
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
    setResults({ packs: [], statistics: { totalCards: 0, byRarity: {}, bySheet: {} } });
    setFlippedCards([]); // 清空已翻开卡牌
  };

  // 再来一包（追加结果）
  const handleMorePack = async () => {
    if (!selectedBoosterCode) return;

    setIsLoading(true);
    try {
      const newResults = await simulatePacks(selectedBoosterCode, 1);
      setResults(prev => ({
        packs: [...prev.packs, ...newResults.packs],
        statistics: newResults.statistics
      }));
    } catch (error) {
      console.error('模拟开包失败:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // 处理卡牌翻开状态变化
  const handleFlippedCardsChange = useCallback((cards: Card[]) => {
    setFlippedCards(cards);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center gap-4">
        <div className="w-full sm:w-[200px]">
          <SetSelect
            value={selectedSetCode}
            onChange={(value) => {
              setSelectedSetCode(value);
              setSelectedBoosterCode(''); // 重置补充包选择
              handleClear();
            }}
            disabled={isLoading}
            title="选择系列"
            iconSize="1x"
          />
        </div>
        <div className="w-full sm:w-[200px]">
          <Select
            value={selectedBoosterCode}
            onChange={(e) => {
              setSelectedBoosterCode(e.target.value);
              handleClear();
            }}
            title="选择补充包"
            disabled={isLoading || boosterOptions.length === 0}
            options={boosterOptions}
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
              disabled={!selectedBoosterCode || isLoading}
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
              setCode={selectedSetCode}
              boosterCode={selectedBoosterCode}
              packCount={results.packs.length}
            />
          </div>
        </div>
      ) : (
        <Statistics 
          cards={[]} 
          setCode={selectedSetCode}
          boosterCode={selectedBoosterCode}
          packCount={0}
        />
      )}
    </div>
  );
} 