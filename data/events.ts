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
  lastUpdated: '2025/01/27',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-january-27-2025#schedule',
};

const midweekMagicEvents: Event[] = [
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
    endTime: new Date('2025-02-06T14:00:00-08:00'),
    format: '现开',
  },
  {
    type: 'midweek_magic',
    title: '投身乙太飘移',
    startTime: new Date('2025-02-11T14:00:00-08:00'),
    endTime: new Date('2025-02-13T14:00:00-08:00'),
    format: '预组',
  },
  {
    type: 'midweek_magic',
    title: '乙太飘移构筑',
    startTime: new Date('2025-02-18T14:00:00-08:00'),
    endTime: new Date('2025-02-20T14:00:00-08:00'),
    format: '乙太飘移',
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
    title: '五彩方盒Cube轮抽',
    startTime: new Date('2025-01-28T08:00:00-08:00'),
    endTime: new Date('2025-02-11T08:00:00-08:00'),
    format: '轮抽',
    description: '提供BO1和BO3两种模式，卡表见https://magic.wizards.com/en/news/mtg-arena/chromatic-cube-draft',
  },
  {
    type: 'other',
    title: '史迹环境挑战赛',
    startTime: new Date('2025-02-21T08:00:00-08:00'),
    endTime: new Date('2025-02-23T08:00:00-08:00'),
    format: '史迹',
  },
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-02-15T06:00:00-08:00'),
    endTime: new Date('2025-02-16T03:00:00-08:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-02-21T06:00:00-08:00'),
    endTime: new Date('2025-02-22T03:00:00-08:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-02-22T06:00:00-08:00'),
    endTime: new Date('2025-02-23T16:00:00-08:00'),
    format: '史迹',
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