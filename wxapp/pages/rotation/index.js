const { dateText, parseDate } = require('../../utils/format');
const { fetchChineseSetNames } = require('../../utils/api');
const { loadKeyruneFont } = require('../../utils/font');
const { getSetIconGlyph } = require('../../data/set-icons');
const { previewImages } = require('../../utils/wx-actions');
const { toDisplayError } = require('../../utils/display-error');
const { fetchRemoteData } = require('../../utils/remote-data');
const { generatePageShareImage } = require('../../utils/share-image');

let rotation = {
  sets: [],
  bans: [],
};

const quarterMap = {
  Q1: '第一季度',
  Q2: '第二季度',
  Q3: '第三季度',
  Q4: '第四季度',
};

const monthMap = {
  January: '1月',
  February: '2月',
  March: '3月',
  April: '4月',
  May: '5月',
  June: '6月',
  July: '7月',
  August: '8月',
  September: '9月',
  October: '10月',
  November: '11月',
  December: '12月',
};

const monthIndex = Object.keys(monthMap).reduce((map, month, index) => {
  map[month] = index;
  return map;
}, {});

function formatRoughDate(value) {
  const text = String(value || '');
  const quarterMatch = text.match(/^(Q[1-4])\s+(\d{4})$/);
  if (quarterMatch) return `${quarterMatch[2]}年${quarterMap[quarterMatch[1]]}`;

  const monthMatch = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthMatch) return `${monthMatch[2]}年${monthMap[monthMatch[1]] || monthMatch[1]}`;

  return text || '待定';
}

function parseRoughDate(value) {
  const text = String(value || '');
  const quarterMatch = text.match(/^Q([1-4])\s+(\d{4})$/);
  if (quarterMatch) {
    const quarter = Number(quarterMatch[1]);
    const year = Number(quarterMatch[2]);
    return new Date(year, (quarter - 1) * 3 + 1, 15);
  }

  const monthMatch = text.match(/^([A-Za-z]+)\s+(\d{4})$/);
  if (monthMatch && monthIndex[monthMatch[1]] !== undefined) {
    return new Date(Number(monthMatch[2]), monthIndex[monthMatch[1]], 15);
  }

  return null;
}

function formatRotationDate(date, roughDate) {
  if (date) return dateText(date);
  return formatRoughDate(roughDate);
}

function dateForSort(date, roughDate) {
  if (date) return parseDate(date);
  return parseRoughDate(roughDate) || new Date(8640000000000000);
}

