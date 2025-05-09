'use client'

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, ChevronDown, ExternalLink, Menu, X, Calendar, Activity, Download } from "lucide-react";
import { useState, useEffect } from "react";
import digitalSets from '@/data/digital-sets.json';
import { useStatusStore, StatusData } from '@/lib/store';
import { usePWAInstall } from '@/hooks/use-pwa-install';
import { Tooltip } from "@/components/ui/tooltip"
import { parseISO, isValid } from 'date-fns';

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
  wikiUrl?: string;
  preview?: {
    title: string;
    description: string;
    links: { name: string; url: string }[];
    backgroundImage?: string;
  };
}

function getCurrentAndNextSet(): { current: DigitalSet | null; next: DigitalSet | null } {
  const now = new Date();
  const sets = digitalSets.sets
    .sort((a, b) => {
      const dateA = parseISO(a.releaseDate.replace('~', ''));
      const dateB = parseISO(b.releaseDate.replace('~', ''));
      const timeA = isValid(dateA) ? dateA.getTime() : -Infinity;
      const timeB = isValid(dateB) ? dateB.getTime() : Infinity;
      return timeA - timeB;
    });

  let current: DigitalSet | null = null;
  let next: DigitalSet | null = null;

  for (let i = sets.length - 1; i >= 0; i--) {
    const set = sets[i];
    const releaseDate = parseISO(set.releaseDate.replace('~', ''));
    if (isValid(releaseDate) && releaseDate <= now) {
      current = set;
      next = sets[i + 1] || null;
      break;
    }
  }

  return { current, next };
}

function formatDate(dateStr: string): string {
  const prefix = dateStr.includes('~') ? '约' : '';
  const date = parseISO(dateStr.replace('~', ''));
  if (!isValid(date)) {
    console.error(`Invalid date string passed to formatDate: ${dateStr}`);
    return '无效日期';
  }
  return prefix + new Intl.DateTimeFormat('zh-CN', {
    month: 'long',
    day: 'numeric',
  }).format(date);
}

