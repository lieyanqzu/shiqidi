'use client';

import type { Pack, Card } from '@/types/pack-simulator';
import Image from 'next/image';
import { useState, useEffect, useRef, useCallback } from 'react';
import { CardModal } from './card-modal';

interface PackDisplayProps {
  packs: Pack[];
  onFlippedCardsChange: (cards: Card[]) => void;
  autoFlipCommon: boolean;
}

// 获取卡图URL
function getCardImageUrl(scryfallId: string, setCode: string, number: string): string {
  // 优先使用 sbwsz.com 的图片源
  const sbwszUrl = `https://sbwsz.com/image/large/${setCode.toUpperCase()}/${setCode.toUpperCase()}_${number}.jpg`;

  return sbwszUrl;
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
      return 'text-[--muted-foreground]';
  }
}

// 获取卡牌详情页面URL
function getCardDetailUrl(card: Card): string {
  // 如果卡牌号带有 a 或 b 后缀，使用基础卡牌号
  const number = /^(\d+)[ab]$/.test(card.number) ? card.number.slice(0, -1) : card.number;
  return `https://sbwsz.com/card/${card.setCode}/${number}`;
}

export function PackDisplay({ packs, onFlippedCardsChange, autoFlipCommon }: PackDisplayProps) {
  const [flippedCards, setFlippedCards] = useState<Set<string>>(new Set());
  const [collapsedPacks, setCollapsedPacks] = useState<Set<number>>(new Set());
  const [loadingImages, setLoadingImages] = useState<Set<string>>(new Set());
  const [selectedCard, setSelectedCard] = useState<{ 
    card: Card & { 
      packIndex: number; 
      cardIndex: number;
      isPackSeparator?: boolean;
    }; 
    imageUrl: string 
  } | null>(null);
  const latestPackRef = useRef<HTMLDivElement>(null);
  const prevFlippedCardsRef = useRef<Card[]>([]);

  // 获取所有已翻开的卡牌
  const getAllCards = useCallback((currentPackIndex: number) => {
    const allCards: Array<Card & { 
      packIndex: number; 
      cardIndex: number;
      isPackSeparator?: boolean;
    }> = [];

    // 只获取当前包中已翻开的卡牌
    const pack = packs[currentPackIndex];
    if (pack?.cards) {
      // 按照卡牌在包中的顺序返回已翻开的卡牌
      for (let cardIndex = 0; cardIndex < pack.cards.length; cardIndex++) {
        const cardKey = `${currentPackIndex}-${cardIndex}`;
        if (flippedCards.has(cardKey)) {
          allCards.push({
            ...pack.cards[cardIndex],
            packIndex: currentPackIndex,
            cardIndex
          });
        }
      }
    }

    return allCards;
  }, [packs, flippedCards]);

  // 处理卡牌切换
  const handleCardChange = useCallback((newCard: Card & { packIndex: number; cardIndex: number }) => {
    setSelectedCard({
      card: {
        ...newCard,
        packIndex: newCard.packIndex,
        cardIndex: newCard.cardIndex
      },
      imageUrl: getCardImageUrl(newCard.scryfallId!, newCard.setCode, newCard.number)
    });
  }, []);

  // 获取所有已翻开的卡牌
  const getFlippedCards = useCallback(() => {
    const flippedCardsList: Card[] = [];
    packs?.forEach((pack, packIndex) => {
      pack.cards?.forEach((card, cardIndex) => {
        const cardKey = `${packIndex}-${cardIndex}`;
        if (flippedCards.has(cardKey)) {
          flippedCardsList.push(card);
        }
      });
    });
    return flippedCardsList;
  }, [packs, flippedCards]);

  // 当翻开状态改变时，通知父组件
  useEffect(() => {
    const currentFlippedCards = getFlippedCards();
    // 只有当翻开的卡牌真正发生变化时才通知父组件
    if (JSON.stringify(currentFlippedCards) !== JSON.stringify(prevFlippedCardsRef.current)) {
      prevFlippedCardsRef.current = currentFlippedCards;
      onFlippedCardsChange(currentFlippedCards);
    }
  }, [flippedCards, onFlippedCardsChange, getFlippedCards]);

  // 自动翻开普通和非普通卡牌
  useEffect(() => {
    if (!packs || !Array.isArray(packs) || packs.length === 0) return;
    
    if (autoFlipCommon) {
      setFlippedCards(prev => {
        const newFlippedCards = new Set(prev);
        packs.forEach((pack, packIndex) => {
          pack.cards?.forEach((card, cardIndex) => {
            if (card.rarity === 'common' || card.rarity === 'uncommon') {
              newFlippedCards.add(`${packIndex}-${cardIndex}`);
            }
          });
        });
        return newFlippedCards;
      });
    }
  }, [packs, autoFlipCommon]);

  // 收起所有补充包
  const collapseAllPacks = useCallback(() => {
    if (!packs) return;
    const newCollapsedPacks = new Set<number>();
    for (let i = 0; i < packs.length - 1; i++) {  // 除了最新的一包
      newCollapsedPacks.add(i);
    }
    setCollapsedPacks(newCollapsedPacks);
  }, [packs]);

  // 在组件挂载和 packs 更新时检查是否需要收起补充包并滚动到新包位置
  useEffect(() => {
    if (!packs || !Array.isArray(packs) || packs.length === 0) return;
    
    if (packs.length > 1) {
      collapseAllPacks();
      // 使用 setTimeout 确保在 DOM 更新后再滚动
      setTimeout(() => {
        if (latestPackRef.current) {
          const headerHeight = 64; // header 的高度
          const rect = latestPackRef.current.getBoundingClientRect();
          const absoluteTop = window.pageYOffset + rect.top - headerHeight - 20; // 20px 额外间距
          window.scrollTo({
            top: absoluteTop,
            behavior: 'smooth'
          });
        }
      }, 100);
    }
  }, [packs, collapseAllPacks]);

  if (!packs || !Array.isArray(packs) || packs.length === 0) {
    return null;
  }

  const handleCardClick = (packIndex: number, cardIndex: number) => {
    const cardKey = `${packIndex}-${cardIndex}`;
    if (!flippedCards.has(cardKey)) {
      setFlippedCards(prev => {
        const next = new Set(prev);
        next.add(cardKey);
        return next;
      });
    }
  };

  const handleCardImageClick = (e: React.MouseEvent, card: Card, packIndex: number, cardIndex: number) => {
    e.stopPropagation();
    setSelectedCard({
      card: { ...card, packIndex, cardIndex },
      imageUrl: getCardImageUrl(card.scryfallId!, card.setCode, card.number)
    });
  };

  const togglePackCollapse = (packIndex: number) => {
    setCollapsedPacks(prev => {
      const next = new Set(prev);
      if (next.has(packIndex)) {
        next.delete(packIndex);
      } else {
        next.add(packIndex);
      }
      return next;
    });
  };

  return (
    <>
      <style jsx>{`
        @keyframes rainbow {
          0% { color: #ff0000; }
          17% { color: #ff8800; }
          33% { color: #ffff00; }
          50% { color: #00ff00; }
          67% { color: #0088ff; }
          83% { color: #8800ff; }
          100% { color: #ff0000; }
        }
        .rainbow-text {
          animation: rainbow 4s linear infinite;
        }
        @keyframes pulse {
          0% { opacity: 0.3; }
          50% { opacity: 0.6; }
          100% { opacity: 0.3; }
        }
        .loading-pulse {
          animation: pulse 1.5s ease-in-out infinite;
        }
        @keyframes rareGlow {
          0% {
            box-shadow: 0 0 10px 2px rgba(218, 165, 32, 0.3),
                      0 0 20px 5px rgba(218, 165, 32, 0.2),
                      0 0 30px 10px rgba(218, 165, 32, 0.1);
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            box-shadow: 0 0 20px 5px rgba(218, 165, 32, 0.5),
                      0 0 40px 10px rgba(218, 165, 32, 0.3),
                      0 0 60px 15px rgba(218, 165, 32, 0.2);
            transform: scale(1.08);
            filter: brightness(1.2);
          }
          100% {
            box-shadow: 0 0 10px 2px rgba(218, 165, 32, 0.3),
                      0 0 20px 5px rgba(218, 165, 32, 0.2),
                      0 0 30px 10px rgba(218, 165, 32, 0.1);
            transform: scale(1);
            filter: brightness(1);
          }
        }
        @keyframes mythicGlow {
          0% {
            box-shadow: 0 0 15px 3px rgba(255, 69, 0, 0.3),
                      0 0 30px 8px rgba(255, 69, 0, 0.2),
                      0 0 45px 15px rgba(255, 69, 0, 0.1);
            transform: scale(1);
            filter: brightness(1);
          }
          50% {
            box-shadow: 0 0 30px 8px rgba(255, 69, 0, 0.5),
                      0 0 60px 15px rgba(255, 69, 0, 0.3),
                      0 0 90px 20px rgba(255, 69, 0, 0.2);
            transform: scale(1.12);
            filter: brightness(1.3);
          }
          100% {
            box-shadow: 0 0 15px 3px rgba(255, 69, 0, 0.3),
                      0 0 30px 8px rgba(255, 69, 0, 0.2),
                      0 0 45px 15px rgba(255, 69, 0, 0.1);
            transform: scale(1);
            filter: brightness(1);
          }
        }
        .rare-glow {
          animation: rareGlow 1.5s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }
        .mythic-glow {
          animation: mythicGlow 1.8s cubic-bezier(0.4, 0, 0.2, 1);
          z-index: 10;
        }
      `}</style>
      <div className="space-y-4">
        {selectedCard && (
          <CardModal
            card={selectedCard.card}
            imageUrl={selectedCard.imageUrl}
            onClose={() => setSelectedCard(null)}
            allCards={getAllCards(selectedCard.card.packIndex)}
            onCardChange={handleCardChange}
          />
        )}
        {packs.map((pack, packIndex) => {
          const isCollapsed = collapsedPacks.has(packIndex);
          const isLatestPack = packIndex === packs.length - 1;
          
          return (
            <div 
              key={packIndex}
              ref={isLatestPack ? latestPackRef : undefined}
              className="bg-[--card] border border-[--border] rounded-lg p-4"
            >
              <div className="flex justify-between items-center mb-3">
                <div className="flex items-center gap-3">
                  <h3 className="font-medium">补充包 #{packIndex + 1}</h3>
                </div>
                <button
                  onClick={() => togglePackCollapse(packIndex)}
                  className="text-sm text-[--muted-foreground] hover:text-[--foreground]"
                >
                  {isCollapsed ? '展开' : '收起'}
                </button>
              </div>
              
              {!isCollapsed && (
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
                  {pack.cards?.map((card, cardIndex) => {
                    const isFlipped = flippedCards.has(`${packIndex}-${cardIndex}`);
                    const cardKey = `${packIndex}-${cardIndex}`;
                    const isLoading = loadingImages.has(cardKey);
                    
                    return (
                      <div 
                        key={cardKey}
                        className="relative preserve-3d cursor-pointer"
                        onClick={() => handleCardClick(packIndex, cardIndex)}
                      >
                        <div 
                          className={`
                            relative w-full pb-[140%] 
                            transform-gpu transition-transform duration-700
                            ${isFlipped ? 'rotate-y-180' : ''}
                            preserve-3d
                          `}
                        >
                          {/* 卡背 */}
                          <div className="absolute inset-0 backface-hidden">
                            <Image
                              src="https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg"
                              alt="Card Back"
                              width={300}
                              height={420}
                              className="w-full h-full rounded-lg"
                              unoptimized
                            />
                          </div>

                          {/* 卡牌正面 */}
                          <div className={`absolute inset-0 backface-hidden rotate-y-180`}>
                            {isFlipped ? (
                              <>
                                <div 
                                  className={`
                                    relative cursor-pointer
                                    ${card.sheet.includes('foil') ? 'foil-effect' : ''} 
                                    ${isFlipped && card.rarity === 'rare' ? 'rare-glow' : ''}
                                    ${isFlipped && card.rarity === 'mythic' ? 'mythic-glow' : ''}
                                  `}
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleCardImageClick(e, card, packIndex, cardIndex);
                                  }}
                                >
                                  {isLoading && (
                                    <div className="absolute inset-0 bg-[--card] loading-pulse rounded-lg" />
                                  )}
                                  <Image
                                    src={getCardImageUrl(card.scryfallId!, card.setCode, card.number)}
                                    alt={card.zhs_name || card.officialName || card.translatedName || card.name || card.id}
                                    width={300}
                                    height={420}
                                    className="w-full h-full object-contain rounded-lg"
                                    unoptimized
                                    onLoadingComplete={() => {
                                      setLoadingImages(prev => {
                                        const next = new Set(prev);
                                        next.delete(cardKey);
                                        return next;
                                      });
                                    }}
                                    onLoad={() => {
                                      setLoadingImages(prev => {
                                        const next = new Set(prev);
                                        next.delete(cardKey);
                                        return next;
                                      });
                                    }}
                                    onLoadStart={() => {
                                      setLoadingImages(prev => {
                                        const next = new Set(prev);
                                        next.add(cardKey);
                                        return next;
                                      });
                                    }}
                                    onError={(e) => {
                                      // 如果 sbwsz.com 的图片加载失败，切换到 scryfall 的图片
                                      const img = e.target as HTMLImageElement;
                                      if (!img.src.includes('scryfall.io')) {
                                        if (card.scryfallId) {
                                          img.src = `https://cards.scryfall.io/large/front/${card.scryfallId.slice(0, 1)}/${card.scryfallId.slice(1, 2)}/${card.scryfallId}.jpg`;
                                        } else {
                                          img.src = 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';
                                        }
                                      }
                                      setLoadingImages(prev => {
                                        const next = new Set(prev);
                                        next.delete(cardKey);
                                        return next;
                                      });
                                    }}
                                  />
                                </div>
                              </>
                            ) : (
                              <div className={`
                                relative 
                                ${card.sheet.includes('foil') ? 'foil-effect' : ''} 
                                ${isFlipped && card.rarity === 'rare' ? 'rare-glow' : ''}
                                ${isFlipped && card.rarity === 'mythic' ? 'mythic-glow' : ''}
                              `}>
                                {isLoading && (
                                  <div className="absolute inset-0 bg-[--card] loading-pulse rounded-lg" />
                                )}
                                <Image
                                  src={getCardImageUrl(card.scryfallId!, card.setCode, card.number)}
                                  alt={card.zhs_name || card.officialName || card.translatedName || card.name || card.id}
                                  width={300}
                                  height={420}
                                  className="w-full h-full object-contain rounded-lg"
                                  unoptimized
                                  onLoadingComplete={() => {
                                    setLoadingImages(prev => {
                                      const next = new Set(prev);
                                      next.delete(cardKey);
                                      return next;
                                    });
                                  }}
                                  onLoad={() => {
                                    setLoadingImages(prev => {
                                      const next = new Set(prev);
                                      next.delete(cardKey);
                                      return next;
                                    });
                                  }}
                                  onLoadStart={() => {
                                    setLoadingImages(prev => {
                                      const next = new Set(prev);
                                      next.add(cardKey);
                                      return next;
                                    });
                                  }}
                                  onError={(e) => {
                                    // 如果 sbwsz.com 的图片加载失败，切换到 scryfall 的图片
                                    const img = e.target as HTMLImageElement;
                                    if (!img.src.includes('scryfall.io')) {
                                      if (card.scryfallId) {
                                        img.src = `https://cards.scryfall.io/large/front/${card.scryfallId.slice(0, 1)}/${card.scryfallId.slice(1, 2)}/${card.scryfallId}.jpg`;
                                      } else {
                                        img.src = 'https://static.wikia.nocookie.net/mtgsalvation_gamepedia/images/f/f8/Magic_card_back.jpg';
                                      }
                                    }
                                    setLoadingImages(prev => {
                                      const next = new Set(prev);
                                      next.delete(cardKey);
                                      return next;
                                    });
                                  }}
                                />
                              </div>
                            )}
                          </div>
                        </div>

                        {/* 卡牌信息 - 仅在翻转后显示 */}
                        {isFlipped && (
                          <div className="mt-2 text-sm">
                            <div className="flex items-center gap-2">
                              <a 
                                href={getCardDetailUrl(card)} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                className={`truncate hover:opacity-80 transition-opacity ${card.rarity ? getRarityColor(card.rarity) : ''}`}
                              >
                                <div className="text-sm truncate max-w-full">
                                  {card.zhs_name || card.officialName || card.translatedName || card.name || card.id}
                                </div>
                              </a>
                              {card.sheet.includes('foil') && (
                                <span className="text-xs rainbow-text">闪</span>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </>
  );
} 