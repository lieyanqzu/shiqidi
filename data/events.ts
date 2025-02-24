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
  lastUpdated: '2025/02/24',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-february-24-2025#schedule',
};

const midweekMagicEvents: Event[] = [
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
    startTime: new Date('2025-03-11T14:00:00-07:00'),
    endTime: new Date('2025-03-13T14:00:00-07:00'),
    format: '炼金',
    description: '先手玩家第一块地须横置进场',
  },
  {
    type: 'midweek_magic',
    title: '标准倾曳',
    startTime: new Date('2025-03-18T14:00:00-07:00'),
    endTime: new Date('2025-03-20T14:00:00-07:00'),
    format: '标准',
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '乙太飘移',
    startTime: new Date('2025-02-11T08:00:00-08:00'),
    endTime: new Date('2025-04-08T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-03-04T08:00:00-08:00'),
    endTime: new Date('2025-03-09T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '炼金：乙太飘移',
    startTime: new Date('2025-03-04T08:00:00-08:00'),
    endTime: new Date('2025-03-18T08:00:00-07:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '乙太飘移',
    startTime: new Date('2025-02-25T08:00:00-08:00'),
    endTime: new Date('2025-03-07T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2025-03-07T08:00:00-08:00'),
    endTime: new Date('2025-03-18T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '竞技场直邮赛 - 暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-03-07T08:00:00-08:00'),
    endTime: new Date('2025-03-10T11:00:00-07:00'),
    format: '轮抽',
    description: '赛制：暮悲邸：鬼屋惊魂轮抽BO1，6胜或2负出局。奖励：6胜获得2盒暮悲邸：鬼屋惊魂常规补充包。',
  },
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-03-15T06:00:00-07:00'),
    endTime: new Date('2025-03-16T03:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '额外资格赛入围赛BO1',
    startTime: new Date('2025-03-16T05:00:00-07:00'),
    endTime: new Date('2025-03-17T05:00:00-07:00'),
    format: '乙太飘移现开',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-03-21T06:00:00-07:00'),
    endTime: new Date('2025-03-22T03:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-03-22T06:00:00-07:00'),
    endTime: new Date('2025-03-23T16:00:00-07:00'),
    format: '标准',
    description: '两日赛事，获胜者将获得参加即将到来的竞技场冠军赛的资格。请记得在比赛开始前领取通过赛季奖励获得的参赛券。',
  },
];

const arenaOpenEvents: Event[] = [
  {
    type: 'arena_open',
    title: '竞技场公开赛：乙太飘移',
    startTime: new Date('2025-03-01T06:00:00-08:00'),
    endTime: new Date('2025-03-02T08:00:00-08:00'),
    format: '乙太飘移现开/轮抽',
    description: '第一天：乙太飘移现开（BO1和BO3），第二天：乙太飘移轮抽（BO3）。参赛奖励：五彩玛珂牌套。',
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