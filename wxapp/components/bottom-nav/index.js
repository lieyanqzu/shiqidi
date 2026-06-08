const { openPage } = require('../../utils/wx-actions');

const homeUrl = '/pages/index/index';

const navGroups = [
  {
    key: 'home',
    label: '首页',
    url: homeUrl,
    icon: '/assets/icons/home-tab.svg',
    activeIcon: '/assets/icons/home-tab-active.svg',
  },
  {
    key: 'draft',
    label: '轮抽',
    icon: '/assets/icons/cards-tab.svg',
    activeIcon: '/assets/icons/cards-tab-active.svg',
    items: [
      { title: '卡牌数据', url: '/pages/cards/index', icon: '/assets/icons/cards.svg' },
      { title: '赛制速度', url: '/pages/speed/index', icon: '/assets/icons/speed.svg' },
      { title: '色组数据', url: '/pages/colors/index', icon: '/assets/icons/colors.svg' },
    ],
  },
  {
    key: 'schedule',
    label: '日程',
    icon: '/assets/icons/calendar-tab.svg',
    activeIcon: '/assets/icons/calendar-tab-active.svg',
    items: [
      { title: 'MTGA活动日历', url: '/pages/calendar/index', icon: '/assets/icons/calendar.svg' },
      { title: '标准轮替日程', url: '/pages/rotation/index', icon: '/assets/icons/rotation.svg' },
      { title: 'MTGA服务状态', url: '/pages/status/index', icon: '/assets/icons/status.svg' },
      { title: '炼金系列预览', url: '/pages/previews/index', icon: '/assets/icons/previews.svg' },
    ],
  },
  {
    key: 'tools',
    label: '工具',
    icon: '/assets/icons/tools-tab.svg',
    activeIcon: '/assets/icons/tools-tab-active.svg',
    items: [
      { title: '抽卡概率计算器', url: '/pages/hypergeometric/index', icon: '/assets/icons/probability.svg' },
      { title: '精研通行证计算器', url: '/pages/mastery/index', icon: '/assets/icons/mastery.svg' },
      { title: '开包模拟器', url: '/pages/simulator/index', icon: '/assets/icons/simulator.svg' },
    ],
  },
  {
    key: 'about',
    label: '关于',
    url: '/pages/info/index',
    icon: '/assets/icons/about-tab.svg',
    activeIcon: '/assets/icons/about-tab-active.svg',
  },
];

function normalizeUrl(url) {
  const text = String(url || '').trim();
  if (!text) return '';
  return text.startsWith('/') ? text : `/${text}`;
}

function getCurrentUrl() {
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const page = pages[pages.length - 1];
  return page && page.route ? `/${page.route}` : homeUrl;
}

function findGroup(url) {
  const normalizedUrl = normalizeUrl(url);
  return navGroups.find((group) => {
    if (normalizeUrl(group.url) === normalizedUrl) return true;
    return (group.items || []).some((item) => normalizeUrl(item.url) === normalizedUrl);
  }) || navGroups[0];
}

function decorateGroups(currentUrl, openKey = '') {
  const activeGroup = findGroup(currentUrl);
  return navGroups.map((group) => {
    const active = group.key === activeGroup.key;
    return {
      ...group,
      active,
      open: group.key === openKey,
      iconSrc: active ? group.activeIcon : group.icon,
    };
  });
}

function decorateMenuItems(group, currentUrl) {
  const normalizedUrl = normalizeUrl(currentUrl);
  return (group.items || []).map((item) => ({
    ...item,
    active: normalizeUrl(item.url) === normalizedUrl,
  }));
}

Component({
  data: {
    currentUrl: homeUrl,
    groups: decorateGroups(homeUrl),
    menuOpen: false,
    menuGroup: null,
    menuItems: [],
  },

  lifetimes: {
    attached() {
      this.syncCurrent();
    },
  },

  pageLifetimes: {
    show() {
      this.syncCurrent();
    },
  },

  methods: {
    syncCurrent() {
      const currentUrl = getCurrentUrl();
      this.setData({
        currentUrl,
        groups: decorateGroups(currentUrl, this.data.menuOpen && this.data.menuGroup ? this.data.menuGroup.key : ''),
      });
    },

    onNavTap(event) {
      const { key } = event.currentTarget.dataset;
      const group = navGroups.find((item) => item.key === key);
      if (!group) return;

      if (group.url) {
        this.closeMenu();
        openPage(group.url, { navigation: true });
        return;
      }

      if (this.data.menuOpen && this.data.menuGroup && this.data.menuGroup.key === group.key) {
        this.closeMenu();
        return;
      }

      this.setData({
        menuOpen: true,
        menuGroup: group,
        menuItems: decorateMenuItems(group, this.data.currentUrl),
        groups: decorateGroups(this.data.currentUrl, group.key),
      });
    },

    openMenuItem(event) {
      const { url } = event.currentTarget.dataset;
      this.closeMenu();
      openPage(url, { navigation: true });
    },

    closeMenu() {
      this.setData({
        menuOpen: false,
        menuGroup: null,
        menuItems: [],
        groups: decorateGroups(this.data.currentUrl),
      });
    },

    noop() {},
  },
});
