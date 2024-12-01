import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <section className="mb-12">
        <h1 className="text-4xl font-semibold mb-4 text-[--foreground]">十七地</h1>
        <p className="text-[--foreground-muted] text-lg">
          万智牌：竞技场 - 轮抽数据
        </p>
      </section>

      <section>
        <Link href="/cards" className="block">
          <div className="card p-6 hover:bg-[--accent] transition-colors">
            <h2 className="text-xl font-semibold mb-4 text-[--foreground]">卡牌数据</h2>
            <p className="text-[--foreground-muted] mb-4">
              查看各系列轮抽中卡牌的表现数据，包括胜率、选取率等详细统计。
            </p>
          </div>
        </Link>
      </section>
    </div>
  );
} 