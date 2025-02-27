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
            <h1 className="text-2xl font-bold">
              {setName}预览
              {isReleased && (
                <span className="inline-flex items-center px-2 py-1 text-xs bg-[--primary] text-[--primary-foreground] rounded ml-2 align-middle">
                  已上线
                </span>
              )}
            </h1>
          </div>
          <Button
            variant="secondary"
            onClick={() => setIsEnglish(!isEnglish)}
            className="flex items-center gap-2 whitespace-nowrap"
          >
            <Languages className="w-4 h-4" />
            <span className="hidden sm:inline">中/英切换</span>
          </Button>
        </div>
        
        {/* 描述 */}
        <div className="bg-[--card] rounded-lg mb-8">
          <div className="p-4">
            <p className="text-sm text-[--muted-foreground] leading-relaxed">
              {previewData.description}
            </p>
          </div>
          <div className="px-4 py-1.5 border-t border-[--border] flex items-center gap-3">
            <span className="text-xs text-[--muted-foreground] min-w-[80px]">
              {previewData.total_cards && previewData.cards.length === previewData.total_cards
                ? `共 ${previewData.total_cards} 张卡牌`
                : `${previewData.cards.length}/${previewData.total_cards || '?'} 张卡牌`
              }
            </span>
            <div className="flex-1 h-1 bg-[--border] rounded-full overflow-hidden">
              <div 
                className="h-full bg-[--primary] transition-all duration-500"
                style={{ 
                  width: `${(previewData.cards.length / (previewData.total_cards || previewData.cards.length)) * 100}%` 
                }}
              />
            </div>
          </div>
        </div>

        {/* 卡牌列表 */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {previewData.cards
            .sort((a, b) => {
              const isComplete = previewData.total_cards && previewData.cards.length === previewData.total_cards;
              const aNum = parseInt(a.id.split('-')[1]);
              const bNum = parseInt(b.id.split('-')[1]);
              return isComplete ? aNum - bNum : bNum - aNum;
            })
            .map(card => (
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