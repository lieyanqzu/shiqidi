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
  lastUpdated: '2025/03/24',
  announcementUrl: 'https://magic.wizards.com/en/news/mtg-arena/announcements-march-24-2025#schedule',
};

const midweekMagicEvents: Event[] = [
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
  {
    type: 'midweek_magic',
    title: '投身鞑契龙岚录',
    startTime: new Date('2025-04-08T14:00:00-07:00'),
    endTime: new Date('2025-04-10T14:00:00-07:00'),
    format: '鞑契龙岚录',
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
    title: '阿芒凯重制版',
    startTime: new Date('2025-03-25T08:00:00-07:00'),
    endTime: new Date('2025-04-01T08:00:00-07:00'),
    format: '竞技轮抽',
  },
  {
    type: 'premier_draft',
    title: '火花之战重制版',
    startTime: new Date('2025-04-01T08:00:00-07:00'),
    endTime: new Date('2025-04-08T08:00:00-07:00'),
    format: '竞技轮抽',
  },
];

const quickDraftEvents: Event[] = [
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
  {
    type: 'quick_draft',
    title: '鞑契龙岚录',
    startTime: new Date('2025-04-16T08:00:00-07:00'),
    endTime: new Date('2025-04-26T08:00:00-07:00'),
    format: '快速轮抽',
  },
];

const otherEvents: Event[] = [
  {
    type: 'other',
    title: '万智牌：竞技场幻影方盒轮抽',
    startTime: new Date('2025-03-25T08:00:00-07:00'),
    endTime: new Date('2025-04-08T08:00:00-07:00'),
    format: '方盒轮抽',
  },
  {
    type: 'other',
    title: '竞技场直邮赛 - 乙太漂移',
    startTime: new Date('2025-03-28T08:00:00-07:00'),
    endTime: new Date('2025-03-31T08:00:00-07:00'),
    format: '乙太漂移现开',
    description: '6胜获得两盒乙太漂移常规补充包'
  },
  {
    type: 'other',
    title: '永恒环境挑战赛',
    startTime: new Date('2025-03-28T08:00:00-07:00'),
    endTime: new Date('2025-03-31T08:00:00-07:00'),
    format: '永恒',
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

const arenaChampionshipEvents: Event[] = [
  {
    type: 'arena_championship',
    title: '竞技场冠军赛8',
    startTime: new Date('2025-03-29T09:00:00-07:00'),
    endTime: new Date('2025-03-30T23:00:00-07:00'),
    format: '探险',
  },
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