const { copyText } = require('../../utils/wx-actions');
const { generatePageShareImage } = require('../../utils/share-image');

const webUrl = 'https://shiqidi.lenitatis.com';
const startYear = 2024;
const currentYear = new Date().getFullYear();
const yearText = currentYear > startYear ? `${startYear}-${currentYear}` : String(startYear);

Page({
  data: {
    webUrl,
    shareImageUrl: '',
    sources: [
      {
        name: '17Lands',
        detail: '提供轮抽数据分析的核心数据，包括卡牌胜率、选取率、色组数据和赛制速度等。',
      },
      {
        name: '大学院废墟',
        detail: '提供万智牌的中文翻译数据。',
      },
    ],
    notices: [
      '万智牌®是美国海滨之巫师有限责任公司的注册商标。除另有注明外，万智牌图片和文本均归其版权所有。',
      `© ${yearText} 十七地`,
    ],
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
        title: '关于十七地',
        subtitle: '关于',
        description: '万智牌竞技场数据分析与实用工具',
      });
      this.setData({ shareImageUrl: imagePath });
    } catch (error) {
      console.warn('生成分享图失败', error);
    }
  },

  copyWebUrl() {
    copyText(webUrl, '网页地址已复制');
  },

  onShareAppMessage() {
    return {
      title: '关于 - 十七地小助手',
      path: '/pages/info/index',
      imageUrl: this.data.shareImageUrl,
    };
  },

  onShareTimeline() {
    return {
      title: '关于 - 十七地小助手',
      imageUrl: this.data.shareImageUrl,
    };
  },
});
