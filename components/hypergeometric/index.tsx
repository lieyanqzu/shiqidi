'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

interface CalculatorInput {
  populationSize: number;      // 牌库大小
  sampleSize: number;          // 抽牌数量
  successesInPopulation: number; // 目标牌数量
  successesInSample: number;   // 想抽到的目标牌数量
}

interface ProbabilityResults {
  exact: number;
  orMore: number;
  orLess: number;
  zero: number;
}

function calculateHypergeometric(input: CalculatorInput, targetSuccesses: number): number {
  const { populationSize, sampleSize, successesInPopulation } = input;
  
  // 检查输入是否有效
  if (
    populationSize < 0 || 
    sampleSize < 0 || 
    successesInPopulation < 0 || 
    targetSuccesses < 0 ||
    sampleSize > populationSize ||
    successesInPopulation > populationSize ||
    targetSuccesses > successesInPopulation ||
    targetSuccesses > sampleSize
  ) {
    return 0;
  }

  // 计算组合数的函数
  function combinations(n: number, k: number): number {
    if (k > n) return 0;
    if (k === 0 || k === n) return 1;
    
    let result = 1;
    for (let i = 1; i <= k; i++) {
      result *= (n - i + 1) / i;
    }
    return result;
  }

  // 超几何分布公式
  const numerator = combinations(successesInPopulation, targetSuccesses) * 
                   combinations(populationSize - successesInPopulation, sampleSize - targetSuccesses);
  const denominator = combinations(populationSize, sampleSize);
  
  return numerator / denominator;
}

function calculateAllProbabilities(input: CalculatorInput): ProbabilityResults {
  const exact = calculateHypergeometric(input, input.successesInSample);
  
  let orMore = 0;
  for (let i = input.successesInSample; i <= Math.min(input.successesInPopulation, input.sampleSize); i++) {
    orMore += calculateHypergeometric({ ...input, successesInSample: i }, i);
  }

  let orLess = 0;
  for (let i = 0; i <= input.successesInSample; i++) {
    orLess += calculateHypergeometric({ ...input, successesInSample: i }, i);
  }

  const zero = calculateHypergeometric({ ...input, successesInSample: 0 }, 0);

  return { exact, orMore, orLess, zero };
}

const quickInputs = {
  populationSize: [40, 60],
  sampleSize: [7, 8, 9],
  successesInPopulation: [4, 17, 24],
  successesInSample: [1, 2, 3, 4],
};

export function HypergeometricCalculator() {
  const [values, setValues] = useState<CalculatorInput>({
    populationSize: 60,
    sampleSize: 7,
    successesInPopulation: 4,
    successesInSample: 1,
  });

  const [probabilities, setProbabilities] = useState<ProbabilityResults | null>(null);

  const handleChange = (id: keyof CalculatorInput, value: string) => {
    const numValue = parseInt(value) || 0;
    setValues(prev => ({ ...prev, [id]: numValue }));
    setProbabilities(null);
  };

  const handleCalculate = () => {
    const probs = calculateAllProbabilities(values);
    setProbabilities(probs);
  };

  const handleQuickInput = (field: keyof typeof quickInputs, value: number) => {
    setValues(prev => ({ ...prev, [field]: value }));
    setProbabilities(null);
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
                <Label className="text-base font-medium">牌库大小</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  你的牌库中的总牌数
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  value={values.populationSize}
                  onChange={(e) => handleChange('populationSize', e.target.value)}
                  min={0}
                  className="w-20 text-lg text-right"
                />
                <div className="flex gap-1 justify-end">
                  {quickInputs.populationSize.map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant="secondary"
                      className="px-2 h-7 bg-[--accent] hover:bg-[--accent]/80"
                      onClick={() => handleQuickInput('populationSize', value)}
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
                <Label className="text-base font-medium">抽牌数量</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  要抽的牌数，例如起手牌数
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  value={values.sampleSize}
                  onChange={(e) => handleChange('sampleSize', e.target.value)}
                  min={0}
                  className="w-20 text-lg text-right"
                />
                <div className="flex gap-1 justify-end">
                  {quickInputs.sampleSize.map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant="secondary"
                      className="px-2 h-7 bg-[--accent] hover:bg-[--accent]/80"
                      onClick={() => handleQuickInput('sampleSize', value)}
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
                <Label className="text-base font-medium">目标牌数量</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  牌库中你想要找的牌的数量
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  value={values.successesInPopulation}
                  onChange={(e) => handleChange('successesInPopulation', e.target.value)}
                  min={0}
                  className="w-20 text-lg text-right"
                />
                <div className="flex gap-1 justify-end">
                  {quickInputs.successesInPopulation.map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant="secondary"
                      className="px-2 h-7 bg-[--accent] hover:bg-[--accent]/80"
                      onClick={() => handleQuickInput('successesInPopulation', value)}
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
                <Label className="text-base font-medium">期望抽到数量</Label>
                <div className="text-xs text-gray-500 mt-0.5">
                  你想要抽到多少张目标牌
                </div>
              </div>
              <div className="space-y-1">
                <Input
                  type="number"
                  value={values.successesInSample}
                  onChange={(e) => handleChange('successesInSample', e.target.value)}
                  min={0}
                  className="w-20 text-lg text-right"
                />
                <div className="flex gap-1 justify-end">
                  {quickInputs.successesInSample.map(value => (
                    <Button
                      key={value}
                      size="sm"
                      variant="secondary"
                      className="px-2 h-7 bg-[--accent] hover:bg-[--accent]/80"
                      onClick={() => handleQuickInput('successesInSample', value)}
                    >
                      {value}
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <Button 
            onClick={handleCalculate} 
            className="w-full text-lg py-6 mt-6 bg-[--primary] text-[--primary-foreground] hover:bg-[--primary]/90"
          >
            计算概率
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
                抽到 {values.successesInSample} 张或更多目标牌的概率
              </div>
              <div className="text-3xl font-bold text-[--primary]">
                {(probabilities.orMore * 100).toPrecision(3)}%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[--accent] border border-[--border]">
              <div className="text-base text-[--muted-foreground] mb-1">
                抽到恰好 {values.successesInSample} 张目标牌的概率
              </div>
              <div className="text-3xl font-bold text-[--primary]">
                {(probabilities.exact * 100).toPrecision(3)}%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[--accent] border border-[--border]">
              <div className="text-base text-[--muted-foreground] mb-1">
                抽到 {values.successesInSample} 张或更少目标牌的概率
              </div>
              <div className="text-3xl font-bold text-[--primary]">
                {(probabilities.orLess * 100).toPrecision(3)}%
              </div>
            </div>

            <div className="p-4 rounded-lg bg-[--accent] border border-[--border]">
              <div className="text-base text-[--muted-foreground] mb-1">
                一张目标牌都抽不到的概率
              </div>
              <div className="text-3xl font-bold text-[--primary]">
                {(probabilities.zero * 100).toPrecision(3)}%
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