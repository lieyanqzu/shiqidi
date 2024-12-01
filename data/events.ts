export interface Event {
  type: 'midweek_magic' | 'quick_draft' | 'other' | 'premier_play' | 'arena_open' | 'arena_championship';
  title: string;
  startTime: Date;
  endTime: Date;
  format?: string;
  description?: string;
}

export const events: Event[] = [
  // 周中魔法
  {
    type: 'midweek_magic',
    title: '标准套牌对决',
    startTime: new Date('2024-11-26T14:00:00-08:00'),
    endTime: new Date('2024-11-28T14:00:00-08:00'),
    format: '标准',
  },
  {
    type: 'midweek_magic',
    title: '万智牌：基石构筑争锋构筑挑战',
    startTime: new Date('2024-12-03T14:00:00-08:00'),
    endTime: new Date('2024-12-05T14:00:00-08:00'),
    format: '争锋',
  },
  {
    type: 'midweek_magic',
    title: '探险构筑',
    startTime: new Date('2024-12-10T14:00:00-08:00'),
    endTime: new Date('2024-12-12T14:00:00-08:00'),
    format: '探险',
  },
  {
    type: 'midweek_magic',
    title: '先驱大师争锋构筑挑战',
    startTime: new Date('2024-12-17T14:00:00-08:00'),
    endTime: new Date('2024-12-19T14:00:00-08:00'),
    format: '争锋',
  },

  // 快速轮抽
  {
    type: 'quick_draft',
    title: '万智牌：基石构筑',
    startTime: new Date('2024-11-22T08:00:00-08:00'),
    endTime: new Date('2024-12-03T08:00:00-08:00'),
    format: '快速轮抽',
  },
  {
    type: 'quick_draft',
    title: '光雷驿镖客',
    startTime: new Date('2024-12-03T08:00:00-08:00'),
    endTime: new Date('2024-12-12T08:00:00-08:00'),
    format: '快速轮抽',
  },

  // 其他活动
  {
    type: 'other',
    title: '基石构筑速战',
    startTime: new Date('2024-11-19T08:00:00-08:00'),
    endTime: new Date('2024-12-03T08:00:00-08:00'),
    format: '速学',
  },
  {
    type: 'other',
    title: '永恒环境挑战赛',
    startTime: new Date('2024-12-06T08:00:00-08:00'),
    endTime: new Date('2024-12-08T08:00:00-08:00'),
    format: '永恒',
  },

  // 资格赛
  {
    type: 'premier_play',
    title: '资格赛入围赛BO1',
    startTime: new Date('2024-12-14T06:00:00-08:00'),
    endTime: new Date('2024-12-15T03:00:00-08:00'),
    format: '万智牌：基石构筑限制赛',
    description: '单日赛事，获胜者将获得参加本月资格赛周末的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛入围赛BO3',
    startTime: new Date('2024-12-20T06:00:00-08:00'),
    endTime: new Date('2024-12-21T03:00:00-08:00'),
    format: '万智牌：基石构筑限制赛',
    description: '单日赛事，获胜者将获得参加本月资格赛周末的资格。',
  },
  {
    type: 'premier_play',
    title: '资格赛周末',
    startTime: new Date('2024-12-21T06:00:00-08:00'),
    endTime: new Date('2024-12-22T16:00:00-08:00'),
    format: '万智牌：基石构筑限制赛',
    description: '两日赛事，获胜者将获得参加即将到来的竞技场锦标赛的资格。',
  },

  // 竞技场公开赛
  {
    type: 'arena_open',
    title: '竞技场公开赛',
    startTime: new Date('2024-11-30T06:00:00-08:00'),
    endTime: new Date('2024-12-01T03:00:00-08:00'),
    format: '万智牌：基石构筑现开/轮抽',
    description: '第一天：基石构筑现开（BO1/BO3），第二天：基石构筑轮抽（BO3）',
  },

  // 竞技场锦标赛
  {
    type: 'arena_championship',
    title: '竞技场锦标赛 7',
    startTime: new Date('2024-12-14T00:00:00-08:00'),
    endTime: new Date('2024-12-15T23:59:59-08:00'),
    format: '标准',
    description: '仅限受邀选手参加的两日幻影赛事，参赛资格通过资格赛周末活动获得。',
  },
]; 