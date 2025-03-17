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
  lastUpdated: '2025/03/17',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-march-17-2025#schedule',
};

const midweekMagicEvents: Event[] = [
  {
    type: 'midweek_magic',
    title: '标准倾曳',
    startTime: new Date('2025-03-18T14:00:00-07:00'), 
    endTime: new Date('2025-03-20T14:00:00-07:00'),
    format: '标准',
  },
  {
    type: 'midweek_magic',
    title: '争锋构筑挑战',
    startTime: new Date('2025-03-25T14:00:00-07:00'),
    endTime: new Date('2025-03-27T14:00:00-07:00'), 
    format: '争锋',
  },
  {
    type: 'midweek_magic',
    title: '不开玩笑！乙太飘移快速轮抽',
    startTime: new Date('2025-04-01T14:00:00-07:00'),
    endTime: new Date('2025-04-03T14:00:00-07:00'),
    format: '快速轮抽 - 乙太飘移',
  },
];

const premierDraftEvents: Event[] = [
  {
    type: 'premier_draft',
    title: '乙太飘移',
    startTime: new Date('2025-02-11T08:00:00-08:00'),
    endTime: new Date('2025-04-08T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '炼金：乙太飘移',
    startTime: new Date('2025-03-04T08:00:00-08:00'),
    endTime: new Date('2025-03-17T08:00:00-07:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
  {
    type: 'quick_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2025-03-07T08:00:00-08:00'),
    endTime: new Date('2025-03-17T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '乙太飘移',
    startTime: new Date('2025-03-18T08:00:00-07:00'),
    endTime: new Date('2025-03-31T08:00:00-07:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '卡洛夫庄园谋杀案',
    startTime: new Date('2025-04-01T08:00:00-07:00'),
    endTime: new Date('2025-04-16T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '奇密理快速轮抽：乙太飘移',
    startTime: new Date('2025-03-21T08:00:00-07:00'),
    endTime: new Date('2025-03-23T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const premierPlayEvents: Event[] = [
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2025-03-21T06:00:00-07:00'),
    endTime: new Date('2025-03-22T03:00:00-07:00'),
    format: '标准',
    description: '单日赛事，玩家将竞争获得本月资格赛周末的参赛资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2025-03-22T06:00:00-07:00'),
    endTime: new Date('2025-03-23T16:00:00-07:00'),
    format: '标准',
    description: '两日赛事，获胜者将获得参加即将到来的竞技场冠军赛的资格。请记得在比赛开始前领取通过赛季奖励获得的参赛券。',
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