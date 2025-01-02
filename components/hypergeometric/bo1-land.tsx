'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface Bo1LandInput {
  deckSize: number;      // 卡组大小
  landCount: number;     // 地牌数量
}

interface Bo1ProbabilityResults {
  landDistribution: {
    lands: number;
    probability: number;
  }[];
  averageLands: number;
  normalProbability: {
    lands: number;
    probability: number;
  }[];
}

// 计算组合数
function combinations(n: number, k: number): number {
  if (k > n) return 0;
  if (k === 0 || k === n) return 1;
  
  let result = 1;
  for (let i = 1; i <= k; i++) {
    result *= (n - i + 1) / i;
  }
  return result;
}

// 计算超几何分布概率
function hypergeometric(N: number, K: number, n: number, k: number): number {
  return combinations(K, k) * combinations(N - K, n - k) / combinations(N, n);
}

// 计算与目标比例的差异
function calculateDeviation(lands: number, sample: number, targetRatio: number): number {
  return Math.abs(lands / sample - targetRatio);
}

// 计算BO1起手概率
function calculateBo1Probabilities(input: Bo1LandInput): Bo1ProbabilityResults {
  const { deckSize, landCount } = input;
  const sampleSize = 7;
  const targetRatio = landCount / deckSize;
  
  // 计算普通超几何分布（不考虑BO1优化）
  const normalDistribution: { lands: number; probability: number; }[] = [];
  for (let i = 0; i <= sampleSize; i++) {
    const prob = hypergeometric(deckSize, landCount, sampleSize, i);
    normalDistribution.push({ lands: i, probability: prob });
  }

  // 计算BO1优化后的概率分布
  const bo1Distribution = new Array(sampleSize + 1).fill(0);
  let totalLands = 0;
  let totalHands = 0;

  // 模拟所有可能的三次抓牌组合
  for (let hand1 = 0; hand1 <= sampleSize; hand1++) {
    const prob1 = hypergeometric(deckSize, landCount, sampleSize, hand1);
    for (let hand2 = 0; hand2 <= sampleSize; hand2++) {
      const prob2 = hypergeometric(deckSize, landCount, sampleSize, hand2);
      for (let hand3 = 0; hand3 <= sampleSize; hand3++) {
        const prob3 = hypergeometric(deckSize, landCount, sampleSize, hand3);
        
        // 计算每个手牌与目标比例的偏差
        const dev1 = calculateDeviation(hand1, sampleSize, targetRatio);
        const dev2 = calculateDeviation(hand2, sampleSize, targetRatio);
        const dev3 = calculateDeviation(hand3, sampleSize, targetRatio);
        
        // 找出偏差最小的手牌
        const minDev = Math.min(dev1, dev2, dev3);
        let selectedHand;
        if (minDev === dev1) selectedHand = hand1;
        else if (minDev === dev2) selectedHand = hand2;
        else selectedHand = hand3;
        
        // 累加概率
        const combinedProb = prob1 * prob2 * prob3;
        bo1Distribution[selectedHand] += combinedProb;
        
        totalLands += selectedHand * combinedProb;
        totalHands += combinedProb;
      }
    }
  }

  // 格式化结果
  const landDistribution = bo1Distribution.map((prob, lands) => ({
    lands,
    probability: prob
  }));

  return {
    landDistribution,
    averageLands: totalLands / totalHands,
    normalProbability: normalDistribution
  };
}

