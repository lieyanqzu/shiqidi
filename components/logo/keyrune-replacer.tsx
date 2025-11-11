'use client';

import { useEffect } from 'react';
import { DYNAMIC_SETS } from './dynamic-sets';

// SVG 缓存
const svgCache = new Map<string, { paths: string[]; viewBox: string } | null>();

// 从 Scryfall 获取 SVG
async function fetchSetIcon(setCode: string): Promise<{ paths: string[]; viewBox: string } | null> {
  if (svgCache.has(setCode)) {
    return svgCache.get(setCode)!;
  }

  try {
    const res = await fetch(`https://api.scryfall.com/sets/${setCode}`);
    const data = await res.json();
    
    if (!data.icon_svg_uri) {
      svgCache.set(setCode, null);
      return null;
    }

    const svgRes = await fetch(data.icon_svg_uri);
    const svg = await svgRes.text();
    
    const viewBoxMatch = svg.match(/viewBox="([^"]+)"/i);
    const viewBox = viewBoxMatch ? viewBoxMatch[1] : '0 0 600 600';
    
    // 提取所有 path 元素
    const pathMatches = svg.matchAll(/<path[^>]*\sd="([^"]+)"/gi);
    const paths: string[] = [];
    for (const match of pathMatches) {
      if (match[1]) {
        paths.push(match[1]);
      }
    }
    
    if (paths.length > 0) {
      const result = { paths, viewBox };
      svgCache.set(setCode, result);
      return result;
    }
    
    svgCache.set(setCode, null);
    return null;
  } catch (error) {
    console.error(`[KeyruneReplacer] 获取 ${setCode} 失败:`, error);
    svgCache.set(setCode, null);
    return null;
  }
}

// 正在处理的元素集合，避免重复处理
const processing = new Set<HTMLElement>();

// 替换单个 keyrune 图标
async function replaceKeyruneIcon(element: HTMLElement) {
  // 如果已经替换过了或正在处理，跳过
  if (element.dataset.replaced === 'true' || processing.has(element)) return;
  
  // 如果是由 SetIcon 组件管理的，跳过（SetIcon 会自己处理）
  if (element.dataset.setIconManaged === 'true') return;
  
  // 检查是否已经有 SetIcon 组件创建的 SVG（通过检查兄弟节点）
  const siblingSvg = element.nextElementSibling as HTMLElement;
  if (siblingSvg && siblingSvg.tagName === 'svg' && siblingSvg.dataset.setIcon === 'true') {
    // 如果已经有 SetIcon 创建的 SVG，隐藏这个 keyrune 图标
    element.style.display = 'none';
    element.setAttribute('data-replaced', 'true');
    return;
  }
  
  // 检查并清理旧的 SVG（如果存在）
  const oldSvg = element.nextElementSibling as HTMLElement;
  if (oldSvg && oldSvg.tagName === 'svg' && oldSvg.dataset.replaced === 'true') {
    // 移除旧的 SVG
    oldSvg.remove();
    element.style.display = '';
    element.removeAttribute('data-replaced');
  }
  
  const classList = Array.from(element.classList);
  
  // 找到系列代码（ss-xxx 格式）
  const setClass = classList.find(cls => cls.startsWith('ss-') && cls !== 'ss-fw' && !cls.match(/^ss-(xs|sm|base|lg|xl|2x|3x|4x|common|uncommon|rare|mythic|timeshifted)$/));
  
  if (!setClass) return;
  
  const setCode = setClass.replace('ss-', '').toLowerCase();
  
  // 只处理 DYNAMIC_SETS 中的系列
  if (!DYNAMIC_SETS.includes(setCode as string)) return;
  
  processing.add(element);

  // 获取稀有度
  const rarityClass = classList.find(cls => cls.match(/^ss-(common|uncommon|rare|mythic|timeshifted)$/));
  const rarity = rarityClass ? rarityClass.replace('ss-', '') : null;

  const rarityColors: Record<string, string> = {
    common: '#1a1818', uncommon: '#707883', rare: '#a58e4a',
    mythic: '#bf4427', timeshifted: '#652978',
  };
  
  // 获取 SVG
  const svgData = await fetchSetIcon(setCode);
  
  if (!svgData) {
    processing.delete(element);
    return;
  }
  
  // 创建 SVG 元素
  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  // 只移除系列代码类（ss-xxx），保留尺寸类（ss-2x等）和其他类
  const cleanedClass = element.className
    .split(/\s+/)
    .filter(cls => !cls.match(/^ss-(?!fw|xs|sm|base|lg|xl|2x|3x|4x|common|uncommon|rare|mythic|timeshifted)/))
    .join(' ') + ' inline-block align-middle';
  svg.setAttribute('class', cleanedClass.trim());
  svg.setAttribute('viewBox', svgData.viewBox);
  
  // 解析 viewBox 获取宽高比
  const viewBoxMatch = svgData.viewBox.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
  let widthStyle = '1em';
  if (viewBoxMatch) {
    const viewBoxWidth = parseFloat(viewBoxMatch[3]);
    const viewBoxHeight = parseFloat(viewBoxMatch[4]);
    if (viewBoxHeight > 0) {
      // 保持 viewBox 的宽高比，高度为 1em，宽度按比例计算
      const aspectRatio = viewBoxWidth / viewBoxHeight;
      widthStyle = `${aspectRatio}em`;
    }
  }
  
  // SVG 高度为 1em，宽度根据 viewBox 宽高比计算，让 CSS 的 font-size（如 ss-2x 的 2em）控制实际大小
  svg.setAttribute('style', `width: ${widthStyle}; height: 1em; fill: ${rarity ? rarityColors[rarity] : 'currentColor'}; vertical-align: middle;`);
  svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');
  svg.setAttribute('aria-hidden', 'true');
  svg.setAttribute('data-replaced', 'true');
  
  // 创建所有 path 元素
  svgData.paths.forEach(pathData => {
    const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
    path.setAttribute('d', pathData);
    svg.appendChild(path);
  });
  
  // 隐藏原图标并插入 SVG（不替换，避免与 React 冲突）
  element.style.display = 'none';
  element.setAttribute('data-replaced', 'true');
  element.parentNode?.insertBefore(svg, element.nextSibling);
  
  processing.delete(element);
}

