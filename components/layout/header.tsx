'use client'

import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github, ChevronDown, ExternalLink } from "lucide-react";

interface MenuItem {
  label: string;
  href?: string;
  external?: boolean;
  children?: MenuItem[];
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
    ]
  },
  {
    label: "其他工具",
    children: [
      { label: "MTGA汉化MOD", href: "/mod" },
      { label: "Scryfall汉化脚本", href: "/script" },
    ]
  }
]

function DropdownMenu({ item }: { item: MenuItem }) {
  if (!item.children) {
    return (
      <Link href={item.href!} className="text-[--foreground-muted] hover:text-[--foreground]">
        {item.label}
      </Link>
    );
  }

  return (
    <div 
      className="relative group"
    >
      <button 
        className="flex items-center gap-1 text-[--foreground-muted] group-hover:text-[--foreground]"
      >
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
                className="block px-4 py-2 text-[--foreground-muted] hover:text-[--foreground] hover:bg-[--accent] flex items-center gap-1"
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
  return (
    <header className="sticky top-0 z-50 border-b border-[--border] bg-[--background]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="mr-6 font-semibold text-[--foreground]">
            十七地
          </Link>
          <nav className="flex items-center space-x-6 text-sm">
            {menuItems.map((item, index) => (
              <DropdownMenu key={index} item={item} />
            ))}
          </nav>
        </div>
        <div className="flex items-center space-x-4">
          <a
            href="https://github.com/lieyanqzu/shiqidi"
            target="_blank"
            rel="noopener noreferrer"
            className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
          >
            <Github className="h-5 w-5" />
          </a>
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
} 