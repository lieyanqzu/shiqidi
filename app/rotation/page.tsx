import { generateMetadata } from '../metadata';
import rotationData from '@/data/rotation.json';
import { Content } from '@/components/rotation/content';
import type { Set, Ban } from '@/types/rotation';
import { parseISO, isValid } from 'date-fns';

export const metadata = generateMetadata(
  "十七地 - 标准轮替日程",
  "了解标准赛制的系列轮替时间表，掌握当前可用系列和即将轮替的系列信息。帮助你合理规划卡牌收集。",
  "/rotation",
  {
    keywords: ["MTGA", "万智牌", "标准轮替", "系列更新", "标准赛制", "轮替时间表", "系列表"],
  }
);

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

function isValidSet(set: unknown): set is Set {
  if (!set || typeof set !== 'object') return false;
  const s = set as Partial<Set>;
  return typeof s.name === 'string' &&
    typeof s.code === 'string' &&
    (typeof s.enter_date === 'string' || s.rough_enter_date !== null) &&
    (typeof s.exit_date === 'string' || s.rough_exit_date !== null);
}

export default function RotationPage() {
  const now = new Date();
  const data = rotationData as unknown as RotationData;

  const sets = data.sets
    .filter(isValidSet)
    .filter(set => {
      if (!set.exit_date && !set.rough_exit_date) return false;
      if (!set.exit_date) return true;
      const exitDate = parseISO(set.exit_date);
      return isValid(exitDate) && exitDate > now;
    })
    .sort((a, b) => {
      const dateA = a.exit_date ? parseISO(a.exit_date) : null;
      const dateB = b.exit_date ? parseISO(b.exit_date) : null;
      const timeA = dateA && isValid(dateA) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = dateB && isValid(dateB) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });

  // 按轮替时间分组
  const currentSetGroups = sets
    .filter(set => {
      if (!set.enter_date) return false;
      const enterDate = parseISO(set.enter_date);
      return isValid(enterDate) && enterDate <= now;
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
      const dateA = a.exitDate ? parseISO(a.exitDate) : null;
      const dateB = b.exitDate ? parseISO(b.exitDate) : null;
      const timeA = dateA && isValid(dateA) ? dateA.getTime() : Number.MAX_SAFE_INTEGER;
      const timeB = dateB && isValid(dateB) ? dateB.getTime() : Number.MAX_SAFE_INTEGER;
      return timeA - timeB;
    });

  const futureSets = sets.filter(set => {
    if (!set.enter_date) return true;
    const enterDate = parseISO(set.enter_date);
    return !isValid(enterDate) || enterDate > now;
  });

  // 获取当前标准系列的代码列表
  const standardSetCodes = new Set(
    currentSetGroups.flatMap(group => group.sets.map(set => set.code))
  );

  // 只显示当前标准系列的禁牌
  const recentBans = data.bans
    .filter(ban => {
      if (!ban.set_code) return false;
      // 处理新格式的 set_code（如 "OTJ:74"）
      const setCode = ban.set_code.includes(':') ? ban.set_code.split(':')[0] : ban.set_code;
      return standardSetCodes.has(setCode);
    });

  return (
    <div className="container mx-auto px-4 py-8">
      <Content
        currentSetGroups={currentSetGroups}
        futureSets={futureSets}
        recentBans={recentBans}
      />
    </div>
  );
} 