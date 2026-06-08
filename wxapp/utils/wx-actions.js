function showToast(title, icon = 'none') {
  if (!title) return;
  wx.showToast({ title, icon });
}

function copyText(data, successTitle = '内容已复制', failTitle = '复制失败') {
  if (!data) {
    showToast('没有可复制的内容');
    return;
  }
  wx.setClipboardData({
    data,
    success() {
      showToast(successTitle);
    },
    fail() {
      showToast(failTitle);
    },
  });
}

function openPage(url, options = {}) {
  if (!url) return;
  const targetUrl = String(url).startsWith('/') ? String(url) : `/${url}`;
  const pages = typeof getCurrentPages === 'function' ? getCurrentPages() : [];
  const currentPage = pages[pages.length - 1];
  const currentUrl = currentPage && currentPage.route ? `/${currentPage.route}` : '';
  const homeUrl = '/pages/index/index';
  const routeAnimation = {
    animationType: 'none',
    animationDuration: 0,
  };

  if (targetUrl === currentUrl) return;

  const fail = () => {
    showToast(options.failTitle || '页面打开失败');
  };

  if (targetUrl === homeUrl) {
    const homeIndex = pages.slice(0, -1).map((page) => `/${page.route}`).lastIndexOf(homeUrl);
    if (homeIndex >= 0) {
      wx.navigateBack({
        delta: pages.length - 1 - homeIndex,
        ...routeAnimation,
        fail,
      });
      return;
    }
    wx.redirectTo({ url: targetUrl, ...routeAnimation, fail });
    return;
  }

  if (currentUrl === homeUrl) {
    wx.navigateTo({
      url: targetUrl,
      ...routeAnimation,
      fail() {
        wx.redirectTo({ url: targetUrl, ...routeAnimation, fail });
      },
    });
    return;
  }

  wx.redirectTo({ url: targetUrl, ...routeAnimation, fail });
}

function previewImages(current, urls, failTitle = '图片预览失败') {
  if (!current) {
    showToast('暂无可预览图片');
    return;
  }
  const candidates = Array.isArray(urls) && urls.length ? urls : [current];
  wx.showLoading({ title: '正在加载图片', mask: true });

  wx.getImageInfo({
    src: current,
    success(result) {
      const localPath = result && result.path ? result.path : current;
      const previewUrls = candidates.map((item) => (item === current ? localPath : item));
      if (!previewUrls.includes(localPath)) previewUrls.unshift(localPath);
      wx.hideLoading();
      wx.previewImage({
        current: localPath,
        urls: previewUrls,
        fail() {
          showToast(failTitle);
        },
      });
    },
    fail() {
      wx.hideLoading();
      wx.previewImage({
        current,
        urls: candidates,
        fail() {
          showToast(failTitle);
        },
      });
    },
  });
}

function scrollToSelector(selector, options = {}) {
  if (!selector || typeof wx.pageScrollTo !== 'function') return;
  wx.pageScrollTo({
    selector,
    duration: options.duration === undefined ? 280 : options.duration,
    fail() {
      if (options.failTitle) showToast(options.failTitle);
    },
  });
}

function showActionMenu(itemList, onSelect, options = {}) {
  if (!Array.isArray(itemList) || !itemList.length) {
    showToast('暂无可用操作');
    return;
  }
  if (typeof wx.showActionSheet !== 'function') {
    if (typeof options.unsupported === 'function') {
      options.unsupported();
      return;
    }
    showToast(options.unsupportedTitle || '当前微信版本不支持操作菜单');
    return;
  }
  wx.showActionSheet({
    itemList,
    success(result) {
      if (typeof onSelect === 'function') {
        onSelect(result.tapIndex, result);
      }
    },
    fail(error) {
      const errMsg = String(error && error.errMsg || '');
      if (/cancel/i.test(errMsg)) return;
      showToast(options.failTitle || '操作菜单打开失败');
    },
  });
}

function showInfoModal({ title, content, confirmText = '知道了' }) {
  const safeTitle = title || '提示';
  const safeContent = content || '暂无说明。';
  if (typeof wx.showModal !== 'function') {
    showToast(safeContent);
    return;
  }
  wx.showModal({
    title: safeTitle,
    content: safeContent,
    showCancel: false,
    confirmText,
    fail() {
      showToast(safeContent);
    },
  });
}

function addPhoneCalendarEvent(payload, options = {}) {
  if (!payload || !payload.title || !payload.startTime || !payload.endTime) {
    showToast(options.invalidTitle || '日历事件信息不完整');
    return;
  }
  if (typeof wx.addPhoneCalendar !== 'function') {
    showToast(options.unsupportedTitle || '当前微信版本不支持添加系统日历');
    return;
  }
  wx.addPhoneCalendar({
    ...payload,
    success(result) {
      if (typeof payload.success === 'function') payload.success(result);
      showToast(options.successTitle || '已加入系统日历', 'success');
    },
    fail(error) {
      if (typeof payload.fail === 'function') payload.fail(error);
      showToast(options.failTitle || '添加日历失败');
    },
  });
}

module.exports = {
  showToast,
  copyText,
  openPage,
  previewImages,
  scrollToSelector,
  showActionMenu,
  showInfoModal,
  addPhoneCalendarEvent,
};
