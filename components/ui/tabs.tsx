'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

export function Tabs({
  value,
  onValueChange,
  children,
  className = '',
}: {
  value: string;
  onValueChange: (value: string) => void;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Root
      value={value}
      onValueChange={onValueChange}
      className={className}
    >
      {children}
    </TabsPrimitive.Root>
  );
}

/**
 * 列表容器：紧贴下边界，便于下划线 Tab 与内容区视觉上融为一体
 */
export function TabsList({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.List
      className={`inline-flex h-10 items-center justify-center rounded-lg bg-[--card] border border-[--border] p-1 text-[--muted-foreground] ${className}`}
    >
      {children}
    </TabsPrimitive.List>
  );
}

/**
 * 列表项：小号胶囊式
 */
export function TabsTrigger({
  value,
  children,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={`
        inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1.5 text-sm font-medium ring-offset-background transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 data-[state=active]:bg-[--background] data-[state=active]:text-[--foreground] data-[state=active]:shadow-sm
        ${className}
      `}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}

export function TabsContent({
  value,
  children,
  className = '',
  forceMount,
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
  /**
   * 强制挂载：默认 Radix 在 SSR 与非激活态下不渲染子节点，
   * 加上 forceMount 后两个 Tab 内容都会进入 DOM，由 data-state 控制显隐，
   * 适用于 SEO 与首屏渲染所有内容（如支持者列表、爱发电卡片等需要被搜索引擎抓取的模块）。
   */
  forceMount?: boolean;
}) {
  return (
    <TabsPrimitive.Content
      value={value}
      forceMount={forceMount || undefined}
      className={`mt-2 ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${className}`}
    >
      {children}
    </TabsPrimitive.Content>
  );
}

/* ------------------------------------------------------------------ */
/* 大号下划线式 Tab（用于关于页等需要突出标题层级的场景）             */
/* ------------------------------------------------------------------ */

/**
 * 大号 Tab 列表容器：横向铺开 + 底部细线分隔
 * 选中的 Tab 通过底部 2px 彩色条指示
 */
export function UnderlineTabsList({
  children,
  className = '',
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.List
      className={`flex items-stretch gap-6 sm:gap-8 border-b border-[--border] text-[--muted-foreground] ${className}`}
    >
      {children}
    </TabsPrimitive.List>
  );
}

/**
 * 大号 Tab 触发器：
 * - 字号 base（移动端）/ lg（桌面）
 * - 上下 padding 更大（h-12）
 * - 激活态：文字高亮 + 底部 2px 主题色横线
 * - 非激活态：灰色 + hover 变深
 */
export function UnderlineTabsTrigger({
  value,
  children,
  className = '',
}: {
  value: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <TabsPrimitive.Trigger
      value={value}
      className={`
        relative inline-flex items-center justify-center
        h-12 px-1 text-base sm:text-lg font-medium
        text-[--muted-foreground]
        transition-colors
        hover:text-[--foreground]
        data-[state=active]:text-[--foreground]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary] focus-visible:ring-offset-2
        cursor-pointer
        after:absolute after:left-0 after:right-0 after:bottom-[-1px] after:h-0.5
        after:bg-[--primary] after:scale-x-0 after:origin-center
        after:transition-transform after:duration-200
        data-[state=active]:after:scale-x-100
        ${className}
      `}
    >
      {children}
    </TabsPrimitive.Trigger>
  );
}
