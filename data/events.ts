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
  lastUpdated: '2025/04/14',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-april-14-2025#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '慢热启动',
    startTime: new Date('2025-04-15T14:00:00-07:00'),
    endTime: new Date('2025-04-17T14:00:00-07:00'),
    format: '炼金',
    description: '先手玩家的第一块地须横置进场',
  },
  {
    type: 'midweek_magic',
    title: '剑走偏锋',
    startTime: new Date('2025-04-22T14:00:00-07:00'),
    endTime: new Date('2025-04-24T14:00:00-07:00'),
    format: '标准',
    description: '只能使用暮悲邸：鬼屋惊魂、乙太飘移和鞑契龙岚录中的牌',
  },
  {
    type: 'midweek_magic',
    title: '步入未来',
    startTime: new Date('2025-04-29T14:00:00-07:00'),
    endTime: new Date('2025-05-01T14:00:00-07:00'),
    format: '炼金预组'
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
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-05-08T08:00:00-07:00'),
    endTime: new Date('2025-05-20T08:00:00-07:00'),
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
  },
  {
    type: 'other',
    title: '标准环境挑战赛',
    startTime: new Date('2025-04-18T08:00:00-07:00'),
    endTime: new Date('2025-04-20T08:00:00-07:00'),
    format: '标准'
  },
  {
    type: 'other',
    title: '竞技场直邮赛 - 鞑契龙岚录',
    startTime: new Date('2025-04-18T08:00:00-07:00'),
    endTime: new Date('2025-04-20T08:00:00-07:00'),
    format: '现开',
    description: '6胜获得1盒鞑契龙岚录聚珍补充包。',
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-05-03T06:00:00-07:00'),
    endTime: new Date('2025-05-04T09:00:00-07:00'),
    format: '炼金',
    description: '单日赛事，玩家将竞争获得5月10-11日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-05-09T06:00:00-07:00'),
    endTime: new Date('2025-05-10T07:00:00-07:00'),
    format: '炼金',
    description: '单日赛事，玩家将竞争获得5月10-11日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-05-10T06:00:00-07:00'),
    endTime: new Date('2025-05-11T16:00:00-07:00'),
    format: '炼金',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛10的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-06-21T06:00:00-07:00'),
    endTime: new Date('2025-06-22T09:00:00-07:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得6月28-29日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-06-27T06:00:00-07:00'),
    endTime: new Date('2025-06-28T07:00:00-07:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得6月28-29日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-06-28T06:00:00-07:00'),
    endTime: new Date('2025-06-29T16:00:00-07:00'),
    format: '史迹',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛10的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-07-12T06:00:00-07:00'),
    endTime: new Date('2025-07-13T09:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得7月19-20日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1（加赛）',
    startTime: new Date('2025-07-13T06:00:00-07:00'),
    endTime: new Date('2025-07-14T09:00:00-07:00'),
    format: '现开',
    description: '单日赛事，玩家将竞争获得7月19-20日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-07-18T06:00:00-07:00'),
    endTime: new Date('2025-07-19T07:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得7月19-20日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-07-19T06:00:00-07:00'),
    endTime: new Date('2025-07-20T16:00:00-07:00'),
    format: '标准',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛10的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-08-16T06:00:00-07:00'),
    endTime: new Date('2025-08-17T09:00:00-07:00'),
    format: '现开',
    description: '单日赛事，玩家将竞争获得8月23-24日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-08-22T06:00:00-07:00'),
    endTime: new Date('2025-08-23T07:00:00-07:00'),
    format: '现开',
    description: '单日赛事，玩家将竞争获得8月23-24日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-08-23T06:00:00-07:00'),
    endTime: new Date('2025-08-24T16:00:00-07:00'),
    format: '限制',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛10的资格。',
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
