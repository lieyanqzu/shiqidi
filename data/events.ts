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
  lastUpdated: '2025/06/30',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-june-30-2025#Schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '倾曳争锋',
    startTime: new Date('2025-07-01T14:00:00-07:00'),
    endTime: new Date('2025-07-03T14:00:00-07:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '莫秘维',
    startTime: new Date('2025-07-08T14:00:00-07:00'),
    endTime: new Date('2025-07-10T14:00:00-07:00'),
    format: '莫秘维'
  },
  {
    type: 'midweek_magic',
    title: '幻影黄金现开',
    startTime: new Date('2025-07-15T14:00:00-07:00'),
    endTime: new Date('2025-07-17T14:00:00-07:00'),
    format: '黄金现开'
  },
  {
    type: 'midweek_magic',
    title: '万智牌～最终幻想幻影快速轮抽',
    startTime: new Date('2025-07-22T14:00:00-07:00'),
    endTime: new Date('2025-07-24T14:00:00-07:00'),
    format: '快速轮抽'
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2025-06-10T08:00:00-07:00'),
    endTime: new Date('2025-07-29T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '效忠拉尼卡',
    startTime: new Date('2025-07-08T08:00:00-07:00'),
    endTime: new Date('2025-07-15T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '核心系列2019',
    startTime: new Date('2025-07-15T08:00:00-07:00'),
    endTime: new Date('2025-07-22T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '艾卓王权',
    startTime: new Date('2025-07-22T08:00:00-07:00'),
    endTime: new Date('2025-08-08T08:00:00-07:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '光雷驿镖客',
    startTime: new Date('2025-06-29T08:00:00-07:00'),
    endTime: new Date('2025-07-08T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2025-07-08T08:00:00-07:00'),
    endTime: new Date('2025-07-22T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-07-22T08:00:00-07:00'),
    endTime: new Date('2025-08-08T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '万智牌～最终幻想现开BO1',
    startTime: new Date('2025-06-10T08:00:00-07:00'),
    endTime: new Date('2025-07-04T08:00:00-07:00'),
    format: '现开',
  },
  {
    type: 'other',
    title: '投身万智牌～最终幻想',
    startTime: new Date('2025-06-10T08:00:00-07:00'),
    endTime: new Date('2025-07-15T08:00:00-07:00'),
    format: '速学！',
  },
  {
    type: 'other',
    title: '竞技场直邮赛 - 万智牌～最终幻想现开（常规珍补充包）',
    startTime: new Date('2025-07-04T08:00:00-07:00'),
    endTime: new Date('2025-07-07T08:00:00-07:00'),
    format: '现开',
  },
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-07-12T06:00:00-07:00'),
    endTime: new Date('2025-07-13T03:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得7月19-20日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1（加赛）',
    startTime: new Date('2025-07-13T06:00:00-07:00'),
    endTime: new Date('2025-07-14T03:00:00-07:00'),
    format: '万智牌～最终幻想现开',
    description: '单日赛事，玩家将竞争获得7月19-20日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-07-18T06:00:00-07:00'),
    endTime: new Date('2025-07-19T03:00:00-07:00'),
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
    endTime: new Date('2025-08-17T03:00:00-07:00'),
    format: '现开',
    description: '单日赛事，玩家将竞争获得8月23-24日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-08-22T06:00:00-07:00'),
    endTime: new Date('2025-08-23T03:00:00-07:00'),
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
