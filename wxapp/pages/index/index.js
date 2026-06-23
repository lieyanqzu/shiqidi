const { openPage } = require('../../utils/wx-actions');
const { generatePageShareImage } = require('../../utils/share-image');

const sections = [
  {
    title: '轮抽数据',
    desc: '深入分析万智牌轮抽数据',
    links: [
      {
        title: '卡牌数据',
        desc: '查看各系列轮抽中卡牌的表现数据，包括胜率、选取率等详细统计',
        url: '/pages/cards/index',
        icon: '../../assets/icons/cards.svg',
      },
      {
        title: '赛制速度',
        desc: '了解各个系列限制赛的速度和先手胜率',
        url: '/pages/speed/index',
        icon: '../../assets/icons/speed.svg',
      },
      {
        title: '色组数据',
        desc: '查看限制赛各色组的胜率与对局数量，比较单色、双色和多色套牌表现',
        url: '/pages/colors/index',
        icon: '../../assets/icons/colors.svg',
      },
    ],
  },
  {
    title: '万智日程',
    desc: '追踪MTGA赛事和活动',
    links: [
      {
        title: 'MTGA活动日历',
        desc: '查看MTGA活动日程，包括周中万智牌、快速轮抽、资格赛等赛事安排',
        url: '/pages/calendar/index',
        icon: '../../assets/icons/calendar.svg',
      },
      {
        title: '标准轮替日程',
        desc: '了解标准赛制的系列轮替时间表，掌握当前可用系列和即将轮替的系列',
        url: '/pages/rotation/index',
        icon: '../../assets/icons/rotation.svg',
      },
      {
        title: 'MTGA服务状态',
        desc: '查看MTGA的服务器状态、维护信息和各平台运行情况',
        url: '/pages/status/index',
        icon: '../../assets/icons/status.svg',
      },
      {
        title: '炼金系列预览',
        desc: '查看最新炼金系列的卡牌中文预览',
        url: '/pages/previews/index',
        icon: '../../assets/icons/previews.svg',
      },
    ],
  },
  {
    title: '其他工具',
    desc: '实用工具和汉化功能',
    links: [
      {
        title: '抽卡概率计算器',
        desc: '计算万智牌抽卡概率，基于超几何分布',
        url: '/pages/hypergeometric/index',
        icon: '../../assets/icons/probability.svg',
      },
      {
        title: '精研通行证计算器',
        desc: '计算精研通行证等级进度',
        url: '/pages/mastery/index',
        icon: '../../assets/icons/mastery.svg',
      },
      {
        title: '开包模拟器',
        desc: '模拟开启补充包，体验开包乐趣',
        url: '/pages/simulator/index',
        icon: '../../assets/icons/simulator.svg',
      },
    ],
  },
];

Page({
  data: {
    sections,
    shareImageUrl: '',
  },

  onLoad() {
    wx.showShareMenu({
      withShareTicket: true,
      menus: ['shareAppMessage', 'shareTimeline'],
    });
    this.prepareShareImage();
  },

  async prepareShareImage() {
    try {
      const imagePath = await generatePageShareImage(this, {
        title: '十七地小助手',
        subtitle: 'MTGA工具',
        description: '万智牌竞技场数据分析与实用工具合集',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  openFeature(event) {
    const { url } = event.currentTarget.dataset;
    openPage(url);
  },

  onShareAppMessage() {
    return {
      title: '十七地小助手',
      path: '/pages/index/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: '十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },
});
