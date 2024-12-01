interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'icon';
}

export function Button({
  variant = 'primary',
  size = 'md',
  className,
  ...props
}: ButtonProps) {
  const baseStyles = 'inline-flex items-center justify-center rounded-md font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[--primary]';
  
  const variants = {
    primary: 'bg-[--primary] text-[--primary-foreground] hover:brightness-110 active:scale-[0.98]',
    secondary: 'bg-[--background-subtle] text-[--foreground] hover:brightness-95 active:scale-[0.98]',
    ghost: 'bg-transparent text-[--foreground-muted] hover:bg-[--background-subtle] hover:text-[--foreground] active:scale-[0.98]'
  };

  const sizes = {
    sm: 'h-8 px-3 text-sm',
    md: 'h-10 px-4 text-sm',
    lg: 'h-12 px-6 text-base',
    icon: 'h-9 w-9 p-0'
  };

  return (
    <button
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      {...props}
    />
  );
} 