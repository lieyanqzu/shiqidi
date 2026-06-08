function readStorage(key, fallback = null) {
  try {
    const value = wx.getStorageSync(key);
    return value === undefined ? fallback : value;
  } catch (error) {
    return fallback;
  }
}

function writeStorage(key, value) {
  try {
    wx.setStorageSync(key, value);
    return true;
  } catch (error) {
    return false;
  }
}

module.exports = {
  readStorage,
  writeStorage,
};
