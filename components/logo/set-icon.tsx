'use client';

import React, { useState, useEffect } from 'react';
import { DYNAMIC_SETS } from './dynamic-sets';

// 导出类型供其他组件使用
export type SetIconSize = 'xs' | 'sm' | 'base' | 'lg' | 'xl' | '2x' | '3x' | '4x';
export type SetIconRarity = 'common' | 'uncommon' | 'rare' | 'mythic' | 'timeshifted';

interface SetIconProps {
  set: string;
  className?: string;
  size?: SetIconSize;
  rarity?: SetIconRarity;
  style?: React.CSSProperties;
}

// 简单的内存缓存
const svgCache = new Map<string, { paths: string[]; viewBox: string } | null>();
// Promise 缓存，用于防止重复请求
const pendingRequests = new Map<string, Promise<{ paths: string[]; viewBox: string } | null>>();

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

    // 检查是否有正在进行的请求
    if (pendingRequests.has(processedSet)) {
      // 等待现有请求完成
      pendingRequests.get(processedSet)!.then(data => {
        setSvgData(data);
      });
      return;
    }

    // 创建新请求
    const fetchPromise = fetch(`https://api.scryfall.com/sets/${processedSet}`)
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
          return data;
        } else {
          svgCache.set(processedSet, null);
          return null;
        }
      })
      .catch((error) => {
        console.error(`[SetIcon] ${processedSet} 加载失败:`, error);
        svgCache.set(processedSet, null);
        return null;
      })
      .finally(() => {
        // 请求完成后清理 pendingRequests
        pendingRequests.delete(processedSet);
      });

    // 存储 Promise
    pendingRequests.set(processedSet, fetchPromise);

    // 等待请求完成
    fetchPromise.then(data => {
      setSvgData(data);
    });
  }, [processedSet]);

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
    
    const sizeMap: Record<SetIconSize, string> = {
      'xs': '0.75em',
      'sm': '0.875em',
      'base': '1em',
      'lg': '1.25em',
      'xl': '1.5em',
      '2x': '2em',
      '3x': '3em',
      '4x': '4em',
    };
    
    const height = sizeMap[size];

    
    // Calculate width based on viewBox aspect ratio
    let aspectRatio = 1.5; // Default fallback
    if (svgData.viewBox) {
      const parts = svgData.viewBox.split(/\s+/).map(Number);
      if (parts.length === 4 && parts[3] > 0) {
        aspectRatio = parts[2] / parts[3];
      }
    }
    
    const width = `${parseFloat(height) * aspectRatio}${height.replace(/[\d.]+/, '')}`;
    
    return (
      <svg
        ref={svgRef}
        className={`inline-block ${className}`}
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
