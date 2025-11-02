'use client';

import { useState, useEffect, useRef } from 'react';
import { ManaText } from '@/components/mana/mana-text';

interface Ability {
  name: string;
  text: string;
  alias?: string[];
}

interface AbilityTooltipProps {
  children: React.ReactNode;
  abilityName: string;
}

let abilitiesCache: Ability[] | null = null;

export function AbilityTooltip({ children, abilityName }: AbilityTooltipProps) {
  const [abilityText, setAbilityText] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showTooltip, setShowTooltip] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0, arrowOffset: 0, isAbove: true });
  const triggerRef = useRef<HTMLSpanElement>(null);
  const tooltipRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function loadAbility() {
      try {
        if (!abilitiesCache) {
          const response = await import('@/data/previews/abilities.json');
          abilitiesCache = response.default;
        }

        const ability = abilitiesCache.find(a => {
          const nameMatch = a.name.toLowerCase() === abilityName.toLowerCase();
          const aliasMatch = Array.isArray(a.alias) && a.alias.some(alias => alias.toLowerCase() === abilityName.toLowerCase());
          return nameMatch || aliasMatch;
        });
        setAbilityText(ability?.text || null);
      } catch (error) {
        console.error('加载异能说明失败:', error);
        setAbilityText(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadAbility();
  }, [abilityName]);

  // 计算位置的函数
  const calculatePosition = () => {
    if (!triggerRef.current || !tooltipRef.current) return;

    const triggerRect = triggerRef.current.getBoundingClientRect();
    const tooltipRect = tooltipRef.current.getBoundingClientRect();
    const margin = 8;

    // 默认显示在上方
    let x = triggerRect.left;
    let y = triggerRect.top - tooltipRect.height - margin;
    let isAbove = true;

    // 如果上方空间不够，显示在下方
    if (y < margin) {
      y = triggerRect.bottom + margin;
      isAbove = false;
    }

    // 确保不超出左右边界
    if (x + tooltipRect.width > window.innerWidth - margin) {
      x = window.innerWidth - tooltipRect.width - margin;
    }
    if (x < margin) {
      x = margin;
    }

    // 计算箭头位置
    const arrowOffset = Math.max(16, Math.min(triggerRect.left - x + triggerRect.width / 2, tooltipRect.width - 16));

    return { x, y, arrowOffset, isAbove };
  };

  // 处理鼠标进入事件
  const handleMouseEnter = () => {
    setShowTooltip(true);
  };

  useEffect(() => {
    if (showTooltip) {
      // 等待 tooltip 渲染完成后再计算位置
      requestAnimationFrame(() => {
        const pos = calculatePosition();
        if (pos) {
          setPosition(pos);
        }
      });

      // 添加滚动和调整窗口大小的事件监听
      function updatePosition() {
        const pos = calculatePosition();
        if (pos) {
          setPosition(pos);
        }
      }

      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);

      return () => {
        window.removeEventListener('scroll', updatePosition, true);
        window.removeEventListener('resize', updatePosition);
      };
    }
  }, [showTooltip]);

  if (isLoading || !abilityText) {
    return <span className="inline">{children}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-help border-b border-dotted border-[--muted-foreground] inline text-black dark:text-white font-medium"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={() => setShowTooltip(false)}
      >
        {children}
      </span>
      {showTooltip && (
        <div
          ref={tooltipRef}
          className="fixed z-50 animate-in fade-in-0 zoom-in-95 max-w-[20rem]"
          style={{
            top: position.y,
            left: position.x,
            pointerEvents: 'none',
            opacity: position.x === 0 ? 0 : 1,
          }}
        >
          <div 
            className="rounded-lg bg-[--card] border border-[--border] shadow-lg relative after:absolute after:w-3 after:h-3 after:rotate-45 after:bg-[--card] after:border after:border-[--border]"
            style={{
              '--arrow-offset': `${position.arrowOffset || 0}px`,
              '--arrow-top': position.isAbove ? '100%' : '-6px',
              '--arrow-transform': position.isAbove ? 'translateY(-50%) rotate(45deg)' : 'translateY(0) rotate(45deg)'
            } as React.CSSProperties}
          >
            <div className="relative overflow-hidden rounded-lg px-3 py-2 text-sm text-[--foreground]">
              <div className="relative">
                <ManaText text={abilityText || ''} />
              </div>
            </div>
            <style jsx>{`
              div:after {
                left: var(--arrow-offset);
                top: var(--arrow-top);
                transform: var(--arrow-transform);
                border-right: none;
                border-bottom: none;
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
} 