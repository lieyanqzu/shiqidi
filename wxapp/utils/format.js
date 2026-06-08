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
  const date = new Date(value);
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
  percent,
  number,
  dateText,
  normalizeCardName,
  denormalizeCardName,
};
