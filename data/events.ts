export interface CalendarMetadata {
  lastUpdated: string;
  announcementUrl: string;
}

export interface Event {
  type: 'midweek_magic' | 'premier_draft' | 'quick_draft' | 'other' | 'premier_play' | 'arena_open' | 'arena_championship';
  title: string;
  startTime: Date;
  endTime: Date;
  format?: string;
  description?: string;
}

export const calendarMetadata: CalendarMetadata = {
  lastUpdated: '2025/01/20',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/mtg-arena-announcements-january-20-2025#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '倾曳争锋',
    startTime: new Date('2025-01-21T14:00:00-08:00'),
    endTime: new Date('2025-01-23T14:00:00-08:00'),
    format: '争锋',
  },
  {
    type: 'midweek_magic',
    title: '史迹纯铁',
    startTime: new Date('2025-01-28T14:00:00-08:00'),
    endTime: new Date('2025-01-30T14:00:00-08:00'),
    format: '史迹',
  },
  {
    type: 'midweek_magic',
    title: '黄金包现开赛',
    startTime: new Date('2025-02-04T14:00:00-08:00'),
    endTime: new Date('2025-02-05T14:00:00-08:00'),
    format: '现开',
  },
  {
    type: 'midweek_magic',
    title: '投身乙太飘移',
    startTime: new Date('2025-02-11T14:00:00-08:00'),
    endTime: new Date('2025-02-12T14:00:00-08:00'),
    format: '预组',
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-01-21T08:00:00-08:00'),
    endTime: new Date('2025-01-28T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '光雷驿镖客',
    startTime: new Date('2025-01-28T08:00:00-08:00'),
    endTime: new Date('2025-02-04T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '邪军压境',
    startTime: new Date('2025-02-04T08:00:00-08:00'),
    endTime: new Date('2025-02-11T08:00:00-08:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '艾卓仙踪',
    startTime: new Date('2025-01-18T08:00:00-08:00'),
    endTime: new Date('2025-02-01T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '班隆洛',
    startTime: new Date('2025-02-01T08:00:00-08:00'),
    endTime: new Date('2025-02-15T08:00:00-08:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '竞技场直邮赛 - 暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-01-24T08:00:00-08:00'),
    endTime: new Date('2025-01-27T08:00:00-08:00'),
    format: '现开',
  },
  {
    type: 'other',
    title: '五彩方盒轮抽',
    startTime: new Date('2025-01-28T08:00:00-08:00'),
    endTime: new Date('2025-02-11T08:00:00-08:00'),
    format: '轮抽',
    description: '提供BO1和BO3两种模式',
  },
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-01-24T06:00:00-08:00'),
    endTime: new Date('2025-01-25T03:00:00-08:00'),
    format: '探险',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-01-25T06:00:00-08:00'),
    endTime: new Date('2025-01-26T16:00:00-08:00'),
    format: '探险',
    description: '两日赛事，获胜者将获得参加即将到来的竞技场冠军赛的资格。',
  },
];

const arenaOpenEvents: Event[] = [];

const arenaChampionshipEvents: Event[] = [];

export const events: Event[] = [
  ...midweekMagicEvents,
  ...premierDraftEvents,
  ...quickDraftEvents,
  ...otherEvents,
  ...premierPlayEvents,
  ...arenaOpenEvents,
  ...arenaChampionshipEvents,
];