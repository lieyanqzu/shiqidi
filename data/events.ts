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
  lastUpdated: '2025/04/07',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-april-7-2025#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '投身鞑契龙岚录',
    startTime: new Date('2025-04-08T14:00:00-07:00'),
    endTime: new Date('2025-04-10T14:00:00-07:00'),
    format: '鞑契龙岚录预组',
  },
  {
    type: 'midweek_magic',
    title: '慢热启动',
    startTime: new Date('2025-04-15T14:00:00-07:00'),
    endTime: new Date('2025-04-17T14:00:00-07:00'),
    format: '标准',
    description: '先手玩家的第一块地须横置进场',
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-04-08T08:00:00-07:00'),
    endTime: new Date('2025-06-10T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '炼金：鞑契',
    startTime: new Date('2025-04-29T08:00:00-07:00'),
    endTime: new Date('2025-05-13T08:00:00-07:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '卡洛夫庄园谋杀案',
    startTime: new Date('2025-04-01T08:00:00-07:00'),
    endTime: new Date('2025-04-17T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-04-17T08:00:00-07:00'),
    endTime: new Date('2025-04-27T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-04-27T08:00:00-07:00'),
    endTime: new Date('2025-05-08T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '鞑契龙岚录现开赛',
    startTime: new Date('2025-04-08T08:00:00-07:00'),
    endTime: new Date('2025-05-01T08:00:00-07:00'),
    format: '现开',
    description: '除常规现开赛外，额外有五个部族主题现开赛',
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-04-04T06:00:00-07:00'),
    endTime: new Date('2025-04-05T03:00:00-07:00'),
    format: '乙太飘移幻影现开',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-04-05T06:00:00-07:00'),
    endTime: new Date('2025-04-06T16:00:00-07:00'),
    format: '乙太飘移幻影现开',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛9的资格。请记得在比赛开始前领取通过赛季奖励获得的参赛券。',
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
