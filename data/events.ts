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
  lastUpdated: '2026/03/03',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/teenage-mutant-ninja-turtles-event-schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '标准纯铁',
    startTime: new Date('2026-03-03T14:00:00-08:00'),
    endTime: new Date('2026-03-05T14:00:00-08:00'),
    format: '标准纯铁'
  },
  {
    type: 'midweek_magic',
    title: '剑走偏锋',
    startTime: new Date('2026-03-10T14:00:00-07:00'),
    endTime: new Date('2026-03-12T14:00:00-07:00'),
    format: '构筑',
    description: '最近三个标准系列加基石构筑'
  },
  {
    type: 'midweek_magic',
    title: '争锋构筑挑战赛',
    startTime: new Date('2026-03-17T14:00:00-07:00'),
    endTime: new Date('2026-03-19T14:00:00-07:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '慢启动炼金',
    startTime: new Date('2026-03-24T14:00:00-07:00'),
    endTime: new Date('2026-03-26T14:00:00-07:00'),
    format: '炼金'
  },
  {
    type: 'midweek_magic',
    title: '茁壮仪式争锋',
    startTime: new Date('2026-03-31T14:00:00-07:00'),
    endTime: new Date('2026-04-02T14:00:00-07:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '忍者神龟人机轮抽',
    startTime: new Date('2026-04-07T14:00:00-07:00'),
    endTime: new Date('2026-04-09T14:00:00-07:00'),
    format: '人机轮抽'
  },
  {
    type: 'midweek_magic',
    title: '莫秘维',
    startTime: new Date('2026-04-14T14:00:00-07:00'),
    endTime: new Date('2026-04-16T14:00:00-07:00'),
    format: '莫秘维'
  }
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '忍者神龟',
    startTime: new Date('2026-03-03T08:00:00-08:00'),
    endTime: new Date('2026-04-21T08:00:00-07:00'),
    format: '竞技轮抽 & 三盘轮抽 & 选两张轮抽'
  },
  {
    type: 'premier_draft',
    title: '邪军压境：终战回响',
    startTime: new Date('2026-03-17T08:00:00-07:00'),
    endTime: new Date('2026-03-24T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '神器混合轮抽',
    startTime: new Date('2026-03-24T08:00:00-07:00'),
    endTime: new Date('2026-03-31T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '强化方盒轮抽',
    startTime: new Date('2026-03-31T08:00:00-07:00'),
    endTime: new Date('2026-04-21T08:00:00-07:00'),
    format: '竞技轮抽 & 三盘轮抽'
  },
  {
    type: 'premier_draft',
    title: '班隆洛',
    startTime: new Date('2026-03-31T08:00:00-07:00'),
    endTime: new Date('2026-04-07T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2026-04-07T08:00:00-07:00'),
    endTime: new Date('2026-04-14T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '神河：霓朝纪',
    startTime: new Date('2026-04-14T08:00:00-07:00'),
    endTime: new Date('2026-04-21T08:00:00-07:00'),
    format: '竞技轮抽'
  }
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '忍者神龟',
    startTime: new Date('2026-03-12T08:00:00-07:00'),
    endTime: new Date('2026-03-23T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2026-03-23T08:00:00-07:00'),
    endTime: new Date('2026-04-07T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '忍者神龟',
    startTime: new Date('2026-04-07T08:00:00-07:00'),
    endTime: new Date('2026-04-21T08:00:00-07:00'),
    format: '快速轮抽'
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '忍者神龟现开',
    startTime: new Date('2026-03-03T08:00:00-08:00'),
    endTime: new Date('2026-03-27T08:00:00-07:00'),
    format: '现开'
  },
  {
    type: 'other',
    title: '忍者神龟三盘现开',
    startTime: new Date('2026-03-03T08:00:00-08:00'),
    endTime: new Date('2026-03-18T08:00:00-07:00'),
    format: '三盘现开'
  },
  {
    type: 'other',
    title: '史迹环境挑战赛',
    startTime: new Date('2026-03-13T08:00:00-07:00'),
    endTime: new Date('2026-03-16T08:00:00-07:00'),
    format: '史迹'
  },
  {
    type: 'other',
    title: '先驱环境挑战赛',
    startTime: new Date('2026-03-27T08:00:00-07:00'),
    endTime: new Date('2026-03-30T08:00:00-07:00'),
    format: '先驱'
  },
  {
    type: 'other',
    title: '争锋改禁环境挑战赛',
    startTime: new Date('2026-03-31T08:00:00-07:00'),
    endTime: new Date('2026-04-21T08:00:00-07:00'),
    format: '争锋'
  },
  {
    type: 'other',
    title: '标准环境挑战赛',
    startTime: new Date('2026-04-03T08:00:00-07:00'),
    endTime: new Date('2026-04-06T08:00:00-07:00'),
    format: '标准'
  },
  {
    type: 'other',
    title: '永恒环境挑战赛',
    startTime: new Date('2026-04-10T08:00:00-07:00'),
    endTime: new Date('2026-04-13T08:00:00-07:00'),
    format: '永恒'
  }
];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 忍者神龟聚珍补充包',
    startTime: new Date('2026-03-13T08:00:00-07:00'),
    endTime: new Date('2026-03-16T08:00:00-07:00'),
    format: '忍者神龟现开'
  },
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 忍者神龟常规补充包',
    startTime: new Date('2026-03-27T08:00:00-07:00'),
    endTime: new Date('2026-03-30T08:00:00-07:00'),
    format: '忍者神龟现开'
  },
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 班隆洛日文常规补充包',
    startTime: new Date('2026-04-10T08:00:00-07:00'),
    endTime: new Date('2026-04-13T08:00:00-07:00'),
    format: '班隆洛现开'
  }
];

const premierPlayEvents: Event[] = [
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
