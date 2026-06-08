function hasChineseText(value) {
  return /[\u4e00-\u9fff]/.test(String(value || ''));
}

function looksLikeTechnicalError(value) {
  const text = String(value || '').trim();
  return /^(TypeError|ReferenceError|SyntaxError|RangeError|Error):/i.test(text)
    || /^(Cannot|Failed|NetworkError|Request failed|undefined|null)\b/i.test(text)
    || /\bHTTP\s+\d{3}\b/i.test(text)
    || /\b(errMsg|stack trace|promise rejection)\b/i.test(text);
}

function toDisplayError(error, fallback) {
  const message = error && typeof error.message === 'string'
    ? error.message.trim()
    : '';
  if (message && hasChineseText(message) && !looksLikeTechnicalError(message)) {
    return message;
  }
  return fallback;
}

module.exports = {
  toDisplayError,
};
