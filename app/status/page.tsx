import { ClientStatusContent } from "@/components/status";
import { generateMetadata } from '../metadata';

export const metadata = generateMetadata(
  "十七地 - MTGA 服务状态",
  "实时查看MTGA的服务器状态、维护信息和各平台运行情况。及时了解游戏服务器状态，避免影响游戏体验。",
  "/status",
  {
    keywords: ["MTGA", "万智牌", "服务器状态", "维护信息", "运行状态", "平台状态", "服务状态"],
  }
);

export default function StatusPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">MTGA 服务状态</h1>
        <ClientStatusContent />
      </div>
    </div>
  );
} 