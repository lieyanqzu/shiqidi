import { useEffect, useState, useCallback, useRef } from 'react';
import Image from 'next/image';
import type { Card } from '@/types/pack-simulator';

interface CardModalProps {
  card: Card & { 
    packIndex: number; 
    cardIndex: number;
    isPackSeparator?: boolean;
  };
  onClose: () => void;
  imageUrl: string;
  allCards: Array<Card & { 
    packIndex: number; 
    cardIndex: number;
    isPackSeparator?: boolean;
  }>;
  onCardChange: (card: Card & { 
    packIndex: number; 
    cardIndex: number;
    isPackSeparator?: boolean;
  }) => void;
}

export function CardModal({ card, onClose, imageUrl, allCards, onCardChange }: CardModalProps) {
  const [currentImageUrl, setCurrentImageUrl] = useState(imageUrl);
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);
  const [showSwipeHint, setShowSwipeHint] = useState(true);
  const containerRef = useRef<HTMLDivElement>(null);
  const [translateX, setTranslateX] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [prevImageUrl, setPrevImageUrl] = useState<string>('');
  const [nextImageUrl, setNextImageUrl] = useState<string>('');

  // 当imageUrl改变时更新currentImageUrl
  useEffect(() => {
    setCurrentImageUrl(imageUrl);
  }, [imageUrl]);

  // 3秒后隐藏滑动提示
  useEffect(() => {
    if (showSwipeHint) {
      const timer = setTimeout(() => {
        setShowSwipeHint(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [showSwipeHint]);

  // 找到当前卡牌的索引
  const currentIndex = allCards.findIndex(c => 
    c.id === card.id && 
    c.packIndex === card.packIndex && 
    c.cardIndex === card.cardIndex
  );

  // 获取上一张卡片的图片URL
  const getPrevCardImageUrl = useCallback((): string => {
    if (currentIndex <= 0) return '';
    let prevIndex = currentIndex - 1;
    while (prevIndex >= 0 && allCards[prevIndex].isPackSeparator) {
      prevIndex--;
    }
    if (prevIndex >= 0) {
      const prevCard = allCards[prevIndex];
      if (!prevImageUrl) {
        setPrevImageUrl(`https://www.sbwsz.com/image/large/${prevCard.setCode.toUpperCase()}/${prevCard.setCode.toUpperCase()}_${prevCard.number}.jpg`);
      }
      return prevImageUrl;
    }
    return '';
  }, [currentIndex, allCards, prevImageUrl]);

  // 获取下一张卡片的图片URL
  const getNextCardImageUrl = useCallback((): string => {
    if (currentIndex >= allCards.length - 1) return '';
    let nextIndex = currentIndex + 1;
    while (nextIndex < allCards.length && allCards[nextIndex].isPackSeparator) {
      nextIndex++;
    }
    if (nextIndex < allCards.length) {
      const nextCard = allCards[nextIndex];
      if (!nextImageUrl) {
        setNextImageUrl(`https://www.sbwsz.com/image/large/${nextCard.setCode.toUpperCase()}/${nextCard.setCode.toUpperCase()}_${nextCard.number}.jpg`);
      }
      return nextImageUrl;
    }
    return '';
  }, [currentIndex, allCards, nextImageUrl]);

  // 重置相邻卡片的URL当当前卡片改变时
  useEffect(() => {
    setPrevImageUrl('');
    setNextImageUrl('');
  }, [card.id]);

  // 切换到上一张卡牌
  const showPrevCard = useCallback(() => {
    if (currentIndex > 0) {
      const prevCard = allCards[currentIndex - 1];
      onCardChange(prevCard);
    }
  }, [currentIndex, allCards, onCardChange]);

  // 切换到下一张卡牌
  const showNextCard = useCallback(() => {
    if (currentIndex < allCards.length - 1) {
      const nextCard = allCards[currentIndex + 1];
      onCardChange(nextCard);
    }
  }, [currentIndex, allCards, onCardChange]);

  // 处理键盘事件
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      switch (event.key) {
        case 'Escape':
          onClose();
          break;
        case 'ArrowLeft':
          showPrevCard();
          break;
        case 'ArrowRight':
          showNextCard();
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [onClose, showPrevCard, showNextCard]);

  // 处理触摸事件
  const handleTouchStart = useCallback((e: TouchEvent) => {
    // 如果点击的是链接，不阻止默认行为
    if ((e.target as HTMLElement).tagName === 'A') return;
    
    e.preventDefault();
    e.stopPropagation();
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
    setIsDragging(true);
  }, []);

  const handleTouchMove = useCallback((e: TouchEvent) => {
    // 如果点击的是链接，不阻止默认行为
    if ((e.target as HTMLElement).tagName === 'A') return;
    
    e.preventDefault();
    e.stopPropagation();
    setTouchEnd(e.targetTouches[0].clientX);
    if (touchStart) {
      const diff = e.targetTouches[0].clientX - touchStart;
      setTranslateX(diff);
    }
  }, [touchStart]);

  const handleTouchEnd = useCallback((e: TouchEvent) => {
    // 如果点击的是链接，不阻止默认行为
    if ((e.target as HTMLElement).tagName === 'A') return;
    
    e.preventDefault();
    e.stopPropagation();
    if (!touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const containerWidth = containerRef.current?.clientWidth ?? 300;
    const threshold = containerWidth / 3;
    
    const isLeftSwipe = distance > threshold;
    const isRightSwipe = distance < -threshold;

    setIsDragging(false);
    setTranslateX(0);

    if (isLeftSwipe) {
      showNextCard();
    }
    if (isRightSwipe) {
      showPrevCard();
    }
  }, [touchStart, touchEnd, showNextCard, showPrevCard]);

  // 添加触摸事件监听
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const touchStartHandler = (e: Event) => handleTouchStart(e as TouchEvent);
    const touchMoveHandler = (e: Event) => handleTouchMove(e as TouchEvent);
    const touchEndHandler = (e: Event) => handleTouchEnd(e as TouchEvent);

    container.addEventListener('touchstart', touchStartHandler, { passive: false });
    container.addEventListener('touchmove', touchMoveHandler, { passive: false });
    container.addEventListener('touchend', touchEndHandler, { passive: false });

    return () => {
      container.removeEventListener('touchstart', touchStartHandler);
      container.removeEventListener('touchmove', touchMoveHandler);
      container.removeEventListener('touchend', touchEndHandler);
    };
  }, [handleTouchStart, handleTouchMove, handleTouchEnd]);

  // 获取卡牌详情页面URL
  function getCardDetailUrl(card: Card): string {
    // 如果卡牌号带有 a 或 b 后缀，使用基础卡牌号
    const number = /^(\d+)[ab]$/.test(card.number) ? card.number.slice(0, -1) : card.number;
    return `https://www.sbwsz.com/card/${card.setCode.toUpperCase()}/${number}?utm_source=shiqidi`;
  }

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/80"
      onClick={onClose}
    >
      <button
        className="absolute left-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-4 hidden sm:block"
        onClick={(e) => {
          e.stopPropagation();
          showPrevCard();
        }}
        disabled={currentIndex === 0}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m15 18-6-6 6-6"/>
        </svg>
      </button>

      <button
        className="absolute right-4 top-1/2 -translate-y-1/2 text-white/80 hover:text-white p-4 hidden sm:block"
        onClick={(e) => {
          e.stopPropagation();
          showNextCard();
        }}
        disabled={currentIndex === allCards.length - 1}
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="m9 18 6-6-6-6"/>
        </svg>
      </button>

      <style jsx>{`
        @keyframes fade-out {
          0% { opacity: 0.8; transform: translateY(20px); }
          10% { opacity: 1; transform: translateY(0); }
          80% { opacity: 1; transform: translateY(0); }
          100% { opacity: 0; transform: translateY(20px); }
        }
        .animate-fade-out {
          animation: fade-out 3s ease-in-out forwards;
        }
      `}</style>

      {showSwipeHint && allCards.length > 1 && (
        <div className="fixed inset-x-0 bottom-20 flex justify-center sm:hidden">
          <div className="bg-black/60 text-white px-4 py-2 rounded-full text-sm flex items-center gap-2 animate-fade-out">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M17 8l4 4-4 4M7 8L3 12l4 4"/>
            </svg>
            <span>左右滑动切换卡图 · 点击卡名查看详情</span>
          </div>
        </div>
      )}

      <div 
        className={`relative max-w-[90vw] max-h-[90vh] flex flex-col overflow-hidden`}
        onClick={e => e.stopPropagation()}
        ref={containerRef}
      >
        <div className="p-4 bg-black/60 text-white rounded-t-lg">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <a 
                href={getCardDetailUrl(card)} 
                target="_blank" 
                rel="noopener noreferrer"
                className={`text-lg font-medium hover:opacity-80 transition-opacity ${card.rarity ? getRarityColor(card.rarity) : ''}`}
                onClick={e => e.stopPropagation()}
              >
                {card.zhs_name || card.name || card.id}
              </a>
              {card.id.includes('foil') && (
                <span className="text-sm rainbow-text">闪卡</span>
              )}
            </div>
            <div className="text-sm text-white/80">
              补充包 #{(card.packIndex ?? 0) + 1} - 第{(card.cardIndex ?? 0) + 1}张
            </div>
          </div>
        </div>

        <div className="relative flex items-center">
          {/* 下一张卡片 */}
          {currentIndex < allCards.length - 1 && (
            <div 
              className="absolute right-0 transform translate-x-[calc(100%-20px)]"
              style={{
                transform: `translateX(calc(100% - 20px + ${Math.min(0, translateX)}px))`,
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isDragging ? Math.abs(Math.min(0, translateX)) / (containerRef.current?.clientWidth ?? 300) : 0.5
              }}
            >
              <Image
                src={getNextCardImageUrl()}
                alt="Next Card"
                width={600}
                height={840}
                className="w-auto h-auto max-w-full max-h-[calc(90vh-4rem)] rounded-b-lg"
                unoptimized
                priority
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('scryfall.io')) {
                    const nextIndex = currentIndex + 1;
                    const nextCard = allCards[nextIndex];
                    if (nextCard?.scryfallId) {
                      setNextImageUrl(`https://cards.scryfall.io/large/front/${nextCard.scryfallId.slice(0, 1)}/${nextCard.scryfallId.slice(1, 2)}/${nextCard.scryfallId}.jpg`);
                    } else {
                      setNextImageUrl('/image/back.png');
                    }
                  }
                }}
              />
            </div>
          )}

          {/* 上一张卡片 */}
          {currentIndex > 0 && (
            <div 
              className="absolute left-0 transform -translate-x-[calc(100%-20px)] z-10"
              style={{
                transform: `translateX(calc(-100% + 20px + ${Math.max(0, translateX)}px))`,
                transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                opacity: isDragging ? Math.abs(Math.max(0, translateX)) / (containerRef.current?.clientWidth ?? 300) : 0.5
              }}
            >
              <Image
                src={getPrevCardImageUrl()}
                alt="Previous Card"
                width={600}
                height={840}
                className="w-auto h-auto max-w-full max-h-[calc(90vh-4rem)] rounded-b-lg"
                unoptimized
                priority
                onError={(e) => {
                  const img = e.target as HTMLImageElement;
                  if (!img.src.includes('scryfall.io')) {
                    const prevIndex = currentIndex - 1;
                    const prevCard = allCards[prevIndex];
                    if (prevCard?.scryfallId) {
                      setPrevImageUrl(`https://cards.scryfall.io/large/front/${prevCard.scryfallId.slice(0, 1)}/${prevCard.scryfallId.slice(1, 2)}/${prevCard.scryfallId}.jpg`);
                    } else {
                      setPrevImageUrl('/image/back.png');
                    }
                  }
                }}
              />
            </div>
          )}

          {/* 当前卡片 */}
          <div 
            className={`relative ${card.id.includes('foil') ? 'foil-effect' : ''} z-20`}
            style={{
              transform: `translateX(${translateX}px)`,
              transition: isDragging ? 'none' : 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
              opacity: isDragging ? 1 - (Math.abs(translateX) / (containerRef.current?.clientWidth ?? 300) * 0.3) : 1
            }}
          >
            <Image
              src={currentImageUrl}
              alt={card.zhs_name || card.name || card.id}
              width={600}
              height={840}
              className="w-auto h-auto max-w-full max-h-[calc(90vh-4rem)] rounded-b-lg"
              unoptimized
              priority
              onError={(e) => {
                const img = e.target as HTMLImageElement;
                if (!img.src.includes('scryfall.io')) {
                  if (card.scryfallId) {
                    setCurrentImageUrl(`https://cards.scryfall.io/large/front/${card.scryfallId.slice(0, 1)}/${card.scryfallId.slice(1, 2)}/${card.scryfallId}.jpg`);
                  } else {
                    setCurrentImageUrl('/image/back.png');
                  }
                }
              }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}

// 获取稀有度颜色
function getRarityColor(rarity: string): string {
  switch (rarity.toLowerCase()) {
    case 'mythic':
      return 'text-orange-500';
    case 'rare':
      return 'text-yellow-500';
    case 'uncommon':
      return 'text-blue-500';
    default:
      return 'text-white';
  }
} 