const { fetchStatusSummary } = require('../../utils/api');
const { toDisplayError } = require('../../utils/display-error');
const { parseDate } = require('../../utils/format');
const { generatePageShareImage } = require('../../utils/share-image');

const statusText = {
  componentNames: {
    Platform: '平台',
    Game: '游戏',
    Logins: '登录',
    Matches: '对局',
    Social: '社交',
    Store: '商店',
    Windows: 'Windows',
    macOS: 'macOS',
    Android: 'Android',
    iOS: 'iOS',
  },
  componentDescriptions: {
    Platform: '各平台客户端状态',
    Game: '游戏服务状态',
    Logins: '登录和认证服务状态',
    Matches: '对局和活动服务状态',
    Social: '社交功能状态',
    Store: '商店和兑换码服务状态',
  },
};

const autoRefreshSeconds = 60;

function componentLabel(status) {
  const map = {
    operational: '正常',
    degraded_performance: '性能下降',
    partial_outage: '部分故障',
    major_outage: '严重故障',
    under_maintenance: '维护中',
  };
  return map[status] || status || '未知';
}

function incidentStatusLabel(status) {
  const map = {
    investigating: '正在调查',
    identified: '已确认问题',
    monitoring: '监控中',
    resolved: '已解决',
    scheduled: '已排期',
    in_progress: '进行中',
    verifying: '验证中',
    completed: '已完成',
  };
  return map[status] || status || '未知';
}

function impactLabel(impact) {
  const map = {
    none: '无影响',
    minor: '轻微影响',
    major: '严重影响',
    critical: '重大影响',
    maintenance: '维护',
  };
  return map[impact] || impact || '未知影响';
}

function statusClass(status) {
  const map = {
    operational: 'ok',
    degraded_performance: 'warn',
    partial_outage: 'warn',
    major_outage: 'bad',
    under_maintenance: 'maintenance',
  };
  return map[status] || 'unknown';
}

function pageStatusText(status) {
  if (!status) return '状态未知';
  if (status.indicator === 'none') return '所有服务正常运行';
  if (status.indicator === 'maintenance') return '服务正在维护中';
  return '部分服务出现问题';
}

function pageStatusClass(status) {
  if (!status) return 'unknown';
  if (status.indicator === 'none') return 'ok';
  if (status.indicator === 'maintenance') return 'maintenance';
  return 'bad';
}

function formatDateTime(value) {
  if (!value) return '未知时间';
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const hour = String(date.getHours()).padStart(2, '0');
  const minute = String(date.getMinutes()).padStart(2, '0');
  return `${year}年${month}月${day}日 ${hour}:${minute}`;
}

function translateComponent(item) {
  return {
    id: item.id,
    name: statusText.componentNames[item.name] || item.name,
    rawName: item.name,
    description: statusText.componentDescriptions[item.name] || item.description || '',
    status: item.status,
    statusText: componentLabel(item.status),
    statusClass: statusClass(item.status),
    children: item.components || [],
    expanded: false,
  };
}

function formatUpdates(updates) {
  return (updates || []).map((update) => ({
    id: update.id || `${update.created_at}-${update.status}`,
    statusText: incidentStatusLabel(update.status),
    body: update.body || '',
    createdText: formatDateTime(update.created_at),
  }));
}

function formatIncident(item) {
  return {
    id: item.id,
    name: item.name,
    statusText: incidentStatusLabel(item.status),
    impactText: impactLabel(item.impact),
    updates: formatUpdates(item.incident_updates),
  };
}

function formatMaintenance(item) {
  return {
    id: item.id,
    name: item.name,
    statusText: incidentStatusLabel(item.status),
    scheduledForText: formatDateTime(item.scheduled_for),
    scheduledUntilText: formatDateTime(item.scheduled_until),
    updates: formatUpdates(item.incident_updates),
  };
}

Page({
  data: {
    loading: false,
    refreshing: false,
    refreshCountdown: autoRefreshSeconds,
    error: '',
    pageStatus: null,
    pageStatusText: '',
    pageStatusClass: 'unknown',
    components: [],
    componentGroups: [],
    incidents: [],
    maintenances: [],
    shareImageUrl: '',
  },

  onShow() {
    this.startAutoRefresh();
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    this.loadStatus();
    this.prepareShareImage();
  },

  async prepareShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: 'MTGA服务状态',
        subtitle: '万智日程',
        description: '查看MTGA的服务器状态和维护信息',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  onHide() {
    this.stopAutoRefresh();
  },

  onUnload() {
    this.stopAutoRefresh();
  },

  startAutoRefresh() {
    if (this.statusRefreshTimer) return;
    this.setData({ refreshCountdown: autoRefreshSeconds });
    this.statusRefreshTimer = setInterval(() => {
      const nextCountdown = Math.max(0, this.data.refreshCountdown - 1);
      if (nextCountdown > 0) {
        this.setData({ refreshCountdown: nextCountdown });
        return;
      }
      this.setData({ refreshCountdown: autoRefreshSeconds });
      this.loadStatus({ silent: true });
    }, 1000);
  },

  stopAutoRefresh() {
    if (!this.statusRefreshTimer) return;
    clearInterval(this.statusRefreshTimer);
    this.statusRefreshTimer = null;
  },

  async loadStatus(options = {}) {
    if (this.data.loading) return;
    this.setData({ loading: !options.silent, refreshing: true, error: '' });
    try {
      const data = await fetchStatusSummary();
      const componentMap = {};
      (data.components || []).forEach((item) => {
        componentMap[item.id] = translateComponent(item);
      });

      const componentGroups = (data.components || [])
        .filter((item) => Array.isArray(item.components) && item.components.length)
        .map((item) => ({
          ...componentMap[item.id],
          children: item.components.map((id) => componentMap[id]).filter(Boolean),
        }));

      const components = (data.components || [])
        .filter((item) => !item.group_id && !(Array.isArray(item.components) && item.components.length))
        .map((item) => componentMap[item.id]);

      this.setData({
        pageStatus: data.status || null,
        pageStatusText: pageStatusText(data.status),
        pageStatusClass: pageStatusClass(data.status),
        components,
        componentGroups,
        incidents: (data.incidents || []).map(formatIncident),
        maintenances: (data.scheduled_maintenances || []).map(formatMaintenance),
        loading: false,
        refreshing: false,
      });
    } catch (error) {
      this.setData({
        loading: false,
        refreshing: false,
        error: toDisplayError(error, '服务状态加载失败'),
      });
    }
  },

  toggleGroup(event) {
    const index = Number(event.currentTarget.dataset.index);
    this.setData({
      [`componentGroups[${index}].expanded`]: !this.data.componentGroups[index].expanded,
    });
  },

  onShareAppMessage() {
    return {
      title: 'MTGA服务状态 - 十七地小助手',
      path: '/pages/status/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: 'MTGA服务状态 - 十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },
});
