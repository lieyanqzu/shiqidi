'use client';

import React, { useState, useEffect } from 'react';
import { DYNAMIC_SETS } from './dynamic-sets';

interface SetIconProps {
  set: string;
  className?: string;
  size?: 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2x' | '3x' | '4x';
  rarity?: 'common' | 'uncommon' | 'rare' | 'mythic' | 'timeshifted';
  style?: React.CSSProperties;
}

// 简单的内存缓存
const svgCache = new Map<string, { paths: string[]; viewBox: string } | null>();

/**
 * 系列图标组件
 * 对于 DYNAMIC_SETS 中的系列，从 Scryfall 获取 SVG
 * 其他系列使用 keyrune 字体图标
 */
export function SetIcon({ 
  set, 
  className = '', 
  size = 'base',
  rarity,
  style 
}: SetIconProps) {
  const processedSet = set.startsWith('Y') 
    ? `y${set.slice(set.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
    : set.toLowerCase();

  const [svgData, setSvgData] = useState<{ paths: string[]; viewBox: string } | null>(null);

  useEffect(() => {
    // 如果新系列不在 DYNAMIC_SETS 中，清空 SVG 数据
    if (!DYNAMIC_SETS.includes(processedSet as string)) {
      setSvgData(null);
      return;
    }

    // 检查缓存
    if (svgCache.has(processedSet)) {
      setSvgData(svgCache.get(processedSet)!);
      return;
    }

    // 从 Scryfall 获取
    fetch(`https://api.scryfall.com/sets/${processedSet}`)
      .then(res => res.json())
      .then(data => {
        if (data.icon_svg_uri) {
          return fetch(data.icon_svg_uri);
        }
        throw new Error('No SVG');
      })
      .then(res => res.text())
      .then(svg => {
        // 提取 viewBox
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
          const data = { paths, viewBox };
          svgCache.set(processedSet, data);
          setSvgData(data);
        } else {
          svgCache.set(processedSet, null);
          setSvgData(null);
        }
      })
      .catch((error) => {
        console.error(`[SetIcon] ${processedSet} 加载失败:`, error);
        svgCache.set(processedSet, null);
        setSvgData(null);
      });
  }, [processedSet]);

  const sizeMap = {
    'xs': '0.75em', 'sm': '0.875em', 'base': '1em', 'lg': '1.25em',
    'xl': '1.5em', '2x': '2em', '3x': '3em', '4x': '4em',
  };

  const rarityColors = {
    common: '#1a1818', uncommon: '#707883', rare: '#a58e4a',
    mythic: '#bf4427', timeshifted: '#652978',
  };

  // 如果有 SVG，显示 SVG
  if (svgData) {
    // 使用 ref 来清理可能存在的 KeyruneReplacer 创建的 SVG
    const svgRef = (node: SVGSVGElement | null) => {
      if (node) {
        // 检查前面是否有 KeyruneReplacer 创建的 SVG，如果有则移除
        const prevSibling = node.previousElementSibling as HTMLElement;
        if (prevSibling && prevSibling.tagName === 'svg' && prevSibling.dataset.replaced === 'true' && !prevSibling.dataset.setIcon) {
          prevSibling.remove();
        }
      }
    };
    
    // 解析 viewBox 获取宽高比
    const viewBoxMatch = svgData.viewBox.match(/(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)\s+(\d+(?:\.\d+)?)/);
    const height = sizeMap[size];
    let width = height;
    if (viewBoxMatch) {
      const viewBoxWidth = parseFloat(viewBoxMatch[3]);
      const viewBoxHeight = parseFloat(viewBoxMatch[4]);
      if (viewBoxHeight > 0) {
        // 保持 viewBox 的宽高比，高度为指定值，宽度按比例计算
        const aspectRatio = viewBoxWidth / viewBoxHeight;
        // 将高度值转换为数字，然后乘以宽高比
        const heightValue = parseFloat(height);
        const heightUnit = height.replace(/[\d.]+/, '');
        width = `${heightValue * aspectRatio}${heightUnit}`;
      }
    }
    
    return (
      <svg
        ref={svgRef}
        className={`inline-block align-middle ${className}`}
        style={{
          width,
          height,
          fill: rarity ? rarityColors[rarity] : 'currentColor',
          ...style,
        }}
        viewBox={svgData.viewBox}
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        data-set-icon="true"
      >
        {svgData.paths.map((pathData, index) => (
          <path key={index} d={pathData} />
        ))}
      </svg>
    );
  }

  // 否则使用 keyrune
  const sizeClass = size === 'base' ? '' : `ss-${size}`;
  const rarityClass = rarity ? `ss-${rarity}` : '';
  
  return (
    <i
      className={`keyrune ss ss-${processedSet} ${sizeClass} ${rarityClass} ${className}`.trim()}
      style={style}
      aria-hidden="true"
      data-set-icon-managed="true"
    />
  );
}
