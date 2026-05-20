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
  lastUpdated: '2026/05/20',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/secrets-of-strixhaven-event-schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '速学！',
    startTime: new Date('2026-04-21T14:00:00-07:00'),
    endTime: new Date('2026-04-23T14:00:00-07:00'),
    format: '速学！'
  },
  {
    type: 'midweek_magic',
    title: '剑走偏锋',
    startTime: new Date('2026-04-28T14:00:00-07:00'),
    endTime: new Date('2026-04-30T14:00:00-07:00'),
    format: '构筑',
    description: '最近三个标准系列加基石构筑'
  },
  {
    type: 'midweek_magic',
    title: '史迹纯铁',
    startTime: new Date('2026-05-05T14:00:00-07:00'),
    endTime: new Date('2026-05-07T14:00:00-07:00'),
    format: '史迹'
  },
  {
    type: 'midweek_magic',
    title: '五彩星启标准',
    startTime: new Date('2026-05-12T14:00:00-07:00'),
    endTime: new Date('2026-05-14T14:00:00-07:00'),
    format: '标准'
  },
  {
    type: 'midweek_magic',
    title: '步入未来',
    startTime: new Date('2026-05-19T14:00:00-07:00'),
    endTime: new Date('2026-05-21T14:00:00-07:00'),
    format: '炼金预组'
  },
  {
    type: 'midweek_magic',
    title: '争锋构筑挑战赛',
    startTime: new Date('2026-05-26T14:00:00-07:00'),
    endTime: new Date('2026-05-28T14:00:00-07:00'),
    format: '争锋'
  },
  {
    type: 'midweek_magic',
    title: '慢热启动标准',
    startTime: new Date('2026-06-02T14:00:00-07:00'),
    endTime: new Date('2026-06-04T14:00:00-07:00'),
    format: '标准',
    description: '先手的牌手须将其第一块地横置进场'
  },
  {
    type: 'midweek_magic',
    title: '斯翠海文的秘密倾曳轮抽',
    startTime: new Date('2026-06-09T14:00:00-07:00'),
    endTime: new Date('2026-06-11T14:00:00-07:00'),
    format: '轮抽'
  },
  {
    type: 'midweek_magic',
    title: '斯翠海文的秘密幻影现开',
    startTime: new Date('2026-06-16T14:00:00-07:00'),
    endTime: new Date('2026-06-18T14:00:00-07:00'),
    format: '现开'
  }
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '斯翠海文的秘密',
    startTime: new Date('2026-04-21T08:00:00-07:00'),
    endTime: new Date('2026-06-23T08:00:00-07:00'),
    format: '竞技轮抽 & 三盘轮抽 & 选两张轮抽'
  },
  {
    type: 'premier_draft',
    title: '斯翠海文：魔法学院',
    startTime: new Date('2026-05-26T08:00:00-07:00'),
    endTime: new Date('2026-06-02T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '炼金：斯翠海文',
    startTime: new Date('2026-05-19T08:00:00-07:00'),
    endTime: new Date('2026-06-02T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '降世神通：最后的气宗',
    startTime: new Date('2026-06-02T08:00:00-07:00'),
    endTime: new Date('2026-06-09T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2026-06-09T08:00:00-07:00'),
    endTime: new Date('2026-06-16T08:00:00-07:00'),
    format: '竞技轮抽'
  },
  {
    type: 'premier_draft',
    title: '万智牌～最终幻想',
    startTime: new Date('2026-06-16T08:00:00-07:00'),
    endTime: new Date('2026-06-23T08:00:00-07:00'),
    format: '竞技轮抽'
  }
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2026-04-21T08:00:00-07:00'),
    endTime: new Date('2026-04-30T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '斯翠海文的秘密',
    startTime: new Date('2026-04-30T08:00:00-07:00'),
    endTime: new Date('2026-05-11T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '虚空边域',
    startTime: new Date('2026-05-11T08:00:00-07:00'),
    endTime: new Date('2026-05-26T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '斯翠海文的秘密',
    startTime: new Date('2026-05-26T08:00:00-07:00'),
    endTime: new Date('2026-06-08T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '卡洛夫庄园谋杀案',
    startTime: new Date('2026-06-08T08:00:00-07:00'),
    endTime: new Date('2026-06-17T08:00:00-07:00'),
    format: '快速轮抽'
  },
  {
    type: 'quick_draft',
    title: '班隆洛',
    startTime: new Date('2026-06-17T08:00:00-07:00'),
    endTime: new Date('2026-07-02T08:00:00-07:00'),
    format: '快速轮抽'
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '斯翠海文的秘密学院现开',
    startTime: new Date('2026-04-21T08:00:00-07:00'),
    endTime: new Date('2026-05-14T08:00:00-07:00'),
    format: '现开'
  },
  {
    type: 'other',
    title: '斯翠海文的秘密三盘现开',
    startTime: new Date('2026-04-21T08:00:00-07:00'),
    endTime: new Date('2026-05-05T08:00:00-07:00'),
    format: '三盘现开'
  },
  {
    type: 'other',
    title: '史迹环境挑战赛',
    startTime: new Date('2026-04-24T08:00:00-07:00'),
    endTime: new Date('2026-04-27T08:00:00-07:00'),
    format: '史迹'
  },
  {
    type: 'other',
    title: '永恒环境挑战赛',
    startTime: new Date('2026-05-08T08:00:00-07:00'),
    endTime: new Date('2026-05-11T08:00:00-07:00'),
    format: '永恒'
  },
  {
    type: 'other',
    title: '标准环境挑战赛',
    startTime: new Date('2026-05-22T08:00:00-07:00'),
    endTime: new Date('2026-05-26T08:00:00-07:00'),
    format: '标准'
  },
  {
    type: 'other',
    title: '斯翠海文的秘密竞逐轮抽',
    startTime: new Date('2026-05-22T08:00:00-07:00'),
    endTime: new Date('2026-05-29T08:00:00-07:00'),
    format: '竞逐轮抽',
    description: '门票和奖励都比普通轮抽更高'
  },
  {
    type: 'other',
    title: '竞技场方盒轮抽',
    startTime: new Date('2026-06-02T08:00:00-07:00'),
    endTime: new Date('2026-06-23T08:00:00-07:00'),
    format: '方盒轮抽'
  },
  {
    type: 'other',
    title: '万智牌：基石构筑幻影轮抽',
    startTime: new Date('2026-06-10T08:00:00-07:00'),
    endTime: new Date('2026-06-13T08:00:00-07:00'),
    format: '幻影轮抽',
    description: '免门票，庆祝国际游戏日'
  },
];

const arenaDirectEvents: Event[] = [
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 斯翠海文的秘密聚珍补充包',
    startTime: new Date('2026-05-01T08:00:00-07:00'),
    endTime: new Date('2026-05-04T08:00:00-07:00'),
    format: '斯翠海文的秘密现开'
  },
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 斯翠海文的秘密常规补充包',
    startTime: new Date('2026-05-15T08:00:00-07:00'),
    endTime: new Date('2026-05-18T08:00:00-07:00'),
    format: '斯翠海文的秘密现开'
  },
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 斯翠海文的秘密常规补充包',
    startTime: new Date('2026-05-27T08:00:00-07:00'),
    endTime: new Date('2026-05-31T08:00:00-07:00'),
    format: '斯翠海文的秘密现开'
  },
  {
    type: 'arena_direct',
    title: '竞技场直邮赛 - 万智牌：基石构筑常规补充包',
    startTime: new Date('2026-06-12T08:00:00-07:00'),
    endTime: new Date('2026-06-15T08:00:00-07:00'),
    format: '万智牌：基石构筑现开'
  }
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO1',
    startTime: new Date('2026-05-09T06:00:00-07:00'),
    endTime: new Date('2026-05-10T09:00:00-07:00'),
    format: '斯翠海文的秘密现开',
    description: '单日赛事，玩家将竞争获得 5 月 16-17 日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO3',
    startTime: new Date('2026-05-15T06:00:00-07:00'),
    endTime: new Date('2026-05-16T07:00:00-07:00'),
    format: '斯翠海文的秘密现开',
    description: '单日赛事，玩家将竞争获得 5 月 16-17 日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛周末',
    startTime: new Date('2026-05-16T06:00:00-07:00'),
    endTime: new Date('2026-05-17T17:00:00-07:00'),
    format: '斯翠海文的秘密现开',
    description: '两日赛事，获胜者将获得参加竞技场冠军赛的资格。',
  },
  {
    type: 'premier_play',
    title: '限制冠军赛资格赛',
    startTime: new Date('2026-06-05T08:00:00-07:00'),
    endTime: new Date('2026-06-08T08:00:00-07:00'),
    format: '斯翠海文的秘密轮抽',
    description: '两日赛事，获胜者将获得参加竞技场限制冠军赛的资格。'
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO1',
    startTime: new Date('2026-06-06T06:00:00-07:00'),
    endTime: new Date('2026-06-07T09:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得 6 月 13-14 日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛 - 入围赛BO3',
    startTime: new Date('2026-06-12T06:00:00-07:00'),
    endTime: new Date('2026-06-13T07:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得 6 月 13-14 日冠军赛资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '冠军赛资格赛周末',
    startTime: new Date('2026-06-13T06:00:00-07:00'),
    endTime: new Date('2026-06-14T17:00:00-07:00'),
    format: '标准',
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
