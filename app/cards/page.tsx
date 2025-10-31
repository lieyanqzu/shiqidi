'use client';

import { useEffect, useMemo, useState, ReactNode } from "react";
import { CardTable } from "@/components/card-table";
import { CardGrades } from "@/components/card-grades";
import { CardFilters } from "@/components/card-filters";
import { SetSymbol } from "@/components/set-symbol";
import { useCardStore } from "@/lib/store";
import { fetchCardData, fetchAllChineseCardData } from "@/lib/api";
import { BackToTop } from "@/components/back-to-top";
import { GRADE_METRICS, type GradeMetric } from "@/lib/grades";
import { Button } from "@/components/ui/button";
import { GradeMethodologyDialog } from "@/components/grade-methodology-dialog";

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
  const [viewMode, setViewMode] = useState<'table' | 'grades'>('table');
  const [gradeMetric, setGradeMetric] = useState<GradeMetric>('ever_drawn_win_rate');
  const [columnControls, setColumnControls] = useState<ReactNode | null>(null);

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

  useEffect(() => {
    if (viewMode !== 'table') {
      setColumnControls(null);
    }
  }, [viewMode]);

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

        {/* 视图切换和指标选择 */}
        <div className="flex flex-wrap items-center gap-3 mt-6 p-4 bg-[--component-background] rounded-lg border border-[--border]">
          {/* 视图切换按钮 */}
          <div className="flex items-center gap-2 shrink-0">
            <Button
              variant={viewMode === 'grades' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('grades')}
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-4 h-4">
                <path d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zM3 10a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6zM14 9a1 1 0 00-1 1v6a1 1 0 001 1h2a1 1 0 001-1v-6a1 1 0 00-1-1h-2z" />
              </svg>
              评分视图
            </Button>
            <Button
              variant={viewMode === 'table' ? 'secondary' : 'ghost'}
              size="sm"
              onClick={() => setViewMode('table')}
              className="flex items-center gap-2"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <rect x="3" y="4" width="18" height="16" rx="2" ry="2" />
                <path d="M3 9h18" />
                <path d="M8 3v2" />
                <path d="M16 3v2" />
              </svg>
              表格视图
            </Button>
          </div>

          {/* 指标选择器 - 仅在 Grades 视图显示 */}
          {viewMode === 'grades' && (
            <div className="flex items-center gap-2 flex-wrap">
              <div className="flex items-center gap-1 text-sm text-[--foreground-muted]">
                <span>评分指标：</span>
                <GradeMethodologyDialog />
              </div>
              {GRADE_METRICS.map((metric) => (
                <Button
                  key={metric.value}
                  variant={gradeMetric === metric.value ? 'secondary' : 'ghost'}
                  size="sm"
                  onClick={() => setGradeMetric(metric.value)}
                  title={metric.label}
                >
                  {metric.shortLabel}
                </Button>
              ))}
            </div>
          )}

          {/* 列显示控制 - 仅在 Table 视图显示 */}
          {viewMode === 'table' && columnControls && (
            <div className="flex-1 min-w-[240px] ml-auto">
              {columnControls}
            </div>
          )}
        </div>
      </div>

      {/* 根据视图模式显示不同内容 */}
      {viewMode === 'table' ? (
      <CardTable 
        data={filteredCards} 
        isLoading={isLoading} 
        expansion={params.expansion}
        onColumnControlsChange={setColumnControls}
      />
      ) : (
        <CardGrades
          data={filteredCards}
          allCards={cards}
          metric={gradeMetric}
          expansion={params.expansion}
        />
      )}
      <BackToTop />
    </div>
  );
} 