'use client';

interface ManaTextProps {
  text: string;
  className?: string;
}

export function ManaText({ text, className = '' }: ManaTextProps) {
  // 将文本中的法术力符号转换为 <i> 标签
  const processedText = text.replace(/\{([^}]+)\}/g, (match, symbol) => {
    // 处理混合法术力，如 {W/P}
    if (symbol.includes('/')) {
      const [color1, color2] = symbol.split('/');
      return `<i class="ms ms-cost ms-${color1.toLowerCase()}${color2.toLowerCase()} align-text-bottom"></i>`;
    }
    // 处理普通法术力
    return `<i class="ms ms-cost ms-${symbol.toLowerCase()} align-text-bottom"></i>`;
  });

  return (
    <span 
      className={`inline ${className}`}
      dangerouslySetInnerHTML={{ __html: processedText }}
    />
  );
} 