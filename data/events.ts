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
  lastUpdated: '2025/07/28',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-july-28-2025#Events',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '投身虚空边域',
    startTime: new Date('2025-07-29T14:00:00-07:00'),
    endTime: new Date('2025-07-31T14:00:00-07:00'),
    format: '速学！'
  },
  {
    type: 'midweek_magic',
    title: '剑走偏锋',
    startTime: new Date('2025-08-05T14:00:00-07:00'),
    endTime: new Date('2025-08-07T14:00:00-07:00'),
    format: '特殊标准'
  },
  {
    type: 'midweek_magic',
    title: '虚空边域构筑',
    startTime: new Date('2025-08-12T14:00:00-07:00'),
    endTime: new Date('2025-08-14T14:00:00-07:00'),
    format: '虚空边域'
  },
  {
    type: 'midweek_magic',
    title: '步入未来',
    startTime: new Date('2025-08-19T14:00:00-07:00'),
    endTime: new Date('2025-08-21T14:00:00-07:00'),
    format: '炼金：虚空边域预组'
  }
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '虚空边域',
    startTime: new Date('2025-07-29T08:00:00-07:00'),
    endTime: new Date('2025-09-23T08:00:00-07:00'),
    format: '竞技轮抽 & 三盘轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-07-22T08:00:00-07:00'),
    endTime: new Date('2025-08-08T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '虚空边域',
    startTime: new Date('2025-08-08T08:00:00-07:00'),
    endTime: new Date('2025-08-19T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '乙太飘移',
    startTime: new Date('2025-08-19T08:00:00-07:00'),
    endTime: new Date('2025-09-02T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '虚空边域',
    startTime: new Date('2025-09-02T08:00:00-07:00'),
    endTime: new Date('2025-09-12T08:00:00-07:00'),
    format: '快速轮抽',
  }
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '虚空边域现开',
    startTime: new Date('2025-07-29T08:00:00-07:00'),
    endTime: new Date('2025-08-22T08:00:00-07:00'),
    format: '现开',
  },
  {
    type: 'other',
    title: '虚空边域三盘现开',
    startTime: new Date('2025-07-29T08:00:00-07:00'),
    endTime: new Date('2025-08-12T08:00:00-07:00'),
    format: '三盘现开',
  },
  {
    type: 'other',
    title: '史迹环境挑战',
    startTime: new Date('2025-08-01T08:00:00-07:00'),
    endTime: new Date('2025-08-04T08:00:00-07:00'),
    format: '三盘史迹'
  },
  {
    type: 'other',
    title: '竞技场直邮赛 - 虚空边域现开（聚珍补充包）',
    startTime: new Date('2025-08-08T09:00:00-07:00'),
    endTime: new Date('2025-08-11T09:00:00-07:00'),
    format: '现开',
  },
];

const premierPlayEvents: Event[] = [
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

const arenaOpenEvents: Event[] = [
  {
    type: 'arena_open',
    title: '竞技场公开赛 - 虚空边域',
    startTime: new Date('2025-08-16T06:00:00-07:00'),
    endTime: new Date('2025-08-17T08:05:00-07:00'),
    format: '第一日：现开 & 三盘现开, 第二日：三盘轮抽',
  }
];

const arenaChampionshipEvents: Event[] = [
  {
    type: 'arena_championship',
    title: '竞技场冠军赛9',
    startTime: new Date('2025-08-09T10:00:00-07:00'),
    endTime: new Date('2025-08-10T20:00:00-07:00'),
    format: '标准',
  }
];

export const events: Event[] = [
  ...midweekMagicEvents,
  ...premierDraftEvents,
  ...quickDraftEvents,
  ...otherEvents,
  ...premierPlayEvents,
  ...arenaOpenEvents,
  ...arenaChampionshipEvents,
];
