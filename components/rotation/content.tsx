'use client';

import React from 'react';
import { useEffect } from 'react';
import { useSetStore } from '@/lib/store';
import type { Set, Ban } from '@/types/rotation';

interface SetGroup {
  exitDate: string | null;
  roughExitDate: string | null;
  sets: Set[];
}

interface Props {
  currentSetGroups: SetGroup[];
  futureSets: Set[];
  recentBans: Ban[];
}

function formatDate(dateStr: string | null, roughDate: string | null): string {
  if (dateStr) {
    const date = new Date(dateStr);
    return new Intl.DateTimeFormat('zh-CN', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  }
  return roughDate || '待定';
}

function getTimeLeft(dateStr: string | null, roughDate: string | null): string {
  if (!dateStr && !roughDate) return '待定';
  
  const date = dateStr ? new Date(dateStr) : null;
  if (!date) {
    return roughDate || '待定';
  }

  const now = new Date();
  const diff = date.getTime() - now.getTime();
  const days = Math.ceil(diff / (1000 * 60 * 60 * 24));
  
  if (days < 0) return '已过期';
  if (days === 0) return '今天';
  if (days === 1) return '明天';
  if (days <= 30) return `${days}天后`;
  
  const months = Math.floor(days / 30);
  if (months < 12) return `${months}个月后`;
  
  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;
  if (remainingMonths === 0) return `${years}年后`;
  return `${years}年${remainingMonths}个月后`;
}

function getTimeSpan(sets: Set[]): string {
  const validDates = sets
    .map(set => set.enter_date)
    .filter((date): date is string => date !== null)
    .map(date => new Date(date));

  if (validDates.length === 0) return '';

  const earliestDate = new Date(Math.min(...validDates.map(d => d.getTime())));
  const exitDate = sets[0].exit_date ? new Date(sets[0].exit_date) : null;

  const startYear = earliestDate.getFullYear();
  const endYear = exitDate ? exitDate.getFullYear() : (
    sets[0].rough_exit_date?.match(/\d{4}/)?.[0] || ''
  );

  return `${startYear}–${endYear}`;
}

function ExternalLinkIcon({ className = "" }: { className?: string }) {
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className={`w-3 h-3 ${className}`}>
      <path fillRule="evenodd" d="M4.25 5.5a.75.75 0 0 0-.75.75v8.5c0 .414.336.75.75.75h8.5a.75.75 0 0 0 .75-.75v-4a.75.75 0 0 1 1.5 0v4A2.25 2.25 0 0 1 12.75 17h-8.5A2.25 2.25 0 0 1 2 14.75v-8.5A2.25 2.25 0 0 1 4.25 4h5a.75.75 0 0 1 0 1.5h-5Z" clipRule="evenodd" />
      <path fillRule="evenodd" d="M6.194 12.753a.75.75 0 0 0 1.06.053L16.5 4.44v2.81a.75.75 0 0 0 1.5 0v-4.5a.75.75 0 0 0-.75-.75h-4.5a.75.75 0 0 0 0 1.5h2.553l-9.056 8.194a.75.75 0 0 0-.053 1.06Z" clipRule="evenodd" />
    </svg>
  );
}

