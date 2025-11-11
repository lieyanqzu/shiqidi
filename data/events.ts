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
  lastUpdated: '2025/11/10',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-november-10-2025#Events',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '穿越预兆路幻影人机轮抽',
    startTime: new Date('2025-11-11T14:00:00-08:00'),
    endTime: new Date('2025-11-13T14:00:00-08:00'),
    format: '幻影人机轮抽'
  },
  {
    type: 'midweek_magic',
    title: '投身万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-11-18T14:00:00-08:00'),
    endTime: new Date('2025-11-20T14:00:00-08:00'),
    format: '速学！'
  },
  {
    type: 'midweek_magic',
    title: '基石构筑 + 万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-11-25T14:00:00-08:00'),
    endTime: new Date('2025-11-27T14:00:00-08:00'),
    format: '构筑'
  },
  {
    type: 'midweek_magic',
    title: '万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-12-02T14:00:00-08:00'),
    endTime: new Date('2025-12-04T14:00:00-08:00'),
    format: '构筑(?)'
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '穿越预兆路',
    startTime: new Date('2025-09-23T08:00:00-07:00'),
    endTime: new Date('2025-11-18T08:00:00-08:00'),
    format: '选两张轮抽 & 三盘选两张轮抽',
  },
  {
    type: 'premier_draft',
    title: '竞技场强化方盒轮抽',
    startTime: new Date('2025-10-28T08:00:00-07:00'),
    endTime: new Date('2025-11-18T08:00:00-08:00'),
    format: '竞技轮抽 & 三盘轮抽',
    description: '幻影活动，五胜及以上奖励补充包含有至少两张稀有卡牌',
  },
  {
    type: 'premier_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2025-11-04T08:00:00-08:00'),
    endTime: new Date('2025-11-11T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '神河：霓朝纪',
    startTime: new Date('2025-11-11T08:00:00-08:00'),
    endTime: new Date('2025-11-18T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-11-18T08:00:00-08:00'),
    endTime: new Date('2026-01-20T08:00:00-08:00'),
    format: '竞技轮抽',
  }
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '穿越预兆路',
    startTime: new Date('2025-10-28T08:00:00-07:00'),
    endTime: new Date('2025-11-11T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-11-11T08:00:00-08:00'),
    endTime: new Date('2025-11-27T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '降世神通：最后的气宗',
    startTime: new Date('2025-11-27T08:00:00-08:00'),
    endTime: new Date('2025-12-09T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '依夏兰迷窟',
    startTime: new Date('2025-12-09T08:00:00-08:00'),
    endTime: new Date('2026-12-15T08:00:00-08:00'),
    format: '快速轮抽',
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '先驱环境挑战赛',
    startTime: new Date('2025-11-14T08:00:00-08:00'),
    endTime: new Date('2025-11-17T16:00:00-08:00'),
    format: '三盘先驱',
  }
];

const arenaOpenEvents: Event[] = [];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 神河：霓朝纪现开（轮抽补充包）',
    startTime: new Date('2025-11-14T08:00:00-07:00'),
    endTime: new Date('2025-11-17T08:00:00-08:00'),
    format: '神河：霓朝纪现开'
  }
];

const premierPlayEvents: Event[] = [
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


