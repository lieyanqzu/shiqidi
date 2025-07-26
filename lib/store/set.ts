import { create } from 'zustand';

interface SetData {
  code: string;
  translated_name?: string;
}

interface SetStore {
  chineseSetNames: { [key: string]: string };
  isLoading: boolean;
  error: Error | null;
  hasLoaded: boolean;
  fetchChineseSetNames: () => Promise<void>;
}

export const useSetStore = create<SetStore>((set) => ({
  chineseSetNames: {},
  isLoading: false,
  error: null,
  hasLoaded: false,
  fetchChineseSetNames: async () => {
    const state = useSetStore.getState();
    if (state.hasLoaded || state.isLoading) {
      return;
    }

    try {
      set({ isLoading: true });
      const response = await fetch('https://mtgzh.com/api/v1/sets/');
      if (!response.ok) {
        throw new Error('获取系列中文名称失败');
      }
      const data = await response.json();
      const chineseNames = data.reduce((acc: { [key: string]: string }, set: SetData) => {
        if (set.translated_name) {
          acc[set.code] = set.translated_name;
        }
        return acc;
      }, {});
      set({ chineseSetNames: chineseNames, error: null, hasLoaded: true });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error('获取系列中文名称失败') });
    } finally {
      set({ isLoading: false });
    }
  }
}));