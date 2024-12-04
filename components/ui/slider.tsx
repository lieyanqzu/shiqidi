'use client';

import * as React from 'react';
import * as SliderPrimitive from '@radix-ui/react-slider';

export function Slider({
  className = '',
  min,
  max,
  step,
  value,
  onValueChange,
  ...props
}: React.ComponentPropsWithoutRef<typeof SliderPrimitive.Root> & {
  min?: number;
  max?: number;
  step?: number;
  value?: number[];
  onValueChange?: (value: number[]) => void;
}) {
  return (
    <SliderPrimitive.Root
      className={`relative flex items-center select-none touch-none w-full h-5 ${className}`}
      value={value}
      onValueChange={onValueChange}
      min={min}
      max={max}
      step={step}
      {...props}
    >
      <SliderPrimitive.Track className="relative grow rounded-full h-[3px] bg-[--border]">
        <SliderPrimitive.Range className="absolute h-full rounded-full bg-[--primary]" />
      </SliderPrimitive.Track>
      <SliderPrimitive.Thumb className="block w-4 h-4 bg-[--primary] rounded-full focus:outline-none focus:ring-2 focus:ring-[--ring] disabled:pointer-events-none disabled:opacity-50" />
    </SliderPrimitive.Root>
  );
} 