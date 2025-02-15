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

export interface IncidentUpdate {
  id: string;
  status: string;
  body: string;
  incident_id: string;
  created_at: string;
  updated_at: string;
  display_at: string;
  affected_components: Array<{
    code: string;
    name: string;
    old_status: string;
    new_status: string;
  }>;
}

export interface Incident {
  id: string;
  name: string;
  status: string;
  created_at: string;
  updated_at: string;
  monitoring_at: string | null;
  resolved_at: string | null;
  impact: string;
  shortlink: string;
  started_at: string;
  page_id: string;
  incident_updates: IncidentUpdate[];
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
    indicator: 'none' | 'minor' | 'major' | 'critical' | 'maintenance';
    description: string;
  };
  components: Component[];
  incidents: Incident[];
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