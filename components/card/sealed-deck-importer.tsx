'use client';

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { X, Upload, AlertCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface SealedDeckImporterProps {
  onImport: (deck: Map<string, number>) => void;
  onClear: () => void;
  hasImportedDeck: boolean;
  cardNameMap: Map<string, string>;
}

export function SealedDeckImporter({ onImport, onClear, hasImportedDeck, cardNameMap }: SealedDeckImporterProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [importError, setImportError] = useState<{
    missingCards: string[];
    isFullFailure: boolean;
  } | null>(null);

  const handleImport = () => {
    if (!input.trim()) return;

    setImportError(null);

    // Parse the input
    let lines = input.split('\n');
    
    // If "Deck" line exists, ignore everything before it
    const deckLineIndex = lines.findIndex(line => line.trim().toLowerCase() === 'deck');
    if (deckLineIndex !== -1) {
      lines = lines.slice(deckLineIndex + 1);
    }

    lines = lines.filter(line => line.trim());

    const parsedDeck = new Map<string, number>();
    const missingCards: string[] = [];

    lines.forEach(line => {
      let trimmed = line.trim();
      let quantity = 1;

      // Try to match "Number Card Name" pattern (e.g., "2 Card Name" or "1x Card Name")
      const match = trimmed.match(/^(\d+)[xX]?\s+(.+)$/);
      if (match) {
        quantity = parseInt(match[1], 10);
        trimmed = match[2].trim();
      }

      // Handle split cards (keep front face only)
      // e.g., "Name // Other" -> "Name"
      const splitIndex = trimmed.indexOf('//');
      if (splitIndex !== -1) {
        trimmed = trimmed.substring(0, splitIndex).trim();
      }

      // Handle set code/number suffix (common in some exports like MTGA/17Lands)
      // e.g., "Name (SET) 123" -> "Name"
      // Look for " (" that indicates start of set code
      const setIndex = trimmed.indexOf(' (');
      if (setIndex !== -1) {
        trimmed = trimmed.substring(0, setIndex).trim();
      } else {
          // Also check for just "(" if no space, though usually there is a space
          const parenIndex = trimmed.indexOf('(');
          // Only if it's at the end-ish to avoid cards with parentheses in name? 
          // Most Magic cards don't have () in name except for very few un-sets or special cases (e.g. "Hazmat Suit (Used)").
          // But standard set exports usually follow "Name (SET)".
          // Safe heuristic: if it looks like (SET) ...
          if (parenIndex !== -1 && parenIndex < trimmed.length - 1) {
               // Let's rely on the space before ( for safety, or just cut at ( matching the user request "无视(及其后面的内容"
               // User request: "后面的是系列和编号，需要无视(及其后面的内容"
               // So unconditional cut at ( is requested.
               trimmed = trimmed.substring(0, parenIndex).trim();
          }
      }

      // Check against cardNameMap (keys are lowercase)
      const lowerName = trimmed.toLowerCase();
      // map maps lowercase name (en/zh) to canonical English name
      const canonicalName = cardNameMap.get(lowerName);

      if (canonicalName) {
        parsedDeck.set(canonicalName, (parsedDeck.get(canonicalName) || 0) + quantity);
      } else {
        missingCards.push(trimmed);
      }
    });

    if (missingCards.length > 0) {
      const isFullFailure = missingCards.length === lines.length;
      setImportError({
        missingCards,
        isFullFailure
      });
      
      if (isFullFailure) {
        return; 
      }
      return;
    }

    onImport(parsedDeck);
    setOpen(false);
    // Do NOT clear input here, so it persists when reopened
    setImportError(null);
  };


  const handleClear = () => {
    onClear();
    setOpen(false);
    setInput("");
    setImportError(null);
  };

  return (
    <>
      <Button 
        variant={hasImportedDeck ? "secondary" : "ghost"} 
        size="sm"
        onClick={() => setOpen(true)}
        className={`flex items-center gap-2 ${
          hasImportedDeck 
            ? 'bg-[--accent]/20 text-[--foreground] border border-[--accent]/60 hover:bg-[--accent]/30' 
            : ''
        }`}
      >
        <Upload className="w-4 h-4" />
        {hasImportedDeck ? '现开模式 √' : '现开模式'}
      </Button>

      {open && (
        <>
          {/* 背景遮罩 */}
          <div 
            className="fixed inset-0 bg-black/50 z-50"
            onClick={() => setOpen(false)}
          />
          
          {/* 对话框内容 */}
          <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-lg h-[600px] max-h-[90vh] bg-[--component-background] rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
            {/* 标题栏 */}
            <div className="flex items-center justify-between p-4 border-b border-[--border] shrink-0">
              <div>
                <h2 className="text-lg font-semibold text-[--foreground]">
                  现开模式
                </h2>
                <p className="text-sm text-[--foreground-muted] mt-1">
                  粘贴你的现开牌表内容。每行一张卡牌，支持 &quot;数量 卡牌名称&quot; 格式。
                </p>
              </div>
              <button
                onClick={() => setOpen(false)}
                className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* 内容区域 */}
            <div className="flex-1 p-4 flex flex-col min-h-0 gap-4">
              <Textarea
                placeholder={`Deck\n1 Adventurer's Airship\n1 Adventurer's Inn\n...`}
                className="flex-1 font-mono text-sm resize-none"
                value={input}
                onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => {
                  setInput(e.target.value);
                  if (importError) setImportError(null);
                }}
              />
              
              {importError && (
                <Alert variant="destructive" className="shrink-0 max-h-[120px] overflow-y-auto">
                  <AlertCircle className="h-4 w-4" />
                  <AlertTitle>
                    {importError.isFullFailure ? "匹配失败" : "部分卡牌未找到"}
                  </AlertTitle>
                  <AlertDescription className="text-xs mt-1">
                    {importError.isFullFailure 
                      ? "所有卡牌均未找到，请检查牌表格式或确认系列是否选择正确。" 
                      : (
                        <div className="space-y-1">
                          <p>以下卡牌未找到，请检查拼写：</p>
                          <div className="font-mono bg-black/10 p-1 rounded">
                            {importError.missingCards.join(', ')}
                          </div>
                        </div>
                      )
                    }
                  </AlertDescription>
                </Alert>
              )}
            </div>

            {/* 底部按钮 */}
            <div className="px-4 py-3 border-t border-[--border] flex justify-end gap-2 shrink-0">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setOpen(false)}
              >
                取消
              </Button>
              {hasImportedDeck && (
                <Button type="button" variant="secondary" size="sm" onClick={handleClear}>
                  清空当前牌表
                </Button>
              )}
              <Button type="submit" size="sm" onClick={handleImport}>导入</Button>
            </div>
          </div>
        </>
      )}
    </>
  );
}
