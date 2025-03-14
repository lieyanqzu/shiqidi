'use client';

import { useState, useEffect, useRef } from 'react';
import { ManaText } from './mana-text';

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
  const [position, setPosition] = useState({ x: 0, y: 0, arrowOffset: 0 });
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

  useEffect(() => {
    function updatePosition() {
      if (!triggerRef.current || !tooltipRef.current || !showTooltip) return;

      const triggerRect = triggerRef.current.getBoundingClientRect();
      const tooltipRect = tooltipRef.current.getBoundingClientRect();
      const margin = 8;

      // 默认显示在上方
      let x = triggerRect.left;
      let y = triggerRect.top - tooltipRect.height - margin;

      // 如果上方空间不够，显示在下方
      if (y < margin) {
        y = triggerRect.bottom + margin;
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

      setPosition({ x, y, arrowOffset });
    }

    if (showTooltip) {
      // 初次显示时立即更新位置
      requestAnimationFrame(updatePosition);
      // 添加事件监听
      window.addEventListener('scroll', updatePosition, true);
      window.addEventListener('resize', updatePosition);
    }

    return () => {
      window.removeEventListener('scroll', updatePosition, true);
      window.removeEventListener('resize', updatePosition);
    };
  }, [showTooltip]);

  if (isLoading || !abilityText) {
    return <span className="inline">{children}</span>;
  }

  return (
    <>
      <span
        ref={triggerRef}
        className="cursor-help border-b border-dotted border-[--muted-foreground] inline text-black dark:text-white font-medium"
        onMouseEnter={() => setShowTooltip(true)}
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
          }}
        >
          <div 
            className="rounded-lg bg-[--card] border border-[--border] shadow-lg relative after:absolute after:w-3 after:h-3 after:rotate-45 after:bg-[--card] after:border after:border-[--border] after:top-[100%] after:-translate-y-1/2"
            style={{
              '--arrow-offset': `${position.arrowOffset || 0}px`
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
              }
            `}</style>
          </div>
        </div>
      )}
    </>
  );
} 