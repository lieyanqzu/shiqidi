'use client';

import React from 'react';

interface ManaSymbolsProps {
  color: string;
}

export function ManaSymbols({ color }: ManaSymbolsProps) {
  const symbols = color.split('').sort();
  const spacing = symbols.length === 5 ? '-space-x-2' 
    : symbols.length >= 3 ? '-space-x-1'
    : 'gap-0.5';

  return (
    <div className={`flex ${spacing}`}>
      {symbols.map((symbol, index) => (
        <div 
          key={index} 
          className={`w-4 h-4 bg-no-repeat bg-center bg-contain card-symbol-${symbol}`}
          title={getColorName(symbol)}
        />
      ))}
    </div>
  );
}

function getColorName(symbol: string): string {
  switch (symbol) {
    case 'W': return '白色';
    case 'U': return '蓝色';
    case 'B': return '黑色';
    case 'R': return '红色';
    case 'G': return '绿色';
    default: return '无色';
  }
} 