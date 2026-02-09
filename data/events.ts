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
  lastUpdated: '2026/02/09',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-february-9-2026#Events',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '洛温：暗影笼罩争锋构筑挑战',
    startTime: new Date('2026-02-10T14:00:00-08:00'),
    endTime: new Date('2026-02-12T14:00:00-08:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '幻影黄金补充包现开',
    startTime: new Date('2026-02-17T14:00:00-08:00'),
    endTime: new Date('2026-02-19T14:00:00-08:00'),
    format: '现开'
  },
  {
    type: 'midweek_magic',
    title: '洛温：暗影笼罩幻影现开',
    startTime: new Date('2026-02-24T14:00:00-08:00'),
    endTime: new Date('2026-02-26T14:00:00-08:00'),
    format: '现开'
  },
  {
    type: 'midweek_magic',
    title: '投身忍者神龟',
    startTime: new Date('2026-03-03T14:00:00-08:00'),
    endTime: new Date('2026-03-05T14:00:00-08:00'),
    format: '速学！'
  }
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '洛温：暗影笼罩',
    startTime: new Date('2026-01-20T08:00:00-08:00'),
    endTime: new Date('2026-03-03T08:00:00-08:00'),
    format: '竞技轮抽 & 三盘轮抽',
  },
  {
    type: 'premier_draft',
    title: '炼金：洛温',
    startTime: new Date('2026-02-02T08:00:00-08:00'),
    endTime: new Date('2026-02-17T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2026-02-10T08:00:00-08:00'),
    endTime: new Date('2026-02-17T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '强化方盒轮抽',
    startTime: new Date('2026-02-10T08:00:00-08:00'),
    endTime: new Date('2026-03-03T08:00:00-08:00'),
    format: '竞技轮抽 & 三盘轮抽',
    description: '更新日志：https://magic.wizards.com/en/news/mtg-arena/arena-powered-cube-draft'
  },
  {
    type: 'premier_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2026-02-17T08:00:00-08:00'),
    endTime: new Date('2026-02-24T08:00:00-08:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '降世神通：最后的气宗',
    startTime: new Date('2026-02-24T08:00:00-08:00'),
    endTime: new Date('2026-03-03T08:00:00-08:00'),
    format: '竞技轮抽',
  }
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '穿越预兆路',
    startTime: new Date('2026-02-09T08:00:00-08:00'),
    endTime: new Date('2026-02-23T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '洛温：暗影笼罩',
    startTime: new Date('2026-02-23T08:00:00-08:00'),
    endTime: new Date('2026-03-12T08:00:00-07:00'),
    format: '快速轮抽',
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '洛温：暗影笼罩现开',
    startTime: new Date('2026-01-20T08:00:00-08:00'),
    endTime: new Date('2026-02-13T08:00:00-08:00'),
    format: '现开'
  },
  {
    type: 'other',
    title: '改禁争锋环境挑战赛',
    startTime: new Date('2026-01-26T08:00:00-08:00'),
    endTime: new Date('2026-02-10T08:00:00-08:00'),
    format: '争锋'
  }
];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 洛温：暗影笼罩现开（常规补充包）',
    startTime: new Date('2026-02-13T08:00:00-08:00'),
    endTime: new Date('2026-02-16T08:00:00-08:00'),
    format: '洛温：暗影笼罩现开'
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '限制冠军赛资格赛',
    startTime: new Date('2026-02-20T06:00:00-08:00'),
    endTime: new Date('2026-02-22T09:00:00-08:00'),
    format: '洛温：暗影笼罩轮抽',
    description: '两日赛事，获胜者将获得参加竞技场限制冠军赛的资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO1',
    startTime: new Date('2026-03-21T06:00:00-07:00'),
    endTime: new Date('2026-03-22T09:00:00-07:00'),
    format: '现开',
    description: '单日赛事，玩家将竞争获得3月28-29日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO3',
    startTime: new Date('2026-03-27T06:00:00-07:00'),
    endTime: new Date('2026-03-28T07:00:00-07:00'),
    format: '现开',
    description: '单日赛事，玩家将竞争获得3月28-29日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛周末',
    startTime: new Date('2026-03-28T06:00:00-07:00'),
    endTime: new Date('2026-03-29T17:00:00-07:00'),
    format: '现开',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛的资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO1',
    startTime: new Date('2026-04-04T06:00:00-07:00'),
    endTime: new Date('2026-04-05T09:00:00-07:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得4月11-12日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO3',
    startTime: new Date('2026-04-10T06:00:00-07:00'),
    endTime: new Date('2026-04-11T07:00:00-07:00'),
    format: '史迹',
    description: '单日赛事，玩家将竞争获得4月11-12日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛周末',
    startTime: new Date('2026-04-11T06:00:00-07:00'),
    endTime: new Date('2026-04-12T17:00:00-07:00'),
    format: '史迹',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛的资格。',
  }
];

const arenaChampionshipEvents: Event[] = [
  {
    type: 'arena_championship',
    title: '竞技场冠军赛11',
    startTime: new Date('2026-02-21T09:00:00-08:00'),
    endTime: new Date('2026-02-22T17:00:00-08:00'),
    format: '标准',
  },
  {
    type: 'arena_championship',
    title: '竞技场冠军赛12',
    startTime: new Date('2026-05-23T09:00:00-07:00'),
    endTime: new Date('2026-05-24T17:00:00-07:00'),
    format: '史迹',
  },
  {
    type: 'arena_championship',
    title: '竞技场冠军赛13',
    startTime: new Date('2026-10-24T09:00:00-07:00'),
    endTime: new Date('2026-10-25T17:00:00-07:00'),
    format: '标准',
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


