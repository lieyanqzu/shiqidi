'use client';

import React from 'react';

interface SetSymbolProps {
  set: string;
}

export function SetSymbol({ set }: SetSymbolProps) {
  const processedSet = set.startsWith('Y') 
    ? `y${set.slice(set.match(/Y\d{0,2}/)![0].length)}`.toLowerCase()
    : set.toLowerCase();

  return (
    <i 
      className={`keyrune ss ss-2x ss-${processedSet}`}
      aria-hidden="true"
    />
  );
} 