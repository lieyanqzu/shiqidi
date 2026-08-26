import { Heart } from 'lucide-react';
import type { Sponsor } from '@/data/sponsors';

interface SponsorListProps {
  sponsors: Sponsor[];
}

/**
 * 支持者名单展示
 * - 多列横排：桌面 2 列 / 手机 1 列
 * - 每行：[小头像] [名字] [累计金额]
 * - 排序：金额 desc → 昵称 asc
 * - 时间仅在数据层保留，列表不显示
 * - 空态显示引导文案
 */
export function SponsorList({ sponsors }: SponsorListProps) {
  // 排序：金额 desc → 昵称 asc
  const sorted = [...sponsors].sort((a, b) => {
    const aAmount = Number(a.sumAmount) || 0;
    const bAmount = Number(b.sumAmount) || 0;
    if (bAmount !== aAmount) return bAmount - aAmount;
    return a.name.localeCompare(b.name, 'zh-Hans-CN');
  });

  return (
    <div className="bg-[--card] rounded-lg p-6">
      <div className="flex items-center gap-2 mb-4">
        <Heart className="w-5 h-5 text-[--afdian]" aria-hidden="true" />
        <h2 className="text-xl font-semibold">支持者名单</h2>
        {sorted.length > 0 && (
          <span className="text-xs text-[--muted-foreground]">
            （{sorted.length}）
          </span>
        )}
      </div>

      {sorted.length === 0 ? (
        <div className="space-y-2">
          <p className="text-sm text-[--muted-foreground] leading-relaxed">
            还没有公开登记的支持者。
          </p>
          <p className="text-sm text-[--muted-foreground] leading-relaxed">
            想成为第一位？
            <a
              href="https://afdian.com/a/shiqidi"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--primary] hover:opacity-80 mx-1 inline-flex items-center gap-1"
            >
              前往爱发电支持我们
              <svg
                className="w-3 h-3"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
            </a>
            ，你的名字将出现在这里。
          </p>
        </div>
      ) : (
        <>
          <p className="text-xs text-[--muted-foreground] mb-4 leading-relaxed">
            以下名单从爱发电自动拉取，如有遗漏请
            <a
              href="https://github.com/lieyanqzu/shiqidi/issues"
              target="_blank"
              rel="noopener noreferrer"
              className="text-[--primary] hover:opacity-80 mx-1"
            >
              联系我
            </a>
            补充。感谢每个赞助支持的朋友！
          </p>
          {/* 桌面 2 列 / 手机 1 列，每列项间用分隔线分组 */}
          <ul className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            {sorted.map((s) => (
              <li
                key={`${s.name}-${s.sumAmount}`}
                className="flex items-center gap-3 py-2 border-b border-[--border] last:border-b-0 md:[&:nth-last-child(2)]:border-b-0"
              >
                <img
                  src={s.avatar || '/image/afdian-avatar.jpg'}
                  alt={s.name}
                  width={32}
                  height={32}
                  className="h-8 w-8 rounded-full object-cover bg-[--background-subtle] flex-shrink-0"
                  loading="lazy"
                />
                <span className="flex-1 min-w-0 truncate text-sm text-[--foreground]">
                  {s.name}
                </span>
                <span className="text-xs text-[--afdian] font-medium tabular-nums flex-shrink-0 min-w-[3.5rem] text-right">
                  {s.sumAmount ? `¥${s.sumAmount}` : ''}
                </span>
              </li>
            ))}
          </ul>
        </>
      )}
    </div>
  );
}
