'use client';

import * as React from 'react';

interface InfoCardProps {
  title: string;
  icon?: React.ReactNode;
  extra?: React.ReactNode;
  children: React.ReactNode;
}

export function InfoCard({ title, icon, extra, children }: InfoCardProps) {
  return (
    <div className="border border-[--border] rounded-lg p-6 bg-[--card]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          {icon}
          <h2 className="text-lg font-semibold">{title}</h2>
        </div>
        {extra}
      </div>
      {children}
    </div>
  );
} 