export function Content({ currentSetGroups, futureSets, recentBans }: Props) {
  const { chineseSetNames, fetchChineseSetNames } = useSetStore();

  useEffect(() => {
    fetchChineseSetNames();
  }, [fetchChineseSetNames]);

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">标准轮替日程</h1>
      
      {/* 说明 */}
      <div className="bg-[--card] rounded-lg p-4 mb-8">
        <p className="text-sm text-[--muted-foreground] leading-relaxed">
          标准赛制中，最近三年内发行的正式系列都可以使用。2027年起，每年新系列发售时，超过三年的系列将会轮替出标准赛制。
        </p>
      </div>

      {/* 当前标准系列 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">当前标准系列</h2>
        <div className="space-y-8">
          {currentSetGroups.map((group, groupIndex) => {
            const isFirstGroup = groupIndex === 0;
            const timeLeft = getTimeLeft(group.exitDate, group.roughExitDate);
            const isUpcoming = timeLeft.includes('个月后') || timeLeft.includes('年后');
            const isImminent = !isUpcoming && !timeLeft.includes('已过期');

            // 颜色主题
            const themeColors = isFirstGroup
              ? {
                  border: 'border-emerald-500',
                  bg: 'bg-emerald-500/10',
                  text: 'text-emerald-500',
                  dot: 'bg-emerald-500',
                  badge: {
                    bg: 'bg-emerald-400/10',
                    text: 'text-emerald-500',
                    ring: 'ring-emerald-400/30'
                  }
                }
              : {
                  border: isImminent ? 'border-yellow-500' : 'border-transparent',
                  bg: isImminent ? 'bg-yellow-500/10' : 'bg-[--accent]',
                  text: isImminent ? 'text-yellow-500' : 'text-[--muted-foreground]',
                  dot: isImminent ? 'bg-yellow-500' : 'bg-[--muted-foreground]',
                  badge: {
                    bg: 'bg-yellow-400/10',
                    text: 'text-yellow-500',
                    ring: 'ring-yellow-400/30'
                  }
                };

            return (
              <div 
                key={groupIndex} 
                className={`bg-[--card] rounded-lg overflow-hidden border-2 transition-colors ${themeColors.border}`}
              >
                <div className={`px-4 py-3 flex justify-between items-center ${themeColors.bg}`}>
                  <div className="flex items-center gap-2">
                    <div className={`w-2 h-2 rounded-full ${themeColors.dot} ${
                      isImminent || isFirstGroup ? 'animate-pulse' : ''
                    }`} />
                    <div className="text-sm font-medium">
                      {formatDate(group.exitDate, group.roughExitDate)} 轮替
                    </div>
                    {isFirstGroup && (
                      <span className={`inline-flex items-center rounded-md px-2 py-1 text-xs font-medium
                        ${themeColors.badge.bg} ${themeColors.badge.text} ring-1 ring-inset ${themeColors.badge.ring}`}>
                        下一轮替
                      </span>
                    )}
                  </div>
                  <div className={`text-sm font-medium ${themeColors.text}`}>
                    {getTimeSpan(group.sets)}
                  </div>
                </div>
                <div className="p-4">
                  <div className="space-y-3">
                    {group.sets.map(set => (
                      <div key={set.code} className="border border-[--border] rounded-lg p-4 group">
                        <div className="flex flex-col gap-2">
                          <div className="flex items-start justify-between gap-4">
                            <div>
                              <div className="flex items-center gap-2">
                                <h3 className="font-medium text-[--foreground] flex items-center gap-1">
                                  <a
                                    href={set.code ? `https://www.sbwsz.com/set/${set.code}?utm_source=shiqidi` : '#'}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`text-[--foreground] ${set.code ? 'hover:opacity-70 transition-opacity' : ''}`}
                                  >
                                    {set.code && chineseSetNames[set.code] ? chineseSetNames[set.code] : set.name}
                                  </a>
                                  {set.code && (
                                    <ExternalLinkIcon className="opacity-0 group-hover:opacity-50 transition-opacity" />
                                  )}
                                </h3>
                              </div>
                              <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                                {set.code && (
                                  <i className={`ss ss-${set.code.toLowerCase()} ss-fw`} />
                                )}
                                <span>{set.code}</span>
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-[--muted-foreground] whitespace-nowrap">
                                {formatDate(set.enter_date, set.rough_enter_date)} 发售
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 即将发售 */}
      {futureSets.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">即将发售</h2>
          <div className="bg-[--card] rounded-lg p-4">
            <div className="space-y-3">
              {futureSets.map((set, index) => (
                <div key={set.code || index} className="border border-[--border] rounded-lg p-4 group">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[--foreground] flex items-center gap-1">
                            <a
                              href={set.code ? `https://www.sbwsz.com/set/${set.code}?utm_source=shiqidi` : '#'}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`text-[--foreground] ${set.code ? 'hover:opacity-70 transition-opacity' : ''}`}
                            >
                              {set.code && chineseSetNames[set.code] 
                                ? chineseSetNames[set.code] 
                                : (set.name || set.codename || '未知系列')}
                            </a>
                            {set.code && (
                              <ExternalLinkIcon className="opacity-0 group-hover:opacity-50 transition-opacity" />
                            )}
                          </h3>
                        </div>
                        {set.code && (
                          <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                            <i className={`ss ss-${set.code.toLowerCase()} ss-fw`} />
                            <span>{set.code}</span>
                          </div>
                        )}
                      </div>
                      <div className="text-right flex flex-col items-end gap-2">
                        <div className="text-sm text-[--muted-foreground] whitespace-nowrap">
                          {formatDate(set.enter_date, set.rough_enter_date)} 发售
                        </div>
                        <div className="text-sm text-[--muted-foreground] mt-1">
                          {getTimeLeft(set.enter_date, set.rough_enter_date)}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 最近禁牌 */}
      {recentBans.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">最近禁牌</h2>
          <div className="bg-[--card] rounded-lg p-4">
            <div className="space-y-3">
              {recentBans.map((ban, index) => (
                <div key={index} className="border border-[--border] rounded-lg p-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="font-medium text-[--foreground]">{ban.card_name}</h3>
                      <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                        <i className={`ss ss-${ban.set_code.toLowerCase()} ss-fw`} />
                        <span>{chineseSetNames[ban.set_code] || ban.set_code}</span>
                      </div>
                      <div className="text-sm text-[--muted-foreground] mt-2">
                        {ban.reason}
                      </div>
                    </div>
                    {ban.announcement_url && (
                      <a
                        href={`${ban.announcement_url}${ban.announcement_url.includes('?') ? '&' : '?'}utm_source=shiqidi`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-[--primary] hover:underline"
                      >
                        公告
                      </a>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
} 