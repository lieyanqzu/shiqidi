import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export function Header() {
  return (
    <header className="sticky top-0 z-50 w-full border-b border-[--table-border] bg-[--background]">
      <div className="container mx-auto flex h-16 items-center justify-between px-4">
        <div className="flex items-center">
          <Link href="/" className="mr-4 font-semibold text-[--foreground]">
            十七地
          </Link>
          <nav className="flex items-center space-x-4 text-sm">
            <Link href="/" className="text-[--foreground-muted] hover:text-[--foreground]">
              首页
            </Link>
            <Link href="/cards" className="text-[--foreground-muted] hover:text-[--foreground]">
              卡牌数据
            </Link>
          </nav>
        </div>
        <ThemeToggle />
      </div>
    </header>
  );
} 