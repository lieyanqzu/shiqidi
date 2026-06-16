const { parseDate, dateText } = require('../../utils/format');
const { addPhoneCalendarEvent, copyText } = require('../../utils/wx-actions');
const { canvasToTempFilePath, createCanvasContext } = require('../../utils/canvas');
const { fetchRemoteData } = require('../../utils/remote-data');
const { toDisplayError } = require('../../utils/display-error');
const { generatePageShareImage } = require('../../utils/share-image');

let calendar = {
  metadata: {},
  events: [],
  sections: [],
};

const fallbackTypeLabels = {
  midweek_magic: '周中万智牌',
  premier_draft: '竞技轮抽',
  quick_draft: '快速轮抽',
  other: '其他活动',
  premier_play: '竞技赛事',
  arena_direct: '竞技场直邮赛',
  arena_championship: '竞技场冠军赛',
};

const typeVisuals = {
  midweek_magic: { tone: 'midweek' },
  premier_draft: { tone: 'premier' },
  quick_draft: { tone: 'quick' },
  other: { tone: 'other' },
  premier_play: { tone: 'play' },
  arena_direct: { tone: 'direct' },
  arena_championship: { tone: 'championship' },
};

const fallbackSectionDefinitions = [
  {
    type: 'midweek_magic',
    title: '周中万智牌',
    description: '周中万智牌活动通常在每周三开放，周五停止参加。',
  },
  {
    type: 'premier_draft',
    title: '竞技轮抽',
    description: '与其他牌手一同进行轮抽，有抽选时间限制。',
  },
  {
    type: 'quick_draft',
    title: '快速轮抽',
    description: '与 AI 一同进行轮抽，无需等待，没有抽选时间限制。',
  },
  {
    type: 'other',
    title: '其他活动',
    description: '',
  },
  {
    type: 'arena_direct',
    title: '竞技场直邮赛',
    description: '参加赛事竞夺实体奖励，限制地区以官方公告为准。',
    groupText: '竞技赛程',
  },
  {
    type: 'premier_play',
    title: '资格赛',
    description: '资格赛和竞技比赛日程。',
    groupText: '竞技赛程',
  },
  {
    type: 'arena_championship',
    title: '竞技场冠军赛',
    description: '竞技场冠军赛是线上邀请赛，参赛资格通过资格赛周末活动获得。',
    groupText: '竞技赛程',
  },
];

const allTypeOption = { label: '全部活动', value: '' };
const defaultAlarmOffset = -3600;
const shareImageUrl = '';
const shareCanvas = {
  id: 'eventShareCanvas',
  width: 600,
  height: 480,
};

const toneColors = {
  midweek: '#7c3aed',
  premier: '#0f5ce8',
  quick: '#16a34a',
  other: '#64748b',
  play: '#d97706',
  direct: '#be185d',
  championship: '#ca8a04',
};

function normalizeCalendarEvent(event, type) {
  return {
    ...(event || {}),
    type: (event && event.type) || type || 'other',
  };
}

function collectCalendarGroup(group, parentTitle, sections, events) {
  if (!group || !group.id) return;
  const type = group.id;
  const title = group.title || fallbackTypeLabels[type] || type;
  const groupEvents = Array.isArray(group.events) ? group.events : [];

  if (groupEvents.length) {
    const section = {
      type,
      title,
      description: group.description || '',
    };
    if (parentTitle) section.groupText = parentTitle;
    sections.push(section);
    groupEvents.forEach((event) => {
      events.push(normalizeCalendarEvent(event, type));
    });
  }

  (Array.isArray(group.groups) ? group.groups : []).forEach((child) => {
    collectCalendarGroup(child, title, sections, events);
  });
}

function buildLegacySections(events) {
  const typeValues = Array.from(new Set((events || []).map((event) => event.type || 'other')));
  const ordered = fallbackSectionDefinitions.filter((section) => typeValues.includes(section.type));
  const knownTypes = new Set(ordered.map((section) => section.type));
  const extra = typeValues
    .filter((type) => !knownTypes.has(type))
    .map((type) => ({
      type,
      title: fallbackTypeLabels[type] || type,
      description: '',
    }));
  return ordered.concat(extra);
}

function normalizeCalendarData(data) {
  const source = data || {};
  const events = [];
  let sections = [];

  if (Array.isArray(source.groups) && source.groups.length) {
    source.groups.forEach((group) => {
      collectCalendarGroup(group, '', sections, events);
    });
  } else {
    (Array.isArray(source.events) ? source.events : []).forEach((event) => {
      events.push(normalizeCalendarEvent(event, event && event.type));
    });
    sections = buildLegacySections(events);
  }

  return {
    metadata: source.metadata || {},
    groups: source.groups || [],
    events,
    sections,
  };
}

