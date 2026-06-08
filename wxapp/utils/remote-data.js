const { request, toSiteUrl } = require('./api');

const remoteDataCache = {};
const remoteDataTimeout = 30000;

function buildRemoteDataUrl(name) {
  const path = String(name || '')
    .split('/')
    .filter(Boolean)
    .map((part) => encodeURIComponent(part))
    .join('/');
  return toSiteUrl(`/data/${path}.json`);
}

function fetchRemoteData(name) {
  if (!name) return Promise.reject(new Error('远程数据名称无效'));
  if (remoteDataCache[name]) return Promise.resolve(remoteDataCache[name]);
  return request({
    url: buildRemoteDataUrl(name),
    timeout: remoteDataTimeout,
  }).then((data) => {
    if (data === null || data === undefined || data === '') {
      throw new Error(`远程数据为空：${name}`);
    }
    remoteDataCache[name] = data;
    return data;
  });
}

function loadRemoteDataMap(names) {
  const dataNames = Array.isArray(names) ? names : [];
  return Promise.all(dataNames.map((name) => (
    fetchRemoteData(name).then((data) => [name, data])
  ))).then((entries) => entries.reduce((result, entry) => {
    result[entry[0]] = entry[1];
    return result;
  }, {}));
}

module.exports = {
  fetchRemoteData,
  loadRemoteDataMap,
};
