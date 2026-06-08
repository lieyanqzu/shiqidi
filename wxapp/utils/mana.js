const { getManaGlyph } = require('../data/mana-symbols');

const colorOrder = ['W', 'U', 'B', 'R', 'G', 'C'];
const colorCodes = {
  W: 'w',
  U: 'u',
  B: 'b',
  R: 'r',
  G: 'g',
  C: 'c',
};

const specialCodes = {
  T: 'tap',
  Q: 'untap',
  S: 's',
  E: 'e',
  X: 'x',
  Y: 'y',
  Z: 'z',
  P: 'p',
  TK: 'tk',
};

const splitColorPairs = {
  WU: true,
  WB: true,
  UB: true,
  UR: true,
  BR: true,
  BG: true,
  RW: true,
  RG: true,
  GW: true,
  GU: true,
};

function normalizeManaSymbol(symbol) {
  return String(symbol || '').trim().toUpperCase();
}

function normalizeClassName(symbol) {
  const text = normalizeManaSymbol(symbol);
  if (!text) return 'unknown';
  if (text === '1/2') return '1-2';
  if (text === '∞') return 'infinity';
  return text.toLowerCase().replace(/[^a-z0-9]+/g, '') || 'unknown';
}

function getSymbolText(symbol) {
  const text = normalizeManaSymbol(symbol);
  if (!text) return '';
  if (text === '∞') return '∞';
  return text;
}

function getComponentCode(part) {
  const text = normalizeManaSymbol(part);
  if (colorCodes[text]) return colorCodes[text];
  if (/^\d+$/.test(text)) return text;
  if (specialCodes[text]) return specialCodes[text];
  if (text === '∞') return 'infinity';
  if (text === '1/2') return '1-2';
  return text.toLowerCase().replace(/[^a-z0-9-]+/g, '');
}

function getManaCode(symbol) {
  const text = normalizeManaSymbol(symbol);
  if (!text) return '';
  if (text === '1/2') return '1-2';
  if (text === '∞') return 'infinity';
  if (colorCodes[text]) return colorCodes[text];
  if (specialCodes[text]) return specialCodes[text];
  if (/^\d+$/.test(text)) return text;
  return normalizeClassName(text);
}

function getManaTone(symbol) {
  const text = normalizeManaSymbol(symbol);
  const firstColor = text.match(/[WUBRG]/);
  if (firstColor) return firstColor[0].toLowerCase();
  if (text === 'C') return 'c';
  if (/^\d+$/.test(text)) return 'generic';
  if (text === 'X' || text === 'Y' || text === 'Z') return 'variable';
  if (text === 'T' || text === 'Q') return 'action';
  if (text === 'S') return 'snow';
  if (text === 'E') return 'energy';
  return 'generic';
}

function getSplitSymbol(symbol) {
  const text = normalizeManaSymbol(symbol);
  const parts = text.split('/').filter(Boolean);
  if (parts.length !== 2 && parts.length !== 3) return null;

  const hasPhyrexianSuffix = parts[parts.length - 1] === 'P';
  if (parts.length === 2 && hasPhyrexianSuffix) {
    const colorCode = getComponentCode(parts[0]);
    if (!colorCode || !getManaGlyph(colorCode)) return null;
    return {
      className: `${colorCode}p`,
      glyph: getManaGlyph('p'),
      secondaryGlyph: '',
      split: false,
      phyrexian: true,
    };
  }

  const left = getComponentCode(parts[0]);
  const right = getComponentCode(parts[1]);
  const pairKey = `${parts[0]}${parts[1]}`;
  const canSplit = !!(
    left
    && right
    && getManaGlyph(left)
    && getManaGlyph(right)
    && (splitColorPairs[pairKey] || left === '2' || left === 'c')
  );
  if (!canSplit) return null;

  return {
    className: `${left}${right}${hasPhyrexianSuffix ? 'p' : ''}`,
    glyph: hasPhyrexianSuffix ? getManaGlyph('p') : getManaGlyph(left),
    secondaryGlyph: hasPhyrexianSuffix ? getManaGlyph('p') : getManaGlyph(right),
    split: true,
    phyrexian: hasPhyrexianSuffix,
  };
}

function parseManaSymbol(symbol, index = 0) {
  const raw = String(symbol || '').trim();
  const normalized = normalizeManaSymbol(raw);
  const splitSymbol = getSplitSymbol(normalized);
  const className = splitSymbol ? splitSymbol.className : getManaCode(normalized);
  const glyph = splitSymbol ? splitSymbol.glyph : getManaGlyph(className);
  const secondaryGlyph = splitSymbol ? splitSymbol.secondaryGlyph : '';
  const text = getSymbolText(normalized);
  return {
    key: `${index}-${className || normalizeClassName(normalized)}`,
    raw,
    text,
    tone: getManaTone(normalized),
    className: className || normalizeClassName(normalized),
    glyph,
    secondaryGlyph,
    split: !!(splitSymbol && splitSymbol.split),
    phyrexian: !!(splitSymbol && splitSymbol.phyrexian),
    known: !!glyph,
  };
}

function parseManaCost(value) {
  const text = String(value || '').trim();
  if (!text) return [];

  const matches = Array.from(text.matchAll(/\{([^}]+)\}/g));
  if (!matches.length) return [];

  return matches.map((match, index) => parseManaSymbol(match[1], index));
}

function parseColorSymbols(value) {
  const text = String(value || '').trim().toUpperCase();
  const symbols = text ? text.split('').filter((item) => colorCodes[item]) : ['C'];
  return symbols
    .sort((left, right) => colorOrder.indexOf(left) - colorOrder.indexOf(right))
    .map((symbol, index) => parseManaSymbol(symbol, index));
}

function parseManaTextSegments(value) {
  const source = String(value || '');
  const segments = [];
  const regex = /\{([^}]+)\}/g;
  let lastIndex = 0;
  let match;

  function pushText(text) {
    if (!text) return;
    segments.push({
      key: `${segments.length}-text`,
      type: 'text',
      text,
    });
  }

  while ((match = regex.exec(source)) !== null) {
    if (match.index > lastIndex) {
      pushText(source.slice(lastIndex, match.index));
    }

    const symbol = parseManaSymbol(match[1], segments.length);
    if (symbol.known) {
      segments.push({
        ...symbol,
        key: `${segments.length}-mana-${symbol.className}`,
        type: 'mana',
      });
    } else {
      pushText(match[0]);
    }

    lastIndex = match.index + match[0].length;
  }

  if (lastIndex < source.length) {
    pushText(source.slice(lastIndex));
  }

  return segments;
}

module.exports = {
  parseManaCost,
  parseColorSymbols,
  parseManaSymbol,
  parseManaTextSegments,
};
