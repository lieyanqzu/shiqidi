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
  lastUpdated: '2025/12/15',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-december-15-2025#Events',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '万智牌～最终幻想争锋构筑挑战',
    startTime: new Date('2025-12-16T14:00:00-08:00'),
    endTime: new Date('2025-12-18T14:00:00-08:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '万智牌丨降世神通：最后的气宗全知全能轮抽',
    startTime: new Date('2025-12-23T14:00:00-08:00'),
    endTime: new Date('2025-12-25T14:00:00-08:00'),
    format: '全知全能轮抽'
  },
  {
    type: 'midweek_magic',
    title: '慢热启动标准',
    startTime: new Date('2025-12-30T14:00:00-08:00'),
    endTime: new Date('2026-01-01T14:00:00-08:00'),
    format: '标准',
    description: '先手的牌手的第一块地须横置进入战场'
  },
  {
    type: 'midweek_magic',
    title: '莫秘维',
    startTime: new Date('2026-01-06T14:00:00-08:00'),
    endTime: new Date('2026-01-08T14:00:00-08:00'),
    format: '莫秘维'
  },
  {
    type: 'midweek_magic',
    title: '万智牌丨降世神通：最后的气宗现开',
    startTime: new Date('2026-01-13T14:00:00-08:00'),
    endTime: new Date('2026-01-15T14:00:00-08:00'),
    format: '现开'
  }
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-11-18T08:00:00-08:00'),
    endTime: new Date('2026-01-20T08:00:00-08:00'),
    format: '竞技轮抽 & 三盘轮抽',
  },
  {
    type: 'premier_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2025-12-09T08:00:00-08:00'),
    endTime: new Date('2025-12-30T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '依尼翠：黯夜猎踪',
    startTime: new Date('2025-12-30T08:00:00-08:00'),
    endTime: new Date('2026-01-06T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '强化方盒轮抽(?)',
    startTime: new Date('2026-01-06T08:00:00-08:00'),
    endTime: new Date('2026-01-20T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '卡洛夫庄园谋杀案',
    startTime: new Date('2026-01-06T08:00:00-08:00'),
    endTime: new Date('2026-01-13T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '摩登新篇3',
    startTime: new Date('2026-01-13T08:00:00-08:00'),
    endTime: new Date('2026-01-20T08:00:00-08:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '依夏兰迷窟',
    startTime: new Date('2025-12-09T08:00:00-08:00'),
    endTime: new Date('2025-12-16T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2025-12-16T08:00:00-08:00'),
    endTime: new Date('2025-12-30T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌丨降世神通：最后的气宗全知全能快速轮抽',
    startTime: new Date('2025-12-26T08:00:00-08:00'),
    endTime: new Date('2025-12-30T08:00:00-08:00'),
    format: '全知全能快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '万智牌丨降世神通：最后的气宗',
    startTime: new Date('2025-12-30T08:00:00-08:00'),
    endTime: new Date('2026-01-16T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '暮悲邸：鬼屋惊魂',
    startTime: new Date('2026-01-16T08:00:00-08:00'),
    endTime: new Date('2026-01-28T08:00:00-08:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '全卡争锋改禁环境挑战赛',
    startTime: new Date('2025-12-16T08:00:00-08:00'),
    endTime: new Date('2026-01-06T08:00:00-08:00'),
    format: '争锋',
    description: '公告：https://magic.wizards.com/en/news/mtg-arena/brawl-our-plans'
  }
];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 降世神通：最后的气宗现开（常规补充包）',
    startTime: new Date('2025-12-26T08:00:00-08:00'),
    endTime: new Date('2025-12-29T08:00:00-08:00'),
    format: '降世神通：最后的气宗现开'
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO1',
    startTime: new Date('2026-01-03T06:00:00-08:00'),
    endTime: new Date('2026-01-04T09:00:00-08:00'),
    format: '先驱',
    description: '单日赛事，玩家将竞争获得1月10-11日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO3',
    startTime: new Date('2026-01-09T06:00:00-08:00'),
    endTime: new Date('2026-01-10T07:00:00-08:00'),
    format: '先驱',
    description: '单日赛事，玩家将竞争获得1月10-11日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛周末',
    startTime: new Date('2026-01-10T06:00:00-08:00'),
    endTime: new Date('2026-01-11T17:00:00-08:00'),
    format: '先驱',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛11的资格。',
  }
];

const arenaChampionshipEvents: Event[] = [
  {
    type: 'arena_championship',
    title: '竞技场冠军赛10',
    startTime: new Date('2025-12-20T09:00:00-08:00'),
    endTime: new Date('2025-12-21T17:00:00-08:00'),
    format: '永恒',
    description: '直播地址：twitch.tv/magic'
  },
];

export const events: Event[] = [
  ...midweekMagicEvents,
  ...premierDraftEvents,
  ...quickDraftEvents,
  ...otherEvents,
  ...premierPlayEvents,
  ...arenaDirectEvents,
  ...arenaChampionshipEvents,
];


