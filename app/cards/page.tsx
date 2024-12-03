'use client';

import { useEffect, useMemo, useState } from "react";
import { CardTable } from "@/components/card-table";
import { CardFilters } from "@/components/card-filters";
import { SetSymbol } from "@/components/set-symbol";
import { useCardStore } from "@/lib/store";
import { fetchCardData, fetchAllChineseCardData } from "@/lib/api";
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

  // 加载卡牌数据
  useEffect(() => {
    async function loadData() {
      try {
        setIsLoading(true);
        // 加载17lands数据
        const data = await fetchCardData(params);
        setCards(data);
        setIsLoading(false);

        // 后台加载中文数据，支持增量更新
        fetchAllChineseCardData(
          params.expansion, 
          data,
          (results) => {
            // 每次有新的中文数据就更新
            setChineseCards(results);
          }
        ).catch(error => {
          console.error('Failed to load Chinese card data:', error);
        });
      } catch (error) {
        setError(error as Error);
        setIsLoading(false);
      }
    }

    loadData();
  }, [params, setCards, setChineseCards, setIsLoading, setError]);

  return (
    <div className="py-8">
      <div className="container mx-auto px-4 mb-8">
        <div className="flex items-center gap-3 mb-8">
          <SetSymbol set={params.expansion} />
          <h1 className="text-2xl font-semibold">
            {params.expansion} 轮抽卡牌数据
          </h1>
          <a 
            href="https://www.17lands.com/card_data"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[--accent]/10 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--accent]/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
            17Lands
          </a>
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