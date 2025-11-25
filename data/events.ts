export interface CalendarMetadata {
  lastUpdated: string;
  announcementUrl: string;
}

export interface Event {
  type: 'midweek_magic' | 'premier_draft' | 'quick_draft' | 'other' | 'premier_play' | 'arena_direct' | 'arena_championship';
  title: string;
  startTime: Date;
  endTime: Date;
  format?: string;
  description?: string;
}

export const calendarMetadata: CalendarMetadata = {
  lastUpdated: '2025/11/24',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-november-24-2025#Events',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '基石构筑 + 万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-11-25T14:00:00-08:00'),
    endTime: new Date('2025-11-27T14:00:00-08:00'),
    format: '构筑'
  },
  {
    type: 'midweek_magic',
    title: '万智牌丨降世神通：最后的气宗争锋构筑挑战',
    startTime: new Date('2025-12-02T14:00:00-08:00'),
    endTime: new Date('2025-12-04T14:00:00-08:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '基石构筑 + 万智牌～最终幻想',
    startTime: new Date('2025-12-09T14:00:00-08:00'),
    endTime: new Date('2025-12-11T14:00:00-08:00'),
    format: '构筑'
  },
  {
    type: 'midweek_magic',
    title: '万智牌～最终幻想争锋构筑挑战',
    startTime: new Date('2025-12-16T14:00:00-08:00'),
    endTime: new Date('2025-12-18T14:00:00-08:00'),
    format: '争锋'
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-11-18T08:00:00-08:00'),
    endTime: new Date('2026-01-20T08:00:00-08:00'),
    format: '竞技轮抽 & 三盘轮抽',
  }
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-11-12T08:00:00-08:00'),
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
    endTime: new Date('2026-12-16T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2025-12-16T08:00:00-08:00'),
    endTime: new Date('2026-12-19T08:00:00-08:00'),
    format: '快速轮抽',
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '万智牌丨降世神通：最后的气宗现开',
    startTime: new Date('2025-11-18T08:00:00-08:00'),
    endTime: new Date('2025-12-12T08:00:00-08:00'),
    format: '现开',
  },
  {
    type: 'other',
    title: '万智牌丨降世神通：最后的气宗三盘现开',
    startTime: new Date('2025-11-18T08:00:00-08:00'),
    endTime: new Date('2025-12-02T08:00:00-08:00'),
    format: '三盘现开',
  },
];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 降世神通：最后的气宗现开（聚珍补充包）',
    startTime: new Date('2025-11-28T08:00:00-08:00'),
    endTime: new Date('2025-12-01T08:00:00-08:00'),
    format: '降世神通：最后的气宗现开'
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO1',
    startTime: new Date('2025-12-06T06:00:00-08:00'),
    endTime: new Date('2025-12-07T09:00:00-08:00'),
    format: '降世神通：最后的气宗现开',
    description: '单日赛事，玩家将竞争获得12月12-13日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO3',
    startTime: new Date('2025-12-12T06:00:00-08:00'),
    endTime: new Date('2025-12-13T07:00:00-08:00'),
    format: '降世神通：最后的气宗现开',
    description: '单日赛事，玩家将竞争获得12月12-13日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛周末',
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
  ...arenaDirectEvents,
  ...arenaChampionshipEvents,
];


