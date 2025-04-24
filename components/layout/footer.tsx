export function Footer() {
  const currentYear = new Date().getFullYear();
  const startYear = 2024;
  const yearDisplay = startYear === currentYear ? currentYear : `${startYear}-${currentYear}`;
  
  const icpNumber = process.env.NEXT_PUBLIC_ICP_NUMBER || "测试备00000000号-1";
  
  return (
    <footer className="border-t border-[--table-border] bg-[--background]">
      <div className="container mx-auto px-4 py-4">
        <div className="text-xs text-[--foreground-muted] opacity-75 flex flex-wrap items-center gap-x-2 gap-y-2">
          <div className="flex items-center gap-1">
            轮抽数据来源于 <a href="https://www.17lands.com" target="_blank" rel="noopener noreferrer" className="hover:text-[--foreground] transition-colors">17Lands</a>
          </div>
          <div className="w-px h-3 bg-[--border]" />
          <div className="flex items-center gap-1">
            中文数据来源于 <a href="https://www.sbwsz.com" target="_blank" rel="noopener noreferrer" className="hover:text-[--foreground] transition-colors">大学院废墟</a>
          </div>
          <div className="w-px h-3 bg-[--border]" />
          <div className="flex items-center gap-1">
            <a href="http://beian.miit.gov.cn/" target="_blank" rel="noopener noreferrer" className="hover:text-[--foreground] transition-colors">{icpNumber}</a>
          </div>
        </div>
        <div className="text-xs text-[--foreground-muted] opacity-75 mt-2">
          © {yearDisplay} 十七地 · 万智牌<sup>®</sup>是美国海滨之巫师有限责任公司的注册商标。除另有注明外，万智牌图片和文本均归其版权所有。
        </div>
      </div>
    </footer>
  );
} 