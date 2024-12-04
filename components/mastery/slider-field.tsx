'use client';

import * as React from 'react';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';

interface SliderFieldProps {
  label: string;
  description?: string;
  value: number;
  onChange: (value: number[]) => void;
  min?: number;
  max?: number;
  step?: number;
  showMaxValue?: boolean;
}

export function SliderField({
  label,
  description,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  showMaxValue = false,
}: SliderFieldProps) {
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = parseInt(e.target.value) || 0;
    const clampedValue = Math.min(Math.max(newValue, min), max);
    onChange([clampedValue]);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <Label className="text-base font-medium">{label}</Label>
        <div className="flex items-center gap-1">
          <input
            type="number"
            value={value}
            onChange={handleInputChange}
            min={min}
            max={max}
            step={step}
            className="w-12 h-7 rounded border border-[--border] bg-[--input] font-mono text-sm text-center [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          />
          {showMaxValue && (
            <div className="text-sm text-gray-500">/ {max}</div>
          )}
        </div>
      </div>
      <Slider
        value={[value]}
        onValueChange={onChange}
        min={min}
        max={max}
        step={step}
        className="my-2"
      />
      {description && (
        <div className="text-xs text-[--muted-foreground]">
          {description}
        </div>
      )}
    </div>
  );
} 