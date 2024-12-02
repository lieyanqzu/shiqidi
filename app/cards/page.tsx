'use client';

import { useEffect, useMemo, useState } from "react";
import { CardTable } from "@/components/card-table";
import { CardFilters } from "@/components/card-filters";
import { SetSymbol } from "@/components/set-symbol";
import { useCardStore } from "@/lib/store";
import { fetchCardData, fetchChineseCardData } from "@/lib/api";
import { BackToTop } from "@/components/back-to-top";
import type { Column } from "@/components/card-table";

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

  // 定义表格列
  const columns: Column[] = useMemo(() => [
    {
      accessorKey: "name",
      header: "卡牌名称",
      title: "卡牌名称",
      tooltip: "卡牌名称"
    },
    {
      accessorKey: "color",
      header: "颜色",
      title: "颜色",
      tooltip: "卡牌颜色"
    },
    {
      accessorKey: "rarity",
      header: "稀有度",
      title: "稀有度",
      tooltip: "卡牌稀有度"
    },
    {
      accessorKey: "seen_count",
      header: "# Seen",
      title: "# Seen",
      tooltip: "轮抽中见过的次数"
    },
    {
      accessorKey: "avg_seen",
      header: "ALSA",
      title: "ALSA",
      tooltip: "平均最后见到的抓位"
    },
    {
      accessorKey: "pick_count",
      header: "# Picked",
      title: "# Picked",
      tooltip: "被选择的次数"
    },
    {
      accessorKey: "avg_pick",
      header: "ATA",
      title: "ATA",
      tooltip: "平均选择抓位"
    },
    {
      accessorKey: "game_count",
      header: "# GP",
      title: "# GP",
      tooltip: "使用过的对局数量"
    },
    {
      accessorKey: "play_rate",
      header: "% GP",
      title: "% GP",
      tooltip: "主牌使用率"
    },
    {
      accessorKey: "win_rate",
      header: "GP WR",
      title: "GP WR",
      tooltip: "主牌使用时的胜率"
    },
    {
      accessorKey: "opening_hand_game_count",
      header: "# OH",
      title: "# OH",
      tooltip: "在起手的对局数量"
    },
    {
      accessorKey: "opening_hand_win_rate",
      header: "OH WR",
      title: "OH WR",
      tooltip: "在起手时的胜率"
    },
    {
      accessorKey: "drawn_game_count",
      header: "# GD",
      title: "# GD",
      tooltip: "第一回合后抽到的对局数量"
    },
    {
      accessorKey: "drawn_win_rate",
      header: "GD WR",
      title: "GD WR",
      tooltip: "第一回合后抽到的胜率"
    },
    {
      accessorKey: "ever_drawn_game_count",
      header: "# GIH",
      title: "# GIH",
      tooltip: "在手上的对局数量(起手或抽到)"
    },
    {
      accessorKey: "ever_drawn_win_rate",
      header: "GIH WR",
      title: "GIH WR",
      tooltip: "在手上时的胜率(起手或抽到)"
    },
    {
      accessorKey: "never_drawn_game_count",
      header: "# GNS",
      title: "# GNS",
      tooltip: "未见到的对局数量"
    },
    {
      accessorKey: "never_drawn_win_rate",
      header: "GNS WR",
      title: "GNS WR",
      tooltip: "未见到的胜率"
    },
    {
      accessorKey: "drawn_improvement_win_rate",
      header: "IWD",
      title: "IWD",
      tooltip: "抽到时的胜率提升"
    },
  ], []);

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

  // 加载中文数据,包括当前系列和 SPG
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
      <div className="container mx-auto px-4">
        <CardTable 
          data={filteredCards} 
          columns={columns}
          loading={isLoading}
          expansion={params.expansion}
        />
      </div>
      <BackToTop />
    </div>
  );
} 