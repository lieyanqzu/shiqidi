import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-semibold mb-4 text-[--foreground]">十七地</h1>
        <p className="text-[--foreground-muted] text-lg">
          万智牌：竞技场 - 轮抽数据与活动日历
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Link href="/cards" className="block">
          <div className="card p-6 hover:bg-[--accent] transition-colors rounded-lg border border-[--border]">
            <h2 className="text-xl font-semibold mb-4 text-[--foreground]">轮抽卡牌数据</h2>
            <p className="text-[--foreground-muted] mb-4">
              查看各系列轮抽中卡牌的表现数据，包括胜率、选取率等详细统计。
            </p>
          </div>
        </Link>

        <Link href="/calendar" className="block">
          <div className="card p-6 hover:bg-[--accent] transition-colors rounded-lg border border-[--border]">
            <h2 className="text-xl font-semibold mb-4 text-[--foreground]">活动日历</h2>
            <p className="text-[--foreground-muted] mb-4">
              查看MTGA活动日程，包括周中万智牌、快速轮抽、资格赛等赛事安排。
            </p>
          </div>
        </Link>

        <Link href="/rotation" className="block">
          <div className="card p-6 hover:bg-[--accent] transition-colors rounded-lg border border-[--border]">
            <h2 className="text-xl font-semibold mb-4 text-[--foreground]">标准轮替</h2>
            <p className="text-[--foreground-muted] mb-4">
              查看标准赛制的系列轮替时间表，了解当前可用系列和即将轮替的系列。
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
} 