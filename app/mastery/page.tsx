import { Metadata } from 'next';
import { MasteryCalculator } from '@/components/mastery';

export const metadata: Metadata = {
  title: '精研通行证计算器',
  description: '计算精研通行证等级进度',
};

export default function MasteryPage() {
  return (
    <main className="container mx-auto px-4 py-8">
      <MasteryCalculator />
    </main>
  );
} 