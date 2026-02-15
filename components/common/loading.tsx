interface LoadingProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  text?: string;
}

export function Loading({ className, size = "md", text }: LoadingProps) {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-4",
    lg: "w-12 h-12 border-4",
  };

  return (
    <div className={`flex flex-col items-center justify-center p-8 space-y-4 ${className || ''}`}>
      <div
        className={`animate-spin rounded-full border-[--muted] border-t-[--primary] ${sizeClasses[size]}`}
      />
      {text && (
        <p className="text-sm text-[--muted-foreground] animate-pulse">
          {text}
        </p>
      )}
    </div>
  );
}

