'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, X } from 'lucide-react';

interface TargetCard {
  id: string;
  name: string;
  count: number;
  expected: number;
}

export interface MultiCardInput {
  populationSize: number;      // 牌库大小
  sampleSize: number;          // 抽牌数量
  targetCards: TargetCard[];   // 目标牌列表
}

interface MultiCardProbabilities {
  all: number;          // 同时抽到所有目标牌的概率
  atLeastOne: number;   // 至少抽到一种目标牌的概率
  individual: {         // 每种牌单独的概率
    id: string;
    name: string;
    probability: number;
  }[];
}

interface MultiCardCalculatorProps {
  values: MultiCardInput;
  onChange: (values: MultiCardInput) => void;
}

// 计算组合数 C(n,k)
function combinations(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  return result;
}

export function MultiCardCalculator({ values, onChange }: MultiCardCalculatorProps) {
  const [probabilities, setProbabilities] = useState<MultiCardProbabilities | null>(null);

  const handleChange = (field: keyof MultiCardInput, value: string) => {
    if (field === 'populationSize' || field === 'sampleSize') {
      const numValue = parseInt(value) || 0;
      onChange({ ...values, [field]: numValue });
    }
    setProbabilities(null);
  };

  const handleTargetCardChange = (id: string, field: keyof TargetCard, value: string) => {
    onChange({
      ...values,
      targetCards: values.targetCards.map(card => {
        if (card.id === id) {
          if (field === 'name') {
            return { ...card, [field]: value };
          } else {
            return { ...card, [field]: parseInt(value) || 0 };
          }
        }
        return card;
      })
    });
    setProbabilities(null);
  };

  const handleAddCard = () => {
    const newCardIndex = values.targetCards.length + 1;
    onChange({
      ...values,
      targetCards: [
        ...values.targetCards,
        {
          id: Date.now().toString(),
          name: `目标牌${newCardIndex}`,
          count: 4,
          expected: 1
        }
      ]
    });
    setProbabilities(null);
  };

  const handleRemoveCard = (id: string) => {
    onChange({
      ...values,
      targetCards: values.targetCards.filter(card => card.id !== id)
    });
    setProbabilities(null);
  };

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.target.select();
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    const input = e.currentTarget;
    if (input.value === '0' && e.key >= '0' && e.key <= '9') {
      input.value = '';
    }
  };

  const handleCalculate = () => {
    // 计算每种牌的单独概率
    const individual = values.targetCards.map(card => {
      let probability = 0;
      const { count, expected } = card;
      
      // 计算至少抽到期望数量的概率
      for (let i = expected; i <= Math.min(count, values.sampleSize); i++) {
        probability += (
          combinations(count, i) * 
          combinations(values.populationSize - count, values.sampleSize - i) / 
          combinations(values.populationSize, values.sampleSize)
        );
      }

      return {
        id: card.id,
        name: card.name,
        probability
      };
    });

    // 使用包含-排除原理计算多张牌的概率
    const n = values.targetCards.length;
    let all = 0;
    let atLeastOne = 0;
    
    // 生成所有可能的抽牌组合
    const generateCombinations = (current: number[], depth: number, remainingSize: number): number => {
      // 如果已经处理完所有牌
      if (depth === n) {
        // 检查是否满足所有期望
        const meetsAll = current.every((count, idx) => count >= values.targetCards[idx].expected);
        const meetsOne = current.some((count, idx) => count >= values.targetCards[idx].expected);
        
        // 计算当前组合的概率
        const otherCards = values.populationSize - values.targetCards.reduce((sum, card) => sum + card.count, 0);
        let prob = 1;
        
        // 计算每种牌的组合数
        for (let i = 0; i < n; i++) {
          prob *= combinations(values.targetCards[i].count, current[i]);
        }
        
        // 计算剩余牌的组合数
        prob *= combinations(otherCards, remainingSize);
        prob /= combinations(values.populationSize, values.sampleSize);
        
        if (meetsAll) all += prob;
        if (meetsOne) atLeastOne += prob;
        return prob;
      }
      
      // 递归生成组合
      let sum = 0;
      const card = values.targetCards[depth];
      const maxPossible = Math.min(card.count, remainingSize);
      
      for (let i = 0; i <= maxPossible; i++) {
        current[depth] = i;
        sum += generateCombinations(current, depth + 1, remainingSize - i);
      }
      
      return sum;
    };

    // 开始计算
    const initialCounts = new Array(n).fill(0);
    generateCombinations(initialCounts, 0, values.sampleSize);

    setProbabilities({
      all,
      atLeastOne,
      individual
    });
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* 输入区域 */}
      <div className="border border-[--border] rounded-lg p-6 bg-[--card] h-fit">
        <h2 className="text-xl font-semibold mb-4">输入参数</h2>

        {/* 基础参数 */}
        <div className="space-y-4 mb-6">
          <h3 className="text-base font-medium text-[--muted-foreground]">基础参数</h3>
          
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <Label className="text-base font-medium">牌库总数</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  你的牌库中的总牌数
                </div>
              </div>
              <Input
                type="number"
                value={values.populationSize}
                onChange={(e) => handleChange('populationSize', e.target.value)}
                min={0}
                className="w-20 text-lg text-right"
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <Label className="text-base font-medium">抽牌数量</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  要抽的牌数，例如起手牌数
                </div>
              </div>
              <Input
                type="number"
                value={values.sampleSize}
                onChange={(e) => handleChange('sampleSize', e.target.value)}
                min={0}
                className="w-20 text-lg text-right"
                onFocus={handleFocus}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
        </div>

        {/* 目标牌列表 */}
        <div className="space-y-6">
          <div className="flex items-center justify-between border-b border-[--border] pb-2">
            <h3 className="text-base font-medium">目标牌</h3>
            <Button
              className="h-9 px-8 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90"
              onClick={handleCalculate}
            >
              计算概率
            </Button>
          </div>

          {values.targetCards.map((card) => (
            <div
              key={card.id}
              className="p-5 rounded-lg border border-[--border] bg-[--accent]/30 space-y-5 hover:border-[--border]/80 transition-colors"
            >
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Label className="text-sm mb-1.5 block text-[--muted-foreground]">牌名</Label>
                  <div className="flex items-center gap-2">
                    <Input
                      value={card.name}
                      onChange={(e) => handleTargetCardChange(card.id, 'name', e.target.value)}
                      className="bg-[--background]"
                      placeholder="输入牌名"
                    />
                    {values.targetCards.length > 1 && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-9 w-9 p-0 hover:bg-red-500/10 hover:text-red-500 shrink-0"
                        onClick={() => handleRemoveCard(card.id)}
                      >
                        <X className="w-5 h-5" />
                      </Button>
                    )}
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-5">
                <div>
                  <Label className="text-sm mb-1.5 block text-[--muted-foreground]">牌库中的数量</Label>
                  <Input
                    type="number"
                    value={card.count}
                    onChange={(e) => handleTargetCardChange(card.id, 'count', e.target.value)}
                    min={0}
                    className="bg-[--background]"
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                  />
                </div>
                <div>
                  <Label className="text-sm mb-1.5 block text-[--muted-foreground]">期望抽到数量</Label>
                  <Input
                    type="number"
                    value={card.expected}
                    onChange={(e) => handleTargetCardChange(card.id, 'expected', e.target.value)}
                    min={0}
                    className="bg-[--background]"
                    onFocus={handleFocus}
                    onKeyDown={handleKeyDown}
                  />
                </div>
              </div>
            </div>
          ))}

          <Button
            size="sm"
            variant="secondary"
            className="w-full h-8"
            onClick={handleAddCard}
          >
            <Plus className="w-4 h-4 mr-1.5" />
            添加目标牌
          </Button>
        </div>
      </div>

      {/* 结果区域 */}
      <div className="border border-[--border] rounded-lg p-6 bg-[--card] h-fit">
        <h2 className="text-xl font-semibold mb-6">计算结果</h2>
        {probabilities ? (
          <div className="grid gap-6">
            <div className="p-4 rounded-lg bg-[--accent] border border-[--border]">
              <div className="text-base text-[--muted-foreground] mb-1">
                同时抽到所有目标牌的概率
              </div>
              <div className="text-3xl font-bold text-[--primary]">
                {(probabilities.all * 100).toFixed(2)}%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[--accent] border border-[--border]">
              <div className="text-base text-[--muted-foreground] mb-1">
                至少抽到一种目标牌的概率
              </div>
              <div className="text-3xl font-bold text-[--primary]">
                {(probabilities.atLeastOne * 100).toFixed(2)}%
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {probabilities.individual.map(item => (
                <div
                  key={item.id}
                  className="p-4 rounded-lg bg-[--accent] border border-[--border]"
                >
                  <div className="text-sm text-[--muted-foreground] mb-1">
                    抽到{item.name}的概率
                  </div>
                  <div className="text-2xl font-bold text-[--primary]">
                    {(item.probability * 100).toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="text-center text-[--muted-foreground] py-12">
            输入参数并点击计算按钮查看结果
          </div>
        )}
      </div>
    </div>
  );
} 