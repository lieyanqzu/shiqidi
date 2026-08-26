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
            <svg
              viewBox="0 0 24 24"
              fill="currentColor"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinejoin="round"
              className="w-4 h-4 flex-shrink-0"
              aria-hidden="true"
            >
              <path d="M9 14.234a.567.567 0 1 0 0 1.134.567.567 0 0 0 0-1.134m5.351 1.705a.567.567 0 1 0 0 1.135.567.567 0 0 0 0-1.135m8.401 1.436c-.189.095-.461.1-.713.013-.169-.06-.352-.116-.534-.172-.339-.104-.904-.276-1.011-.407a.533.533 0 1 0-.853.643c.059.08.139.146.22.209-.816 1.131-4.398 3.382-9.464 2.273-2.283-.5-3.819-1.413-4.444-2.639-.451-.885-.348-1.797-.133-2.293.62-1.29 5.097-4.261 7.955-5.943a.537.537 0 0 0 .188-.733c-.149-.254-.49-.356-.73-.189-.231.135-1.015.601-2.015 1.236-.338-.227-.923-.508-1.86-.6-1.486-.148-4.92-.805-6.029-1.275C2.535 7.162.731 6.27 1.131 5.267c.092-.234.527-.613 1.47-.974a8.5 8.5 0 0 1 1.995-.492l-.212.103c-.642.312-1.343.662-1.813 1.075-.034-.022-.07-.044-.094-.069a.527.527 0 0 0-.754-.017.533.533 0 0 0-.017.756c.19.2.471.35.829.465l.039.014c1.245.383 3.458.336 6.578.211 1.345-.052 2.615-.102 3.674-.082 3.512.07 6.152 1.469 8.07 4.279 1.178 1.725.753 3.426.079 4.903a1.4 1.4 0 0 1-.231-.222.54.54 0 0 0-.75-.085.535.535 0 0 0-.086.751c.109.137.665.778 1.355.724l.037-.002c.021-.003.042.001.064-.003.472-.086.768-.063 1.045.111.367.232.547.37.511.485-.021.073-.076.125-.168.177M8.19 11.418l-.315.231a1.6 1.6 0 0 1-.243-.32c.123-.038.33.007.558.089m14.733 4.356a1.9 1.9 0 0 0-.81-.27c.632-1.544 1.034-3.565-.336-5.572-2.096-3.072-5.101-4.668-8.93-4.744-1.091-.022-2.377.029-3.737.083-1.58.063-3.683.145-5.112.027.285-.155.588-.304.851-.431 1.006-.49 1.797-.872 1.535-1.548-.137-.396-.547-.603-1.219-.618C3.748 2.669.688 3.489.138 4.872c-.31.779-.361 2.282 2.775 3.61 1.29.548 4.934 1.216 6.341 1.355.397.039.701.119.931.205a75 75 0 0 0-.986.664c-.577-.329-1.521-.718-2.226-.237a.94.94 0 0 0-.435.768c-.01.385.224.763.486 1.066-1.038.83-1.877 1.634-2.175 2.253-.332.762-.467 2.008.153 3.224.786 1.544 2.524 2.62 5.166 3.199 3.454.755 6.437.075 8.411-.966 1.099-.579 1.878-1.27 2.257-1.887l.356.113c.169.051.338.103.496.159.522.181 1.1.157 1.545-.068l.025-.013c.336-.177.577-.46.683-.803.285-.922-.528-1.432-1.018-1.74" />
            </svg>
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
