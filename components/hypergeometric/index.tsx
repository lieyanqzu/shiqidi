'use client';

import { useState } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { SingleCardCalculator } from './single-card';
import { MultiCardCalculator } from './multi-card';
import { Bo1LandCalculator } from './bo1-land';
import type { CalculatorInput } from './single-card';
import type { MultiCardInput } from './multi-card';

export function HypergeometricCalculator() {
  const [tab, setTab] = useState('single');
  
  // 单牌计算器状态
  const [singleCardValues, setSingleCardValues] = useState<CalculatorInput>({
    populationSize: 60,
    sampleSize: 7,
    successesInPopulation: 4,
    successesInSample: 1,
  });

  // 多牌计算器状态
  const [multiCardValues, setMultiCardValues] = useState<MultiCardInput>({
    populationSize: 60,
    sampleSize: 7,
    targetCards: [
      {
        id: '1',
        name: '目标牌1',
        count: 4,
        expected: 1
      }
    ]
  });

  return (
    <div className="space-y-6">
      <Tabs value={tab} onValueChange={setTab} className="w-full">
        <TabsList className="grid w-full sm:w-fit grid-cols-3 h-11 p-0.5 bg-[--accent]/50">
          <TabsTrigger 
            value="single" 
            className="px-8 text-base data-[state=active]:bg-[--background] data-[state=active]:text-[--foreground] data-[state=active]:shadow-none"
          >
            单牌概率
          </TabsTrigger>
          <TabsTrigger 
            value="multi" 
            className="px-8 text-base data-[state=active]:bg-[--background] data-[state=active]:text-[--foreground] data-[state=active]:shadow-none"
          >
            多牌概率
          </TabsTrigger>
          <TabsTrigger 
            value="bo1" 
            className="px-8 text-base data-[state=active]:bg-[--background] data-[state=active]:text-[--foreground] data-[state=active]:shadow-none"
          >
            BO1地牌
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single" className="mt-6">
          <SingleCardCalculator 
            values={singleCardValues}
            onChange={setSingleCardValues}
          />
        </TabsContent>

        <TabsContent value="multi" className="mt-6">
          <MultiCardCalculator 
            values={multiCardValues}
            onChange={setMultiCardValues}
          />
        </TabsContent>

        <TabsContent value="bo1" className="mt-6">
          <Bo1LandCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
} 