import { create } from 'zustand';
import type { CardData, ChineseCardData } from '@/types/card';
import type { CardDataParams } from '@/lib/api';
import { getStartDateForExpansion } from '@/lib/filter';

interface CardStore {
  cards: CardData[];
  chineseCards: { [key: string]: ChineseCardData };
  params: CardDataParams;
  isLoading: boolean;
  error: Error | null;
  setCards: (cards: CardData[]) => void;
  setChineseCards: (cards: ChineseCardData[]) => void;
  setParams: (params: Partial<CardDataParams>) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: Error | null) => void;
}

// 获取当前日期的YYYY-MM-DD格式
const today = new Date().toISOString().split('T')[0];

// 获取默认系列的起始日期
const defaultExpansion = 'TLA';
const defaultFormat = 'PremierDraft';
const defaultStartDate = getStartDateForExpansion(defaultExpansion)?.split('T')[0] || '2016-01-01';

export const useCardStore = create<CardStore>((set) => ({
  cards: [],
  chineseCards: {},
  params: {
    expansion: defaultExpansion,
    event_type: defaultFormat, 
    start_date: defaultStartDate,
    end_date: today,
  },
  isLoading: false,
  error: null,
  setCards: (cards) => set({ cards }),
  setChineseCards: (cards) => set((state) => {
    const chineseCards = { ...state.chineseCards };
    cards.forEach(card => {
      chineseCards[card.name] = card;
    });
    return { chineseCards };
  }),
  setParams: (params) => set((state) => ({ 
    params: { ...state.params, ...params } 
  })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 