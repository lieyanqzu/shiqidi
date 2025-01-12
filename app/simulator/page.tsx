import { PackSimulator } from '@/components/pack-simulator';
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "十七地 - 开包模拟器",
  "模拟万智牌补充包开包过程，支持多个系列的补充包模拟。帮助你了解开包概率和体验开包乐趣。",
  "/simulator",
  {
    keywords: ["MTGA", "万智牌", "开包模拟", "补充包", "模拟器", "开包", "卡包"],
  }
);

export default function PackSimulatorPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">开包模拟器</h1>
        <PackSimulator />
      </div>
    </div>
  );
} 