import { Metadata } from 'next';
import { HypergeometricCalculator } from '@/components/hypergeometric';

export const metadata: Metadata = {
  title: '十七地 - 抽卡概率计算器',
  description: '计算万智牌抽卡概率，基于超几何分布',
};

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