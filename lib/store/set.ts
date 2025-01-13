import { create } from 'zustand';

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
      const response = await fetch('https://sbwsz.com/static/setName.json');
      if (!response.ok) {
        throw new Error('获取系列中文名称失败');
      }
      const data = await response.json();
      set({ chineseSetNames: data, error: null, hasLoaded: true });
    } catch (err) {
      set({ error: err instanceof Error ? err : new Error('获取系列中文名称失败') });
    } finally {
      set({ isLoading: false });
    }
  }
})); 