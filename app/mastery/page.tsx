import { MasteryCalculator } from '@/components/mastery';
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "精研通行证计算器 - MTGA等级进度工具",
  "计算MTGA精研通行证等级进度，帮助你规划每日任务和经验获取。提供详细的等级预测和目标达成分析。",
  "/mastery",
  {
    keywords: ["MTGA", "万智牌", "精研通行证", "等级计算", "进度计算", "通行证", "每日任务", "经验值"],
  }
);

export default function MasteryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <MasteryCalculator />
    </main>
  );
} 