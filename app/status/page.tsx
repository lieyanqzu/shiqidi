import { Metadata } from 'next';
import { ClientStatusContent } from "@/components/status";

export const metadata: Metadata = {
  title: '十七地 - MTGA 服务状态',
  description: '查看MTGA的服务器状态和维护信息',
};

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