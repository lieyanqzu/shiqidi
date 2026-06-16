// iOS 兼容的日期解析函数
// iOS 不支持负时区格式 "-07:00"，只支持 "+HH:mm"，需要手动解析
function parseDate(dateString) {
  if (!dateString) return new Date();

  const str = String(dateString);

  // 手动解析 ISO 8601 带时区格式：2024-01-01T12:00:00-07:00 或 +08:00
  const match = str.match(
    /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2}):(\d{2})(?:\.(\d+))?([+-])(\d{2}):(\d{2})$/
  );
  if (match) {
    const [, year, month, day, hours, minutes, seconds, ms, tzSign, tzH, tzM] = match;
    const utcMs = Date.UTC(
      Number(year), Number(month) - 1, Number(day),
      Number(hours), Number(minutes), Number(seconds),
      ms ? Number(ms.slice(0, 3)) : 0
    );
    const offsetMs = (Number(tzH) * 60 + Number(tzM)) * 60000;
    return new Date(tzSign === '+' ? utcMs - offsetMs : utcMs + offsetMs);
  }

  // 尝试直接解析（iOS 支持的格式：yyyy-MM-ddTHH:mm:ss、yyyy/MM/dd 等）
  try {
    const date = new Date(str);
    if (!isNaN(date.getTime())) return date;
  } catch (e) {
    // 解析失败
  }

  return new Date(NaN);
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
