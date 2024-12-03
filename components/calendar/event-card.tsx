'use client'

import { format as formatDate, differenceInDays, isBefore, isAfter, differenceInHours, isToday } from 'date-fns';
import { zhCN } from 'date-fns/locale';
import { Trophy, Swords, Scroll, Crown, Sparkles, Gamepad2 } from 'lucide-react';

interface EventCardProps {
  title: string;
  startTime: Date;
  endTime: Date;
  format?: string;
  description?: string;
  type: 'midweek_magic' | 'premier_draft' | 'quick_draft' | 'other' | 'premier_play' | 'arena_open' | 'arena_championship';
}

export function EventCard({ title, startTime, endTime, format: eventFormat, description, type }: EventCardProps) {
  const now = new Date();
  const isEnded = isBefore(endTime, now);
  const isNotStarted = isAfter(startTime, now);
  const daysLeft = differenceInDays(endTime, now);
  const daysToStart = differenceInDays(startTime, now);
  const hoursToStart = differenceInHours(startTime, now);
  const hoursLeft = differenceInHours(endTime, now);

  const getEventIcon = () => {
    switch (type) {
      case 'midweek_magic':
        return <Sparkles className="w-5 h-5" />;
      case 'quick_draft':
        return <Scroll className="w-5 h-5" />;
      case 'premier_draft':
        return <Swords className="w-5 h-5" />;
      case 'premier_play':
        return <Trophy className="w-5 h-5" />;
      case 'arena_open':
        return <Swords className="w-5 h-5" />;
      case 'arena_championship':
        return <Crown className="w-5 h-5" />;
      default:
        return <Gamepad2 className="w-5 h-5" />;
    }
  };

  const getEventTypeColor = () => {
    switch (type) {
      case 'midweek_magic':
        return {
          gradient: 'from-purple-500/20 to-blue-500/20 dark:from-purple-500/10 dark:to-blue-500/10',
          border: 'hover:border-purple-500/50',
          icon: 'text-purple-500'
        };
      case 'premier_draft':
        return {
          gradient: 'from-blue-500/20 to-cyan-500/20 dark:from-blue-500/10 dark:to-cyan-500/10',
          border: 'hover:border-blue-500/50',
          icon: 'text-blue-500'
        };
      case 'quick_draft':
        return {
          gradient: 'from-green-500/20 to-emerald-500/20 dark:from-green-500/10 dark:to-emerald-500/10',
          border: 'hover:border-green-500/50',
          icon: 'text-green-500'
        };
      case 'premier_play':
        return {
          gradient: 'from-amber-500/20 to-orange-500/20 dark:from-amber-500/10 dark:to-orange-500/10',
          border: 'hover:border-amber-500/50',
          icon: 'text-amber-500'
        };
      case 'arena_open':
        return {
          gradient: 'from-red-500/20 to-pink-500/20 dark:from-red-500/10 dark:to-pink-500/10',
          border: 'hover:border-red-500/50',
          icon: 'text-red-500'
        };
      case 'arena_championship':
        return {
          gradient: 'from-yellow-500/20 to-amber-500/20 dark:from-yellow-500/10 dark:to-amber-500/10',
          border: 'hover:border-yellow-500/50',
          icon: 'text-yellow-500'
        };
      default:
        return {
          gradient: 'from-gray-500/20 to-slate-500/20 dark:from-gray-500/10 dark:to-slate-500/10',
          border: 'hover:border-gray-500/50',
          icon: 'text-gray-500'
        };
    }
  };

  const getStatusBadge = () => {
    if (isEnded) {
      return (
        <div className="text-sm text-[--muted-foreground] bg-[--muted]/10 px-3 py-1 rounded-full">
          已结束
        </div>
      );
    }
    if (isNotStarted) {
      if (hoursToStart <= 24) {
        return (
          <div className="text-sm text-amber-500 dark:text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full animate-pulse">
            {hoursToStart <= 1 ? '即将开始' : `${hoursToStart} 小时后开始`}
          </div>
        );
      }
      return (
        <div className="text-sm text-blue-500 dark:text-blue-400 bg-blue-500/10 px-3 py-1 rounded-full">
          {daysToStart} 天后开始
        </div>
      );
    }
    if (hoursLeft <= 24) {
      return (
        <div className="text-sm text-red-500 dark:text-red-400 bg-red-500/10 px-3 py-1 rounded-full animate-pulse">
          {hoursLeft <= 1 ? '即将结束' : `${hoursLeft} 小时后结束`}
        </div>
      );
    }
    return (
      <div className="text-sm text-green-500 dark:text-green-400 bg-green-500/10 px-3 py-1 rounded-full">
        剩余 {daysLeft} 天
      </div>
    );
  };

  const getTimeDisplay = () => {
    if (isEnded) {
      return (
        <div className="text-sm text-[--muted-foreground] whitespace-nowrap">
          已于 {formatDate(endTime, 'M月d日 HH:mm', { locale: zhCN })} 结束
        </div>
      );
    }

    const startTimeStr = formatDate(startTime, isToday(startTime) ? 'HH:mm' : 'M月d日 HH:mm', { locale: zhCN });
    const endTimeStr = formatDate(endTime, isToday(endTime) ? 'HH:mm' : 'M月d日 HH:mm', { locale: zhCN });

    return (
      <div className="text-sm text-[--muted-foreground] whitespace-nowrap bg-[--accent]/5 px-3 py-1 rounded-full">
        {startTimeStr} – {endTimeStr}
      </div>
    );
  };

  const colors = getEventTypeColor();

  return (
    <div className={`group relative overflow-hidden border border-[--border] rounded-xl transition-all duration-300 
      ${isEnded ? 'opacity-60' : `hover:shadow-lg hover:shadow-[--accent]/5 hover:-translate-y-0.5 ${colors.border}`}`}>
      <div className={`absolute inset-0 bg-gradient-to-br ${colors.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      <div className="relative p-4">
        <div className="flex flex-col gap-3">
          <div className="flex items-start justify-between gap-4">
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2">
                <div className={`${colors.icon} transition-colors`}>
                  {getEventIcon()}
                </div>
                <h3 className={`font-medium text-[--foreground] ${!isEnded && 'group-hover:text-[--foreground-emphasis]'} transition-colors`}>
                  {title}
                </h3>
              </div>
              <div className="flex items-center gap-2 flex-wrap">
                {getTimeDisplay()}
                {getStatusBadge()}
              </div>
            </div>
          </div>
          
          <div className="text-sm space-y-2">
            {eventFormat && (
              <div className="inline-flex items-center px-3 py-1 bg-[--accent]/5 rounded-full">
                <span className="text-[--muted-foreground]">赛制</span>
                <span className="mx-1.5 text-[--muted-foreground]">·</span>
                <span className="text-[--foreground]">{eventFormat}</span>
              </div>
            )}
            
            {description && (
              <div className="text-[--muted-foreground] leading-relaxed mt-2">
                {description}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 