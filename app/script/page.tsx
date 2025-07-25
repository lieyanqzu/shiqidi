import { ScriptCarousel } from '@/components/script/script-carousel';
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "十七地 - Scryfall汉化脚本",
  "为Scryfall卡牌数据库添加中文翻译支持，让你可以使用中文名称搜索卡牌。包含安装方法和使用说明。",
  "/script",
  {
    keywords: ["MTGA", "万智牌", "Scryfall", "汉化脚本", "中文翻译", "卡牌数据库", "中文搜索", "卡牌查询"],
  }
);

const screenshots = [
  '/screenshots/scryfall/screenshot1.jpg',
  '/screenshots/scryfall/screenshot2.jpg',
  '/screenshots/scryfall/screenshot3.jpg'
]

export default function ScriptPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Scryfall 汉化脚本</h1>
        
        {/* 下载按钮 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 sm:gap-0">
            <div>
              <h3 className="font-medium text-[--foreground]">立即安装</h3>
              <p className="text-sm text-[--muted-foreground] mt-1">
                选择安装方式，请确认已安装<a href="https://www.tampermonkey.net" target="_blank" rel="noopener noreferrer" className="text-[--primary] hover:underline">篡改猴</a>浏览器扩展
              </p>
            </div>
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4">
              <a 
                href="/scryfall.user.js"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md bg-[--primary] text-[--primary-foreground] hover:opacity-90 transition-opacity text-center"
              >
                直接安装
              </a>
              <a 
                href="https://greasyfork.org/zh-CN/scripts/508932-scryfall%E5%8D%A1%E7%89%8C%E6%B1%89%E5%8C%96"
                target="_blank"
                rel="noopener noreferrer"
                className="px-4 py-2 rounded-md border border-[--primary] text-[--primary] hover:bg-[--primary] hover:text-[--primary-foreground] transition-colors text-center"
              >
                从Greasyfork安装
              </a>
            </div>
          </div>
        </div>

        {/* 截图展示 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <h2 className="text-xl font-semibold mb-4">效果展示</h2>
          <ScriptCarousel screenshots={screenshots} />
        </div>

        {/* 介绍 */}
        <div className="bg-[--card] rounded-lg p-4">
          <h2 className="text-xl font-semibold mb-4">功能介绍</h2>
          <div className="space-y-4 text-sm text-[--muted-foreground]">
            <p className="leading-relaxed">
              这个用户脚本为 Scryfall 网站上没有中文翻译的万智牌卡牌添加汉化功能。所有的汉化数据均来自中文卡查网站 mtgch.com。
            </p>
            <div>
              <p className="font-medium text-[--foreground] mb-2">主要功能：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>自动为 Scryfall 卡牌页面添加中文翻译</li>
                <li>可以在原文和中文之间快速切换</li>
                <li>保留原有的法术力符号和颜色指示器</li>
                <li>翻译卡牌名称、类别、规则文本、风味文本、规则FAQ</li>
                <li>可设置默认显示中文，省去手动点击</li>
              </ul>
            </div>
            <div>
              <p className="font-medium text-[--foreground] mb-2">使用说明：</p>
              <ol className="list-decimal list-inside space-y-1">
                <li>安装脚本后，访问任意 Scryfall 卡牌页面</li>
                <li>页面加载完成后，会在语言选项处添加一个&ldquo;汉化&rdquo;按钮</li>
                <li>点击&ldquo;汉化&rdquo;按钮可以切换显示中文或原文</li>
                <li>在脚本菜单中可以设置默认显示语言</li>
              </ol>
            </div>
            <div>
              <p className="font-medium text-[--foreground] mb-2">注意事项：</p>
              <ul className="list-disc list-inside space-y-1">
                <li>脚本需要从外部 API 获取数据，首次加载可能会稍有延迟</li>
                <li>少部分卡牌可能缺少中文数据，此时会保持原文显示</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 