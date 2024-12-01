import { Metadata } from 'next';
import { EventCard } from '@/components/event-card';
import { events } from '@/data/events';

export const metadata: Metadata = {
  title: '活动日历 - 十七地',
  description: 'MTGA 活动日历，包括周中万智牌、快速轮抽、竞技场公开赛等活动的时间安排。',
};

export default function CalendarPage() {
  const midweekMagicEvents = events.filter(event => event.type === 'midweek_magic');
  const quickDraftEvents = events.filter(event => event.type === 'quick_draft');
  const otherEvents = events.filter(event => event.type === 'other');
  const premierPlayEvents = events.filter(event => event.type === 'premier_play');
  const arenaOpenEvents = events.filter(event => event.type === 'arena_open');
  const arenaChampionshipEvents = events.filter(event => event.type === 'arena_championship');

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">活动日历</h1>
        
        {/* 时区说明 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <p className="text-sm text-[--muted-foreground] leading-relaxed">
            除非另有说明，所有活动时间均为太平洋时间（UTC-08:00）。大多数活动在开始日期的早上 8 点开放，在结束日期的早上 8 点停止报名。
          </p>
        </div>

        {/* 周中万智牌 */}
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

        {/* 快速轮抽 */}
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

        {/* 其他活动 */}
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

        {/* 竞技赛程 */}
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">竞技赛程</h2>
          <div className="bg-[--card] rounded-lg p-4">
            <p className="text-sm text-[--muted-foreground] mb-6 leading-relaxed">
              所有时间均为太平洋时间（UTC-08:00）。
            </p>
            
            {/* 资格赛 */}
            <div className="mb-8">
              <h3 className="text-lg font-medium mb-4">资格赛</h3>
              <div className="space-y-3">
                {premierPlayEvents.map((event, index) => (
                  <EventCard key={index} {...event} />
                ))}
              </div>
            </div>

            {/* 竞技场公开赛 */}
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

            {/* 竞技场锦标赛 */}
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
          </div>
        </section>
      </div>
    </div>
  );
} 