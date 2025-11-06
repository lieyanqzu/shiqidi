'use client';

import React from 'react';
import { SetIcon } from '@/components/logo/set-icon';

interface SetSymbolProps {
  set: string;
}

export function SetSymbol({ set }: SetSymbolProps) {
  return <SetIcon set={set} size="2x" />;
} 