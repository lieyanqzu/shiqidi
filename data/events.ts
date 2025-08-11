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
  lastUpdated: '2025/08/11',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-august-11-2025',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '虚空边域构筑',
    startTime: new Date('2025-08-12T14:00:00-07:00'),
    endTime: new Date('2025-08-14T14:00:00-07:00'),
    format: '虚空边域'
  },
  {
    type: 'midweek_magic',
    title: '炼金构筑',
    startTime: new Date('2025-08-19T14:00:00-07:00'),
    endTime: new Date('2025-08-21T14:00:00-07:00'),
    format: '炼金'
  },
  {
    type: 'midweek_magic',
    title: '选两张轮抽：万智牌基石构筑',
    startTime: new Date('2025-08-26T14:00:00-07:00'),
    endTime: new Date('2025-08-28T14:00:00-07:00'),
    format: '选两张轮抽'
  },
  {
    type: 'midweek_magic',
    title: '争锋构筑挑战',
    startTime: new Date('2025-09-02T14:00:00-07:00'),
    endTime: new Date('2025-09-04T14:00:00-07:00'),
    format: '争锋'
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
  },
  {
    type: 'quick_draft',
    title: '万智牌基石构筑',
    startTime: new Date('2025-09-11T08:00:00-07:00'),
    endTime: new Date('2025-09-24T08:00:00-07:00'),
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
  }
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
