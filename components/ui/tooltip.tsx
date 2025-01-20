"use client"

import React, { useState, useEffect, useRef, ReactNode } from 'react'
import { createPortal } from 'react-dom'

interface TooltipProps {
  children?: ReactNode
  content: ReactNode
  open?: boolean
  onOpenChange?: (open: boolean) => void
  side?: 'top' | 'right' | 'bottom' | 'left'
  className?: string
  showCloseButton?: boolean
  asNotification?: boolean
  backgroundImage?: string
}

const TooltipContent = ({ 
  children, 
  className = '',
  side = 'bottom',
  onClose,
  asNotification = false,
  backgroundImage
}: { 
  children: ReactNode
  className?: string
  side?: 'top' | 'right' | 'bottom' | 'left'
  onClose?: () => void
  asNotification?: boolean
  backgroundImage?: string
}) => {
  const arrowClasses = {
    'top': 'after:bottom-[-6px] after:border-b-0 after:border-l-0 after:left-1/2 after:-translate-x-1/2',
    'bottom': 'after:top-[-6px] after:border-t-0 after:border-r-0 after:left-1/2 after:-translate-x-1/2',
    'left': 'after:right-[-6px] after:border-t-0 after:border-r-0 after:top-1/2 after:-translate-y-1/2',
    'right': 'after:left-[-6px] after:border-b-0 after:border-l-0 after:top-1/2 after:-translate-y-1/2'
  }

  return (
    <div className={`
      rounded-lg bg-[--card] border border-[--border]
      shadow-lg animate-in fade-in-0 zoom-in-95 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95
      relative
      ${!asNotification ? `after:absolute after:w-3 after:h-3 
      after:rotate-45 after:bg-[--card] after:border after:border-[--border]
      ${arrowClasses[side]}` : ''}
      ${className}
    `}>
      <div className="relative overflow-hidden rounded-lg px-4 py-3 text-sm text-[--foreground]">
        {backgroundImage && (
          <div className="absolute inset-0">
            <div 
              className="absolute inset-0 opacity-[0.3] dark:opacity-[0.3]"
              style={{
                backgroundImage: `url(${backgroundImage})`,
                backgroundSize: 'cover',
                backgroundPosition: 'center'
              }}
            />
            <div className="absolute inset-0 bg-[--card] opacity-60 dark:opacity-70" />
          </div>
        )}
        <div className="relative">
          {onClose && (
            <button
              onClick={onClose}
              className="absolute top-0 right-0 w-6 h-6 rounded flex items-center justify-center text-[--muted-foreground] hover:text-[--foreground] transition-colors"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          )}
          {children}
        </div>
      </div>
    </div>
  )
}

