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

  const [selectedColors, setSelectedColors] = useState<string[]>([]);
  const [selectedRarities, setSelectedRarities] = useState<string[]>([]);
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
        const chineseName = chineseCard?.atomic_official_name || chineseCard?.atomic_translated_name || chineseCard?.zhs_name;
        const chineseMatch = chineseName?.toLowerCase().includes(searchLower);
        
        return englishMatch || chineseMatch;
      });
    }

    // 颜色筛选
    if (selectedColors.length > 0) {
      result = result.filter(card => {
        const cardColors = card.color ? card.color.split('') : [];
        const isMulticolor = cardColors.length > 1;
        const isColorless = cardColors.length === 0;
        
        // 检查选中的颜色中是否包含 M（多色）和 C（无色）
        const hasMulticolorSelected = selectedColors.includes('M');
        const hasColorlessSelected = selectedColors.includes('C');
        
        // 如果是无色卡牌且选中了无色，直接返回 true
        if (isColorless && hasColorlessSelected) {
          return true;
        }
        
        // 如果选中了多色按钮，只显示多色卡牌
        if (hasMulticolorSelected) {
          // 如果不是多色卡牌，直接返回 false
          if (!isMulticolor) {
            return false;
          }
          
          // 获取选中的基本颜色（WUBRG）
          const selectedBasicColors = selectedColors.filter(c => 'WUBRG'.includes(c));
          // 如果同时选中了基本颜色，则多色卡必须包含所有选中的基本颜色
          if (selectedBasicColors.length > 0) {
            return selectedBasicColors.every(color => cardColors.includes(color));
          }
          // 如果只选中了多色按钮，显示所有多色卡
          return true;
        }
        
        // 获取选中的基本颜色（WUBRG）
        const selectedBasicColors = selectedColors.filter(c => 'WUBRG'.includes(c));
        
        // 如果选中了基本颜色检查卡牌是否包含任何一个选中的颜色
        if (selectedBasicColors.length > 0) {
          return selectedBasicColors.some(color => cardColors.includes(color));
        }
        
        return false;
      });
    }

    // 稀有度筛选
    if (selectedRarities.length > 0) {
      result = result.filter(card => 
        selectedRarities.includes(card.rarity.toLowerCase())
      );
    }

    return result;
  }, [cards, searchText, selectedColors, selectedRarities, chineseCards]);

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
            href="https://www.17lands.com/card_data?utm_source=shiqidi"
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
          onColorFilter={setSelectedColors}
          selectedColors={selectedColors}
          onRarityFilter={setSelectedRarities}
          selectedRarities={selectedRarities}
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