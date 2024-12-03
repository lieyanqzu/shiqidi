import { create } from 'zustand';

export interface Component {
  id: string;
  name: string;
  status: string;
  description: string | null;
  updated_at: string;
  group_id: string | null;
  group: boolean;
  components?: string[];
}

export interface ScheduledMaintenance {
  id: string;
  name: string;
  status: string;
  scheduled_for: string;
  scheduled_until: string;
  incident_updates: {
    body: string;
    created_at: string;
  }[];
}

export interface StatusData {
  status: {
    indicator: 'none' | 'minor' | 'major' | 'critical';
    description: string;
  };
  components: Component[];
  scheduled_maintenances: ScheduledMaintenance[];
}

interface StatusStore {
  data: StatusData | null;
  isLoading: boolean;
  error: string | null;
  lastUpdated: number | null;
  fetchStatus: (force?: boolean) => Promise<void>;
}

export const useStatusStore = create<StatusStore>((set, get) => ({
  data: null,
  isLoading: false,
  error: null,
  lastUpdated: null,

  fetchStatus: async (force = false) => {
    const store = get();
    const now = Date.now();
    
    // 如果数据已存在且未过期（1分钟内），且不是强制刷新，则跳过
    if (!force && 
        store.data && 
        store.lastUpdated && 
        now - store.lastUpdated < 60000) {
      return;
    }

    // 测试模式：通过 URL 参数模拟不同状态
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const mockStatus = urlParams.get('mockStatus');
      if (mockStatus) {
        set({
          data: {
            status: {
              indicator: mockStatus as 'none' | 'minor' | 'major' | 'critical',
              description: "模拟状态"
            },
            components: [],
            scheduled_maintenances: []
          },
          isLoading: false,
          error: null,
          lastUpdated: now
        });
        return;
      }
    }

    set({ isLoading: true });

    try {
      const response = await fetch('https://magicthegatheringarena.statuspage.io/api/v2/summary.json');
      if (!response.ok) throw new Error('获取状态信息失败');
      const data = await response.json();
      
      set({
        data,
        error: null,
        lastUpdated: now
      });
    } catch (err) {
      set({
        error: err instanceof Error ? err.message : '未知错误',
        data: null
      });
    } finally {
      set({ isLoading: false });
    }
  }
})); 