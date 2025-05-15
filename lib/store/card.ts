import { create } from 'zustand';
import type { CardData, ChineseCardData } from '@/types/card';
import type { CardDataParams } from '@/lib/api';

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

export const useCardStore = create<CardStore>((set) => ({
  cards: [],
  chineseCards: {},
  params: {
    expansion: 'FIN',
    format: 'PremierDraft', 
    start_date: '2016-01-01',
    end_date: today,
  },
  isLoading: false,
  error: null,
  setCards: (cards) => set({ cards }),
  setChineseCards: (cards) => set((state) => {
    const chineseCards = { ...state.chineseCards };
    cards.forEach(card => {
      chineseCards[card.name] = card;
      if (card.face_name) {
        chineseCards[card.face_name] = card;
      }
    });
    return { chineseCards };
  }),
  setParams: (params) => set((state) => ({ 
    params: { ...state.params, ...params } 
  })),
  setIsLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
})); 