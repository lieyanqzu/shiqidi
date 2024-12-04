'use client';

import { useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import { Option, formatOptions, expansionOptions } from "@/lib/options";

interface SpeedFiltersProps {
  selectedExpansions: string[];
  onExpansionsChange: (expansions: string[]) => void;
  selectedFormats: string[];
  onFormatsChange: (formats: string[]) => void;
}

export function SpeedFilters({
  selectedExpansions,
  onExpansionsChange,
  selectedFormats,
  onFormatsChange,
}: SpeedFiltersProps) {
  const [showAllExpansions, setShowAllExpansions] = useState(false);
  const [showAllFormats, setShowAllFormats] = useState(false);

  // 将选项分为已选和未选两组
  const { selectedExpansionOptions, unselectedExpansionOptions } = expansionOptions.reduce(
    (acc, option) => {
      if (selectedExpansions.includes(option.value)) {
        acc.selectedExpansionOptions.push(option);
      } else {
        acc.unselectedExpansionOptions.push(option);
      }
      return acc;
    },
    { selectedExpansionOptions: [] as Option[], unselectedExpansionOptions: [] as Option[] }
  );

  const { selectedFormatOptions, unselectedFormatOptions } = formatOptions.reduce(
    (acc, option) => {
      if (selectedFormats.includes(option.value)) {
        acc.selectedFormatOptions.push(option);
      } else {
        acc.unselectedFormatOptions.push(option);
      }
      return acc;
    },
    { selectedFormatOptions: [] as Option[], unselectedFormatOptions: [] as Option[] }
  );

  return (
    <div className="space-y-4">
      <div>
        <div className="font-medium mb-2">系列:</div>
        <div className="flex flex-wrap gap-2">
          {/* 显示已选系列 */}
          {selectedExpansionOptions.map((expansion) => (
            <button
              key={expansion.value}
              onClick={() => {
                onExpansionsChange(selectedExpansions.filter(e => e !== expansion.value));
              }}
              className="px-3 py-1.5 rounded-md text-sm bg-[--primary] text-white"
            >
              {expansion.label}
            </button>
          ))}
          
          {/* 显示未选系列（可展开/收起） */}
          {unselectedExpansionOptions.length > 0 && (
            <>
              {showAllExpansions ? (
                <>
                  {unselectedExpansionOptions.map((expansion) => (
                    <button
                      key={expansion.value}
                      onClick={() => {
                        onExpansionsChange([...selectedExpansions, expansion.value]);
                      }}
                      className="px-3 py-1.5 rounded-md text-sm bg-[--component-background] text-[--component-foreground]"
                    >
                      {expansion.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowAllExpansions(false)}
                    className="px-3 py-1.5 rounded-md text-sm bg-[--component-background] text-[--component-foreground] flex items-center gap-1"
                  >
                    收起 <ChevronUp className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAllExpansions(true)}
                  className="px-3 py-1.5 rounded-md text-sm bg-[--component-background] text-[--component-foreground] flex items-center gap-1"
                >
                  更多系列 ({unselectedExpansionOptions.length}) <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>

      <div>
        <div className="font-medium mb-2">赛制:</div>
        <div className="flex flex-wrap gap-2">
          {/* 显示已选赛制 */}
          {selectedFormatOptions.map((format) => (
            <button
              key={format.value}
              onClick={() => {
                onFormatsChange(selectedFormats.filter(f => f !== format.value));
              }}
              className="px-3 py-1.5 rounded-md text-sm bg-[--primary] text-white"
            >
              {format.label}
            </button>
          ))}
          
          {/* 显示未选赛制（可展开/收起） */}
          {unselectedFormatOptions.length > 0 && (
            <>
              {showAllFormats ? (
                <>
                  {unselectedFormatOptions.map((format) => (
                    <button
                      key={format.value}
                      onClick={() => {
                        onFormatsChange([...selectedFormats, format.value]);
                      }}
                      className="px-3 py-1.5 rounded-md text-sm bg-[--component-background] text-[--component-foreground]"
                    >
                      {format.label}
                    </button>
                  ))}
                  <button
                    onClick={() => setShowAllFormats(false)}
                    className="px-3 py-1.5 rounded-md text-sm bg-[--component-background] text-[--component-foreground] flex items-center gap-1"
                  >
                    收起 <ChevronUp className="h-4 w-4" />
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setShowAllFormats(true)}
                  className="px-3 py-1.5 rounded-md text-sm bg-[--component-background] text-[--component-foreground] flex items-center gap-1"
                >
                  更多赛制 ({unselectedFormatOptions.length}) <ChevronDown className="h-4 w-4" />
                </button>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
} 