const Tooltip = ({ 
  children, 
  content, 
  open, 
  onOpenChange,
  side = 'bottom',
  className = '',
  showCloseButton = false,
  asNotification = false,
  backgroundImage
}: TooltipProps) => {
  const [isOpen, setIsOpen] = useState(open)
  const [position, setPosition] = useState({ top: 0, left: 0 })
  const [actualSide, setActualSide] = useState(side)
  const [lastInteractionType, setLastInteractionType] = useState<'mouse' | 'touch' | null>(null)
  const triggerRef = useRef<HTMLDivElement>(null)
  const tooltipRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined)

  useEffect(() => {
    if (open !== undefined) {
      setIsOpen(open)
    }
  }, [open])

  useEffect(() => {
    if (!isOpen || !tooltipRef.current) return
    if (asNotification) {
      // 通知样式固定在右下角
      setPosition({ 
        top: window.innerHeight - (tooltipRef.current.offsetHeight + 16),
        left: window.innerWidth - (tooltipRef.current.offsetWidth + 16)
      })
      return
    }
    if (!triggerRef.current) return

    const updatePosition = () => {
      if (!triggerRef.current || !tooltipRef.current) return

      // 获取当前触发元素的位置信息
      let triggerRect = triggerRef.current.getBoundingClientRect()
      
      // 检查当前触发元素是否在视口内且可见
      if (
        triggerRect.width === 0 ||
        triggerRect.height === 0 ||
        triggerRect.top >= window.innerHeight ||
        triggerRect.bottom <= 0 ||
        triggerRect.left >= window.innerWidth ||
        triggerRect.right <= 0 ||
        window.getComputedStyle(triggerRef.current).display === 'none' ||
        window.getComputedStyle(triggerRef.current).visibility === 'hidden'
      ) {
        // 尝试查找同一组件的其他实例
        const allTriggers = document.querySelectorAll('[data-next-set-trigger]')
        let visibleTriggerElement: Element | null = null

        for (const el of allTriggers) {
          const rect = el.getBoundingClientRect()
          const style = window.getComputedStyle(el)
          
          if (
            rect.width > 0 &&
            rect.height > 0 &&
            rect.top < window.innerHeight &&
            rect.bottom > 0 &&
            rect.left < window.innerWidth &&
            rect.right > 0 &&
            style.display !== 'none' &&
            style.visibility !== 'hidden'
          ) {
            visibleTriggerElement = el
            break
          }
        }

        if (!visibleTriggerElement) {
          setIsOpen(false)
          onOpenChange?.(false)
          return
        }

        triggerRect = visibleTriggerElement.getBoundingClientRect()
      }

      const tooltip = tooltipRef.current.getBoundingClientRect()
      let top = 0
      let left = 0
      let newSide = side

      // 确保tooltip不会超出视口
      const margin = 8 // 与边缘的最小距离
      const viewportWidth = window.innerWidth
      const viewportHeight = window.innerHeight

      // 检查是否有足够空间在首选位置显示
      const spaceAbove = triggerRect.top
      const spaceBelow = viewportHeight - triggerRect.bottom

      // 如果首选位置是底部但空间不够，尝试顶部
      if (side === 'bottom' && spaceBelow < tooltip.height + margin && spaceAbove > tooltip.height + margin) {
        newSide = 'top'
      }
      // 如果首选位置是顶部但空间不够，尝试底部
      else if (side === 'top' && spaceAbove < tooltip.height + margin && spaceBelow > tooltip.height + margin) {
        newSide = 'bottom'
      }

      // 计算基础位置（相对于视口）
      switch (newSide) {
        case 'bottom':
          top = triggerRect.bottom + 12
          left = triggerRect.left + (triggerRect.width - tooltip.width) / 2
          break
        case 'top':
          top = triggerRect.top - tooltip.height - 12
          left = triggerRect.left + (triggerRect.width - tooltip.width) / 2
          break
        case 'right':
          top = triggerRect.top + (triggerRect.height - tooltip.height) / 2
          left = triggerRect.right + 12
          break
        case 'left':
          top = triggerRect.top + (triggerRect.height - tooltip.height) / 2
          left = triggerRect.left - tooltip.width - 12
          break
      }

      // 水平方向的边界检查
      if (left < margin) {
        left = margin
      } else if (left + tooltip.width > viewportWidth - margin) {
        left = viewportWidth - tooltip.width - margin
      }

      // 垂直方向的边界检查
      if (top < margin) {
        top = margin
      } else if (top + tooltip.height > viewportHeight - margin) {
        top = viewportHeight - tooltip.height - margin
      }

      setActualSide(newSide)
      setPosition({ top, left })
    }

    updatePosition()

    // 添加事件监听
    window.addEventListener('resize', updatePosition)
    window.addEventListener('scroll', updatePosition, true) // 使用 capture 确保能捕获所有滚动事件

    return () => {
      window.removeEventListener('resize', updatePosition)
      window.removeEventListener('scroll', updatePosition, true)
    }
  }, [isOpen, side, asNotification, onOpenChange])

  const handleMouseEnter = (e: React.MouseEvent) => {
    if (asNotification) return
    // 如果不是触摸事件触发的
    if (!(e.nativeEvent instanceof TouchEvent)) {
      setLastInteractionType('mouse')
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
      setIsOpen(true)
      onOpenChange?.(true)
    }
  }

  const handleMouseLeave = (e: React.MouseEvent) => {
    if (asNotification) return
    // 如果不是触摸事件触发的
    if (!(e.nativeEvent instanceof TouchEvent)) {
      timeoutRef.current = setTimeout(() => {
        if (!tooltipRef.current?.matches(':hover')) {
          setIsOpen(false)
          onOpenChange?.(false)
        }
      }, 100)
    }
  }

  const handleTooltipMouseLeave = (e: React.MouseEvent) => {
    if (asNotification) return
    // 如果不是触摸事件触发的
    if (!(e.nativeEvent instanceof TouchEvent)) {
      setIsOpen(false)
      onOpenChange?.(false)
    }
  }

  const handleClick = (e: React.MouseEvent) => {
    // 如果是触摸事件或通知模式
    if (e.nativeEvent instanceof TouchEvent || asNotification) {
      setLastInteractionType('touch')
      setIsOpen(!isOpen)
      onOpenChange?.(!isOpen)
    }
  }

  const handleClose = () => {
    setIsOpen(false)
    onOpenChange?.(false)
  }

  return (
    <>
      <div
        ref={triggerRef}
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
        onClick={handleClick}
      >
        {children}
      </div>
      {isOpen && typeof window !== 'undefined' && createPortal(
        <div
          ref={tooltipRef}
          style={{
            position: 'fixed',
            top: position.top,
            left: position.left,
            zIndex: 9999
          }}
          className={className}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleTooltipMouseLeave}
        >
          <TooltipContent 
            side={actualSide} 
            onClose={showCloseButton ? handleClose : undefined} 
            asNotification={asNotification || lastInteractionType === 'touch'}
            backgroundImage={backgroundImage}
          >
            {content}
          </TooltipContent>
        </div>,
        document.body
      )}
    </>
  )
}

export { Tooltip } 