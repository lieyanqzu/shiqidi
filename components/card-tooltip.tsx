import { CardData } from '@/types/card'
import { FC, useEffect, useState } from 'react'
import { ManaSymbols } from '@/components/mana-symbols'
import { useCardStore } from "@/lib/store"
import Image from 'next/image'

interface CardTooltipProps {
  card: CardData
  visible: boolean
  x: number
  y: number
  expansion: string
  isMobile?: boolean
}

interface CardApiResponse {
  type: 'normal' | 'double'
  data: Array<{
    zhs_type: string
    zhs_text?: string
    translatedText?: string
    side?: 'a' | 'b'
    zhs_faceName?: string
  }>
}

interface CardDetails {
  type: 'normal' | 'double'
  data: Array<{
    zhs_type: string
    zhs_text?: string
    translatedText?: string
    side?: 'a' | 'b'
    zhs_faceName?: string
  }>
}

const CardTooltip: FC<CardTooltipProps> = ({ card, visible, x, y, expansion, isMobile }) => {
  const { chineseCards } = useCardStore();
  const chineseCard = chineseCards[card.name];
  const chineseName = chineseCard?.zhs_name || chineseCard?.officialName || chineseCard?.translatedName;
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);

  // 处理文本替换
  const processText = (text?: string) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n').replace(/CARDNAME/g, chineseName || card.name);
  };

  // 计算悬浮窗位置
  const getTooltipPosition = () => {
    if (typeof window === 'undefined') return { top: y + 10, left: x + 10 };

    if (isMobile) {
      return {
        position: 'fixed' as const,
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        width: 'calc(100% - 32px)',
        maxWidth: '450px',
        maxHeight: 'calc(100vh - 64px)',
        overflow: 'auto'
      };
    }

    const tooltipHeight = cardDetails?.type === 'normal' ? 300 : 400;
    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    
    let top = y + 10;
    if (top + tooltipHeight + 10 > screenHeight) {
      top = y - tooltipHeight - 10;
    }

    let left = x + 10;
    const tooltipWidth = cardDetails?.type === 'normal' ? 300 : 450;
    if (left + tooltipWidth > screenWidth - 10) {
      left = screenWidth - tooltipWidth - 10;
    }

    return { top, left };
  };

  useEffect(() => {
    if (!visible) {
      setCardDetails(null);
      return;
    }

    if (visible && chineseCard?.setCode && chineseCard?.number) {
      fetch(`https://api.sbwsz.com/card/${chineseCard.setCode}/${chineseCard.number}`)
        .then(res => res.json())
        .then((json: CardApiResponse) => {
          if ((json.type === 'normal' || json.type === 'double') && json.data?.[0]) {
            setCardDetails({
              type: json.type,
              data: json.data.map(card => ({
                zhs_type: card.zhs_type,
                zhs_text: card.zhs_text,
                translatedText: card.translatedText,
                side: card.side,
                zhs_faceName: card.zhs_faceName
              }))
            });
          }
        })
        .catch(console.error);
    }
  }, [visible, chineseCard?.setCode, chineseCard?.number]);

  if (!visible) return null

  const position = getTooltipPosition();

  // 处理稀有度图标的系列代码
  const processedSet = expansion.startsWith('Y')
    ? `y${expansion.slice(expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
    : expansion.toLowerCase()

  // 获取卡图URL
  const cardImageUrl = card.url || (chineseCard?.scryfallId 
    ? `https://cards.scryfall.io/normal/front/${chineseCard.scryfallId.slice(0, 1)}/${chineseCard.scryfallId.slice(1, 2)}/${chineseCard.scryfallId}.jpg`
    : null);

  const handleClose = () => {
    const event = new MouseEvent('mouseleave');
    document.dispatchEvent(event);
  };

  return (
    <>
      {isMobile && visible && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={handleClose}
        />
      )}
      <div 
        className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${
          isMobile ? 'overflow-y-auto aspect-[3/4]' : 'p-4'
        }`}
        style={position}
        onClick={(e) => e.stopPropagation()}
      >
        {isMobile && (
          <div className="sticky top-0 z-10 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="font-bold text-lg">{chineseName}</h2>
                <div className="text-sm text-gray-500">{card.name}</div>
              </div>
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  if (chineseCard?.setCode && chineseCard?.number) {
                    window.open(`https://sbwsz.com/card/${chineseCard.setCode}/${chineseCard.number}`, '_blank');
                  }
                }}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                在 sbwsz.com 中查看
              </button>
            </div>
          </div>
        )}
        
        <div className={isMobile ? 'p-4' : ''}>
          <div className={`flex ${isMobile ? 'flex-col' : 'gap-4'}`}>
            {/* 右侧卡图区域 - 在移动端显示在顶部 */}
            {cardImageUrl && isMobile && (
              <div className="w-full aspect-[7/5] mb-4 rounded-lg overflow-hidden">
                <Image 
                  src={cardImageUrl} 
                  alt={card.name}
                  width={350}
                  height={250}
                  className="w-full h-full object-contain"
                  unoptimized
                />
              </div>
            )}

            {/* 左侧信息区域 */}
            <div className="space-y-3 flex-1">
              {/* 卡牌名称和基本信息 - 在移动端隐藏，因为已经在顶部显示 */}
              {!isMobile && (
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-bold text-lg">{chineseName}</h3>
                    <div className="text-sm text-gray-500">{card.name}</div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-20 flex justify-end">
                      <ManaSymbols color={card.color} />
                    </div>
                    <i 
                      className={`keyrune ss ss-${processedSet} ss-${card.rarity.toLowerCase()} ss-2x`}
                      title={card.rarity}
                    />
                  </div>
                </div>
              )}

              {/* 卡牌效果 */}
              {cardDetails?.data && (
                <div className="text-sm p-3 bg-gray-50 dark:bg-gray-900 rounded">
                  {cardDetails.type === 'normal' ? (
                    // 单面卡显示
                    <div className="whitespace-pre-wrap break-words max-w-[300px]">
                      <div className="font-medium mb-1">{cardDetails.data[0]?.zhs_type}</div>
                      <div>{processText(cardDetails.data[0]?.zhs_text || cardDetails.data[0]?.translatedText)}</div>
                    </div>
                  ) : (
                    // 双面卡显示
                    <div className="flex gap-4 max-w-[450px]">
                      <div className="flex-1 min-w-0 whitespace-pre-wrap break-words">
                        <div className="font-medium mb-1">{cardDetails.data[0]?.zhs_faceName}</div>
                        <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">{cardDetails.data[0]?.zhs_type}</div>
                        <div>{processText(cardDetails.data[0]?.zhs_text || cardDetails.data[0]?.translatedText)}</div>
                      </div>
                      <div className="w-px bg-gray-200 dark:bg-gray-700 mx-2 shrink-0" />
                      <div className="flex-1 min-w-0 whitespace-pre-wrap break-words">
                        <div className="font-medium mb-1">{cardDetails.data[1]?.zhs_faceName}</div>
                        <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">{cardDetails.data[1]?.zhs_type}</div>
                        <div>{processText(cardDetails.data[1]?.zhs_text || cardDetails.data[1]?.translatedText)}</div>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {/* 核心数据 */}
              <div className="grid grid-cols-3 gap-2 text-sm bg-gray-50 dark:bg-gray-900 p-2 rounded">
                <div className="text-center">
                  <div className="font-medium text-lg">{card.avg_seen?.toFixed(1) || '-'}</div>
                  <div className="text-gray-500">平均抓位</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg">{(card.ever_drawn_win_rate ? (card.ever_drawn_win_rate * 100).toFixed(1) : '-') + '%'}</div>
                  <div className="text-gray-500">在手胜率</div>
                </div>
                <div className="text-center">
                  <div className="font-medium text-lg">{(card.drawn_improvement_win_rate ? (card.drawn_improvement_win_rate * 100).toFixed(1) : '-') + '%'}</div>
                  <div className="text-gray-500">抽到胜率提升</div>
                </div>
              </div>

              {/* 轮抽数据 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm">
                <p className="flex justify-between">
                  <span className="text-gray-500">见过次数</span>
                  <span className="font-medium">{card.seen_count || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">选择次数</span>
                  <span className="font-medium">{card.pick_count || 0}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">平均选择位置</span>
                  <span className="font-medium">{card.avg_pick?.toFixed(1) || '-'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">游戏次数</span>
                  <span className="font-medium">{card.game_count || 0}</span>
                </p>
              </div>

              {/* 详细胜率数据 */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-sm border-t pt-2">
                <p className="flex justify-between">
                  <span className="text-gray-500">起手胜率</span>
                  <span className="font-medium">{(card.opening_hand_win_rate ? (card.opening_hand_win_rate * 100).toFixed(1) : '-') + '%'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">抽到胜率</span>
                  <span className="font-medium">{(card.drawn_win_rate ? (card.drawn_win_rate * 100).toFixed(1) : '-') + '%'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">未抽到胜率</span>
                  <span className="font-medium">{(card.never_drawn_win_rate ? (card.never_drawn_win_rate * 100).toFixed(1) : '-') + '%'}</span>
                </p>
                <p className="flex justify-between">
                  <span className="text-gray-500">使用胜率</span>
                  <span className="font-medium">{(card.play_rate ? (card.play_rate * 100).toFixed(1) : '-') + '%'}</span>
                </p>
              </div>
            </div>

            {/* 右侧卡图区域 - 在桌面端显示 */}
            {cardImageUrl && !isMobile && (
              <div className="w-[240px] h-[340px] flex-shrink-0 rounded-lg overflow-hidden">
                <Image 
                  src={cardImageUrl} 
                  alt={card.name}
                  width={240}
                  height={340}
                  className="object-cover"
                  unoptimized
                />
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export default CardTooltip 