const keyruneFontBase64 = require('../data/keyrune-font');
const manaFontBase64 = require('../data/mana-font');

const keyruneFontSource = `url("data:font/woff2;charset=utf-8;base64,${keyruneFontBase64}")`;
const manaFontSource = `url("data:font/woff2;charset=utf-8;base64,${manaFontBase64}")`;

const fontStates = {
  Keyrune: {
    loading: false,
    ready: false,
    callbacks: [],
  },
  Mana: {
    loading: false,
    ready: false,
    callbacks: [],
  },
};

function notifyCallbacks(family) {
  const state = fontStates[family];
  const callbacks = state.callbacks.slice();
  state.callbacks = [];
  callbacks.forEach((callback) => callback());
}

function loadFontFace(family, source, onReady) {
  const state = fontStates[family];
  if (!state) return false;
  if (typeof onReady === 'function') {
    state.callbacks.push(onReady);
  }
  if (state.ready) {
    notifyCallbacks(family);
    return true;
  }
  if (state.loading) return true;
  if (typeof wx === 'undefined' || typeof wx.loadFontFace !== 'function') {
    state.callbacks = [];
    return false;
  }

  state.loading = true;
  try {
    wx.loadFontFace({
      family,
      source,
      global: true,
      success() {
        state.ready = true;
        state.loading = false;
        notifyCallbacks(family);
      },
      fail() {
        state.loading = false;
        state.callbacks = [];
      },
    });
    return true;
  } catch (error) {
    state.loading = false;
    return false;
  }
}

function loadKeyruneFont(onReady) {
  return loadFontFace('Keyrune', keyruneFontSource, onReady);
}

function loadManaFont(onReady) {
  return loadFontFace('Mana', manaFontSource, onReady);
}

module.exports = {
  loadKeyruneFont,
  loadManaFont,
};
