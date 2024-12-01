import Link from 'next/link'
import { ExternalLink } from 'lucide-react'

export default function HomePage() {
  const sections = [
    {
      title: "轮抽数据",
      description: "深入分析万智牌轮抽数据",
      links: [
        { label: "卡牌数据", href: "/cards", description: "查看各系列轮抽中卡牌的表现数据，包括胜率、选取率等详细统计" },
        { label: "色组数据", href: "https://www.17lands.com/deck_color_data", external: true, description: "分析不同色组组合的胜率和选用率" },
        { label: "赛制速度", href: "https://www.17lands.com/format_speed", external: true, description: "了解当前赛制的游戏节奏和速度" },
      ]
    },
    {
      title: "万智日程",
      description: "追踪MTGA赛事和活动",
      links: [
        { label: "MTGA活动日历", href: "/calendar", description: "查看MTGA活动日程，包括周中万智牌、快速轮抽、资格赛等赛事安排" },
        { label: "标准轮替日程", href: "/rotation", description: "了解标准赛制的系列轮替时间表，掌握当前可用系列和即将轮替的系列" },
      ]
    },
    {
      title: "其他工具",
      description: "实用工具和汉化功能",
      links: [
        { label: "MTGA汉化MOD", href: "/mod", description: "下载并安装MTGA游戏界面汉化MOD" },
        { label: "Scryfall汉化脚本", href: "/script", description: "为Scryfall卡牌数据库添加中文翻译支持" },
      ]
    }
  ]

  return (
    <div className="min-h-screen bg-[--background]">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-[--primary]/10 to-transparent" />
        <div className="container mx-auto px-4 py-16 relative">
          <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-clip-text text-transparent bg-gradient-to-r from-[--primary] to-[--foreground]">
            十七地
          </h1>
          <p className="text-xl md:text-2xl text-[--muted-foreground] max-w-2xl">
            你的万智牌：竞技场坐牢小助手
          </p>
        </div>
      </div>

      {/* Content Sections */}
      <div className="container mx-auto px-4 py-16">
        <div className="grid gap-8">
          {sections.map((section, sectionIndex) => (
            <section key={sectionIndex} className="space-y-8">
              <div>
                <h2 className="text-2xl font-semibold mb-2">{section.title}</h2>
                <p className="text-[--muted-foreground]">{section.description}</p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {section.links.map((link, linkIndex) => (
                  link.external ? (
                    <a
                      key={linkIndex}
                      href={link.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="group block p-6 bg-[--card] rounded-lg border border-[--border] hover:border-[--primary]/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-2">
                        <h3 className="font-medium text-[--foreground] group-hover:text-[--primary]">
                          {link.label}
                        </h3>
                        <ExternalLink className="w-4 h-4 text-[--muted-foreground] group-hover:text-[--primary]" />
                      </div>
                      <p className="text-sm text-[--muted-foreground]">{link.description}</p>
                    </a>
                  ) : (
                    <Link
                      key={linkIndex}
                      href={link.href}
                      className="group block p-6 bg-[--card] rounded-lg border border-[--border] hover:border-[--primary]/50 transition-colors"
                    >
                      <h3 className="font-medium text-[--foreground] group-hover:text-[--primary] mb-2">
                        {link.label}
                      </h3>
                      <p className="text-sm text-[--muted-foreground]">{link.description}</p>
                    </Link>
                  )
                ))}
              </div>
            </section>
          ))}
        </div>
      </div>
    </div>
  )
} 