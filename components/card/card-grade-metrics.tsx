'use client';

import { useMemo, useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { GRADE_METRICS, type GradeMetric, type CustomMetricConfig, loadCustomMetricConfig, getDefaultCustomMetricConfig } from "@/lib/grades";
import { GradeMethodologyDialog } from "@/components/card/grade-methodology-dialog";
import { CustomMetricDialog } from "@/components/card/custom-metric-dialog";

interface CardGradeMetricsProps {
  selectedMetric: GradeMetric;
  onMetricChange: (metric: GradeMetric) => void;
  onCustomConfigChange?: (config: CustomMetricConfig) => void;
}

export function CardGradeMetrics({
  selectedMetric,
  onMetricChange,
  onCustomConfigChange,
}: CardGradeMetricsProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [showCustomDialog, setShowCustomDialog] = useState(false);
  const [customConfig, setCustomConfig] = useState<CustomMetricConfig | null>(null);

  useEffect(() => {
    // 加载自定义配置
    const saved = loadCustomMetricConfig();
    setCustomConfig(saved || getDefaultCustomMetricConfig());
  }, []);

  const selectedMetricData = useMemo(() => {
    return GRADE_METRICS.find(m => m.value === selectedMetric);
  }, [selectedMetric]);

  const handleMetricClick = (metric: GradeMetric) => {
    if (metric === 'custom') {
      setShowCustomDialog(true);
    } else {
      onMetricChange(metric);
    }
  };

  const handleCustomConfigSave = (config: CustomMetricConfig) => {
    setCustomConfig(config);
    onMetricChange('custom');
    if (onCustomConfigChange) {
      onCustomConfigChange(config);
    }
  };

  return (
    <div className="w-full">
      {/* 移动端折叠按钮 */}
      <div className="sm:hidden mb-2 flex items-center gap-2">
        <Button
          variant="secondary"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="flex-1 flex items-center justify-between bg-[--component-background]"
        >
          <span>评分指标</span>
          <span className="text-xs text-[--foreground-muted]">
            {selectedMetric === 'custom' ? '自定义' : (selectedMetricData?.englishShortLabel || '')}
          </span>
        </Button>
        <GradeMethodologyDialog />
      </div>

      {/* 桌面端标题和指标选项 */}
      <div className="hidden sm:flex sm:items-center sm:gap-3">
        <span className="text-sm text-[--component-foreground-muted] flex items-center gap-1">
          评分指标：
          <GradeMethodologyDialog />
        </span>
        <div className="flex-1 min-w-[240px] overflow-x-auto">
          <div className="flex items-center gap-2 whitespace-nowrap pb-1">
            {GRADE_METRICS.map((metric) => {
              const isSelected = selectedMetric === metric.value;

              return (
                <div key={metric.value} className="flex items-center gap-1">
                  <Button
                    variant={isSelected ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => handleMetricClick(metric.value)}
                    title={metric.label}
                    className={`inline-flex justify-center text-sm rounded-full px-4 border transition-all ${
                      isSelected
                        ? 'bg-gradient-to-r from-[--accent]/20 to-[--accent]/10 text-[--foreground] border-[--accent]/60 font-medium shadow-sm hover:border-[--accent]'
                        : 'bg-[--component-background] text-[--foreground-muted] border-[--border] hover:text-[--foreground] hover:border-[--accent]/50'
                    }`}
                  >
                    {metric.shortLabel}
                  </Button>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* 移动端展开的指标选项 */}
      <div className={`sm:hidden ${!isExpanded ? 'hidden' : ''}`}>
        <div className="grid grid-cols-2 gap-2">
          {GRADE_METRICS.map((metric) => {
            const isSelected = selectedMetric === metric.value;

            return (
              <Button
                key={metric.value}
                variant={isSelected ? "secondary" : "ghost"}
                size="sm"
                onClick={() => {
                  handleMetricClick(metric.value);
                  if (metric.value !== 'custom') {
                    setIsExpanded(false);
                  }
                }}
                title={metric.label}
                className={`w-full justify-start text-sm rounded-full border transition-all ${
                  isSelected
                    ? 'bg-gradient-to-r from-[--accent]/20 to-[--accent]/10 text-[--foreground] border-[--accent]/60 font-medium shadow-sm hover:border-[--accent]'
                    : 'bg-[--component-background] text-[--foreground-muted] border-[--border] hover:text-[--foreground] hover:border-[--accent]/50'
                }`}
              >
                {metric.shortLabel}
              </Button>
            );
          })}
        </div>
      </div>

      {/* 自定义指标配置对话框 */}
      <CustomMetricDialog
        open={showCustomDialog}
        onClose={() => setShowCustomDialog(false)}
        onSave={handleCustomConfigSave}
        initialConfig={customConfig || undefined}
      />

    </div>
  );
}