export function Bo1LandCalculator() {
  const [values, setValues] = useState<Bo1LandInput>({
    deckSize: 60,
    landCount: 24
  });
  
  const [probabilities, setProbabilities] = useState<Bo1ProbabilityResults | null>(null);

  const handleChange = (field: keyof Bo1LandInput, value: string) => {
    const numValue = parseInt(value) || 0;
    setValues(prev => ({ ...prev, [field]: numValue }));
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

  const handleQuickInput = (field: keyof Bo1LandInput, value: number) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setProbabilities(null);
  };

  const handleCalculate = () => {
    const probs = calculateBo1Probabilities(values);
    setProbabilities(probs);
  };

  return (
    <div className="grid gap-8 md:grid-cols-2">
      {/* 输入区域 */}
      <div className="border border-[--border] rounded-lg p-6 bg-[--card] h-fit">
        <h2 className="text-xl font-semibold mb-4">输入参数</h2>

        <div className="space-y-4">
          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <Label className="text-base font-medium">卡组总数</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  你的卡组中的总牌数
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  value={values.deckSize}
                  onChange={(e) => handleChange('deckSize', e.target.value)}
                  min={0}
                  className="w-20 text-lg text-right"
                  onFocus={handleFocus}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex gap-1 justify-end">
                  {[40, 60].map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant="secondary"
                      className="px-2 h-7 bg-[--accent] hover:bg-[--accent]/80"
                      onClick={() => handleQuickInput('deckSize', value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <div className="flex items-center justify-between mb-1">
              <div>
                <Label className="text-base font-medium">地牌数量</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  卡组中的地牌数量
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  value={values.landCount}
                  onChange={(e) => handleChange('landCount', e.target.value)}
                  min={0}
                  className="w-20 text-lg text-right"
                  onFocus={handleFocus}
                  onKeyDown={handleKeyDown}
                />
                <div className="flex gap-1 justify-end flex-wrap">
                  {[16, 17, 22, 24, 26].map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant="secondary"
                      className="px-2 h-7 bg-[--accent] hover:bg-[--accent]/80"
                      onClick={() => handleQuickInput('landCount', value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleCalculate}
          >
            计算概率
          </Button>

          <div className="p-4 rounded-lg bg-[--accent] border border-[--border] space-y-4 mt-6">
            <div className="text-base font-medium">计算原理说明</div>
            <div className="text-sm text-[--muted-foreground] space-y-2">
              <p>1. 普通抓牌概率：使用超几何分布直接计算从{values.deckSize}张牌中抽取7张时，抽到特定数量地牌的概率。</p>
              <p>2. BO1优化概率：</p>
              <ul className="list-disc pl-5 space-y-1">
                <li>系统会进行3次独立的抓牌尝试</li>
                <li>计算每次抓牌中地牌比例与套牌中的地牌比例（{values.landCount}/{values.deckSize}={((values.landCount / values.deckSize) * 100).toFixed(0)}%）的偏差</li>
                <li>选择偏差最小的那次作为最终起手牌</li>
                <li>通过模拟所有可能的组合来计算最终概率分布</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* 结果区域 */}
      <div className="border border-[--border] rounded-lg p-6 bg-[--card] h-fit">
        <h2 className="text-xl font-semibold mb-6">计算结果</h2>
        {probabilities ? (
          <div className="space-y-6">
            <div className="grid gap-4">
              <div>
                <div className="text-base font-medium mb-2">地牌数量分布对比</div>
                <div className="flex gap-4 text-sm text-[--muted-foreground] mb-4">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500" />
                    <span>BO1优化后</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-orange-500" />
                    <span>普通抓牌</span>
                  </div>
                </div>
              </div>
              <div className="grid gap-2">
                {probabilities.landDistribution.map(({ lands, probability }) => {
                  const normalProb = probabilities.normalProbability.find(p => p.lands === lands)?.probability || 0;
                  const maxProb = Math.max(probability, normalProb);
                  return (
                    <div 
                      key={lands}
                      className="space-y-1"
                    >
                      <div className="text-sm font-medium mb-1">{lands}张</div>
                      {/* BO1优化后的概率 */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-5 bg-[--accent] rounded overflow-hidden">
                          <div 
                            className="h-full bg-blue-500" 
                            style={{ width: `${probability * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm text-blue-500">
                          {(probability * 100).toFixed(2)}%
                        </div>
                      </div>
                      {/* 普通抓牌的概率 */}
                      <div className="flex items-center gap-2">
                        <div className="flex-1 h-5 bg-[--accent] rounded overflow-hidden">
                          <div 
                            className="h-full bg-orange-500" 
                            style={{ width: `${normalProb * 100}%` }}
                          />
                        </div>
                        <div className="w-16 text-right text-sm text-orange-500">
                          {(normalProb * 100).toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
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