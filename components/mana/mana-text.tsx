'use client';

import React from 'react';
import { AbilityTooltip } from '@/components/common/ability-tooltip';

interface ManaTextProps {
  text: string;
  className?: string;
  renderCardRef?: (text: string, index: number) => React.ReactNode | null;
}

export function ManaText({ text, className = '', renderCardRef }: ManaTextProps) {
  // 如果有卡牌引用处理函数，先处理卡牌引用
  if (renderCardRef) {
    // 使用正则表达式匹配反引号中的文本
    const parts: (string | React.ReactNode)[] = [];
    let lastIndex = 0;
    const regex = /`([^`]+)`/g;
    let match;
    
    while ((match = regex.exec(text)) !== null) {
      // 添加引用前的文本
      if (match.index > lastIndex) {
        const beforeText = text.substring(lastIndex, match.index);
        parts.push(
          <span key={`text-${parts.length}`} dangerouslySetInnerHTML={{ __html: processManaCost(beforeText) }} />
        );
      }
      
      // 检查是否是卡牌引用（包含冒号）
      const cardMatch = match[1].match(/([^:]+):(\d+)/);
      if (cardMatch) {
        // 如果是卡牌引用，使用renderCardRef处理
        const cardRef = renderCardRef(match[1], parts.length);
        if (cardRef) {
          parts.push(cardRef);
        } else {
          parts.push(
            <span key={`text-${parts.length}`} dangerouslySetInnerHTML={{ __html: processManaCost(match[0]) }} />
          );
        }
      } else {
        // 如果不是卡牌引用，可能是异能提示
        parts.push(
          <AbilityTooltip key={`ability-${parts.length}`} abilityName={match[1]}>
            {match[1]}
          </AbilityTooltip>
        );
      }
      
      lastIndex = match.index + match[0].length;
    }
    
    // 添加最后一部分文本
    if (lastIndex < text.length) {
      parts.push(
        <span key={`text-${parts.length}`} dangerouslySetInnerHTML={{ __html: processManaCost(text.substring(lastIndex)) }} />
      );
    }
    
    return (
      <span className={`inline ${className}`}>
        {parts}
      </span>
    );
  }
  
  // 如果没有卡牌引用处理函数，只处理法术力符号
  return (
    <span 
      className={`inline ${className}`}
      dangerouslySetInnerHTML={{ __html: processManaCost(text) }}
    />
  );
}

// 处理法术力费用的辅助函数
function processManaCost(text: string): string {
  return text.replace(/\{([^}]+)\}/g, (match, symbol) => {
    // 处理横置符号
    if (symbol === 'T' || symbol === 'Tap' || symbol === 'tap') {
      return `<i class="ms ms-cost ms-tap align-text-bottom"></i>`;
    }
    // 处理混合法术力，如 {W/P}
    if (symbol.includes('/')) {
      const [color1, color2] = symbol.split('/');
      return `<i class="ms ms-cost ms-${color1.toLowerCase()}${color2.toLowerCase()} align-text-bottom"></i>`;
    }
    // 处理普通法术力
    return `<i class="ms ms-cost ms-${symbol.toLowerCase()} align-text-bottom"></i>`;
  });
}