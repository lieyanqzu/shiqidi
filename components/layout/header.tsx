'use client'

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, ChevronDown, ExternalLink, Menu, X, Calendar, Activity } from "lucide-react";
import { useState, useEffect } from "react";
import digitalSets from '@/data/digital-sets.json';
import { useStatusStore, StatusData } from '@/lib/store';

interface MenuItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: MenuItem[];
}

interface DigitalSet {
  name: string;
  code: string;
  releaseDate: string;
}

function getCurrentAndNextSet(): { current: DigitalSet | null; next: DigitalSet | null } {
  const now = new Date();
  const sets = digitalSets.sets
    .sort((a, b) => new Date(a.releaseDate).getTime() - new Date(b.releaseDate).getTime());

  let current: DigitalSet | null = null;
  let next: DigitalSet | null = null;

  for (let i = sets.length - 1; i >= 0; i--) {
    const set = sets[i];
    if (new Date(set.releaseDate) <= now) {
      current = set;
      next = sets[i + 1] || null;
      break;
    }
  }

  return { current, next };
}

function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  return new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function SetInfo({ className = "" }: { className?: string }) {
  const { current, next } = getCurrentAndNextSet();
  
  if (!current) return null;
  
  return (
    <div className={`flex items-center gap-4 px-3 py-1.5 text-sm text-[--muted-foreground] ${className}`}>
      <div className="flex items-center gap-1.5">
        <i className={`ss ss-${current.code.toLowerCase()} ss-fw`} />
        <span>当前系列：{current.name}</span>
      </div>
      {next && (
        <>
          <div className="w-px h-4 bg-[--border]" />
          <div className="flex items-center gap-1.5">
            <Calendar className="w-4 h-4" />
            <span>下个系列：{next.name}（{formatDate(next.releaseDate)}）</span>
          </div>
        </>
      )}
    </div>
  );
}

