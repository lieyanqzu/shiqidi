const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..', '..');
const wxDataDir = path.join(rootDir, 'wxapp', 'data');
const keyruneFontSource = path.join(rootDir, 'node_modules', 'keyrune', 'fonts', 'keyrune.woff2');
const keyruneCssSource = path.join(rootDir, 'node_modules', 'keyrune', 'css', 'keyrune.css');
const manaFontSource = path.join(rootDir, 'node_modules', '.pnpm', 'mana-font@1.18.0', 'node_modules', 'mana-font', 'fonts', 'mana.woff2');
const manaCssSource = path.join(rootDir, 'node_modules', '.pnpm', 'mana-font@1.18.0', 'node_modules', 'mana-font', 'css', 'mana.css');
const generatedHeader = '// 此文件由 wxapp/scripts/sync-wxapp-data.js 从依赖资源生成，请勿手工修改。';

function writeGeneratedText(relativePath, body) {
  const target = path.join(rootDir, relativePath);
  fs.mkdirSync(path.dirname(target), { recursive: true });
  fs.writeFileSync(target, `${generatedHeader}\n${body}`, 'utf8');
}

function findKeyruneFontSource() {
  if (!fs.existsSync(keyruneFontSource)) {
    throw new Error('未找到 Keyrune 字体文件，请先安装 keyrune 依赖');
  }
  return keyruneFontSource;
}

function findKeyruneCssSource() {
  if (!fs.existsSync(keyruneCssSource)) {
    throw new Error('未找到 Keyrune CSS 文件，请先安装 keyrune 依赖');
  }
  return keyruneCssSource;
}

function findManaFontSource() {
  if (!fs.existsSync(manaFontSource)) {
    throw new Error('未找到 Mana 字体文件，请先安装 mana-font 依赖');
  }
  return manaFontSource;
}

function findManaCssSource() {
  if (!fs.existsSync(manaCssSource)) {
    throw new Error('未找到 Mana CSS 文件，请先安装 mana-font 依赖');
  }
  return manaCssSource;
}

function toGlyphLiteral(hex) {
  return `\\u${String(hex).toLowerCase().padStart(4, '0')}`;
}

function buildSetIconsModule() {
  const css = fs.readFileSync(findKeyruneCssSource(), 'utf8');
  const defaultMatch = css.match(/\.ss:before\s*\{\s*content:\s*"\\([0-9a-fA-F]+)";\s*\}/m);
  if (!defaultMatch) {
    throw new Error('未能从 Keyrune CSS 中提取默认系列图标');
  }

  const glyphs = {};
  const glyphPattern = /^\.ss-([a-z0-9]+):before\s*\{\s*\r?\n\s*content:\s*"\\([0-9a-fA-F]+)";/gm;
  let match = glyphPattern.exec(css);
  while (match) {
    glyphs[match[1]] = match[2];
    match = glyphPattern.exec(css);
  }

  if (!Object.keys(glyphs).length) {
    throw new Error('未能从 Keyrune CSS 中提取系列图标映射');
  }

  const glyphLines = Object.keys(glyphs).sort().map((code) => (
    `  ${JSON.stringify(code)}: '${toGlyphLiteral(glyphs[code])}',`
  ));

  return `const defaultSetIconGlyph = '${toGlyphLiteral(defaultMatch[1])}';

const setIconGlyphs = {
${glyphLines.join('\n')}
};

function normalizeSetCode(expansion) {
  const text = String(expansion || '').trim();
  if (!text) return '';
  if (text === 'Chaos') return 'chr';
  if (text === 'Remix - Artifacts') return 'bot';
  if (text === 'CORE') return 'm19';
  if (text === 'RAVM') return 'rav';
  if (text === 'Ravnica') return 'rav';
  if (text.startsWith('Cube')) return '';
  if (text.startsWith('Y')) {
    const prefixMatch = text.match(/^Y\\d{0,2}/);
    return prefixMatch ? \`y\${text.slice(prefixMatch[0].length)}\`.toLowerCase() : text.toLowerCase();
  }
  return text.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function getSetIconGlyph(expansion) {
  const code = normalizeSetCode(expansion);
  if (!code) return '';
  if (setIconGlyphs[code]) return setIconGlyphs[code];
  if (code.startsWith('y') && setIconGlyphs[code.slice(1)]) return setIconGlyphs[code.slice(1)];
  return defaultSetIconGlyph;
}

module.exports = {
  defaultSetIconGlyph,
  getSetIconGlyph,
};
`;
}

function buildManaSymbolsModule() {
  const css = fs.readFileSync(findManaCssSource(), 'utf8');
  const glyphs = {};
  const rulePattern = /([^{}]+)\{\s*content:\s*"\\([0-9a-fA-F]+)";\s*\}/gm;
  let match = rulePattern.exec(css);
  while (match) {
    const selectors = match[1].split(',');
    selectors.forEach((selector) => {
      const selectorMatch = selector.trim().match(/^\.ms-([a-z0-9-]+)::before$/i);
      if (selectorMatch) {
        glyphs[selectorMatch[1].toLowerCase()] = match[2];
      }
    });
    match = rulePattern.exec(css);
  }

  if (!Object.keys(glyphs).length) {
    throw new Error('未能从 Mana CSS 中提取法术力符号映射');
  }

  const glyphLines = Object.keys(glyphs).sort().map((code) => (
    `  ${JSON.stringify(code)}: '${toGlyphLiteral(glyphs[code])}',`
  ));

  return `const manaGlyphs = {
${glyphLines.join('\n')}
};

function getManaGlyph(code) {
  return manaGlyphs[String(code || '').trim().toLowerCase()] || '';
}

module.exports = {
  manaGlyphs,
  getManaGlyph,
};
`;
}

function writeKeyruneFontModule(fontSource) {
  const base64 = fs.readFileSync(fontSource).toString('base64');
  writeGeneratedText('wxapp/data/keyrune-font.js', `module.exports=${JSON.stringify(base64)};\n`);
}

function writeManaFontModule(fontSource) {
  const base64 = fs.readFileSync(fontSource).toString('base64');
  writeGeneratedText('wxapp/data/mana-font.js', `module.exports=${JSON.stringify(base64)};\n`);
}

function syncFontModules() {
  fs.mkdirSync(wxDataDir, { recursive: true });

  writeKeyruneFontModule(findKeyruneFontSource());
  writeGeneratedText('wxapp/data/set-icons.js', buildSetIconsModule());
  writeManaFontModule(findManaFontSource());
  writeGeneratedText('wxapp/data/mana-symbols.js', buildManaSymbolsModule());
}

try {
  syncFontModules();
  console.log('小程序字体模块已同步。');
} catch (error) {
  console.error('同步小程序字体模块失败：', error);
  process.exitCode = 1;
}