function getTypeLabel(type) {
  const section = (calendar.sections || []).find((item) => item.type === type);
  return (section && section.title) || fallbackTypeLabels[type] || type;
}

function pad(value) {
  return String(value).padStart(2, '0');
}

function dateTimeText(value) {
  if (!value) return '未知';
  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value);
  return `${date.getMonth() + 1}月${date.getDate()}日 ${pad(date.getHours())}:${pad(date.getMinutes())}`;
}

function buildStatus(event) {
  const now = Date.now();
  const start = parseDate(event.startTime).getTime();
  const end = parseDate(event.endTime).getTime();
  const day = 24 * 60 * 60 * 1000;
  const hour = 60 * 60 * 1000;

  if (now > end) {
    return {
      statusText: '已结束',
      statusClass: 'ended',
      timeHint: `已于 ${dateTimeText(event.endTime)} 结束`,
      canAddCalendar: false,
      calendarActionText: '活动已结束',
    };
  }

  if (now < start) {
    const hoursToStart = Math.ceil((start - now) / hour);
    if (hoursToStart <= 24) {
      return {
        statusText: hoursToStart <= 1 ? '即将开始' : `${hoursToStart} 小时后开始`,
        statusClass: 'soon',
        timeHint: `${dateTimeText(event.startTime)} 至 ${dateTimeText(event.endTime)}`,
        canAddCalendar: true,
        calendarActionText: '添加到日历',
      };
    }
    return {
      statusText: `${Math.ceil((start - now) / day)} 天后开始`,
      statusClass: 'upcoming',
      timeHint: `${dateTimeText(event.startTime)} 至 ${dateTimeText(event.endTime)}`,
      canAddCalendar: true,
      calendarActionText: '添加到日历',
    };
  }

  const hoursLeft = Math.ceil((end - now) / hour);
  if (hoursLeft <= 24) {
    return {
      statusText: hoursLeft <= 1 ? '即将结束' : `${hoursLeft} 小时后结束`,
      statusClass: 'ending',
      timeHint: `${dateTimeText(event.startTime)} 至 ${dateTimeText(event.endTime)}`,
      canAddCalendar: false,
      calendarActionText: '活动已开始',
    };
  }

  return {
    statusText: `剩余 ${Math.ceil((end - now) / day)} 天`,
    statusClass: 'active',
    timeHint: `${dateTimeText(event.startTime)} 至 ${dateTimeText(event.endTime)}`,
    canAddCalendar: false,
    calendarActionText: '活动已开始',
  };
}

function formatEvent(event) {
  const status = buildStatus(event);
  const visual = typeVisuals[event.type] || { tone: 'other' };
  return {
    ...event,
    key: `${event.type}-${event.title}-${event.startTime}`,
    typeText: getTypeLabel(event.type),
    typeTone: visual.tone,
    ...status,
    startText: dateText(event.startTime),
    endText: dateText(event.endTime),
    timeText: `${dateTimeText(event.startTime)} 至 ${dateTimeText(event.endTime)}`,
  };
}

function buildTypeOptions(typeValues) {
  const orderedTypes = (calendar.sections || []).map((section) => section.type);
  const sortedTypeValues = orderedTypes
    .filter((type) => typeValues.includes(type))
    .concat(typeValues.filter((type) => !orderedTypes.includes(type)));
  const counts = {};
  calendar.events.forEach((event) => {
    counts[event.type] = (counts[event.type] || 0) + 1;
  });
  return [allTypeOption].concat(sortedTypeValues.map((value) => {
    const visual = typeVisuals[value] || { tone: 'other' };
    return {
      value,
      label: getTypeLabel(value),
      count: counts[value] || 0,
      tone: visual.tone,
      active: false,
    };
  }));
}

function decorateTypeOptions(options, selectedIndex) {
  return options.map((item, index) => ({
    ...item,
    active: index === selectedIndex,
    tone: item.tone || 'all',
    count: item.value ? item.count : calendar.events.length,
  }));
}

