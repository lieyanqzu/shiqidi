'use client';

import { useEffect, useMemo, useState } from "react";
import { CardTable } from "@/components/card-table";
import { CardFilters } from "@/components/card-filters";
import { SetSymbol } from "@/components/set-symbol";
import { useCardStore } from "@/lib/store";
import { fetchCardData, fetchChineseCardData } from "@/lib/api";
import { BackToTop } from "@/components/back-to-top";

export default function CardsPage() {
  const { 
    cards, 
    params,
    chineseCards,
    isLoading,
    setCards, 
    setChineseCards,
    setIsLoading, 
    setError,
    setParams,
  } = useCardStore();

  const [selectedColor, setSelectedColor] = useState<string>("");
  const [selectedRarity, setSelectedRarity] = useState<string>("");
  const [searchText, setSearchText] = useState<string>("");

  // 记录 SPG 数据是否已加载
  const [spgLoaded, setSpgLoaded] = useState(false);

  const filteredCards = useMemo(() => {
    let result = cards;

    // 搜索筛选
    if (searchText) {
      const searchLower = searchText.toLowerCase();
      result = result.filter(card => {
        // 英文名匹配
        const englishMatch = card.name.toLowerCase().includes(searchLower);
        // 中文名匹配
        const chineseCard = chineseCards[card.name];
        const chineseName = chineseCard?.zhs_name || chineseCard?.officialName || chineseCard?.translatedName;
        const chineseMatch = chineseName?.toLowerCase().includes(searchLower);
        
        return englishMatch || chineseMatch;
      });
    }

    // 颜色筛选
    if (selectedColor) {
      result = result.filter(card => {
        if (selectedColor === "Multicolor") {
          return card.color.length > 1;
        }
        if (selectedColor === "Colorless") {
          return card.color === "";
        }
        return card.color === selectedColor;
      });
    }

    // 稀有度筛选
    if (selectedRarity) {
      result = result.filter(card => 
        card.rarity.toLowerCase() === selectedRarity
      );
    }

    return result;
  }, [cards, searchText, selectedColor, selectedRarity, chineseCards]);

  // 加载17lands数据
  useEffect(() => {
    async function loadCardData() {
      try {
        setIsLoading(true);
        const data = await fetchCardData(params);
        setCards(data);
      } catch (error) {
        setError(error as Error);
      } finally {
        setIsLoading(false);
      }
    }

    loadCardData();
  }, [params, setCards, setIsLoading, setError]);

  // 加载中文数据，包括当前系列和 SPG
  useEffect(() => {
    async function loadChineseData() {
      try {
        // 获取当前系列的中文数据
        const currentSetData = await fetchChineseCardData(params.expansion);
        
        // 如果是 YXXX 系列，也获取 XXX 系列的数据
        let originalSetData = { results: [] };
        if (params.expansion.startsWith('Y')) {
          const originalSetCode = params.expansion.replace(/^Y\d{0,2}/, '');
          originalSetData = await fetchChineseCardData(originalSetCode);
        }
        
        // 如果 SPG 数据还没加载过，就加载它
        let spgData = { results: [] };
        if (!spgLoaded) {
          spgData = await fetchChineseCardData('SPG');
          setSpgLoaded(true);
        }

        // 合并所有数据
        const allResults = [
          ...(currentSetData.results || []),
          ...(originalSetData.results || []),
          ...(spgData.results || [])
        ];

        if (allResults.length > 0) {
          setChineseCards(allResults);
        }
      } catch (error) {
        console.error('Failed to load Chinese card data:', error);
      }
    }

    loadChineseData();
  }, [params.expansion, setChineseCards, spgLoaded]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <SetSymbol set={params.expansion} />
          <h1 className="text-2xl font-semibold">
            {params.expansion} 卡牌数据
          </h1>
        </div>
        <CardFilters 
          params={params} 
          onParamsChange={setParams}
          onColorFilter={setSelectedColor}
          selectedColor={selectedColor}
          onRarityFilter={setSelectedRarity}
          selectedRarity={selectedRarity}
          onSearchFilter={setSearchText}
          searchText={searchText}
        />
      </div>
      <CardTable 
        data={filteredCards} 
        isLoading={isLoading} 
        expansion={params.expansion}
      />
      <BackToTop />
    </div>
  );
} 