import { Metadata } from 'next';
import { EventCard } from '@/components/event-card';
import { events, calendarMetadata } from '@/data/events';
import { ExternalLink } from 'lucide-react';

export const metadata: Metadata = {
  title: '十七地 - MTGA活动日历',
  description: '查看MTGA活动日程，包括周中万智牌、快速轮抽、资格赛等赛事安排',
};

export default function CalendarPage() {
  const midweekMagicEvents = events.filter(event => event.type === 'midweek_magic');
  const premierDraftEvents = events.filter(event => event.type === 'premier_draft');
  const quickDraftEvents = events.filter(event => event.type === 'quick_draft');
  const otherEvents = events.filter(event => event.type === 'other');
  const premierPlayEvents = events.filter(event => event.type === 'premier_play');
  const arenaOpenEvents = events.filter(event => event.type === 'arena_open');
  const arenaChampionshipEvents = events.filter(event => event.type === 'arena_championship');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6">
          <h1 className="text-2xl font-bold">活动日历</h1>
          <div className="flex items-center gap-2 text-sm text-[--muted-foreground]">
            <span>更新于 {calendarMetadata.lastUpdated}</span>
            <span>·</span>
            <a
              href={calendarMetadata.announcementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1 hover:text-[--foreground] transition-colors"
            >
              <span>官方公告</span>
              <ExternalLink className="w-4 h-4" />
            </a>
          </div>
        </div>
        
        {/* 说明 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <p className="text-sm text-[--muted-foreground] leading-relaxed">
            活动列表可能并非最新，请以官方公告为准。
          </p>
        </div>

        {/* 周中万智牌 */}
        {midweekMagicEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">周中万智牌</h2>
            <div className="bg-[--card] rounded-lg p-4">
              <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                周中万智牌活动在每周二下午 2 点开放，周四下午 2 点停止参加（UTC-08:00）。
              </p>
              <div className="space-y-3">
                {midweekMagicEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 竞技轮抽 */}
        {premierDraftEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">竞技轮抽</h2>
            <div className="bg-[--card] rounded-lg p-4">
              <div className="space-y-3">
                {premierDraftEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 快速轮抽 */}
        {quickDraftEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">快速轮抽</h2>
            <div className="bg-[--card] rounded-lg p-4">
              <div className="space-y-3">
                {quickDraftEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 其他活动 */}
        {otherEvents.length > 0 && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">其他活动</h2>
            <div className="bg-[--card] rounded-lg p-4">
              <div className="space-y-3">
                {otherEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </div>
            </div>
          </section>
        )}

        {/* 竞技赛程 */}
        {(premierPlayEvents.length > 0 || arenaOpenEvents.length > 0 || arenaChampionshipEvents.length > 0) && (
          <section className="mb-8">
            <h2 className="text-xl font-semibold mb-4">竞技赛程</h2>
            <div className="bg-[--card] rounded-lg p-4">
              {/* 资格赛 */}
              {premierPlayEvents.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">资格赛</h3>
                  <div className="space-y-3">
                    {premierPlayEvents.map((event, index) => (
                      <EventCard key={index} {...event} />
                    ))}
                  </div>
                </div>
              )}

              {/* 竞技场公开赛 */}
              {arenaOpenEvents.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-medium mb-4">竞技场公开赛</h3>
                  <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                    第一天报名窗口从早上 6 点开始，第二天凌晨 3 点结束（UTC-08:00）。第二天报名窗口仅 2 小时，从早上 6 点到 8 点（UTC-08:00）。
                  </p>
                  <div className="space-y-3">
                    {arenaOpenEvents.map((event, index) => (
                      <EventCard key={index} {...event} />
                    ))}
                  </div>
                </div>
              )}

              {/* 竞技场锦标赛 */}
              {arenaChampionshipEvents.length > 0 && (
                <div>
                  <h3 className="text-lg font-medium mb-4">竞技场锦标赛</h3>
                  <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                    竞技场锦标赛是一个为期两天的虚拟邀请赛，参赛资格通过资格赛周末活动获得。
                  </p>
                  <div className="space-y-3">
                    {arenaChampionshipEvents.map((event, index) => (
                      <EventCard key={index} {...event} />
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        )}
      </div>
    </div>
  );
} 