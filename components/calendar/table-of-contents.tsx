'use client';

import { useCallback, useEffect, useState } from 'react';

// 桌面端目录组件
export function DesktopTableOfContents() {
  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className="min-w-[160px] bg-[--card] rounded-lg p-4">
      <nav className="space-y-3">
        <div
          className="text-sm cursor-pointer hover:text-[--primary] transition-colors leading-relaxed"
          onClick={() => scrollToSection('midweek-magic')}
        >
          周中万智牌
        </div>
        <div
          className="text-sm cursor-pointer hover:text-[--primary] transition-colors leading-relaxed"
          onClick={() => scrollToSection('premier-draft')}
        >
          竞技轮抽
        </div>
        <div
          className="text-sm cursor-pointer hover:text-[--primary] transition-colors leading-relaxed"
          onClick={() => scrollToSection('quick-draft')}
        >
          快速轮抽
        </div>
        <div
          className="text-sm cursor-pointer hover:text-[--primary] transition-colors leading-relaxed"
          onClick={() => scrollToSection('other-events')}
        >
          其他活动
        </div>
        <div className="text-sm leading-relaxed">
          <div
            className="cursor-pointer hover:text-[--primary] transition-colors"
            onClick={() => scrollToSection('competitive-events')}
          >
            竞技赛程
          </div>
          <div className="ml-3 pl-3 space-y-3 border-l border-[--muted] opacity-80 mt-3">
            <div
              className="cursor-pointer hover:text-[--primary] transition-colors"
              onClick={() => scrollToSection('arena-open')}
            >
              公开赛
            </div>
            <div
              className="cursor-pointer hover:text-[--primary] transition-colors"
              onClick={() => scrollToSection('arena-direct')}
            >
              直邮赛
            </div>
            <div
              className="cursor-pointer hover:text-[--primary] transition-colors"
              onClick={() => scrollToSection('qualifier')}
            >
              资格赛
            </div>
            <div
              className="cursor-pointer hover:text-[--primary] transition-colors"
              onClick={() => scrollToSection('championship')}
            >
              冠军赛
            </div>
          </div>
        </div>
      </nav>
    </div>
  );
}

// 移动端导航栏组件
export function MobileTableOfContents() {
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      
      if (currentScrollY > 100) {
        setIsVisible(currentScrollY < lastScrollY);
      } else {
        setIsVisible(true);
      }
      
      setLastScrollY(currentScrollY);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [lastScrollY]);

  const scrollToSection = useCallback((id: string) => {
    const element = document.getElementById(id);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  }, []);

  return (
    <div className={`fixed top-[64px] left-0 right-0 bg-[--background] z-50 shadow-sm transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4">
        <nav className="overflow-x-auto -mx-4 px-4 py-3">
          <div className="flex gap-6 min-w-max">
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap"
              onClick={() => scrollToSection('midweek-magic')}
            >
              周中万智牌
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap"
              onClick={() => scrollToSection('premier-draft')}
            >
              竞技轮抽
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap"
              onClick={() => scrollToSection('quick-draft')}
            >
              快速轮抽
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap"
              onClick={() => scrollToSection('other-events')}
            >
              其他活动
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap"
              onClick={() => scrollToSection('competitive-events')}
            >
              竞技赛程
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap opacity-80"
              onClick={() => scrollToSection('arena-open')}
            >
              · 公开赛
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap opacity-80"
              onClick={() => scrollToSection('arena-direct')}
            >
              · 直邮赛
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap opacity-80"
              onClick={() => scrollToSection('qualifier')}
            >
              · 资格赛
            </div>
            <div
              className="text-sm cursor-pointer hover:text-[--primary] transition-colors whitespace-nowrap opacity-80"
              onClick={() => scrollToSection('championship')}
            >
              · 冠军赛
            </div>
          </div>
        </nav>
      </div>
    </div>
  );
} 