function SetInfo({ className = "" }: { className?: string }) {
  const { current, next } = getCurrentAndNextSet();
  const [showTooltip, setShowTooltip] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  
  useEffect(() => {
    const lastShownDate = localStorage.getItem('previewTooltipLastShown');
    const now = new Date().getTime();
    
    if ((!lastShownDate || now - parseInt(lastShownDate) > 5 * 24 * 60 * 60 * 1000) && next?.preview) {
      setShowTooltip(true);
      localStorage.setItem('previewTooltipLastShown', now.toString());
    }
  }, [next]);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  if (!current) return null;
  
  return (
    <div className={`flex items-center gap-4 px-3 py-1.5 text-sm text-[--muted-foreground] ${className}`}>
      <div className="grid md:flex grid-cols-2 w-full md:w-auto gap-4 md:gap-4">
        <div className="flex items-center gap-1.5 min-w-0">
          <i className={`ss ss-${current.code.toLowerCase()} ss-fw flex-shrink-0`} />
          <span className="break-words">最新系列：{current.name}</span>
        </div>
        {next && (
          <>
            <div className="hidden md:block w-px h-4 bg-[--border]" />
            {next.preview ? (
              <Tooltip
                open={showTooltip}
                onOpenChange={setShowTooltip}
                side="top"
                showCloseButton={true}
                asNotification={isMobile}
                backgroundImage={next.preview.backgroundImage}
                content={
                  <div className="w-[320px] space-y-3">
                    <div className="flex items-center gap-3">
                      <div className="space-y-2 flex-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[--foreground] flex items-center gap-2">
                            <span className="text-[13px] text-[--muted-foreground]">新系列：</span>
                            <i className={`ss ss-${next.code.toLowerCase()} ss-2x opacity-80 flex-shrink-0`} />
                            {next.name}
                            {next.wikiUrl && (
                              <a
                                href={next.wikiUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1 text-[13px] text-[--primary] hover:text-[--primary]/80 transition-colors"
                                onClick={e => e.stopPropagation()}
                              >
                                <ExternalLink className="w-3.5 h-3.5" />
                                <span>MTG Wiki</span>
                              </a>
                            )}
                          </h3>
                        </div>
                        <p className="text-sm leading-relaxed">
                          {next.preview?.title && next.preview?.description && (
                            <>
                              <span className="text-[--foreground]">{next.preview.title}</span>
                              <span className="mx-2 text-[--muted-foreground] opacity-30">|</span>
                              <span className="text-[--muted-foreground]">{next.preview.description}</span>
                            </>
                          )}
                        </p>
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <p className="text-[13px] text-[--muted-foreground] opacity-90">前往以下网站，了解{next.name}最新预览卡牌</p>
                      <div className="grid grid-cols-2 gap-2">
                        {next.preview?.links.map((link, index) => (
                          <a
                            key={index}
                            href={link.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1.5 text-[13px] text-[--primary] hover:text-[--primary]/80 transition-colors"
                          >
                            <ExternalLink className="w-3.5 h-3.5 flex-shrink-0" />
                            <span className="truncate">{link.name}</span>
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>
                }
              >
                <span className="flex items-center gap-1.5 cursor-help min-w-0" data-next-set-trigger>
                  <Calendar className="w-4 h-4 flex-shrink-0" />
                  <span className="break-words">下个系列：{next.name}（{formatDate(next.releaseDate)}）<span className="inline-flex items-center justify-center px-1.5 py-0.5 text-xs border border-[--primary] text-[--primary] rounded ml-1">预览</span></span>
                </span>
              </Tooltip>
            ) : (
              <span className="flex items-center gap-1.5 min-w-0">
                <Calendar className="w-4 h-4 flex-shrink-0" />
                <span className="break-words">下个系列：{next.name}（{formatDate(next.releaseDate)}）</span>
              </span>
            )}
          </>
        )}
      </div>
    </div>
  );
}

function ServerStatusInfo({ className = "" }: { className?: string }) {
  const { data: status, isLoading, error, fetchStatus } = useStatusStore();

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(() => fetchStatus(), 60000);
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
    critical: 'text-red-500',
    maintenance: 'text-blue-500'
  };

  const statusText = {
    none: '正常',
    minor: '轻微问题',
    major: '重要问题',
    critical: '严重问题',
    maintenance: '维护中'
  } as const;

  const statusAnimation = status.status.indicator !== 'none' ? 'animate-pulse' : '';

  const hasScheduledMaintenance = status.scheduled_maintenances.length > 0;
  const nextMaintenance = hasScheduledMaintenance ? status.scheduled_maintenances[0] : null;

  const StatusContent = (
    <div className="flex items-center gap-1.5">
      <Activity className={`w-4 h-4 ${statusColors[status.status.indicator]} ${statusAnimation}`} />
      <span className="text-[--muted-foreground] md:inline hidden">MTGA服务：</span>
      <span className={statusColors[status.status.indicator]}>
        {hasScheduledMaintenance && status.status.indicator === 'none' ? '计划维护' : statusText[status.status.indicator]}
      </span>
    </div>
  );

  if (hasScheduledMaintenance && nextMaintenance) {
    const startTime = parseISO(nextMaintenance.scheduled_for);
    const endTime = parseISO(nextMaintenance.scheduled_until);
    const formatTime = (date: Date) => {
      if (!isValid(date)) {
        return '无效时间';
      }
      return new Intl.DateTimeFormat('zh-CN', {
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: 'numeric',
        hour12: false
      }).format(date);
    };

    return (
      <Tooltip
        content={
          <div className="w-[320px] space-y-2">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-blue-500" />
              <h3 className="font-medium text-[--foreground]">{nextMaintenance.name}</h3>
            </div>
            <div className="space-y-2 text-sm text-[--muted-foreground]">
              <div>开始时间：{formatTime(startTime)}</div>
              <div>结束时间：{formatTime(endTime)}</div>
            </div>
            {nextMaintenance.incident_updates.length > 0 && (
              <div className="text-sm whitespace-pre-wrap">
                {nextMaintenance.incident_updates[0].body}
              </div>
            )}
          </div>
        }
        side="bottom"
      >
        <Link 
          href="/status"
          className={`flex items-center gap-1.5 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity ${className}`}
        >
          {StatusContent}
        </Link>
      </Tooltip>
    );
  }

  return (
    <Link 
      href="/status"
      className={`flex items-center gap-1.5 px-3 py-1.5 text-sm hover:opacity-80 transition-opacity ${className}`}
    >
      {StatusContent}
    </Link>
  );
}

const menuItems: MenuItem[] = [
  {
    label: "轮抽数据",
    children: [
      { label: "卡牌数据", href: "/cards" },
      { label: "赛制速度", href: "/speed" },
      { label: "色组数据", href: "https://www.17lands.com/deck_color_data", external: true },
    ]
  },
  {
    label: "万智日程",
    children: [
      { label: "MTGA活动日历", href: "/calendar" },
      { label: "标准轮替日程", href: "/rotation" },
      { label: "MTGA服务状态", href: "/status" },
      { label: "炼金系列预览", href: "/previews" },
    ]
  },
  {
    label: "其他工具",
    children: [
      { label: "MTGA汉化MOD", href: "/mod" },
      { label: "Scryfall汉化脚本", href: "/script" },
      { label: "抽卡概率计算器", href: "/hypergeometric" },
      { label: "精研通行证计算器", href: "/mastery" },
      { label: "开包模拟器", href: "/simulator" },
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
  const { isInstallable, install } = usePWAInstall();

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
      <div className="container mx-auto">
        <div className="flex h-16 md:h-8 2xl:h-16 items-center justify-between px-4">
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
            <SetInfo className="hidden 2xl:flex" />
            <div className="w-px h-4 bg-[--border] hidden 2xl:flex" />
            <ServerStatusInfo className="hidden 2xl:flex" />
            {isInstallable && (
              <button
                onClick={install}
                className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
                title="安装应用"
              >
                <Download className="h-5 w-5" />
              </button>
            )}
            <a
              href="https://space.bilibili.com/271023"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
              title="B站主页"
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
              title="GitHub仓库"
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
        <div className="hidden md:flex 2xl:hidden items-center justify-between border-t border-[--border] px-4">
          <SetInfo />
          <ServerStatusInfo />
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
