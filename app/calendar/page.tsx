import { EventCard } from '@/components/calendar/event-card';
import { ExternalLink } from 'lucide-react';
import { generateMetadata } from '../metadata';
import { DesktopTableOfContents, MobileTableOfContents } from '../../components/calendar/table-of-contents';
import { readPublicJson } from '@/lib/public-data';

interface CalendarEvent {
  title: string;
  startTime: string;
  endTime: string;
  format?: string;
  description?: string;
}

type CalendarEventType = 'midweek_magic' | 'premier_draft' | 'quick_draft' | 'other' | 'premier_play' | 'arena_direct' | 'arena_championship';
type CalendarGroupId = CalendarEventType | 'competitive_events';

interface CalendarGroup {
  id: CalendarGroupId;
  title: string;
  description?: string;
  events?: CalendarEvent[];
  groups?: CalendarGroup[];
}

interface CalendarData {
  metadata: {
    lastUpdated: string;
    announcementUrl: string;
  };
  groups: CalendarGroup[];
}

const sectionIds: Record<CalendarGroupId, string> = {
  midweek_magic: 'midweek-magic',
  premier_draft: 'premier-draft',
  quick_draft: 'quick-draft',
  other: 'other-events',
  competitive_events: 'competitive-events',
  arena_direct: 'arena-direct',
  premier_play: 'qualifier',
  arena_championship: 'championship',
};

function isEventGroup(group: CalendarGroup): group is CalendarGroup & { id: CalendarEventType; events: CalendarEvent[] } {
  return group.id !== 'competitive_events' && Array.isArray(group.events) && group.events.length > 0;
}

function renderEventCards(group: CalendarGroup & { id: CalendarEventType; events: CalendarEvent[] }) {
  return group.events.map((event, index) => (
    <EventCard
      key={`${group.id}-${index}`}
      {...event}
      type={group.id}
      startTime={new Date(event.startTime)}
      endTime={new Date(event.endTime)}
    />
  ));
}

export const metadata = generateMetadata(
  "十七地 - MTGA活动日历",
  "查看MTGA活动日程安排，包括周中万智牌、快速轮抽、资格赛等赛事时间表。及时了解最新活动信息，合理安排游戏时间。",
  "/calendar",
  {
    keywords: ["MTGA", "万智牌", "活动日历", "赛事日程", "周中万智牌", "快速轮抽", "资格赛", "比赛时间"],
  }
);

export default async function CalendarPage() {
  const { groups, metadata: calendarMetadata } = await readPublicJson<CalendarData>('events.json');

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

              {groups.map((group) => {
                if (group.id === 'competitive_events') {
                  const subgroups = (group.groups ?? []).filter(isEventGroup);
                  if (subgroups.length === 0) return null;

                  return (
                    <section key={group.id} id={sectionIds[group.id]} className="mb-8 scroll-mt-24">
                      <h2 className="text-xl font-semibold mb-4">{group.title}</h2>
                      <div className="bg-[--card] rounded-lg p-4">
                        {subgroups.map((subgroup, index) => (
                          <div
                            key={subgroup.id}
                            id={sectionIds[subgroup.id]}
                            className={`${index < subgroups.length - 1 ? 'mb-8' : ''} scroll-mt-24`}
                          >
                            <h3 className="text-lg font-medium mb-4">{subgroup.title}</h3>
                            {subgroup.description && (
                              <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                                {subgroup.description}
                              </p>
                            )}
                            <div className="space-y-3">
                              {renderEventCards(subgroup)}
                            </div>
                          </div>
                        ))}
                      </div>
                    </section>
                  );
                }

                if (!isEventGroup(group)) return null;

                return (
                  <section key={group.id} id={sectionIds[group.id]} className="mb-8 scroll-mt-24">
                    <h2 className="text-xl font-semibold mb-4">{group.title}</h2>
                    <div className="bg-[--card] rounded-lg p-4">
                      {group.description && (
                        <p className="text-sm text-[--muted-foreground] mb-4 leading-relaxed">
                          {group.description}
                        </p>
                      )}
                      <div className="space-y-3">
                        {renderEventCards(group)}
                      </div>
                    </div>
                  </section>
                );
              })}
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
