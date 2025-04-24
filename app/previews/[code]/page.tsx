import { notFound } from 'next/navigation';
import { generateMetadata as baseGenerateMetadata } from '../../metadata';
import type { PreviewSet } from '@/types/previews';
import fs from 'fs';
import path from 'path';
import { PreviewContent } from '@/components/previews/preview-content';
import { parseISO, isValid } from 'date-fns';

// 获取预览数据
async function getPreviewData(code: string): Promise<PreviewSet | null> {
  try {
    // 尝试使用大写的代码
    const upperCode = code.toUpperCase();
    const data = await import(`@/data/previews/${upperCode}.json`);
    return data.default;
  } catch {
    return null;
  }
}

// 获取所有预览系列的代码
function getPreviewCodes(): string[] {
  const previewsDir = path.join(process.cwd(), 'data/previews');
  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir, { recursive: true });
    return [];
  }
  const files = fs.readdirSync(previewsDir);
  return files
    .filter(file => file.endsWith('.json'))
    .map(file => file.replace('.json', ''));
}

export async function generateStaticParams() {
  const codes = getPreviewCodes();
  // 为每个代码生成大写和小写两个版本的参数
  return codes.flatMap(code => [
    { code: code.toLowerCase() },  // 小写版本
    { code: code.toUpperCase() }   // 大写版本
  ]);
}

interface PreviewPageProps {
  params: Promise<{
    code: string;
  }>;
}

export async function generateMetadata(props: PreviewPageProps) {
  const { code } = await props.params;
  const previewData = await getPreviewData(code);
  
  if (!previewData) {
    return baseGenerateMetadata(
      "十七地 - 炼金系列预览",
      "查看最新炼金系列的卡牌中文预览，包括卡牌图片、中英文名称、法术力费用、类别、规则叙述等详细信息。",
      "/previews",
      {
        keywords: ["MTGA", "万智牌", "炼金", "预览", "卡牌预览", "新卡", "中文", "炼金系列"],
      }
    );
  }

  const releaseDate = parseISO(previewData.release_date);
  const isReleased = isValid(releaseDate) ? new Date() > releaseDate : false;
  const releaseStatus = isReleased ? "已上线" : "预览中";

  return baseGenerateMetadata(
    `十七地 - ${previewData.name}预览`,
    `${previewData.name}（${releaseStatus}）${previewData.description}`,
    `/previews/${code.toLowerCase()}`,
    {
      keywords: ["MTGA", "万智牌", previewData.name, "预览", "卡牌预览", "新卡", "中文", "炼金系列"],
    }
  );
}

export default async function PreviewPage(props: PreviewPageProps) {
  const { code } = await props.params;
  const previewData = await getPreviewData(code);
  
  if (!previewData) {
    notFound();
  }

  // 在父组件中计算 isReleased
  const releaseDate = parseISO(previewData.release_date);
  const isReleased = isValid(releaseDate) ? new Date() > releaseDate : false;

  return <PreviewContent previewData={previewData} setName={previewData.name} isReleased={isReleased} />;
}
