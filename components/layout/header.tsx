import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";
import { Github } from "lucide-react";

export function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-[--border] bg-[--background]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="mr-4 font-semibold text-[--foreground]">
            十七地
          </Link>
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="/cards" className="text-[--foreground-muted] hover:text-[--foreground]">
              轮抽卡牌数据
            </Link>
            <Link href="/calendar" className="text-[--foreground-muted] hover:text-[--foreground]">
              活动日历
            </Link>
            <Link href="/rotation" className="text-[--foreground-muted] hover:text-[--foreground]">
              标准轮替
            </Link>
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