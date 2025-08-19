import { EventCard } from '@/components/calendar/event-card';
import { events, calendarMetadata } from '@/data/events';
import { ExternalLink } from 'lucide-react';
import { generateMetadata } from '../metadata';
import { DesktopTableOfContents, MobileTableOfContents } from '../../components/calendar/table-of-contents';

export const metadata = generateMetadata(
  "十七地 - MTGA活动日历",
  "查看MTGA活动日程安排，包括周中万智牌、快速轮抽、资格赛等赛事时间表。及时了解最新活动信息，合理安排游戏时间。",
  "/calendar",
  {
    keywords: ["MTGA", "万智牌", "活动日历", "赛事日程", "周中万智牌", "快速轮抽", "资格赛", "比赛时间"],
  }
);

export default function CalendarPage() {
  const midweekMagicEvents = events.filter(event => event.type === 'midweek_magic');
  const premierDraftEvents = events.filter(event => event.type === 'premier_draft');
  const quickDraftEvents = events.filter(event => event.type === 'quick_draft');
  const otherEvents = events.filter(event => event.type === 'other');
  const premierPlayEvents = events.filter(event => event.type === 'premier_play');
  const arenaOpenEvents = events.filter(event => event.type === 'arena_open');
  const arenaDirectEvents = events.filter(event => event.type === 'arena_direct');
  const arenaChampionshipEvents = events.filter(event => event.type === 'arena_championship');

  return (
    <>
      <div className="lg:hidden">
        <MobileTableOfContents />
      </div>
      <div className="container mx-auto px-4 py-8 lg:pt-8 pt-[84px]">
        <div className="max-w-6xl mx-auto">
          <div className="flex gap-8">
            <div className="flex-1 max-w-4xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 sm:gap-4 mb-6">
                <h1 className="text-2xl font-bold">MTGA 活动日历</h1>
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
                <section id="midweek-magic" className="mb-8 scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-4">周中万智牌</h2>
                  <div className="bg-[--card] rounded-lg p-4">
                    <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                      周中万智牌活动在每周三凌晨 5-6 点开放，周五凌晨 5-6 点停止参加（UTC+08:00）。
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
                <section id="premier-draft" className="mb-8 scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-4">竞技轮抽</h2>
                  <div className="bg-[--card] rounded-lg p-4">
                    <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                      与 7 位其他牌手一同进行轮抽，有抽选时间限制。
                    </p>
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
                <section id="quick-draft" className="mb-8 scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-4">快速轮抽</h2>
                  <div className="bg-[--card] rounded-lg p-4">
                    <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                      与 AI 一同进行轮抽，无需等待，没有抽选时间限制。
                    </p>
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
                <section id="other-events" className="mb-8 scroll-mt-24">
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

              {/* 竞技比赛日程 */}
              {(premierPlayEvents.length > 0 || arenaOpenEvents.length > 0 || arenaDirectEvents.length > 0 || arenaChampionshipEvents.length > 0) && (
                <section id="competitive-events" className="mb-8 scroll-mt-24">
                  <h2 className="text-xl font-semibold mb-4">竞技赛程</h2>
                  <div className="bg-[--card] rounded-lg p-4">
                    {/* 竞技场公开赛 */}
                    {arenaOpenEvents.length > 0 && (
                      <div id="arena-open" className="mb-8 scroll-mt-24">
                        <h3 className="text-lg font-medium mb-4">竞技场公开赛</h3>
                        <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                          参加赛事，竞夺奖金！在第 2 天赛事中取得优异成绩，能够获得现金奖励！
                        </p>
                        <div className="space-y-3">
                          {arenaOpenEvents.map((event, index) => (
                            <EventCard key={index} {...event} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 竞技场直邮赛 */}
                    {arenaDirectEvents.length > 0 && (
                      <div id="arena-direct" className="mb-8 scroll-mt-24">
                        <h3 className="text-lg font-medium mb-4">竞技场直邮赛</h3>
                        <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                          参加赛事，竞夺卡盒！赢取实体奖励直邮到家（限制部分地区，以官方公告为准）。
                        </p>
                        <div className="space-y-3">
                          {arenaDirectEvents.map((event, index) => (
                            <EventCard key={index} {...event} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 资格赛 */}
                    {premierPlayEvents.length > 0 && (
                      <div id="qualifier" className="mb-8 scroll-mt-24">
                        <h3 className="text-lg font-medium mb-4">资格赛</h3>
                        <div className="space-y-3">
                          {premierPlayEvents.map((event, index) => (
                            <EventCard key={index} {...event} />
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 竞技场锦标赛 */}
                    {arenaChampionshipEvents.length > 0 && (
                      <div id="championship" className="scroll-mt-24">
                        <h3 className="text-lg font-medium mb-4">竞技场冠军赛</h3>
                        <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                          竞技场冠军赛是一个为期两天的线上邀请赛，参赛资格通过资格赛周末活动获得。
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

            <div className="hidden lg:block">
              <div className="sticky top-24">
                <DesktopTableOfContents />
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
} 