function ServerStatusInfo({ className = "" }: { className?: string }) {
  const { data: status, isLoading, error, fetchStatus } = useStatusStore();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(), 60000); // 每分钟更新一次
    return () => clearInterval(interval);
  }, [fetchStatus]);

  if (isLoading) {
    return (
      <div className={`flex items-center gap-1.5 px-3 py-1.5 text-sm ${className}`}>
        <Activity className="w-4 h-4 animate-pulse text-[--muted-foreground]" />
        <span className="text-[--muted-foreground] md:inline hidden">MTGA服务：</span>
        <span className="text-[--muted-foreground]">检查中...</span>
      </div>
    );
  }

  if (error || !status) return null;

  const statusColors: Record<StatusData['status']['indicator'], string> = {
    none: 'text-emerald-500',
    minor: 'text-yellow-500',
    major: 'text-orange-500',
    critical: 'text-red-500'
  };

  const statusText = {
    none: '正常',
    minor: '轻微问题',
    major: '重要问题',
    critical: '严重问题',
    maintenance: '维护中'
  } as const;

  const statusAnimation = status.status.indicator !== 'none' ? 'animate-pulse' : '';

  return (
    <Link 
      href="/status"
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity ${className}`}
    >
      <Activity className={`w-4 h-4 ${statusColors[status.status.indicator]} ${statusAnimation}`} />
      <span className="text-[--muted-foreground] md:inline hidden">MTGA服务：</span>
      <span className={statusColors[status.status.indicator]}>
        {statusText[status.status.indicator]}
      </span>
    </Link>
  );
}

const menuItems: MenuItem[] = [
  {
    label: "轮抽数据",
    children: [
      { label: "卡牌数据", href: "/cards" },
      { label: "色组数据", href: "https://www.17lands.com/deck_color_data", external: true },
      { label: "赛制速度", href: "https://www.17lands.com/format_speed", external: true },
    ]
  },
  {
    label: "万智日程",
    children: [
      { label: "MTGA活动日历", href: "/calendar" },
      { label: "标准轮替日程", href: "/rotation" },
      { label: "MTGA服务状态", href: "/status" },
    ]
  },
  {
    label: "其他工具",
    children: [
      { label: "MTGA汉化MOD", href: "/mod" },
      { label: "Scryfall汉化脚本", href: "/script" },
      { label: "抽卡概率计算器", href: "/hypergeometric" },
      { label: "精研通行证计算器", href: "/mastery" },
    ]
  },
  {
    label: "关于",
    href: "/about"
  }
];

function MobileMenuItem({ item, onClose }: { item: MenuItem; onClose: () => void }) {
  const [isOpen, setIsOpen] = useState(false);

  if (!item.children) {
    return (
      <Link 
        href={item.href!} 
        className="block px-4 py-2 text-[--foreground-muted] hover:text-[--foreground]"
        onClick={onClose}
      >
        {item.label}
      </Link>
    );
  }

  return (
    <div>
      <button 
        className="flex items-center justify-between w-full px-4 py-2 text-[--foreground-muted] hover:text-[--foreground]"
        onClick={() => setIsOpen(!isOpen)}
      >
        {item.label}
        <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
      </button>
      {isOpen && (
        <div className="pl-4 space-y-1 border-l border-[--border] ml-4">
          {item.children.map((child, index) => (
            child.external ? (
              <a
                key={index}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 text-[--foreground-muted] hover:text-[--foreground]"
                onClick={onClose}
              >
                {child.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                key={index}
                href={child.href!}
                className="block px-4 py-2 text-[--foreground-muted] hover:text-[--foreground]"
                onClick={onClose}
              >
                {child.label}
              </Link>
            )
          ))}
        </div>
      )}
    </div>
  );
}

function DesktopDropdownMenu({ item }: { item: MenuItem }) {
  if (!item.children) {
    return (
      <Link href={item.href!} className="text-[--foreground-muted] hover:text-[--foreground]">
        {item.label}
      </Link>
    );
  }

  return (
    <div className="relative group">
      <button className="flex items-center gap-1 text-[--foreground-muted] group-hover:text-[--foreground]">
        {item.label}
        <ChevronDown className="h-4 w-4" />
      </button>
      <div className="absolute left-0 top-[calc(100%-0.25rem)] pt-2 invisible opacity-0 group-hover:visible group-hover:opacity-100 transition-[opacity] duration-150">
        <div className="py-2 bg-[--card] rounded-lg border border-[--border] shadow-lg min-w-[160px]">
          {item.children.map((child, index) => (
            child.external ? (
              <a
                key={index}
                href={child.href}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 px-4 py-2 text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--accent]"
              >
                {child.label}
                <ExternalLink className="h-3 w-3" />
              </a>
            ) : (
              <Link
                key={index}
                href={child.href!}
                className="block px-4 py-2 text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--accent]"
              >
                {child.label}
              </Link>
            )
          ))}
        </div>
      </div>
    </div>
  );
}

export function Header() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isMobileMenuOpen]);

  return (
    <header className="sticky top-0 z-50 border-b border-[--border] bg-[--background]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 md:gap-3 min-w-0">
            <Link href="/" className="font-semibold text-[--foreground] whitespace-nowrap">
              十七地
            </Link>
            <ServerStatusInfo className="md:hidden" />
          </div>
          <nav className="hidden md:flex items-center space-x-6 text-sm">
            {menuItems.map((item, index) => (
              <DesktopDropdownMenu key={index} item={item} />
            ))}
          </nav>
        </div>
        <div className="flex items-center gap-4">
          <SetInfo className="hidden md:flex" />
          <div className="w-px h-4 bg-[--border] hidden md:block" />
          <ServerStatusInfo className="hidden md:flex" />
          <a
            href="https://space.bilibili.com/271023"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
            title="Bilibili"
          >
            <svg viewBox="0 0 24 24" fill="currentColor" className="h-5 w-5">
              <path d="M17.813 4.653h.854c1.51.054 2.769.578 3.773 1.574 1.004.995 1.524 2.249 1.56 3.76v7.36c-.036 1.51-.556 2.769-1.56 3.773s-2.262 1.524-3.773 1.56H5.333c-1.51-.036-2.769-.556-3.773-1.56S.036 18.858 0 17.347v-7.36c.036-1.511.556-2.765 1.56-3.76 1.004-.996 2.262-1.52 3.773-1.574h.774l-1.174-1.12a1.234 1.234 0 0 1-.373-.906c0-.356.124-.658.373-.907l.027-.027c.267-.249.573-.373.92-.373.347 0 .653.124.92.373L9.653 4.44c.071.071.134.142.187.213h4.267a.836.836 0 0 1 .16-.213l2.853-2.747c.267-.249.573-.373.92-.373.347 0 .662.151.929.4.267.249.391.551.391.907 0 .355-.124.657-.373.906zM5.333 7.24c-.746.018-1.373.276-1.88.773-.506.498-.769 1.13-.786 1.894v7.52c.017.764.28 1.395.786 1.893.507.498 1.134.756 1.88.773h13.334c.746-.017 1.373-.275 1.88-.773.506-.498.769-1.129.786-1.893v-7.52c-.017-.765-.28-1.396-.786-1.894-.507-.497-1.134-.755-1.88-.773zM8 11.107c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c0-.373.129-.689.386-.947.258-.257.574-.386.947-.386zm8 0c.373 0 .684.124.933.373.25.249.383.569.4.96v1.173c-.017.391-.15.711-.4.96-.249.25-.56.374-.933.374s-.684-.125-.933-.374c-.25-.249-.383-.569-.4-.96V12.44c.017-.391.15-.711.4-.96.249-.249.56-.373.933-.373Z" />
            </svg>
          </a>
          <a
            href="https://github.com/lieyanqzu/shiqidi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
            title="GitHub"
          >
            <Github className="h-5 w-5" />
          </a>
          <ThemeToggle />
          <button
            className="md:hidden p-1 text-[--foreground-muted] hover:text-[--foreground]"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {isMobileMenuOpen && (
        <div className="fixed inset-0 top-16 bg-[--background] z-40 md:hidden">
          <nav className="container mx-auto px-4 py-4">
            <div className="space-y-4 mb-6">
              <SetInfo />
            </div>
            <div className="space-y-1">
              {menuItems.map((item, index) => (
                <MobileMenuItem key={index} item={item} onClose={() => setIsMobileMenuOpen(false)} />
              ))}
            </div>
          </nav>
        </div>
      )}
    </header>
  );
} 