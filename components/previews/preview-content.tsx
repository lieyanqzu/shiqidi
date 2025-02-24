'use client';

import { useState } from 'react';
import { Languages } from 'lucide-react';
import { PreviewCard } from './preview-card';
import { Button } from '@/components/ui/button';
import type { PreviewSet } from '@/types/previews';

interface PreviewContentProps {
  previewData: PreviewSet;
  setName: string;
}

export function PreviewContent({ previewData, setName }: PreviewContentProps) {
  const [isEnglish, setIsEnglish] = useState(false);
  const isReleased = new Date() > new Date(previewData.release_date);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-[1400px] mx-auto">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold">{setName}预览</h1>
            {isReleased && (
              <span className="inline-flex items-center px-2 py-1 text-xs bg-[--primary] text-[--primary-foreground] rounded">
                已上线
              </span>
            )}
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsEnglish(!isEnglish)}
            className="flex items-center gap-2"
          >
            <Languages className="w-4 h-4" />
            <span>中/英切换</span>
          </Button>
        </div>
        
        {/* 描述 */}
        <div className="bg-[--card] rounded-lg p-4 mb-8">
          <p className="text-sm text-[--muted-foreground] leading-relaxed">
            {previewData.description}
          </p>
        </div>

        {/* 卡牌列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {previewData.cards.map(card => (
            <PreviewCard 
              key={card.id} 
              card={card} 
              isEnglish={isEnglish}
              logoCode={previewData.logo_code}
            />
          ))}
        </div>
      </div>
    </div>
  );
} 