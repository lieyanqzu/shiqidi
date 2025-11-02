import { CardData } from '@/types/card'
import { FC, useEffect, useState, useRef, memo, useCallback } from 'react'
import { ManaSymbols } from '@/components/mana/mana-symbols'
import { useCardStore } from "@/lib/store"
import Image from 'next/image'
import { getCardFullImageUrl } from '@/lib/card-images'
import { extractScryfallIdFromUrl, fetchCardDetailByScryfallId } from '@/lib/api'

interface CardTooltipProps {
  card: CardData
  visible: boolean
  x: number
  y: number
  expansion: string
  isMobile?: boolean
  onClose?: () => void
  onMouseEnter?: () => void
  onMouseLeave?: () => void
}

interface CardDetails {
  type: 'normal' | 'double'
  data: Array<{
    zhs_type?: string
    zhs_text?: string
    zhs_name?: string
  }>
}

interface TooltipPosition {
  top: number | string
  left: number | string
  width?: number | string
  position?: 'fixed'
  transform?: string
  maxWidth?: string
  maxHeight?: string
  overflow?: string
}

const CardTooltip: FC<CardTooltipProps> = ({ card, visible, x, y, expansion, isMobile, onClose, onMouseEnter, onMouseLeave }) => {
  const { chineseCards } = useCardStore();
  const chineseCard = chineseCards[card.name];
  const chineseName = chineseCard?.atomic_official_name || chineseCard?.atomic_translated_name || chineseCard?.zhs_name;
  const [cardDetails, setCardDetails] = useState<CardDetails | null>(null);
  
  // 使用 useRef 同步记录初始位置，避免状态更新延迟
  const initialPositionRef = useRef<{ x: number; y: number } | null>(null);
  const wasVisibleRef = useRef(false);
  const tooltipRef = useRef<HTMLDivElement>(null);
  const [tooltipPosition, setTooltipPosition] = useState<TooltipPosition | null>(null);

  // 处理文本替换
  const processText = (text?: string) => {
    if (!text) return '';
    return text.replace(/\\n/g, '\n').replace(/CARDNAME/g, chineseName || card.name);
  };

  // 同步记录初始位置（在渲染期间而不是 useEffect 中）
  if (visible && !wasVisibleRef.current) {
    initialPositionRef.current = { x, y };
    wasVisibleRef.current = true;
  } else if (!visible && wasVisibleRef.current) {
    initialPositionRef.current = null;
    wasVisibleRef.current = false;
  }

  // 计算悬浮窗位置的函数 - 只依赖 visible 和 isMobile，避免鼠标移动时重新计算
  const calculateTooltipPosition = useCallback((actualHeight?: number) => {
    // 只在 visible 时计算
    if (!visible) {
      return { top: 0, left: 0, width: 650 };
    }
    
    // 必须使用 initialPositionRef，这样位置就固定在tooltip首次显示时的鼠标位置
    const posX = initialPositionRef.current?.x ?? 0;
    const posY = initialPositionRef.current?.y ?? 0;
    
    if (typeof window === 'undefined') return { top: posY + 10, left: posX + 10 };

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

    const screenHeight = window.innerHeight;
    const screenWidth = window.innerWidth;
    const margin = 10;
    
    // 根据屏幕宽度动态调整tooltip宽度，避免窄屏闪烁
    const maxTooltipWidth = 650;
    const tooltipWidth = Math.min(maxTooltipWidth, screenWidth - margin * 4); // 留出足够边距
    // 使用实际高度或默认高度
    const tooltipHeight = actualHeight || 400;
    
    // 垂直位置：优先显示在鼠标下方，如果空间不足则显示在上方
    let top = posY + margin;
    if (top + tooltipHeight + margin > screenHeight) {
      top = posY - tooltipHeight - margin;
    }
    // 确保不超出顶部
    if (top < margin) {
      top = margin;
    }
    // 再次确保不超出底部（在高度变化后）
    if (top + tooltipHeight + margin > screenHeight) {
      top = screenHeight - tooltipHeight - margin;
    }

    // 水平位置：优先显示在鼠标右侧，如果空间不足则显示在左侧
    let left = posX + margin;
    if (left + tooltipWidth + margin > screenWidth) {
      // 尝试显示在鼠标左侧
      left = posX - tooltipWidth - margin;
    }
    // 确保不超出左侧
    if (left < margin) {
      left = margin;
    }
    // 确保不超出右侧
    if (left + tooltipWidth > screenWidth - margin) {
      left = screenWidth - tooltipWidth - margin;
    }

    return { top, left, width: tooltipWidth };
  }, [visible, isMobile]); // 移除 x, y 依赖，避免鼠标移动时重新计算

  // 初始化位置
  useEffect(() => {
    if (visible) {
      setTooltipPosition(calculateTooltipPosition());
    } else {
      setTooltipPosition(null);
    }
  }, [visible, calculateTooltipPosition]);

  // 当 cardDetails 加载后，使用实际高度重新计算位置
  useEffect(() => {
    if (visible && cardDetails && tooltipRef.current && !isMobile) {
      // 延迟一帧以确保 DOM 已更新
      requestAnimationFrame(() => {
        if (tooltipRef.current) {
          const actualHeight = tooltipRef.current.offsetHeight;
          setTooltipPosition(calculateTooltipPosition(actualHeight));
        }
      });
    }
  }, [cardDetails, visible, isMobile, calculateTooltipPosition]);

  useEffect(() => {
    if (!visible) {
      setCardDetails(null);
      return;
    }

    // 从card.url提取scryfallId并查询详细信息
    if (visible && card.url) {
      const scryfallId = extractScryfallIdFromUrl(card.url);
      if (scryfallId) {
        fetchCardDetailByScryfallId(scryfallId)
          .then((json) => {
            if (!json) return;
            
            // 处理HTML文本，去除HTML标签
            const stripHtml = (html: string) => {
              if (!html) return '';
              return html
                .replace(/<p>/g, '')
                .replace(/<\/p>/g, '\n')
                .replace(/<br\s*\/?>/g, '\n')
                .replace(/<[^>]+>/g, '')
                .trim();
            };
            
            const mainFace = {
              zhs_type: json.display_type_line || '',
              zhs_text: stripHtml(json.oracle_text_html),
              zhs_name: json.display_name_zh || json.display_name
            };

            setCardDetails({
              type: json.other_faces && json.other_faces.length > 0 ? 'double' : 'normal',
              data: json.other_faces && json.other_faces.length > 0
                ? [mainFace, {
                    zhs_type: json.other_faces[0].display_type_line || '',
                    zhs_text: stripHtml(json.other_faces[0].oracle_text_html),
                    zhs_name: json.other_faces[0].display_name_zh || json.other_faces[0].display_name
                  }]
                : [mainFace]
            });
          })
          .catch(console.error);
      }
    }
  }, [visible, card.url]);

  if (!visible || !tooltipPosition) return null

  const position = tooltipPosition;

  // 处理稀有度图标的系列代码
  const processedSet = expansion.startsWith('Y')
    ? `y${expansion.slice(expansion.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
    : expansion.toLowerCase()

  // 获取卡图URL
  const cardImageUrl = getCardFullImageUrl(card.url, chineseCard?.id, 'normal');

  const handleClose = () => {
    onClose?.()
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
        ref={tooltipRef}
        className={`fixed z-50 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 ${
          isMobile ? 'overflow-y-auto aspect-[3/4]' : 'p-4'
        }`}
        style={{
          ...position,
          ...(isMobile ? {} : { minWidth: '400px', maxWidth: '650px' })
        }}
        onClick={(e) => e.stopPropagation()}
        onMouseEnter={onMouseEnter}
        onMouseLeave={onMouseLeave}
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
                  const scryfallId = chineseCard?.id || (card.url ? extractScryfallIdFromUrl(card.url) : null);
                  if (scryfallId) {
                    window.open(`https://mtgch.com/result?q=id=${scryfallId}&utm_source=shiqidi`, '_blank');
                  }
                }}
                className="text-sm text-blue-500 hover:text-blue-600"
              >
                在 大学院废墟 中查看
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
                    <div className="whitespace-pre-wrap break-words w-full">
                      <div className="font-medium mb-1">{cardDetails.data[0]?.zhs_type}</div>
                      <div>{processText(cardDetails.data[0]?.zhs_text)}</div>
                    </div>
                  ) : (
                    // 双面卡显示
                    <div className="flex gap-4 w-full">
                      <div className="flex-1 min-w-0 whitespace-pre-wrap break-words">
                        <div className="font-medium mb-1">{cardDetails.data[0]?.zhs_name}</div>
                        <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">{cardDetails.data[0]?.zhs_type}</div>
                        <div>{processText(cardDetails.data[0]?.zhs_text)}</div>
                      </div>
                      <div className="w-px bg-gray-200 dark:bg-gray-700 mx-2 shrink-0" />
                      <div className="flex-1 min-w-0 whitespace-pre-wrap break-words">
                        <div className="font-medium mb-1">{cardDetails.data[1]?.zhs_name}</div>
                        <div className="font-medium text-sm text-gray-600 dark:text-gray-400 mb-1">{cardDetails.data[1]?.zhs_type}</div>
                        <div>{processText(cardDetails.data[1]?.zhs_text)}</div>
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
                  <div className="text-gray-500">在手胜率提升</div>
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
                  <span className="font-medium">{(card.win_rate ? (card.win_rate * 100).toFixed(1) : '-') + '%'}</span>
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

// 使用 memo 避免不必要的重新渲染
export default memo(CardTooltip, (prevProps, nextProps) => {
  // 当 visible 状态变化时，总是需要重新渲染
  if (prevProps.visible !== nextProps.visible) {
    return false;
  }
  
  // 只在这些属性变化时才重新渲染（不包括 x 和 y，因为位置固定在首次显示时）
  const shouldNotUpdate = 
    prevProps.card.name === nextProps.card.name &&
    prevProps.expansion === nextProps.expansion &&
    prevProps.isMobile === nextProps.isMobile;
  
  return shouldNotUpdate;
}) 