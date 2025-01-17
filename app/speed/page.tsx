import { SpeedChart } from '@/components/speed/speed-chart';
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "十七地 - 轮抽赛制速度",
  "了解MTGA各个系列限制赛的速度和先手胜率。通过数据分析帮助你更好地理解当前赛制环境，选择合适的策略。",
  "/speed",
  {
    keywords: ["MTGA", "万智牌", "限制赛", "赛制速度", "先手胜率", "环境分析", "数据统计"],
  }
);

async function getSpeedData() {
  const response = await fetch('https://www.17lands.com/data/play_draw', {
    next: { revalidate: 3600 }
  });
  if (!response.ok) {
    throw new Error('Failed to fetch speed data');
  }
  return response.json();
}

export default async function SpeedPage() {
  const data = await getSpeedData();

  return (
    <div className="py-8">
      <div className="container mx-auto px-4">
        <div className="flex items-center gap-3 mb-8">
          <h1 className="text-2xl font-semibold">
            赛制速度
          </h1>
          <a 
            href="https://www.17lands.com/format_speed?utm_source=shiqidi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 px-2 py-1 text-xs rounded-md bg-[--accent]/10 text-[--muted-foreground] hover:text-[--foreground] hover:bg-[--accent]/20 transition-colors"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="w-3 h-3">
              <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 00-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 00.75-.75v-4a.75.75 0 011.5 0v4A2.25 2.25 0 0112.75 17h-8.5A2.25 2.25 0 012 14.75v-8.5A2.25 2.25 0 014.25 4h5a.75.75 0 010 1.5h-5z" clipRule="evenodd" />
              <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 001.06.053L16.5 4.44v2.81a.75.75 0 001.5 0v-4.5a.75.75 0 00-.75-.75h-4.5a.75.75 0 000 1.5h2.553l-9.056 8.194a.75.75 0 00-.053 1.06z" clipRule="evenodd" />
            </svg>
            17Lands
          </a>
        </div>
        <SpeedChart initialData={data} />
      </div>
    </div>
  );
} 