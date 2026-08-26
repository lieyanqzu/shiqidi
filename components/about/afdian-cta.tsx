import { Heart } from 'lucide-react';

/**
 * 爱发电引导卡片（横向紧凑布局）
 * - 头像 + 文案 + 主按钮 三段式同行排布
 * - 移动端垂直堆叠
 */
export function AfdianCTA() {
  return (
    <div className="relative overflow-hidden rounded-lg px-5 sm:px-6 py-4 sm:py-5 text-[--afdian-foreground] bg-gradient-to-br from-[--afdian] to-[--afdian-dark] shadow-sm">
      {/* 装饰光晕 */}
      <div className="pointer-events-none absolute -top-12 -right-12 h-32 w-32 rounded-full bg-white/10 blur-2xl" />
      <div className="pointer-events-none absolute -bottom-12 -left-8 h-24 w-24 rounded-full bg-white/5 blur-2xl" />

      <div className="relative flex flex-col sm:flex-row sm:items-center gap-4">
        {/* 头像 + 爱发电标识 */}
        <div className="flex-shrink-0">
          <div className="relative h-12 w-12 sm:h-14 sm:w-14">
            <img
              src="/image/afdian-avatar.jpg"
              alt="十七地爱发电头像"
              width={56}
              height={56}
              className="h-full w-full rounded-full bg-white/95 p-0.5 object-cover"
            />
            <span className="absolute -bottom-1 -right-1 inline-flex items-center justify-center h-5 w-5 rounded-full bg-white text-[--afdian] shadow ring-2 ring-[--afdian-dark]">
              <Heart className="h-3 w-3 fill-current" aria-hidden="true" />
            </span>
          </div>
        </div>

        {/* 文案 */}
        <div className="flex-1 min-w-0">
          <h3 className="text-base sm:text-lg font-semibold mb-0.5">
            在爱发电支持十七地
          </h3>
          <p className="text-sm leading-snug opacity-90">
            如果您想要对本站以及本站提供的工具表达支持，可以通过爱发电进行赞助。
          </p>
        </div>

        {/* 主按钮 */}
        <div className="flex-shrink-0">
          <a
            href="https://afdian.com/a/shiqidi"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-md bg-white px-4 py-2 text-sm font-medium text-[--afdian-dark] shadow-sm transition-colors hover:bg-white/90 whitespace-nowrap"
          >
            前往爱发电支持
            <svg
              className="w-3.5 h-3.5"
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
        </div>
      </div>
    </div>
  );
}
