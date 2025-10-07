'use client';

import React from 'react';
import { useEffect } from 'react';
import { useSetStore } from '@/lib/store';
import type { Set, Ban } from '@/types/rotation';
import { parseISO, isValid } from 'date-fns';
import Image from 'next/image';

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
    const date = parseISO(dateStr);
    if (isValid(date)) {
      return new Intl.DateTimeFormat('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(date);
    } else {
      console.warn(`Invalid date string passed to formatDate: ${dateStr}`);
    }
  }
  
  // 处理 rough_date：支持季度格式(Q1/Q2/Q3/Q4)和月份格式
  if (roughDate) {
    // 匹配季度格式，如 "Q1 2026"
    const quarterMatch = roughDate.match(/^Q([1-4])\s+(\d{4})$/);
    if (quarterMatch) {
      const quarter = parseInt(quarterMatch[1]);
      const year = quarterMatch[2];
      const quarterMap: Record<number, string> = { 1: '第一季度', 2: '第二季度', 3: '第三季度', 4: '第四季度' };
      return `${year}年${quarterMap[quarter]}`;
    }
    
    // 匹配英文月份格式，如 "January 2026"
    const englishMonthMatch = roughDate.match(/^([A-Za-z]+)\s+(\d{4})$/);
    if (englishMonthMatch) {
      const monthName = englishMonthMatch[1];
      const year = englishMonthMatch[2];
      const monthMap: Record<string, string> = {
        'January': '1月', 'February': '2月', 'March': '3月',
        'April': '4月', 'May': '5月', 'June': '6月',
        'July': '7月', 'August': '8月', 'September': '9月',
        'October': '10月', 'November': '11月', 'December': '12月'
      };
      return `${year}年${monthMap[monthName] || monthName}`;
    }
    
    // 直接返回原始格式
    return roughDate;
  }
  
  return '待定';
}

