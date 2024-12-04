import { Metadata } from 'next';

export const metadata: Metadata = {
  title: '十七地 - 关于',
  description: '十七地是一个专注于万智牌：竞技场的工具平台，旨在帮助玩家提升游玩体验。',
};

export default function AboutPage() {
  const resources = [
    {
      title: "数据来源",
      items: [
        {
          name: "17Lands",
          description: "提供轮抽数据分析的核心数据，包括卡牌胜率、选取率、色组数据和赛制速度等",
          url: "https://www.17lands.com"
        },
        {
          name: "大学院废墟",
          description: "提供万智牌的中文翻译数据",
          url: "https://www.sbwsz.com"
        }
      ]
    }
  ]

  const openSourceComponents = [
    {
      name: "Next.js",
      description: "React框架，提供了服务端渲染、路由等功能",
      url: "https://nextjs.org"
    },
    {
      name: "React",
      description: "用于构建用户界面的JavaScript库",
      url: "https://react.dev"
    },
    {
      name: "Tailwind CSS",
      description: "CSS框架，提供了现代化的样式系统",
      url: "https://tailwindcss.com"
    },
    {
      name: "Zustand",
      description: "轻量级状态管理库",
      url: "https://github.com/pmndrs/zustand"
    },
    {
      name: "React Query",
      description: "用于数据获取和缓存的库",
      url: "https://tanstack.com/query"
    },
    {
      name: "React Table",
      description: "用于构建强大的表格组件",
      url: "https://tanstack.com/table"
    },
    {
      name: "Recharts",
      description: "基于React的图表库",
      url: "https://recharts.org"
    },
    {
      name: "Lucide Icons",
      description: "图标库，提供了界面中使用的各种图标",
      url: "https://lucide.dev"
    },
    {
      name: "Keyrune",
      description: "提供万智牌系列图标的字体库",
      url: "https://keyrune.andrewgioia.com"
    }
  ]

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        {/* Hero Section */}
        <div className="relative overflow-hidden rounded-lg bg-[--card] p-8 mb-8">
          <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/10 to-transparent" />
          <div className="relative">
            <h1 className="text-2xl font-bold mb-4">关于十七地</h1>
            <div className="space-y-4">
              <p className="text-[--muted-foreground] leading-relaxed">
                十七地是一个专注于万智牌：竞技场的工具平台，旨在帮助玩家提升游玩体验。
              </p>
              <p className="text-[--muted-foreground] leading-relaxed">
                本站的轮抽数据功能基于17Lands提供的数据，同时也整合了一些实用工具以提升游戏体验。
              </p>
            </div>
          </div>
        </div>

        {/* Resources */}
        <div className="grid gap-8">
          {/* Data Sources */}
          {resources.map((section, index) => (
            <div key={index} className="bg-[--card] rounded-lg p-6">
              <h2 className="text-xl font-semibold mb-6">{section.title}</h2>
              <div className="grid gap-6">
                {section.items.map((item, itemIndex) => (
                  <div key={itemIndex} className="flex flex-col border-b border-[--border] last:border-0 pb-4 last:pb-0">
                    <div className="flex items-center justify-between mb-2">
                      <h3 className="font-medium text-[--foreground]">
                        {item.name}
                      </h3>
                      {item.url && (
                        <a
                          href={item.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-sm text-[--primary] hover:opacity-80 flex items-center gap-1"
                        >
                          访问
                          <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                            <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                            <polyline points="15 3 21 3 21 9"></polyline>
                            <line x1="10" y1="14" x2="21" y2="3"></line>
                          </svg>
                        </a>
                      )}
                    </div>
                    <p className="text-sm text-[--muted-foreground]">
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          ))}

          {/* License */}
          <div className="bg-[--card] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">改进本站</h2>
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              本项目代码采用 MIT 协议开源。欢迎访问我们的 
              <a 
                href="https://github.com/lieyanqzu/shiqidi" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-[--primary] hover:opacity-80 mx-1 inline-flex items-center gap-1"
              >
                GitHub 仓库
                <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                  <polyline points="15 3 21 3 21 9"></polyline>
                  <line x1="10" y1="14" x2="21" y2="3"></line>
                </svg>
              </a>
              了解更多信息。
            </p>
          </div>

          {/* Open Source Components */}
          <div className="bg-[--card] rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-6">开源组件</h2>
            <div className="grid gap-6">
              {openSourceComponents.map((item, index) => (
                <div key={index} className="flex flex-col border-b border-[--border] last:border-0 pb-4 last:pb-0">
                  <div className="flex items-center justify-between mb-2">
                    <h3 className="font-medium text-[--foreground]">
                      {item.name}
                    </h3>
                    {item.url && (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[--primary] hover:opacity-80 flex items-center gap-1"
                      >
                        访问
                        <svg className="w-3 h-3" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                          <polyline points="15 3 21 3 21 9"></polyline>
                          <line x1="10" y1="14" x2="21" y2="3"></line>
                        </svg>
                      </a>
                    )}
                  </div>
                  <p className="text-sm text-[--muted-foreground]">
                    {item.description}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
} 