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
  lastUpdated: '2024/12/23',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/mtg-arena-announcements-december-23-2024#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '万智牌：基石构筑幻影现开',
    startTime: new Date('2024-12-31T14:00:00-08:00'),
    endTime: new Date('2025-01-02T14:00:00-08:00'),
    format: '现开',
  },
  {
    type: 'midweek_magic',
    title: '先驱大师幻影现开（含全部奖励列表！）',
    startTime: new Date('2025-01-07T14:00:00-08:00'),
    endTime: new Date('2025-01-09T14:00:00-08:00'),
    format: '现开',
  },
  {
    type: 'midweek_magic',
    title: '莫秘维',
    startTime: new Date('2025-01-14T14:00:00-08:00'),
    endTime: new Date('2025-01-16T14:00:00-08:00'),
    format: '莫秘维',
  },
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
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2024-11-12T08:00:00-08:00'),
    endTime: new Date('2025-02-11T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft', 
    title: '先驱大师 - 奖励列表：咒语',
    startTime: new Date('2024-12-24T08:00:00-08:00'),
    endTime: new Date('2025-01-07T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '先驱大师 - 奖励列表：献力',
    startTime: new Date('2025-01-07T08:00:00-08:00'), 
    endTime: new Date('2025-01-21T08:00:00-08:00'),
    format: '竞技轮抽',
  },
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
    title: '万智牌：基石构筑',
    startTime: new Date('2024-12-22T08:00:00-08:00'),
    endTime: new Date('2025-01-04T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-01-04T08:00:00-08:00'),
    endTime: new Date('2025-01-18T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '艾卓仙踪',
    startTime: new Date('2025-01-18T08:00:00-08:00'),
    endTime: new Date('2025-02-01T08:00:00-08:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '标准环境挑战赛',
    startTime: new Date('2025-01-03T08:00:00-08:00'),
    endTime: new Date('2025-01-05T08:00:00-08:00'),
    format: '标准',
  },
  {
    type: 'other',
    title: '基石构筑全知全能轮抽',
    startTime: new Date('2025-01-03T08:00:00-08:00'),
    endTime: new Date('2025-01-06T08:00:00-08:00'),
    format: '轮抽',
  },
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-01-18T06:00:00-08:00'),
    endTime: new Date('2025-01-19T03:00:00-08:00'),
    format: '探险',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
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

const arenaOpenEvents: Event[] = [
  {
    type: 'arena_open',
    title: '竞技场公开赛 - 先驱大师 奖励列表：献力 - 第一天',
    startTime: new Date('2025-01-11T06:00:00-08:00'),
    endTime: new Date('2025-01-12T03:00:00-08:00'),
    format: '先驱大师现开',
    description: '第一天比赛采用现开赛制，可选择BO1或BO3模式参赛。',
  },
  {
    type: 'arena_open',
    title: '竞技场公开赛 - 先驱大师 奖励列表：献力 - 第二天',
    startTime: new Date('2025-01-12T06:00:00-08:00'),
    endTime: new Date('2025-01-12T08:00:00-08:00'),
    format: '先驱大师轮抽',
    description: '第二天比赛采用BO3轮抽赛制，仅限第一天晋级选手参加。',
  },
];

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