function getTimeLeft(dateStr: string | null, roughDate: string | null): string {
  if (!dateStr && !roughDate) return '待定';
  
  let date = dateStr ? parseISO(dateStr) : null;
  
  // 如果没有精确日期，尝试从 roughDate 解析
  if ((!date || !isValid(date)) && roughDate) {
    // 匹配季度格式，如 "Q1 2026"
    const quarterMatch = roughDate.match(/^Q([1-4])\s+(\d{4})$/);
    if (quarterMatch) {
      const quarter = parseInt(quarterMatch[1]);
      const year = parseInt(quarterMatch[2]);
      // Q1=2月中, Q2=5月中, Q3=8月中, Q4=11月中（每个季度的中间月份的15号）
      const monthMap: Record<number, number> = { 1: 1, 2: 4, 3: 7, 4: 10 };
      date = new Date(year, monthMap[quarter], 15);
    } else {
      // 匹配英文月份格式，如 "January 2026" 或 "March 2026"
      const monthMatch = roughDate.match(/^([A-Za-z]+)\s+(\d{4})$/);
      if (monthMatch) {
        const monthName = monthMatch[1];
        const year = parseInt(monthMatch[2]);
        const monthMap: Record<string, number> = {
          'January': 0, 'February': 1, 'March': 2,
          'April': 3, 'May': 4, 'June': 5,
          'July': 6, 'August': 7, 'September': 8,
          'October': 9, 'November': 10, 'December': 11
        };
        if (monthMap[monthName] !== undefined) {
          // 使用月份的中间日期（15号）
          date = new Date(year, monthMap[monthName], 15);
        }
      }
    }
  }
  
  if (!date || !isValid(date)) {
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
    .map(date => parseISO(date))
    .filter(date => isValid(date));

  if (validDates.length === 0) return '';

  const earliestDate = new Date(Math.min(...validDates.map(d => d.getTime())));
  const exitDate = sets[0].exit_date ? parseISO(sets[0].exit_date) : null;

  const startYear = earliestDate.getFullYear();
  const endYear = (exitDate && isValid(exitDate)) ? exitDate.getFullYear() : (
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
        <div className="mt-3 pt-3 border-t border-[--border]">
          <div className="mb-2 text-sm text-[--muted-foreground]">
            <span className="inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-500 ring-1 ring-inset ring-purple-400/20 whitespace-nowrap mr-2">
              无疆新宇宙
            </span>
            与其他IP跨界联动的系列，如魔戒：中洲传说™、最终幻想™等，引入了万智牌以外的世界观和角色。
          </div>
          <div className="text-sm text-[--muted-foreground]">
            <span className="inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-400/20 whitespace-nowrap mr-2">
              穿越预兆路
            </span>
            部分联动IP无法上线数字平台，故而在数字平台上以万智牌世界观重新设计，但保持相同的游戏机制。
          </div>
        </div>
      </div>

      {/* 当前标准系列 */}
      <section className="mb-8">
        <h2 className="text-xl font-semibold mb-4">当前标准系列</h2>
        <div className="space-y-8">
          {currentSetGroups.map((group, groupIndex) => {
            const isFirstGroup = groupIndex === 0;

            // 颜色主题：第一组绿色，其他所有组黄色
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
                  border: 'border-yellow-500',
                  bg: 'bg-yellow-500/10',
                  text: 'text-yellow-500',
                  dot: 'bg-yellow-500',
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
                    <div className={`w-2 h-2 rounded-full ${themeColors.dot} animate-pulse`} />
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
                                    href={set.code ? `https://mtgch.com/set/${set.code}?utm_source=shiqidi&order=released_at` : '#'}
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
                                {set.universes_beyond && (
                                  <span className="ml-2 inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-500 ring-1 ring-inset ring-purple-400/20 whitespace-nowrap">
                                    无疆新宇宙
                                  </span>
                                )}
                              </div>
                            </div>
                            <div className="text-right">
                              <div className="text-sm text-[--muted-foreground] whitespace-nowrap">
                                {formatDate(set.enter_date, set.rough_enter_date)} 发售
                              </div>
                            </div>
                          </div>
                          
                          {set.digital_name && set.digital_code && (
                            <div className="mt-3 pt-3 border-t border-[--border] relative">
                              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[--card] px-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-[--muted-foreground]">
                                  <path d="M10,17.55,8.23,19.27a2.47,2.47,0,0,1-3.5-3.5l4.54-4.55a2.46,2.46,0,0,1,3.39-.09l.12.1a1,1,0,0,0,1.4-1.43A2.75,2.75,0,0,0,14,9.59a4.46,4.46,0,0,0-6.09.22L3.31,14.36a4.48,4.48,0,0,0,6.33,6.33L11.37,19A1,1,0,0,0,10,17.55ZM20.69,3.31a4.49,4.49,0,0,0-6.33,0L12.63,5A1,1,0,0,0,14,6.45l1.73-1.72a2.47,2.47,0,0,1,3.5,3.5l-4.54,4.55a2.46,2.46,0,0,1-3.39.09l-.12-.1a1,1,0,0,0-1.4,1.43,2.75,2.75,0,0,0,.23.21,4.47,4.47,0,0,0,6.09-.22l4.55-4.55A4.49,4.49,0,0,0,20.69,3.31Z" />
                                </svg>
                              </div>
                              <div className="flex items-start justify-between gap-4">
                                <div>
                                  <div className="flex items-center gap-2">
                                    <h4 className="font-medium text-[--foreground] flex items-center gap-1">
                                      <a
                                        href={`https://mtgch.com/set/${set.digital_code}?utm_source=shiqidi&order=released_at`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[--foreground] hover:opacity-70 transition-opacity"
                                      >
                                        {set.digital_code && chineseSetNames[set.digital_code] 
                                          ? chineseSetNames[set.digital_code] 
                                          : set.digital_name}
                                      </a>
                                      <ExternalLinkIcon className="opacity-0 group-hover:opacity-50 transition-opacity" />
                                    </h4>
                                  </div>
                                  <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                                    <i className={`ss ss-${set.digital_code.toLowerCase()} ss-fw`} />
                                    <span>{set.digital_code}</span>
                                    <span className="ml-2 inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-400/20 whitespace-nowrap">
                                      穿越预兆路
                                    </span>
                                  </div>
                                </div>
                                <div className="text-right">
                                  <div className="text-sm text-[--muted-foreground]">
                                    数字平台同期发售
                                  </div>
                                </div>
                              </div>
                            </div>
                          )}
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
          <div className="bg-[--card] rounded-lg border-2 border-[--border] p-4">
            <div className="space-y-3">
              {futureSets.map((set, index) => (
                <div key={set.code || index} className="border border-[--border] rounded-lg p-4 group">
                  <div className="flex flex-col gap-2">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-medium text-[--foreground] flex items-center gap-1">
                            <a
                              href={set.code ? `https://mtgch.com/set/${set.code}?utm_source=shiqidi&order=released_at` : '#'}
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
                            {set.universes_beyond && (
                              <span className="ml-2 inline-flex items-center rounded-md bg-purple-400/10 px-2 py-1 text-xs font-medium text-purple-500 ring-1 ring-inset ring-purple-400/20 whitespace-nowrap">
                                无疆新宇宙
                              </span>
                            )}
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
                    
                    {set.digital_name && set.digital_code && (
                      <div className="mt-3 pt-3 border-t border-[--border] relative">
                        <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[--card] px-2">
                          <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="currentColor" className="text-[--muted-foreground]">
                            <path d="M10,17.55,8.23,19.27a2.47,2.47,0,0,1-3.5-3.5l4.54-4.55a2.46,2.46,0,0,1,3.39-.09l.12.1a1,1,0,0,0,1.4-1.43A2.75,2.75,0,0,0,14,9.59a4.46,4.46,0,0,0-6.09.22L3.31,14.36a4.48,4.48,0,0,0,6.33,6.33L11.37,19A1,1,0,0,0,10,17.55ZM20.69,3.31a4.49,4.49,0,0,0-6.33,0L12.63,5A1,1,0,0,0,14,6.45l1.73-1.72a2.47,2.47,0,0,1,3.5,3.5l-4.54,4.55a2.46,2.46,0,0,1-3.39.09l-.12-.1a1,1,0,0,0-1.4,1.43,2.75,2.75,0,0,0,.23.21,4.47,4.47,0,0,0,6.09-.22l4.55-4.55A4.49,4.49,0,0,0,20.69,3.31Z" />
                          </svg>
                        </div>
                        <div className="flex items-start justify-between gap-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium text-[--foreground] flex items-center gap-1">
                                <a
                                  href={`https://mtgch.com/set/${set.digital_code}?utm_source=shiqidi&order=released_at`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-[--foreground] hover:opacity-70 transition-opacity"
                                >
                                  {set.digital_code && chineseSetNames[set.digital_code] 
                                    ? chineseSetNames[set.digital_code] 
                                    : set.digital_name}
                                </a>
                                <ExternalLinkIcon className="opacity-0 group-hover:opacity-50 transition-opacity" />
                              </h4>
                            </div>
                            <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                              <i className={`ss ss-${set.digital_code.toLowerCase()} ss-fw`} />
                              <span>{set.digital_code}</span>
                              <span className="ml-2 inline-flex items-center rounded-md bg-emerald-400/10 px-2 py-1 text-xs font-medium text-emerald-500 ring-1 ring-inset ring-emerald-400/20 whitespace-nowrap">
                                穿越预兆路
                              </span>
                            </div>
                          </div>
                          <div className="text-right">
                            <div className="text-sm text-[--muted-foreground]">
                              数字平台同期发售
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 标准环境禁牌 */}
      {recentBans.length > 0 && (
        <section className="mb-8">
          <h2 className="text-xl font-semibold mb-4">标准环境禁牌</h2>
          <div className="bg-[--card] rounded-lg p-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {recentBans.map((ban, index) => (
                <div key={index} className="border border-[--border] rounded-lg p-4">
                  <div className="flex flex-row items-start gap-4">
                    {ban.card_image_url && (
                      <div className="flex-shrink-0 w-20 sm:w-28">
                        {ban.set_code && ban.set_code.includes(':') ? (
                          <a 
                            href={`https://mtgch.com/card/${ban.set_code.split(':')[0]}/${ban.set_code.split(':')[1]}?utm_source=shiqidi`}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            <Image
                              src={ban.card_image_url}
                              alt={ban.card_name}
                              width={320}
                              height={448}
                              className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                              loading="lazy"
                            />
                          </a>
                        ) : (
                          <Image
                            src={ban.card_image_url}
                            alt={ban.card_name}
                            width={320}
                            height={448}
                            className="w-full h-auto rounded-lg shadow-md hover:shadow-lg transition-shadow"
                            loading="lazy"
                          />
                        )}
                      </div>
                    )}
                    <div className="flex-grow">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-medium text-[--foreground]">
                            {ban.set_code && ban.set_code.includes(':') ? (
                              <a 
                                href={`https://mtgch.com/card/${ban.set_code.split(':')[0]}/${ban.set_code.split(':')[1]}?utm_source=shiqidi`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="hover:underline"
                              >
                                {ban.card_name}
                              </a>
                            ) : (
                              ban.card_name
                            )}
                          </h3>
                          <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                            <i className={`ss ss-${ban.set_code.split(':')[0].toLowerCase()} ss-fw`} />
                            <span>{chineseSetNames[ban.set_code.split(':')[0]] || ban.set_code.split(':')[0]}</span>
                          </div>
                        </div>
                        {ban.announcement_url && (
                          <a
                            href={`${ban.announcement_url}${ban.announcement_url.includes('?') ? '&' : '?'}utm_source=shiqidi`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-[--primary] hover:underline whitespace-nowrap flex-shrink-0 min-w-[3rem] text-center"
                          >
                            公告
                          </a>
                        )}
                      </div>
                      <p className="text-sm text-[--muted-foreground] mt-3">{ban.reason}</p>
                    </div>
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