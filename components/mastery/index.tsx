'use client';

import { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { InfoCard } from './info-card';
import { SliderField } from './slider-field';
import { calculateCurrentXP, calculateExpectedDailyWinsXP, calculateExpectedWeeklyWinsXP, calculateExpectedDailyQuestsXP, calculateExpectedLevel, calculateDaysLeft, getLocalRefreshTimeString, getLocalRefreshTimeStringWithWeekday } from './utils';
import { masteryConfig } from '@/data/mastery';

interface MasteryState {
  // 基础信息
  currentDate: string;
  endDate: string;
  daysLeft: number;
  maxLevel: number;

  // 当前进度
  currentLevel: number;
  excessXP: number;
  incompleteDailyWins: number;
  incompleteDailyQuests: number;
  incompleteWeeklyWins: number;

  // 预期进度
  dailyWinsPerDay: number;
  dailyQuestsLeft: number;
  weeklyWinsPerWeek: number;
}

export function MasteryCalculator() {
  const [values, setValues] = useState<MasteryState>({
    currentDate: new Date().toISOString().split('T')[0],  // 格式：YYYY-MM-DD
    endDate: masteryConfig.endDate,
    daysLeft: calculateDaysLeft(new Date().toISOString().split('T')[0], masteryConfig.endDate),
    maxLevel: masteryConfig.maxLevel,
    currentLevel: 1,
    excessXP: 0,
    incompleteDailyWins: 0,
    incompleteDailyQuests: 0,
    incompleteWeeklyWins: 0,
    dailyWinsPerDay: masteryConfig.defaultDailyWins,
    weeklyWinsPerWeek: masteryConfig.defaultWeeklyWins,
    dailyQuestsLeft: 0,
  });

  // 计算当前总经验值
  const totalXP = calculateCurrentXP(values);
  
  // 计算预期经验值
  const totalDailyWinXP = calculateExpectedDailyWinsXP(values.dailyWinsPerDay, values.daysLeft);
  const totalDailyQuestXP = calculateExpectedDailyQuestsXP(values.dailyQuestsLeft, values.daysLeft);
  const totalWeeklyWinsXP = calculateExpectedWeeklyWinsXP(values.weeklyWinsPerWeek, values.daysLeft);
  
  // 计算预期等级
  const expectedLevel = calculateExpectedLevel(totalXP, totalDailyWinXP + totalDailyQuestXP + totalWeeklyWinsXP);

  const handleSliderChange = (field: keyof MasteryState, value: number[]) => {
    setValues(prev => ({ ...prev, [field]: value[0] }));
  };

  // 处理日期变化
  const handleDateChange = (field: 'currentDate' | 'endDate', value: string) => {
    setValues(prev => {
      const newValues = {
        ...prev,
        [field]: value,
      };
      // 更新剩余天数
      newValues.daysLeft = calculateDaysLeft(newValues.currentDate, newValues.endDate);
      return newValues;
    });
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div>
        <h1 className="text-3xl font-bold">精研通行证计算器</h1>
        <p className="mt-2 text-[--muted-foreground]">
          计算精研通行证等级进度，帮助你规划每日任务
        </p>
      </div>

      {/* 基础信息 */}
      <InfoCard 
        title="通行证信息"
        extra={
          <div className="text-sm text-[--muted-foreground]">
            时间：{new Date(masteryConfig.startDate).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })} ~ {new Date(masteryConfig.endDate).toLocaleDateString('zh-CN', { year: 'numeric', month: '2-digit', day: '2-digit' })}
          </div>
        }
      >
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <div className="space-y-1.5">
            <Label className="text-base font-medium">当前日期</Label>
            <Input
              type="date"
              value={values.currentDate}
              onChange={(e) => handleDateChange('currentDate', e.target.value)}
              min={masteryConfig.startDate}
              max={values.endDate}
              className="bg-[--input] font-mono text-center"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-base font-medium">结束日期</Label>
            <Input
              type="date"
              value={values.endDate}
              onChange={(e) => handleDateChange('endDate', e.target.value)}
              min={values.currentDate}
              max={masteryConfig.endDate}
              className="bg-[--input] font-mono text-center"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-base font-medium">剩余天数</Label>
            <Input
              type="text"
              value={values.daysLeft}
              readOnly
              className="bg-[--input] font-mono text-center text-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-base font-medium">最高等级</Label>
            <Input
              type="text"
              value={values.maxLevel}
              readOnly
              className="bg-[--input] font-mono text-center text-lg"
            />
          </div>

          <div className="space-y-1.5">
            <Label className="text-base font-medium">预期等级</Label>
            <Input
              type="text"
              value={expectedLevel}
              readOnly
              className="bg-[--input] font-mono text-center text-lg"
            />
          </div>
        </div>
      </InfoCard>

      <div className="grid gap-8 lg:grid-cols-2">
        {/* 当前进度 */}
        <InfoCard title="当前进度">
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-[--accent]/50">
              <div className="space-y-1.5">
                <Label className="text-base font-medium">总经验值</Label>
                <div className="text-sm text-gray-500 mb-2">
                  包含当前等级经验、额外经验和未完成任务经验
                </div>
                <Input
                  type="text"
                  value={calculateCurrentXP(values).toLocaleString()}
                  readOnly
                  className="bg-[--input] font-mono text-center text-lg"
                />
              </div>
            </div>

            <div className="border-t border-[--border] pt-6">
              <div className="p-4 rounded-lg bg-[--accent]/50">
                <SliderField
                  label="当前等级"
                  description="设置你当前的通行证等级"
                  value={values.currentLevel}
                  onChange={(value) => handleSliderChange('currentLevel', value)}
                  min={1}
                  max={values.maxLevel}
                  showMaxValue
                />

                <SliderField
                  label="额外经验值"
                  description="设置当前等级的额外经验值"
                  value={values.excessXP}
                  onChange={(value) => handleSliderChange('excessXP', value)}
                  max={1000}
                  step={25}
                  showMaxValue
                />
              </div>
            </div>

            <div className="border-t border-[--border] pt-6">
              <div className="text-sm font-medium text-[--muted-foreground] mb-4">未完成任务</div>
              <div className="space-y-4 p-4 rounded-lg bg-[--accent]/50">
                <SliderField
                  label="每日胜场"
                  value={values.incompleteDailyWins}
                  onChange={(value) => handleSliderChange('incompleteDailyWins', value)}
                  max={10}
                  showMaxValue
                />

                <SliderField
                  label="每日任务"
                  value={values.incompleteDailyQuests}
                  onChange={(value) => handleSliderChange('incompleteDailyQuests', value)}
                  max={3}
                  showMaxValue
                />

                <SliderField
                  label="每周胜场"
                  value={values.incompleteWeeklyWins}
                  onChange={(value) => handleSliderChange('incompleteWeeklyWins', value)}
                  max={15}
                  showMaxValue
                />
              </div>
            </div>
          </div>
        </InfoCard>

        {/* 预期进度 */}
        <InfoCard title="预期进度">
          <div className="space-y-6">
            <div className="p-4 rounded-lg bg-[--accent]/50">
              <SliderField
                label="每日胜场数"
                description={`你预计每天能完成多少场胜利？（${getLocalRefreshTimeString()} 刷新）`}
                value={values.dailyWinsPerDay}
                onChange={(value) => {
                  const newValues = {
                    ...values,
                    dailyWinsPerDay: value[0],
                    totalDailyWinXP: calculateExpectedDailyWinsXP(value[0], values.daysLeft)
                  };
                  setValues(newValues);
                }}
                max={10}
                showMaxValue
              />

              <div className="mt-4 space-y-1.5">
                <Label className="text-base font-medium">每日胜场经验</Label>
                <div className="text-sm text-gray-500 mb-2">
                  预计可获得的每日胜场总经验
                </div>
                <Input
                  type="text"
                  value={totalDailyWinXP.toLocaleString()}
                  readOnly
                  className="bg-[--input] font-mono text-center text-lg"
                />
              </div>
            </div>

            <div className="border-t border-[--border] pt-6">
              <div className="p-4 rounded-lg bg-[--accent]/50">
                <SliderField
                  label="每日任务数"
                  description={`你预计每天能完成多少个每日任务？（${getLocalRefreshTimeString()} 刷新）`}
                  value={values.dailyQuestsLeft}
                  onChange={(value) => {
                    const newValues = {
                      ...values,
                      dailyQuestsLeft: value[0],
                      totalDailyQuestXP: calculateExpectedDailyQuestsXP(value[0], values.daysLeft)
                    };
                    setValues(newValues);
                  }}
                  max={values.daysLeft}
                  showMaxValue
                />

                <div className="mt-4 space-y-1.5">
                  <Label className="text-base font-medium">每日任务经验</Label>
                  <div className="text-sm text-gray-500 mb-2">
                    预计可获得的每日任务总经验
                  </div>
                  <Input
                    type="text"
                    value={totalDailyQuestXP.toLocaleString()}
                    readOnly
                    className="bg-[--input] font-mono text-center text-lg"
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-[--border] pt-6">
              <div className="p-4 rounded-lg bg-[--accent]/50">
                <SliderField
                  label="每周胜场数"
                  description={`你预计每周能完成多少场胜利？（${getLocalRefreshTimeStringWithWeekday()} 刷新）`}
                  value={values.weeklyWinsPerWeek}
                  onChange={(value) => {
                    const newValues = {
                      ...values,
                      weeklyWinsPerWeek: value[0],
                      totalWeeklyWinsXP: calculateExpectedWeeklyWinsXP(value[0], values.daysLeft)
                    };
                    setValues(newValues);
                  }}
                  max={15}
                  showMaxValue
                />

                <div className="mt-4 space-y-1.5">
                  <Label className="text-base font-medium">每周胜场经验</Label>
                  <div className="text-sm text-gray-500 mb-2">
                    预计可获得的每周胜场总经验
                  </div>
                  <Input
                    type="text"
                    value={totalWeeklyWinsXP.toLocaleString()}
                    readOnly
                    className="bg-[--input] font-mono text-center text-lg"
                  />
                </div>
              </div>
            </div>
          </div>
        </InfoCard>
      </div>
    </div>
  );
} 