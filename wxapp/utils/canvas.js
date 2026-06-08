function getDevicePixelRatio() {
  try {
    if (typeof wx.getWindowInfo === 'function') {
      return wx.getWindowInfo().pixelRatio || 1;
    }
    if (typeof wx.getSystemInfoSync === 'function') {
      return wx.getSystemInfoSync().pixelRatio || 1;
    }
  } catch (error) {
    return 1;
  }
  return 1;
}

function nextRender(callback) {
  if (typeof callback !== 'function') return;
  try {
    if (typeof wx.nextTick === 'function') {
      wx.nextTick(callback);
      return;
    }
  } catch (error) {
    callback();
    return;
  }
  callback();
}

function queryCanvasInfo(page, selector, callback) {
  if (typeof callback !== 'function') return;
  if (!page || !selector || typeof wx.createSelectorQuery !== 'function') {
    callback(null);
    return;
  }
  try {
    wx.createSelectorQuery()
      .in(page)
      .select(selector)
      .fields({ node: true, size: true, rect: true })
      .exec((result) => {
        callback(result && result[0] ? result[0] : null);
      });
  } catch (error) {
    callback(null);
  }
}

function queryElementInfo(page, selector, callback) {
  if (typeof callback !== 'function') return;
  if (!page || !selector || typeof wx.createSelectorQuery !== 'function') {
    callback(null);
    return;
  }
  try {
    wx.createSelectorQuery()
      .in(page)
      .select(selector)
      .fields({ size: true, rect: true })
      .exec((result) => {
        callback(result && result[0] ? result[0] : null);
      });
  } catch (error) {
    callback(null);
  }
}

function createCanvasContext(page, canvasId) {
  if (!page || !canvasId || typeof wx.createCanvasContext !== 'function') {
    return null;
  }
  try {
    return wx.createCanvasContext(canvasId, page);
  } catch (error) {
    return null;
  }
}

function canvasToTempFilePath(page, options, callbacks = {}) {
  if (!page || !options || typeof wx.canvasToTempFilePath !== 'function') {
    if (typeof callbacks.fail === 'function') callbacks.fail();
    return;
  }
  try {
    wx.canvasToTempFilePath({
      ...options,
      success(result) {
        if (typeof callbacks.success === 'function') callbacks.success(result);
      },
      fail(error) {
        if (typeof callbacks.fail === 'function') callbacks.fail(error);
      },
    }, page);
  } catch (error) {
    if (typeof callbacks.fail === 'function') callbacks.fail(error);
  }
}

module.exports = {
  canvasToTempFilePath,
  createCanvasContext,
  getDevicePixelRatio,
  nextRender,
  queryCanvasInfo,
  queryElementInfo,
};
