'use client'

import { useState } from "react"

export default function ModPage() {
  const [downloading, setDownloading] = useState(false)

  const handleDownload = async () => {
    try {
      setDownloading(true)
      
      const fileUrl = '/mods/mod.zip'
      
      const link = document.createElement('a')
      link.href = fileUrl
      link.download = 'mod.zip'
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
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">MTGA 汉化MOD</h1>
        
        {/* 重要声明 */}
        <div className="bg-red-500/10 text-red-500 rounded-lg p-4 mb-8 border-2 border-red-500">
          <p className="font-bold mb-2">重要声明</p>
          <p className="text-sm leading-relaxed">
            所有MOD都在事实上修改了游戏文件或游戏运行逻辑，使用需谨慎，不对所造成的后果负责！
          </p>
        </div>

        {/* 说明 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <div className="space-y-4">
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              本汉化MOD只适用于Windows，基于晨曦之光大佬开发的汉化MOD进行修改，感谢原作者。
            </p>
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              MOD使用了BepInEx框架制作，所以不需要修改任何游戏原文件，使得理论上MOD本体可以避免更新导致的失效。
            </p>
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              如果您不确定如何使用MOD或担心可能的风险，请勿下载使用本程序。
            </p>
          </div>
        </div>

        {/* 下载区域 */}
        <div className="bg-[--card] rounded-lg p-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-medium text-[--foreground]">汉化MOD更新器 v0.4</h3>
              </div>
              <button 
                onClick={handleDownload}
                disabled={downloading}
                className="px-4 py-2 rounded-md bg-[--primary] text-[--primary-foreground] hover:opacity-90 disabled:opacity-50 transition-opacity"
              >
                {downloading ? '准备下载...' : '下载更新器'}
              </button>
            </div>

            <div className="border-t border-[--border] pt-4">
              <h3 className="font-medium text-[--foreground] mb-2">安装说明</h3>
              <ol className="text-sm text-[--muted-foreground] space-y-2 list-decimal list-inside">
                <li>下载更新器程序。</li>
                <li>将更新器放到MTGA游戏根目录下运行。</li>
                <li>在更新器中选择 安装MOD 即可完成安装。</li>
              </ol>
              <p className="text-sm text-yellow-500 mt-2">
                提示：由于更新器需要修改游戏文件，Windows Defender 可能会误报为病毒。
              </p>
            </div>

            <div className="border-t border-[--border] pt-4">
              <h3 className="font-medium text-[--foreground] mb-2">最新MOD版本：v2.6</h3>
              <div className="text-sm text-[--muted-foreground]">
                <p className="mb-2">更新内容：</p>
                <ul className="list-disc list-inside space-y-1">
                  <li>修改MOD更新提示信息</li>
                  <li>优化高级轮抽评分功能的推断色组，现在根据主牌库加悬停卡牌推断并识别混色</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 