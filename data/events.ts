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
  lastUpdated: '2025/02/17',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-february-17-2025#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '乙太飘移构筑',
    startTime: new Date('2025-02-18T14:00:00-08:00'),
    endTime: new Date('2025-02-20T14:00:00-08:00'),
    format: '乙太飘移',
    description: '只能使用乙太飘移系列卡牌构筑套牌',
  },
  {
    type: 'midweek_magic',
    title: '标准纯普',
    startTime: new Date('2025-02-25T14:00:00-08:00'),
    endTime: new Date('2025-02-27T14:00:00-08:00'),
    format: '标准',
  },
  {
    type: 'midweek_magic',
    title: '进入未来',
    startTime: new Date('2025-03-04T14:00:00-08:00'),
    endTime: new Date('2025-03-06T14:00:00-08:00'),
    format: '炼金：乙太漂移预组',
  },
    {
    type: 'midweek_magic',
    title: '慢启动',
    startTime: new Date('2025-03-11T14:00:00-08:00'),
    endTime: new Date('2025-03-13T14:00:00-08:00'),
    format: '可能为炼金',
    description: '先手玩家第一块地须横置进场',
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '乙太飘移',
    startTime: new Date('2025-02-11T08:00:00-08:00'),
    endTime: new Date('2025-04-08T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '炼金：乙太飘移',
    startTime: new Date('2025-03-04T08:00:00-08:00'),
    endTime: new Date('2025-03-18T08:00:00-08:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '光雷驿镖客',
    startTime: new Date('2025-02-16T08:00:00-08:00'),
    endTime: new Date('2025-02-25T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '乙太飘移',
    startTime: new Date('2025-02-25T08:00:00-08:00'),
    endTime: new Date('2025-03-07T08:00:00-08:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '史迹环境挑战赛',
    startTime: new Date('2025-02-21T08:00:00-08:00'),
    endTime: new Date('2025-02-23T08:00:00-08:00'),
    format: '史迹',
  },
  {
    type: 'other',
    title: '竞技场直邮赛 - 乙太飘移',
    startTime: new Date('2025-02-21T08:00:00-08:00'),
    endTime: new Date('2025-02-24T06:00:00-08:00'),
    format: '现开',
    description: '奖励：1盒乙太飘移聚珍补充包',
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