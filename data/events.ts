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
  lastUpdated: '2025/05/19',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-may-19-2025#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '角斗聚焦',
    startTime: new Date('2025-05-20T14:00:00-07:00'),
    endTime: new Date('2025-05-22T14:00:00-07:00'),
    format: '角斗'
  },
  {
    type: 'midweek_magic',
    title: '垫脚石现开',
    startTime: new Date('2025-05-27T14:00:00-07:00'),
    endTime: new Date('2025-05-29T14:00:00-07:00'),
    format: '现开',
    description: '22张固定卡池+一张随机金牌+5包补充包'
  },
  {
    type: 'midweek_magic',
    title: '鞑契龙岚录幻影快速轮抽',
    startTime: new Date('2025-06-03T14:00:00-07:00'),
    endTime: new Date('2025-06-05T14:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'midweek_magic',
    title: 'MTG竞技场纯铁',
    startTime: new Date('2025-06-10T14:00:00-07:00'),
    endTime: new Date('2025-06-12T14:00:00-07:00'),
    format: '纯铁'
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
    title: '鞑契可汗',
    startTime: new Date('2025-05-20T08:00:00-07:00'),
    endTime: new Date('2025-05-27T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '核心系列2021',
    startTime: new Date('2025-05-27T08:00:00-07:00'),
    endTime: new Date('2025-06-03T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '混合轮抽',
    startTime: new Date('2025-05-27T08:00:00-07:00'),
    endTime: new Date('2025-06-10T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '神河霓朝纪',
    startTime: new Date('2025-06-03T08:00:00-07:00'),
    endTime: new Date('2025-06-10T08:00:00-07:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-05-08T08:00:00-07:00'),
    endTime: new Date('2025-05-20T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '依夏兰迷窟',
    startTime: new Date('2025-05-20T08:00:00-07:00'),
    endTime: new Date('2025-06-03T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '乙太飘移',
    startTime: new Date('2025-06-03T08:00:00-07:00'),
    endTime: new Date('2025-06-19T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2025-06-19T08:00:00-07:00'),
    endTime: new Date('2025-06-30T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '依夏兰迷窟现开',
    startTime: new Date('2025-05-19T08:00:00-07:00'),
    endTime: new Date('2025-05-27T08:00:00-07:00'),
    format: '现开',
  },
  {
    type: 'other',
    title: '竞技场直邮赛 - 依夏兰迷窟（系列补充包）',
    startTime: new Date('2025-05-23T08:00:00-07:00'),
    endTime: new Date('2025-05-26T08:00:00-07:00'),
    format: '现开',
  },  
  {
    type: 'other',
    title: '史迹环境挑战赛',
    startTime: new Date('2025-06-06T08:00:00-07:00'),
    endTime: new Date('2025-06-09T08:00:00-07:00'),
    format: '史迹',
  },
];

const premierPlayEvents: Event[] = [
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

const arenaOpenEvents: Event[] = [
  {
    type: 'arena_open',
    title: '竞技场公开赛 - 鞑契龙岚录',
    startTime: new Date('2025-05-17T07:00:00-07:00'),
    endTime: new Date('2025-05-18T04:00:00-07:00'),
    format: '限制'
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