function timeLeft(date, roughDate) {
  const target = dateForSort(date, roughDate);
  if (!target || Number.isNaN(target.getTime())) return '待定';
  const days = Math.ceil((target.getTime() - Date.now()) / (24 * 60 * 60 * 1000));
  if (days < 0) return '已过期';
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days <= 30) return `${days} 天后`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} 个月后`;
  const years = Math.floor(months / 12);
  const restMonths = months % 12;
  return restMonths ? `${years} 年 ${restMonths} 个月后` : `${years} 年后`;
}

function formatSet(set) {
  const code = set.code || '';
  const digitalCode = set.digital_code || '';
  return {
    ...set,
    displayName: set.name || set.codename || set.code || '未知系列',
    localizedName: set.name || set.codename || set.code || '未知系列',
    digitalDisplayText: set.digital_name || '',
    setGlyph: getSetIconGlyph(code),
    digitalGlyph: getSetIconGlyph(digitalCode),
    enterText: formatRotationDate(set.enter_date, set.rough_enter_date),
    exitText: formatRotationDate(set.exit_date, set.rough_exit_date),
    timeLeftText: timeLeft(set.enter_date, set.rough_enter_date),
    universesBeyond: !!set.universes_beyond,
    hasDigital: !!(set.digital_name && set.digital_code),
  };
}

function groupCurrentSets(sets) {
  const groups = {};
  sets.forEach((set) => {
    const key = set.exit_date || set.rough_exit_date || 'unknown';
    if (!groups[key]) {
      groups[key] = {
        key,
        exitDate: set.exit_date || null,
        roughExitDate: set.rough_exit_date || null,
        sortDate: dateForSort(set.exit_date, set.rough_exit_date).getTime(),
        sets: [],
      };
    }
    groups[key].sets.push(formatSet(set));
  });

  return Object.keys(groups)
    .map((key) => groups[key])
    .sort((a, b) => a.sortDate - b.sortDate)
    .map((group, index) => ({
      ...group,
      title: `${formatRotationDate(group.exitDate, group.roughExitDate)} 轮替`,
      timeLeftText: timeLeft(group.exitDate, group.roughExitDate),
      isNext: index === 0,
      sets: group.sets.sort((a, b) => parseDate(a.enter_date) - parseDate(b.enter_date)),
    }));
}

function normalizeSetCode(code) {
  const text = String(code || '');
  return text.includes(':') ? text.split(':')[0] : text;
}

function applySetNamesToSet(set, names) {
  return {
    ...set,
    localizedName: names[set.code] || set.displayName,
    digitalDisplayText: names[set.digital_code] || set.digital_name || '',
  };
}

function applySetNames(currentGroups, upcomingSets, names) {
  return {
    currentGroups: currentGroups.map((group) => ({
      ...group,
      sets: group.sets.map((set) => applySetNamesToSet(set, names)),
    })),
    upcomingSets: upcomingSets.map((set) => applySetNamesToSet(set, names)),
  };
}

Page({
  data: {
    currentGroups: [],
    upcomingSets: [],
    bans: [],
    setNameLoading: false,
    setNameError: '',
    setIconFontReady: false,
    loading: true,
    error: '',
    shareImageUrl: '',
  },

  async onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    this.loadSetIconFont();
    try {
      rotation = await fetchRemoteData('rotation');
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '轮替数据加载失败'),
      });
      return;
    }
    const now = new Date();
    const currentSets = rotation.sets
      .filter((set) => parseDate(set.enter_date) <= now && (!set.exit_date || parseDate(set.exit_date) > now));
    const currentGroups = groupCurrentSets(currentSets);
    const upcomingSets = rotation.sets
      .filter((set) => parseDate(set.enter_date) > now)
      .slice(0, 8)
      .map(formatSet);
    const standardSetCodes = {};
    currentGroups.forEach((group) => {
      group.sets.forEach((set) => {
        if (set.code) standardSetCodes[set.code] = true;
      });
    });
    const bans = (rotation.bans || []).map((ban) => ({
      ...ban,
      setGlyph: getSetIconGlyph(normalizeSetCode(ban.set_code)),
      imageFailed: false,
    })).filter((ban) => standardSetCodes[normalizeSetCode(ban.set_code)]);
    this.setData({ currentGroups, upcomingSets, bans, loading: false, error: '' });
    this.loadChineseSetNames();
    this.prepareShareImage();
  },

  async prepareShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: '标准轮替日程',
        subtitle: '万智日程',
        description: '了解标准赛制的系列轮替时间表',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  loadSetIconFont() {
    loadKeyruneFont(() => {
      this.setData({ setIconFontReady: true });
    });
  },

  async loadChineseSetNames() {
    this.setData({ setNameLoading: true, setNameError: '' });
    try {
      const response = await fetchChineseSetNames();
      const names = {};
      (response || []).forEach((item) => {
        if (item && item.code && item.translated_name) {
          names[item.code] = item.translated_name;
        }
      });
      const named = applySetNames(this.data.currentGroups, this.data.upcomingSets, names);
      this.setData({
        ...named,
        setNameLoading: false,
      });
    } catch (error) {
      this.setData({
        setNameLoading: false,
        setNameError: toDisplayError(error, '系列中文名加载失败'),
      });
    }
  },

  previewBanImage(event) {
    const { url } = event.currentTarget.dataset;
    if (!url) return;
    const urls = this.data.bans
      .filter((ban) => !ban.imageFailed)
      .map((ban) => ban.card_image_url)
      .filter(Boolean);
    previewImages(url, urls);
  },

  handleBanImageError(event) {
    const { index } = event.currentTarget.dataset;
    if (index === undefined) return;
    this.setData({
      [`bans[${index}].imageFailed`]: true,
    });
  },

  onShareAppMessage() {
    return {
      title: '标准轮替日程 - 十七地小助手',
      path: '/pages/rotation/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: '标准轮替日程 - 十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },
});
