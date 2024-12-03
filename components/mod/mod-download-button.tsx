'use client'

import { useState } from "react"

export function ModDownloadButton() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      
      const fileUrl = '/mod-updater.zip'
      
      const link = document.createElement('a')
      link.href = fileUrl
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
    <button 
      onClick={handleDownload}
      disabled={downloading}
      className="px-4 py-2 rounded-md bg-[--primary] text-[--primary-foreground] hover:opacity-90 disabled:opacity-50 transition-opacity"
    >
      {downloading ? '准备下载...' : '下载更新器'}
    </button>
  )
} 