/**
 * 全局 Keyrune 图标替换器
 * 自动查找并替换页面上的 keyrune 图标
 */
export function KeyruneReplacer() {
  useEffect(() => {
    // 替换现有图标（延迟执行，避免与 React 渲染冲突）
    const replaceAll = () => {
      requestAnimationFrame(() => {
        document.querySelectorAll('i.keyrune, i.ss').forEach((el) => {
          if (el instanceof HTMLElement && !el.dataset.replaced && !el.dataset.setIconManaged) {
            replaceKeyruneIcon(el);
          }
        });
      });
    };
    
    // 初始替换（延迟一点，等 React 渲染完成）
    setTimeout(replaceAll, 100);
    
    // 使用 MutationObserver 监听新添加的图标以及 class 变更（系列切换）
    const observer = new MutationObserver((mutations) => {
      // 使用 requestAnimationFrame 延迟处理，避免与 React 冲突
      requestAnimationFrame(() => {
        mutations.forEach((mutation) => {
          // 处理 class 变更：当 <i class="ss ss-xxx"> 的系列类变化时，清理并重新替换
          if (mutation.type === 'attributes' && mutation.target instanceof HTMLElement) {
            const el = mutation.target as HTMLElement;
            if ((el.classList.contains('keyrune') || el.classList.contains('ss'))) {
              // 清理可能存在的跟随 SVG
              const nextSvg = el.nextElementSibling as HTMLElement | null;
              if (nextSvg && nextSvg.tagName === 'svg' && (nextSvg.dataset.replaced === 'true' || nextSvg.dataset.setIcon === 'true')) {
                nextSvg.remove();
              }
              // 取消隐藏与标记，使其可以被重新处理
              el.style.display = '';
              el.removeAttribute('data-replaced');
              if (!el.dataset.setIconManaged) {
                replaceKeyruneIcon(el);
              }
            }
          }

          mutation.addedNodes.forEach((node) => {
            if (node instanceof HTMLElement) {
              // 如果新节点是 SetIcon 创建的 SVG，检查前面的兄弟节点是否有 keyrune 图标需要隐藏
              if (node.tagName === 'svg' && (node as HTMLElement).dataset.setIcon === 'true') {
                const prevSibling = node.previousElementSibling as HTMLElement;
                if (prevSibling && (prevSibling.classList.contains('keyrune') || prevSibling.classList.contains('ss'))) {
                  prevSibling.style.display = 'none';
                  prevSibling.setAttribute('data-replaced', 'true');
                }
                return;
              }
              
              // 检查新节点本身
              if ((node.classList.contains('keyrune') || node.classList.contains('ss')) && !node.dataset.replaced && !node.dataset.setIconManaged) {
                // 检查后面是否已经有 SetIcon 创建的 SVG
                const nextSvg = node.nextElementSibling as HTMLElement;
                if (nextSvg && nextSvg.tagName === 'svg' && nextSvg.dataset.setIcon === 'true') {
                  node.style.display = 'none';
                  node.setAttribute('data-replaced', 'true');
                  return;
                }
                replaceKeyruneIcon(node);
              }
              // 检查新节点内的图标
              node.querySelectorAll?.('i.keyrune, i.ss').forEach((el) => {
                if (el instanceof HTMLElement && !el.dataset.replaced && !el.dataset.setIconManaged) {
                  const nextSvg = el.nextElementSibling as HTMLElement;
                  if (nextSvg && nextSvg.tagName === 'svg' && nextSvg.dataset.setIcon === 'true') {
                    el.style.display = 'none';
                    el.setAttribute('data-replaced', 'true');
                    return;
                  }
                  replaceKeyruneIcon(el);
                }
              });
            }
          });
        });
      });
    });
    
    observer.observe(document.body, {
      childList: true,
      subtree: true,
      attributes: true,
      attributeFilter: ['class'],
    });
    
    return () => {
      observer.disconnect();
    };
  }, []);
  
  return null;
}