Page({
  data: {
    metadata: calendar.metadata,
    typeOptions: [allTypeOption],
    typeIndex: 0,
    sections: [],
    totalCount: 0,
    loading: true,
    error: '',
    actionSheetVisible: false,
    selectedEvent: null,
    selectedShareImage: shareImageUrl,
    pageShareImageUrl: '',
  },

  async onLoad(options = {}) {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    try {
      calendar = normalizeCalendarData(await fetchRemoteData('events'));
      const typeValues = Array.from(new Set(calendar.events.map((event) => event.type)));
      const typeOptions = buildTypeOptions(typeValues);
      const sharedType = options.type ? decodeURIComponent(options.type) : '';
      const sharedTypeIndex = typeOptions.findIndex((option) => option.value === sharedType);
      const typeIndex = sharedTypeIndex > 0 ? sharedTypeIndex : 0;
      this.setData({
        loading: false,
        error: '',
        metadata: calendar.metadata,
        typeIndex,
        typeOptions: decorateTypeOptions(typeOptions, typeIndex),
      }, () => this.applyFilter());
    } catch (error) {
      this.setData({
        loading: false,
        error: toDisplayError(error, '活动日历数据加载失败'),
      });
    }
    this.preparePageShareImage();
  },

  async preparePageShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: '活动日历',
        subtitle: '万智日程',
        description: '查看MTGA的活动排期和赛制安排',
      });
      this.setData({ pageShareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成页面分享图失败', error);
    }
  },

  onTypeChange(event) {
    this.updateTypeIndex(Number(event.detail.value));
  },

  selectType(event) {
    this.updateTypeIndex(Number(event.currentTarget.dataset.index));
  },

  updateTypeIndex(typeIndex) {
    this.setData({
      typeIndex,
      typeOptions: decorateTypeOptions(this.data.typeOptions, typeIndex),
    }, () => this.applyFilter());
  },

  applyFilter() {
    const selectedOption = this.data.typeOptions[this.data.typeIndex] || allTypeOption;
    const selectedType = selectedOption.value;
    const definitions = (calendar.sections || []).concat(
      this.data.typeOptions
        .filter((option) => option.value && !(calendar.sections || []).some((section) => section.type === option.value))
        .map((option) => ({
          type: option.value,
          title: option.label,
          description: '',
        }))
    );
    const sections = definitions
      .filter((section) => !selectedType || section.type === selectedType)
      .map((section) => {
        const events = calendar.events
          .filter((event) => event.type === section.type)
          .map(formatEvent)
          .sort((a, b) => parseDate(a.startTime) - parseDate(b.startTime));
        return {
          ...section,
          events,
          count: events.length,
        };
      })
      .filter((section) => section.count);
    const totalCount = sections.reduce((sum, section) => sum + section.count, 0);
    this.setData({ sections, totalCount });
  },

  handleEventTap(event) {
    const item = this.getEventFromDataset(event.currentTarget.dataset);
    if (!item) return;
    this.openEventActions(item);
  },

  noop() {},

  getEventFromDataset(dataset) {
    const { sectionIndex, eventIndex } = dataset;
    const section = this.data.sections[Number(sectionIndex)];
    return section && section.events[Number(eventIndex)];
  },

  openEventActions(item) {
    this.setData({
      actionSheetVisible: true,
      selectedEvent: item,
      selectedShareImage: shareImageUrl,
    }, () => {
      this.prepareEventShareImage(item);
    });
  },

  closeEventActions() {
    this.setData({
      actionSheetVisible: false,
      selectedEvent: null,
      selectedShareImage: shareImageUrl,
    });
  },

  buildEventNotes(item) {
    return [
      `类型：${item.typeText}`,
      item.format ? `赛制：${item.format}` : '',
      item.description ? `说明：${item.description}` : '',
    ].filter(Boolean).join('\n');
  },

  addEventToCalendar(item) {
    if (!item.canAddCalendar) return;

    const payload = {
      title: `MTGA：${item.title}`,
      startTime: Math.floor(parseDate(item.startTime).getTime() / 1000),
      endTime: Math.floor(parseDate(item.endTime).getTime() / 1000),
      notes: this.buildEventNotes(item),
      alarmOffset: defaultAlarmOffset,
    };
    addPhoneCalendarEvent(payload);
    this.closeEventActions();
  },

  addSelectedEventToCalendar() {
    const item = this.data.selectedEvent;
    if (!item) return;
    this.addEventToCalendar(item);
  },

  buildEventInfoText(item) {
    return [
      item.title,
      `时间：${item.timeText}`,
      `状态：${item.statusText}`,
      this.buildEventNotes(item),
    ].filter(Boolean).join('\n');
  },

  copySelectedEventInfo() {
    const item = this.data.selectedEvent;
    if (!item) return;
    copyText(this.buildEventInfoText(item), '活动信息已复制', '活动信息复制失败');
    this.closeEventActions();
  },

  buildSharePath(item) {
    if (!item || !item.type) return '/pages/calendar/index';
    return `/pages/calendar/index?type=${encodeURIComponent(item.type)}`;
  },

  drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    const source = String(text || '').trim();
    if (!source) return y;
    let line = '';
    let currentY = y;
    let lines = 0;
    for (let index = 0; index < source.length; index += 1) {
      const nextLine = line + source[index];
      if (ctx.measureText(nextLine).width > maxWidth && line) {
        lines += 1;
        const suffix = lines === maxLines && index < source.length ? '...' : '';
        ctx.fillText(`${line}${suffix}`, x, currentY);
        if (lines >= maxLines) return currentY + lineHeight;
        line = source[index];
        currentY += lineHeight;
      } else {
        line = nextLine;
      }
    }
    if (line && lines < maxLines) {
      ctx.fillText(line, x, currentY);
      currentY += lineHeight;
    }
    return currentY;
  },

  prepareEventShareImage(item) {
    const ctx = createCanvasContext(this, shareCanvas.id);
    if (!ctx || !item) return;
    const accent = toneColors[item.typeTone] || '#0f5ce8';
    try {
      ctx.setFillStyle('#f8fafc');
      ctx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(34, 34, 532, 412);
      ctx.setFillStyle(accent);
      ctx.fillRect(34, 34, 10, 412);

      ctx.setFillStyle('#0f172a');
      ctx.setFontSize(28);
      ctx.fillText('十七地 · MTGA 活动', 70, 86);

      ctx.setFillStyle(accent);
      ctx.fillRect(70, 116, 132, 38);
      ctx.setFillStyle('#ffffff');
      ctx.setFontSize(22);
      ctx.fillText(item.typeText, 86, 142);

      ctx.setFillStyle('#e2e8f0');
      ctx.fillRect(218, 116, 132, 38);
      ctx.setFillStyle('#334155');
      ctx.fillText(item.statusText, 234, 142);

      ctx.setFillStyle('#0f172a');
      ctx.setFontSize(36);
      const titleBottom = this.drawWrappedText(ctx, item.title, 70, 210, 460, 60, 2);

      ctx.setFillStyle('#334155');
      ctx.setFontSize(24);
      ctx.fillText(item.timeText, 70, titleBottom + 32);
      if (item.format) {
        ctx.fillText(`赛制：${item.format}`, 70, titleBottom + 70);
      }
      if (item.description) {
        ctx.setFillStyle('#64748b');
        ctx.setFontSize(22);
        this.drawWrappedText(ctx, item.description, 70, titleBottom + (item.format ? 108 : 70), 460, 40, 2);
      }

      ctx.setFillStyle('#94a3b8');
      ctx.setFontSize(20);
      ctx.fillText('打开小程序查看完整日程', 70, 414);
      ctx.draw(false, () => {
        canvasToTempFilePath(this, {
          canvasId: shareCanvas.id,
          width: shareCanvas.width,
          height: shareCanvas.height,
          destWidth: shareCanvas.width,
          destHeight: shareCanvas.height,
          fileType: 'png',
        }, {
          success: (result) => {
            if (result && result.tempFilePath) {
              this.setData({ selectedShareImage: result.tempFilePath });
            }
          },
          fail: () => {
            this.setData({ selectedShareImage: shareImageUrl });
          },
        });
      });
    } catch (error) {
      this.setData({ selectedShareImage: shareImageUrl });
    }
  },

  onShareAppMessage(event) {
    const item = event && event.from === 'button'
      ? (this.getEventFromDataset(event.target.dataset) || this.data.selectedEvent)
      : null;
    if (!item) {
      return {
        title: 'MTGA活动日历 - 十七地小助手',
        path: '/pages/calendar/index',
        imageUrl: this.data.pageShareImageUrl || shareImageUrl,
      };
    }
    return {
      title: `${item.title} · ${item.timeText}`,
      path: this.buildSharePath(item),
      imageUrl: this.data.selectedShareImage || shareImageUrl,
    };
  },

  onShareTimeline() {
    const typeOptions = this.data.typeOptions || [];
    const typeIndex = this.data.typeIndex || 0;
    const currentType = typeOptions[typeIndex];
    const query = currentType && currentType.value ? `type=${encodeURIComponent(currentType.value)}` : '';
    return {
      title: 'MTGA活动日历 - 十七地小助手',
      query,
      imageUrl: this.data.pageShareImageUrl || shareImageUrl,
    };
  },
});
