import { promises as fs } from 'fs';
import path from 'path';
import Link from 'next/link';
import type { PreviewSet } from '@/types/previews';
import { generateMetadata as baseGenerateMetadata } from '../metadata';
import { parseISO, isValid } from 'date-fns';
import { SetIcon } from '@/components/logo/set-icon';

export const metadata = baseGenerateMetadata(
  "十七地 - 炼金系列预览",
  "查看最新炼金系列的卡牌中文预览，包括卡图、中英文名称、法术力费用、类别、规则叙述等详细信息。",
  "/previews",
  {
    keywords: ["MTGA", "万智牌", "炼金", "预览", "卡牌预览", "新卡", "中文", "炼金系列"],
  }
);

async function getPreviewSets(): Promise<PreviewSet[]> {
  const previewsDir = path.join(process.cwd(), 'data/previews');
  const files = await fs.readdir(previewsDir);
  const jsonFiles = files.filter(file => file.endsWith('.json'));

  const previewSets = await Promise.all(
    jsonFiles.map(async file => {
      try {
        const filePath = path.join(previewsDir, file);
        const content = await fs.readFile(filePath, 'utf8');
        const data = JSON.parse(content);
        
        // 确保这是一个有效的预览集
        if (!data.code || !data.name || !Array.isArray(data.cards)) {
          console.warn(`跳过无效的预览集文件: ${file}`);
          return null;
        }
        
        return data as PreviewSet;
      } catch (error) {
        console.error(`解析预览集文件时出错: ${file}`, error);
        return null;
      }
    })
  );

  // 过滤掉无效的预览集
  const validPreviewSets = previewSets.filter(set => set !== null) as PreviewSet[];

  // 按照发售日期倒序排序，最新的系列显示在前面
  return validPreviewSets.sort((a, b) => {
    const dateA = parseISO(a.release_date);
    const dateB = parseISO(b.release_date);
    const timeA = isValid(dateA) ? dateA.getTime() : -Infinity;
    const timeB = isValid(dateB) ? dateB.getTime() : Infinity;
    return timeB - timeA;
  });
}

export default async function PreviewsPage() {
  const previewSets = await getPreviewSets();

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-semibold mb-6">炼金系列预览</h1>
        <div className="grid gap-4">
          {previewSets.map(set => {
            const releaseDate = parseISO(set.release_date);
            const isReleased = isValid(releaseDate) ? new Date() > releaseDate : false;
            return (
              <Link
                key={set.code}
                href={`/previews/${set.code.toLowerCase()}`}
                className="bg-[--card] rounded-lg p-4 border border-[--border] hover:border-[--primary] transition-colors"
              >
                <div className="flex items-center gap-3">
                  <SetIcon set={set.logo_code} size="2x" className="opacity-80" />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h2 className="font-medium truncate">{set.name}</h2>
                      {isReleased && (
                        <span className="inline-flex items-center px-1.5 py-0.5 text-xs bg-[--primary] text-[--primary-foreground] rounded flex-shrink-0">
                          已上线
                        </span>
                      )}
                    </div>
                  </div>
                  <div className="text-sm text-[--muted-foreground] flex-shrink-0">
                    {set.total_cards && set.cards.length === set.total_cards
                      ? `共 ${set.total_cards} 张卡牌`
                      : `${set.cards.length} / ${set.total_cards || '?'} 张卡牌`
                    }
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
} 