'use client'

import { useEffect, useRef, useState } from 'react'

interface GeiliRedeemPanelProps {
  ctaHref?: string
}

export function GeiliRedeemPanel({ ctaHref = 'https://www.geilijiasu.com/' }: GeiliRedeemPanelProps) {
  const [copiedCode, setCopiedCode] = useState<string | null>(null)
  const timerRef = useRef<number | null>(null)

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
    }
  }, [])

  const copyText = async (text: string) => {
    try {
      if (navigator?.clipboard?.writeText) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement('textarea')
        textarea.value = text
        textarea.style.position = 'fixed'
        textarea.style.opacity = '0'
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand('copy')
        document.body.removeChild(textarea)
      }
      setCopiedCode(text)
      if (timerRef.current) {
        window.clearTimeout(timerRef.current)
      }
      timerRef.current = window.setTimeout(() => {
        setCopiedCode(null)
      }, 2000)
    } catch (error) {
      console.error('复制失败:', error)
    }
  }

  return (
    <div className="flex flex-col gap-3 sm:items-end">
      <div className="grid w-full grid-cols-[minmax(0,1fr)_104px] items-stretch gap-3 sm:w-auto sm:grid-cols-[220px_minmax(140px,220px)]">
        <div className="h-full rounded-lg border border-white/10 bg-white/5 px-4 py-3 backdrop-blur sm:h-[88px] dark:border-white/20 dark:bg-white/10">
          <div className="flex items-center gap-2 text-xs text-slate-300">
            <span className="font-semibold text-[#facc15]">VIP 兑换码</span>
            {copiedCode ? (
              <span className="text-[10px] text-slate-400">已复制 {copiedCode}</span>
            ) : null}
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => copyText('十七地')}
              className="rounded-md border border-[#facc15]/40 bg-[#111827]/80 px-3 py-1 text-sm font-semibold text-[#facc15] transition-colors hover:border-[#facc15] hover:bg-[#1f2937] dark:bg-black/30 dark:hover:bg-black/40"
            >
              十七地
            </button>
            <span className="text-xs text-slate-400">或</span>
            <button
              type="button"
              onClick={() => copyText('shiqidi')}
              className="rounded-md border border-[#facc15]/40 bg-[#111827]/80 px-3 py-1 text-sm font-semibold text-[#facc15] transition-colors hover:border-[#facc15] hover:bg-[#1f2937] dark:bg-black/30 dark:hover:bg-black/40"
            >
              shiqidi
            </button>
          </div>
        </div>
        <a
          href={ctaHref}
          target="_blank"
          rel="noreferrer"
          className="inline-flex h-full w-full items-center justify-center rounded-md border border-[#f7d66a] bg-[#f7d66a] px-3 text-sm font-semibold text-black shadow-[0_12px_24px_rgba(247,214,106,0.35)] transition-colors hover:bg-[#f3ca4a] sm:h-[88px] sm:px-6 sm:text-lg dark:border-[#e0b547] dark:bg-[#d4a62f] dark:hover:bg-[#c49424]"
        >
          <span className="block text-center leading-tight sm:hidden">
            <span className="block">立即</span>
            <span className="block">加速</span>
          </span>
          <span className="hidden sm:inline">立即加速</span>
        </a>
      </div>
    </div>
  )
}
