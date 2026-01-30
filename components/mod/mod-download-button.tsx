'use client'

import { useEffect, useState } from "react"
import { ChevronDown } from "lucide-react"

const quarkDownloadUrl = 'https://pan.quark.cn/s/fcc3d825e126'
const directDownloadUrl = '/mod-updater.zip'

export function ModDownloadButton() {
  const [downloading, setDownloading] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as HTMLElement
      if (!target.closest('.mod-download-button')) {
        setMenuOpen(false)
      }
    }

    document.addEventListener('click', handleClickOutside)
    return () => {
      document.removeEventListener('click', handleClickOutside)
    }
  }, [])

  const handleQuarkDownload = () => {
    window.open(quarkDownloadUrl, '_blank', 'noopener,noreferrer')
  }

  const handleDirectDownload = async () => {
    try {
      setDownloading(true)
      setMenuOpen(false)

      const link = document.createElement('a')
      link.href = directDownloadUrl
      link.download = 'mod-updater.zip'
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('下载失败:', error)
    } finally {
      setDownloading(false)
    }
  }

  return (
    <div className="relative inline-flex mod-download-button">
      <button
        type="button"
        onClick={handleQuarkDownload}
        className="px-4 py-2 rounded-l-md bg-[--primary] text-[--primary-foreground] hover:opacity-90 transition-opacity"
      >
        网盘下载
      </button>
      <button
        type="button"
        aria-haspopup="menu"
        aria-expanded={menuOpen}
        onClick={() => setMenuOpen((prev) => !prev)}
        className="px-2 py-2 rounded-r-md bg-[--primary] text-[--primary-foreground] hover:opacity-90 transition-opacity border-l border-[--primary-foreground]/20"
      >
        <ChevronDown className="h-4 w-4" />
      </button>

      {menuOpen && (
        <div className="absolute right-0 top-full z-10 mt-2 w-32 rounded-md border border-[--border] bg-[--card] shadow-lg">
          <button
            type="button"
            onClick={handleDirectDownload}
            disabled={downloading}
            className="w-full px-3 py-2 text-left text-sm text-[--foreground] hover:bg-[--accent] disabled:cursor-not-allowed disabled:opacity-50"
          >
            {downloading ? '准备下载...' : '普通下载'}
          </button>
        </div>
      )}
    </div>
  )
}
