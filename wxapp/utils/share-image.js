const { createCanvasContext, canvasToTempFilePath } = require('./canvas');

// 通用分享图配置
const shareCanvas = {
  id: 'shareCanvas',
  width: 600,
  height: 480,
};

// 品牌色
const brandColor = '#0f5ce8';
const brandName = '十七地';

/**
 * 生成简单的页面分享图
 * @param {Object} page - 页面实例（this）
 * @param {Object} options - 配置选项
 * @param {string} options.title - 页面标题
 * @param {string} options.subtitle - 副标题（可选）
 * @param {string} options.description - 描述文本（可选）
 * @param {string} options.accentColor - 强调色（可选，默认使用品牌色）
 * @returns {Promise<string>} - 返回生成的临时图片路径
 */
function generatePageShareImage(page, options = {}) {
  return new Promise((resolve, reject) => {
    const ctx = createCanvasContext(page, shareCanvas.id);
    if (!ctx) {
      reject(new Error('无法创建 Canvas 上下文'));
      return;
    }

    const {
      title = '十七地小助手',
      subtitle = '',
      description = '',
      accentColor = brandColor,
    } = options;

    try {
      // 背景
      ctx.setFillStyle('#f8fafc');
      ctx.fillRect(0, 0, shareCanvas.width, shareCanvas.height);

      // 白色卡片
      ctx.setFillStyle('#ffffff');
      ctx.fillRect(34, 34, 532, 412);

      // 左侧装饰条
      ctx.setFillStyle(accentColor);
      ctx.fillRect(34, 34, 10, 412);

      // 品牌名称
      ctx.setFillStyle('#0f172a');
      ctx.setFontSize(28);
      ctx.setTextAlign('left');
      ctx.fillText(brandName, 70, 86);

      // 副标题标签（如果有）
      let contentTop = 140;
      if (subtitle) {
        ctx.setFillStyle(accentColor);
        ctx.fillRect(70, 116, 132, 38);
        ctx.setFillStyle('#ffffff');
        ctx.setFontSize(22);
        ctx.setTextAlign('left');
        ctx.fillText(subtitle, 86, 142);
        contentTop = 190;
      }

      // 主标题
      ctx.setFillStyle('#0f172a');
      ctx.setFontSize(36);
      ctx.setTextAlign('left');
      const titleBottom = drawWrappedText(ctx, title, 70, contentTop, 460, 60, 2);

      // 描述文本（如果有）
      if (description) {
        ctx.setFillStyle('#64748b');
        ctx.setFontSize(22);
        ctx.setTextAlign('left');
        drawWrappedText(ctx, description, 70, titleBottom + 40, 460, 40, 3);
      }

      // 底部提示
      ctx.setFillStyle('#94a3b8');
      ctx.setFontSize(20);
      ctx.setTextAlign('left');
      ctx.fillText('扫码打开小程序查看更多', 70, 414);

      ctx.draw(false, () => {
        canvasToTempFilePath(page, {
          canvasId: shareCanvas.id,
          width: shareCanvas.width,
          height: shareCanvas.height,
          destWidth: shareCanvas.width,
          destHeight: shareCanvas.height,
          fileType: 'png',
        }, {
          success: (result) => {
            if (result && result.tempFilePath) {
              resolve(result.tempFilePath);
            } else {
              reject(new Error('生成分享图失败'));
            }
          },
          fail: (error) => {
            reject(error || new Error('生成分享图失败'));
          },
        });
      });
    } catch (error) {
      reject(error);
    }
  });
}

/**
 * 绘制自动换行的文本
 * @param {Object} ctx - Canvas 上下文
 * @param {string} text - 要绘制的文本
 * @param {number} x - 起始 x 坐标
 * @param {number} y - 起始 y 坐标
 * @param {number} maxWidth - 最大宽度
 * @param {number} lineHeight - 行高
 * @param {number} maxLines - 最大行数
 * @returns {number} - 最后一行文本的底部 y 坐标
 */
function drawWrappedText(ctx, text, x, y, maxWidth, lineHeight, maxLines = 999) {
  if (!text) return y;
  const lines = [];
  let currentLine = '';
  const chars = String(text).split('');

  for (let i = 0; i < chars.length; i++) {
    const testLine = currentLine + chars[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && currentLine) {
      lines.push(currentLine);
      currentLine = chars[i];
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }

  const displayLines = lines.slice(0, maxLines);
  displayLines.forEach((line, index) => {
    let displayText = line;
    if (index === maxLines - 1 && lines.length > maxLines) {
      displayText = line.slice(0, -2) + '...';
    }
    ctx.fillText(displayText, x, y + index * lineHeight);
  });

  return y + (displayLines.length - 1) * lineHeight;
}

module.exports = {
  shareCanvas,
  generatePageShareImage,
};
