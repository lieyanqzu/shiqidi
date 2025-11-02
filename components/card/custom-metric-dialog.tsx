'use client';

import { useState, useEffect } from 'react';
import { X, ChevronDown, ChevronUp } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import type { CustomMetricConfig } from '@/lib/grades';
import { getDefaultCustomMetricConfig, saveCustomMetricConfig } from '@/lib/grades';

interface CustomMetricDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (config: CustomMetricConfig) => void;
  initialConfig?: CustomMetricConfig;
}

export function CustomMetricDialog({
  open,
  onClose,
  onSave,
  initialConfig,
}: CustomMetricDialogProps) {
  const [formula, setFormula] = useState('');
  const [stdDevPerHalfGrade, setStdDevPerHalfGrade] = useState(0.33);
  const [stdDevInputValue, setStdDevInputValue] = useState('0.33');
  const [formulaError, setFormulaError] = useState<string | null>(null);
  const [expandedSection, setExpandedSection] = useState<'fields' | 'note' | 'examples' | null>(null);

  // 字段名到中文描述的映射
  const fieldNameMap: Record<string, string> = {
    win_rate: '胜率',
    play_rate: '使用率',
    avg_seen: '平均见过位置',
    avg_pick: '平均选择位置',
    opening_hand_win_rate: '起手胜率',
    drawn_win_rate: '抽到胜率',
    ever_drawn_win_rate: '在手胜率',
    never_drawn_win_rate: '未抽到胜率',
    drawn_improvement_win_rate: '在手胜率提升',
    seen_count: '见过次数',
    pick_count: '选择次数',
    game_count: '游戏次数',
    opening_hand_game_count: '起手数量',
    drawn_game_count: '抽到数量',
    ever_drawn_game_count: '总抽到数量',
    never_drawn_game_count: '未抽到数量',
  };

  // 将公式中的字段名替换为中文描述
  const getFormulaDescription = (formulaText: string): string => {
    if (!formulaText.trim()) return '';
    
    let description = formulaText;
    // 按照字段名长度从长到短排序，避免短字段名被长字段名的一部分替换
    const sortedFields = Object.keys(fieldNameMap).sort((a, b) => b.length - a.length);
    
    sortedFields.forEach(field => {
      const regex = new RegExp(`\\b${field}\\b`, 'g');
      description = description.replace(regex, fieldNameMap[field]);
    });
    
    return description;
  };

  useEffect(() => {
    if (open) {
      const config = initialConfig || getDefaultCustomMetricConfig();
      setFormula(config.formula);
      setStdDevPerHalfGrade(config.stdDevPerHalfGrade);
      setStdDevInputValue(config.stdDevPerHalfGrade.toString());
      setFormulaError(null);
    }
  }, [open, initialConfig]);

  const handleSave = () => {
    // 验证公式
    if (!formula.trim()) {
      setFormulaError('公式不能为空');
      return;
    }

    // 验证标准差
    if (stdDevPerHalfGrade <= 0 || !isFinite(stdDevPerHalfGrade)) {
      setFormulaError('标准差间隔必须大于0');
      return;
    }

    const config: CustomMetricConfig = {
      formula: formula.trim(),
      stdDevPerHalfGrade,
    };

    saveCustomMetricConfig(config);
    onSave(config);
    onClose();
  };

  if (!open) return null;

  return (
    <>
      {/* 背景遮罩 */}
      <div
        className="fixed inset-0 bg-black/50 z-50"
        onClick={onClose}
      />
      
      {/* 对话框内容 */}
      <div className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-[calc(100%-2rem)] sm:w-full max-w-2xl max-h-[85vh] sm:max-h-[80vh] bg-[--component-background] rounded-lg shadow-xl z-50 overflow-hidden flex flex-col">
        {/* 标题栏 */}
        <div className="flex items-center justify-between p-4 border-b border-[--border]">
          <h2 className="text-lg font-semibold text-[--foreground]">
            自定义指标配置
          </h2>
          <button
            onClick={onClose}
            className="text-[--foreground-muted] hover:text-[--foreground] transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* 内容区域 */}
        <div className="overflow-y-auto p-4 sm:p-6 flex-1">
          <div className="space-y-4">
            {/* 公式输入 */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-sm font-medium text-[--foreground]">
                  计算公式
                </label>
                <span className="text-xs text-[--foreground-muted]">支持的操作符: +, -, *, /, ^, (, )</span>
              </div>
              <Input
                value={formula}
                onChange={(e) => {
                  setFormula(e.target.value);
                  setFormulaError(null);
                }}
                placeholder="例如: ever_drawn_win_rate * 0.7 + play_rate * 0.3"
                className={formulaError ? 'border-red-500' : ''}
              />
              {formulaError && (
                <p className="mt-1 text-sm text-red-500">{formulaError}</p>
              )}
              {formula.trim() && (
                <p className="mt-1 text-xs text-[--foreground-muted] font-mono">
                  {getFormulaDescription(formula)}
                </p>
              )}
              
              {/* 可用字段 - 折叠 */}
              <div className="mt-2 border border-[--border] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'fields' ? null : 'fields')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[--foreground] hover:bg-[--background-subtle] transition-colors"
                >
                  <span>可用字段（共16个）</span>
                  {expandedSection === 'fields' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSection === 'fields' && (
                  <div className="px-3 py-2 border-t border-[--border] bg-[--background-subtle]">
                    <div className="space-y-2 text-xs text-[--foreground-muted]">
                      <div>
                        <p className="font-medium text-[--foreground] mb-1">胜率相关（7个）</p>
                        <p className="font-mono text-[11px] leading-relaxed">win_rate, play_rate, opening_hand_win_rate, drawn_win_rate, ever_drawn_win_rate, never_drawn_win_rate, drawn_improvement_win_rate</p>
                      </div>
                      <div>
                        <p className="font-medium text-[--foreground] mb-1">轮抽相关（4个）</p>
                        <p className="font-mono text-[11px] leading-relaxed">avg_seen, avg_pick, seen_count, pick_count</p>
                      </div>
                      <div>
                        <p className="font-medium text-[--foreground] mb-1">数量相关（5个）</p>
                        <p className="font-mono text-[11px] leading-relaxed">game_count, opening_hand_game_count, drawn_game_count, ever_drawn_game_count, never_drawn_game_count</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* 说明 - 折叠 */}
              <div className="mt-2 border border-[--border] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'note' ? null : 'note')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[--foreground] hover:bg-[--background-subtle] transition-colors"
                >
                  <span>说明</span>
                  {expandedSection === 'note' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSection === 'note' && (
                  <div className="px-3 py-2 border-t border-[--border] bg-[--background-subtle]">
                    <ul className="text-xs text-[--foreground-muted] space-y-1.5">
                      <li className="flex items-start gap-1.5">
                        <span className="text-[--accent] mt-0.5">•</span>
                        <span>胜率字段使用小数形式（0.xx），例如 0.55 表示 55%，而不是 55</span>
                      </li>
                      <li className="flex items-start gap-1.5">
                        <span className="text-[--accent] mt-0.5">•</span>
                        <span>如果公式中使用的任何参量为空（无数据），则计算结果为空，该卡牌将被标记为"-"等级</span>
                      </li>
                    </ul>
                  </div>
                )}
              </div>

              {/* 示例 - 折叠 */}
              <div className="mt-2 border border-[--border] rounded-md overflow-hidden">
                <button
                  type="button"
                  onClick={() => setExpandedSection(expandedSection === 'examples' ? null : 'examples')}
                  className="w-full flex items-center justify-between px-3 py-2 text-xs font-medium text-[--foreground] hover:bg-[--background-subtle] transition-colors"
                >
                  <span>示例</span>
                  {expandedSection === 'examples' ? (
                    <ChevronUp className="h-4 w-4" />
                  ) : (
                    <ChevronDown className="h-4 w-4" />
                  )}
                </button>
                {expandedSection === 'examples' && (
                  <div className="px-3 py-2 border-t border-[--border] bg-[--background-subtle]">
                    <div className="space-y-1.5 text-xs text-[--foreground-muted]">
                      <div className="flex items-start gap-2">
                        <code className="flex-shrink-0 font-mono bg-[--component-background] px-1.5 py-0.5 rounded text-[11px]">ever_drawn_win_rate</code>
                        <span className="text-[--foreground-muted]">单个字段，例如 0.55</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="flex-shrink-0 font-mono bg-[--component-background] px-1.5 py-0.5 rounded text-[11px]">win_rate * 0.6 + play_rate * 0.4</code>
                        <span className="text-[--foreground-muted]">加权组合</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="flex-shrink-0 font-mono bg-[--component-background] px-1.5 py-0.5 rounded text-[11px]">ever_drawn_win_rate ^ 2</code>
                        <span className="text-[--foreground-muted]">幂运算</span>
                      </div>
                      <div className="flex items-start gap-2">
                        <code className="flex-shrink-0 font-mono bg-[--component-background] px-1.5 py-0.5 rounded text-[11px]">(ever_drawn_win_rate - never_drawn_win_rate) * 100</code>
                        <span className="text-[--foreground-muted]">差值计算</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 标准差间隔输入 */}
            <div>
              <label className="block text-sm font-medium text-[--foreground] mb-2">
                每个半级的标准差间隔
              </label>
              <Input
                type="text"
                inputMode="decimal"
                value={stdDevInputValue}
                onChange={(e) => {
                  const value = e.target.value;
                  // 允许输入过程中的所有内容（包括空字符串、单个0等）
                  setStdDevInputValue(value);
                  setFormulaError(null);
                  
                  // 如果输入有效，同时更新数值状态
                  if (value !== '' && value !== '.') {
                    const numValue = parseFloat(value);
                    if (!isNaN(numValue) && numValue > 0 && numValue <= 1) {
                      setStdDevPerHalfGrade(numValue);
                    }
                  }
                }}
                onBlur={(e) => {
                  const value = e.target.value.trim();
                  // 验证并修正值
                  if (value === '' || value === '.') {
                    setStdDevInputValue('0.33');
                    setStdDevPerHalfGrade(0.33);
                  } else {
                    const numValue = parseFloat(value);
                    if (isNaN(numValue) || numValue <= 0 || numValue > 1) {
                      setStdDevInputValue('0.33');
                      setStdDevPerHalfGrade(0.33);
                    } else {
                      // 格式化显示（保留最多2位小数）
                      const formatted = numValue.toFixed(2).replace(/\.?0+$/, '');
                      setStdDevInputValue(formatted);
                      setStdDevPerHalfGrade(numValue);
                    }
                  }
                }}
                placeholder="0.33"
              />
              <p className="mt-1 text-xs text-[--foreground-muted]">
                默认值 0.33。数值越小，评级分布越紧凑；数值越大，评级分布越分散。
              </p>
            </div>
          </div>
        </div>

        {/* 底部按钮 */}
        <div className="px-4 py-3 border-t border-[--border] flex justify-end gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
          >
            取消
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={handleSave}
          >
            保存
          </Button>
        </div>
      </div>
    </>
  );
}

