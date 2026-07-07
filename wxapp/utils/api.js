const DEFAULT_TIMEOUT = 60000;
const RETRY_TIMEOUT = 300000;
const MAX_RETRIES = 2;
const RETRY_DELAYS = [1000, 2000];
const SITE_BASE_URL = 'https://shiqidi.lenitatis.com';
const SCRYFALL_CARD_HOST = 'https://cards.scryfall.io';
const MTGCH_IMAGE_HOST = 'https://images.mtgch.com';

const DEFAULT_HEADERS = {
  accept: 'application/json',
};

const SCRYFALL_HEADERS = {
  accept: 'application/json',
  'User-Agent': 'shiqidi-wxapp/0.1',
};

function parseResponseData(data) {
  if (typeof data !== 'string') return data;
  const text = data.trim();
  if (!text || (!text.startsWith('{') && !text.startsWith('['))) return data;
  try {
    return JSON.parse(text);
  } catch (error) {
    return data;
  }
}

function buildHttpError(statusCode) {
  if (statusCode === 401 || statusCode === 403) {
    return `请求被服务端拒绝（状态码 ${statusCode}）`;
  }
  if (statusCode === 404) {
    return '请求的数据不存在或已下线';
  }
  if (statusCode >= 500) {
    return `服务端暂时不可用（状态码 ${statusCode}）`;
  }
  return `请求失败（状态码 ${statusCode}）`;
}

function request({ url, data, header = DEFAULT_HEADERS, timeout = DEFAULT_TIMEOUT }) {
  return new Promise((resolve, reject) => {
    if (!url || !/^https:\/\//.test(String(url))) {
      reject(new Error('请求地址无效'));
      return;
    }
    wx.request({
      url,
      data,
      header,
      timeout,
      method: 'GET',
      dataType: 'text',
      success(response) {
        if (response.statusCode >= 200 && response.statusCode < 400) {
          resolve(parseResponseData(response.data));
          return;
        }
        reject(new Error(buildHttpError(response.statusCode)));
      },
      fail(error) {
        const message = error && error.errMsg && /timeout/i.test(error.errMsg)
          ? '网络请求超时，请稍后重试'
          : '网络连接失败，请稍后重试';
        reject(new Error(message));
      },
    });
  });
}

function requestWithRetry({ url, data, header, timeout = RETRY_TIMEOUT, retries = MAX_RETRIES }) {
  return request({ url, data, header, timeout }).catch((error) => {
    if (retries <= 0) return Promise.reject(error);
    const delay = RETRY_DELAYS[MAX_RETRIES - retries] || 1000;
    return new Promise((resolve) => setTimeout(resolve, delay))
      .then(() => requestWithRetry({ url, data, header, timeout, retries: retries - 1 }));
  });
}

function fetchCardData(params) {
  // 17lands 卡牌数据 API 已用 time_period 替代 start_date/end_date，这里只发送需要的字段
  const fields = ['expansion', 'event_type', 'time_period', 'user_group', 'colors'];
  const query = fields
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return requestWithRetry({
    url: `https://www.17lands.com/api/card_data?${query}`,
  }).then((payload) => {
    // 统一提取 data 字段，兼容两种格式
    if (Array.isArray(payload)) return payload;
    return (payload && Array.isArray(payload.data)) ? payload.data : [];
  });
}

function fetchColorRatings(params) {
  const query = Object.keys(params)
    .filter((key) => params[key] !== undefined && params[key] !== '')
    .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`)
    .join('&');
  return requestWithRetry({
    url: `https://www.17lands.com/color_ratings/data?${query}`,
  });
}

function fetchFilterMetadata() {
  return requestWithRetry({
    url: 'https://www.17lands.com/data/filters',
  });
}

function fetchPlayDrawData() {
  return requestWithRetry({
    url: 'https://www.17lands.com/data/play_draw',
  }).then((response) => {
    const rows = Array.isArray(response)
      ? response
      : (response && Array.isArray(response.data) ? response.data : []);
    return rows.map((item) => ({
      expansion: item.expansion,
      event_type: item.event_type,
      average_game_length: item.average_game_length,
      win_rate_on_play: item.win_rate_on_play,
    }));
  });
}

function fetchChineseNames() {
  return request({
    url: 'https://mtgch.com/static/card_names.json',
    timeout: DEFAULT_TIMEOUT,
  });
}

function fetchChineseSetNames() {
  return request({
    url: 'https://mtgch.com/api/v1/sets/',
    timeout: DEFAULT_TIMEOUT,
  });
}

function fetchCardDetailById(id) {
  const query = encodeURIComponent(`id=${id}`);
  return request({
    url: `https://mtgch.com/api/v1/result?q=${query}&page=1&page_size=1&unique=oracle_id&priority_chinese=true&view=1`,
  });
}

function searchMtgchCards(query, pageSize = 100, options = {}) {
  const unique = options.unique || 'oracle_id';
  return request({
    url: `https://mtgch.com/api/v1/result?q=${encodeURIComponent(query)}&page=1&page_size=${pageSize}&unique=${encodeURIComponent(unique)}&priority_chinese=true&view=1`,
  });
}

function fetchStatusSummary() {
  return request({
    url: 'https://magicthegatheringarena.statuspage.io/api/v2/summary.json',
  });
}

function fetchScryfallCard(id) {
  return request({
    url: `https://api.scryfall.com/cards/${id}`,
    header: SCRYFALL_HEADERS,
  });
}

function buildScryfallImageUrl(id, variant = 'large') {
  return `${SCRYFALL_CARD_HOST}/${variant}/front/${id.slice(0, 1)}/${id.slice(1, 2)}/${id}.jpg`;
}

function buildMtgchImageUrl(id, variant = 'large') {
  return `${MTGCH_IMAGE_HOST}/zhs/${variant}/front/${id.slice(0, 1)}/${id.slice(1, 2)}/${id}.webp`;
}

function toSiteUrl(path) {
  if (!path) return '';
  if (/^https?:\/\//.test(path)) return path;
  return `${SITE_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
}

module.exports = {
  SITE_BASE_URL,
  request,
  fetchCardData,
  fetchColorRatings,
  fetchFilterMetadata,
  fetchPlayDrawData,
  fetchChineseNames,
  fetchChineseSetNames,
  fetchCardDetailById,
  searchMtgchCards,
  fetchStatusSummary,
  fetchScryfallCard,
  buildScryfallImageUrl,
  buildMtgchImageUrl,
  toSiteUrl,
};
