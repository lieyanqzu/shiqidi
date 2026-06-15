// iOS 兼容的日期解析函数
// iOS 不支持 "yyyy-MM-ddTHH:mm:ss±HH:mm" 格式，需要移除时区偏移
function parseDate(dateString) {
  if (!dateString) return new Date();

  // 移除时区偏移部分（如 -07:00, +08:00）
  const normalized = String(dateString).replace(/([+-]\d{2}):(\d{2})$/, '');

  return new Date(normalized);
}

function percent(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }
  return `${(Number(value) * 100).toFixed(digits)}%`;
}

function number(value, digits = 1) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return '-';
  }
  return Number(value).toFixed(digits);
}

function dateText(value) {
  if (!value) return '未知';

  const date = parseDate(value);
  if (Number.isNaN(date.getTime())) return String(value).slice(0, 10);
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function normalizeCardName(name) {
  return String(name || '').replace(/\s*\/\/\s*/g, '/');
}

function denormalizeCardName(name) {
  const value = String(name || '');
  if (value.includes(' // ')) return value;
  return value.replace(/\//g, ' // ');
}

module.exports = {
  parseDate,
  percent,
  number,
  dateText,
  normalizeCardName,
  denormalizeCardName,
};
