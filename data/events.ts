export interface CalendarMetadata {
  lastUpdated: string;
  announcementUrl: string;
}

export interface Event {
  type: 'midweek_magic' | 'premier_draft' | 'quick_draft' | 'other' | 'premier_play' | 'arena_open' | 'arena_direct' | 'arena_championship';
  title: string;
  startTime: Date;
  endTime: Date;
  format?: string;
  description?: string;
}

export const calendarMetadata: CalendarMetadata = {
  lastUpdated: '2025/10/06',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-october-6-2025',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '莫秘维',
    startTime: new Date('2025-10-07T14:00:00-07:00'),
    endTime: new Date('2025-10-09T14:00:00-07:00'),
    format: '莫秘维'
  },
  {
    type: 'midweek_magic',
    title: '争锋构筑挑战赛：穿越预兆路',
    startTime: new Date('2025-10-14T14:00:00-07:00'),
    endTime: new Date('2025-10-16T14:00:00-07:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '史迹纯普',
    startTime: new Date('2025-10-21T14:00:00-07:00'),
    endTime: new Date('2025-10-23T14:00:00-07:00'),
    format: '史迹纯普'
  },
  {
    type: 'midweek_magic',
    title: '全知全能轮抽',
    startTime: new Date('2025-10-28T14:00:00-07:00'),
    endTime: new Date('2025-10-30T14:00:00-07:00'),
    format: '全知全能轮抽'
  }
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '穿越预兆路',
    startTime: new Date('2025-09-23T08:00:00-07:00'),
    endTime: new Date('2025-11-18T08:00:00-07:00'),
    format: '选两张轮抽 & 三盘选两张轮抽',
  },
  {
    type: 'premier_draft',
    title: '暮悲邸：鬼屋惊魂',
    startTime: new Date('2025-10-07T08:00:00-07:00'),
    endTime: new Date('2025-10-14T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '摩登新篇3',
    startTime: new Date('2025-10-14T08:00:00-07:00'),
    endTime: new Date('2025-10-21T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-10-21T08:00:00-07:00'),
    endTime: new Date('2025-10-28T08:00:00-07:00'),
    format: '竞技轮抽',
  }
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '穿越预兆路',
    startTime: new Date('2025-10-03T08:00:00-07:00'),
    endTime: new Date('2025-10-14T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '虚空边域',
    startTime: new Date('2025-10-14T08:00:00-07:00'),
    endTime: new Date('2025-10-28T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '穿越预兆路',
    startTime: new Date('2025-10-28T08:00:00-07:00'),
    endTime: new Date('2025-11-12T08:00:00-07:00'),
    format: '快速轮抽',
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '穿越预兆路三盘现开',
    startTime: new Date('2025-09-23T08:00:00-07:00'),
    endTime: new Date('2025-10-07T08:00:00-07:00'),
    format: '三盘现开',
  },
  {
    type: 'other',
    title: '穿越预兆路现开',
    startTime: new Date('2025-09-23T08:00:00-07:00'),
    endTime: new Date('2025-10-17T08:00:00-07:00'),
    format: '现开',
  },
  {
    type: 'other',
    title: '标准环境挑战赛',
    startTime: new Date('2025-10-10T08:00:00-07:00'),
    endTime: new Date('2025-10-13T16:00:00-07:00'),
    format: '三盘标准',
  },
  {
    type: 'other',
    title: '争锋环境挑战赛',
    startTime: new Date('2025-10-17T08:00:00-07:00'),
    endTime: new Date('2025-10-20T16:00:00-07:00'),
    format: '争锋',
  },
  {
    type: 'other',
    title: '史迹环境挑战赛',
    startTime: new Date('2025-10-24T08:00:00-07:00'),
    endTime: new Date('2025-10-27T16:00:00-07:00'),
    format: '三盘史迹',
  }
];

const arenaOpenEvents: Event[] = [];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 摩登新篇3现开（日文常规补充包）',
    startTime: new Date('2025-10-17T08:00:00-07:00'),
    endTime: new Date('2025-10-20T16:00:00-07:00'),
    format: '摩登新篇3现开'
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-10-11T06:00:00-07:00'),
    endTime: new Date('2025-10-12T09:00:00-07:00'),
    format: '穿越预兆路现开',
    description: '单日赛事，玩家将竞争获得10月18-19日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-10-17T06:00:00-07:00'),
    endTime: new Date('2025-10-18T07:00:00-07:00'),
    format: '穿越预兆路现开',
    description: '单日赛事，玩家将竞争获得10月18-19日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-10-18T06:00:00-07:00'),
    endTime: new Date('2025-10-19T17:00:00-07:00'),
    format: '穿越预兆路现开',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛11的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-10-25T06:00:00-07:00'),
    endTime: new Date('2025-10-26T09:00:00-07:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得11月1-2日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-10-31T06:00:00-07:00'),
    endTime: new Date('2025-11-01T07:00:00-07:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得11月1-2日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-11-01T06:00:00-07:00'),
    endTime: new Date('2025-11-02T17:00:00-07:00'),
    format: '史迹',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛11的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2025-12-06T06:00:00-08:00'),
    endTime: new Date('2025-12-07T09:00:00-08:00'),
    format: '降世神通：最后的气宗现开',
    description: '单日赛事，玩家将竞争获得12月12-13日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-12-12T06:00:00-08:00'),
    endTime: new Date('2025-12-13T07:00:00-08:00'),
    format: '降世神通：最后的气宗现开',
    description: '单日赛事，玩家将竞争获得12月12-13日资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-12-12T06:00:00-08:00'),
    endTime: new Date('2025-12-13T17:00:00-08:00'),
    format: '降世神通：最后的气宗现开',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛11的资格。',
  }
];

const arenaChampionshipEvents: Event[] = [];

export const events: Event[] = [
  ...midweekMagicEvents,
  ...premierDraftEvents,
  ...quickDraftEvents,
  ...otherEvents,
  ...premierPlayEvents,
  ...arenaOpenEvents,
  ...arenaDirectEvents,
  ...arenaChampionshipEvents,
];


