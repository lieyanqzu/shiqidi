import { HypergeometricCalculator } from '@/components/hypergeometric';
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "十七地 - 抽卡概率计算器",
  "计算万智牌抽卡概率，基于超几何分布。帮助你分析套牌构筑和赛场决策，提供精确的数学计算结果。",
  "/hypergeometric",
  {
    keywords: ["MTGA", "万智牌", "概率计算器", "超几何分布", "抽卡概率", "套牌分析", "数学计算", "决策工具"],
  }
);

export default function HypergeometricPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">抽卡概率计算器</h1>
        <HypergeometricCalculator />
      </div>
    </div>
  );
} 