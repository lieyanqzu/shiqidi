import { Metadata } from 'next';
import rotationData from '@/data/rotation.json';

export const metadata: Metadata = {
  title: '标准轮替 - 十七地',
  description: '万智牌：竞技场标准赛制轮替日程，包括各系列的进入和退出时间。',
};

interface Set {
  name: string | null;
  code: string | null;
  enter_date: string | null;
  exit_date: string | null;
  codename: string | null;
  block: string | null;
  rough_enter_date: string | null;
  rough_exit_date: string | null;
}

interface Ban {
  card_name: string;
  card_image_url: string;
  set_code: string;
  reason: string;
  announcement_url: string;
}

interface RotationData {
  meta: {
    comments: {
      consuming: string;
      contributing: string;
      building: string;
    };
  };
  sets: Set[];
  bans: Ban[];
}

interface SetGroup {
  exitDate: string | null;
  roughExitDate: string | null;
  sets: Set[];
}

async function getChineseSetNames() {
  try {
    const response = await fetch('https://sbwsz.com/static/setName.json', { next: { revalidate: 3600 } });
    if (!response.ok) {
      throw new Error('Failed to fetch Chinese set names');
    }
    return await response.json();
  } catch (error) {
    console.error('Failed to fetch Chinese set names:', error);
    return {};
  }
}

function isValidSet(set: unknown): set is Set {
  if (!set || typeof set !== 'object') return false;
  const s = set as Partial<Set>;
  return typeof s.name === 'string' &&
    typeof s.code === 'string' &&
    (typeof s.enter_date === 'string' || s.rough_enter_date !== null) &&
    (typeof s.exit_date === 'string' || s.rough_exit_date !== null);
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

export default async function RotationPage() {
  const now = new Date();
  const data = rotationData as unknown as RotationData;
  const chineseSetNames = await getChineseSetNames();

  const sets = data.sets
    .filter(isValidSet)
    .filter(set => {
      if (!set.exit_date && !set.rough_exit_date) return false;
      if (!set.exit_date) return true;
      const exitDate = new Date(set.exit_date);
      return exitDate > now;
    })
    .sort((a, b) => {
      const dateA = a.exit_date ? new Date(a.exit_date).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.exit_date ? new Date(b.exit_date).getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });

  // 按轮替时间分组
  const currentSetGroups = sets
    .filter(set => {
      if (!set.enter_date) return false;
      return new Date(set.enter_date) <= now;
    })
    .reduce<SetGroup[]>((groups, set) => {
      const existingGroup = groups.find(
        group => group.exitDate === set.exit_date && group.roughExitDate === set.rough_exit_date
      );
      if (existingGroup) {
        existingGroup.sets.push(set);
      } else {
        groups.push({
          exitDate: set.exit_date,
          roughExitDate: set.rough_exit_date,
          sets: [set],
        });
      }
      return groups;
    }, [])
    .sort((a, b) => {
      const dateA = a.exitDate ? new Date(a.exitDate).getTime() : Number.MAX_SAFE_INTEGER;
      const dateB = b.exitDate ? new Date(b.exitDate).getTime() : Number.MAX_SAFE_INTEGER;
      return dateA - dateB;
    });

  const futureSets = sets.filter(set => {
    if (!set.enter_date) return true;
    return new Date(set.enter_date) > now;
  });

  // 获取当前标准系列的代码列表
  const standardSetCodes = new Set(
    currentSetGroups.flatMap(group => group.sets.map(set => set.code))
  );

  // 只显示当前标准系列的禁牌
  const recentBans = data.bans
    .filter(ban => ban.set_code && standardSetCodes.has(ban.set_code))
    .slice(0, 5);

  return (
    <div className="container mx-auto px-4 py-8">
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
                        <div key={set.code} className="border border-[--border] rounded-lg p-4">
                          <div className="flex flex-col gap-2">
                            <div className="flex items-start justify-between gap-4">
                              <div>
                                <h3 className="font-medium text-[--foreground]">
                                  {set.code && chineseSetNames[set.code] ? chineseSetNames[set.code] : set.name}
                                </h3>
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
                  <div key={set.code || index} className="border border-[--border] rounded-lg p-4">
                    <div className="flex flex-col gap-2">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <h3 className="font-medium text-[--foreground]">
                            {set.code && chineseSetNames[set.code] 
                              ? chineseSetNames[set.code] 
                              : (set.name || set.codename || '未知系列')}
                          </h3>
                          {set.code && (
                            <div className="text-sm text-[--muted-foreground] mt-1 flex items-center gap-1.5">
                              <i className={`ss ss-${set.code.toLowerCase()} ss-fw`} />
                              <span>{set.code}</span>
                            </div>
                          )}
                        </div>
                        <div className="text-right">
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
                          href={ban.announcement_url}
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
    </div>
  );
} 