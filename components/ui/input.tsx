interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
}

export function Input({ label, error, className, readOnly, ...props }: InputProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[--component-foreground]">
          {label}
        </label>
      )}
      <input
        className={`
          w-full rounded-md border border-[--border] bg-[--component-background] px-3 py-2 text-sm text-[--component-foreground]
          placeholder:text-[--component-foreground-muted]
          focus:border-[--primary] focus:outline-none focus:ring-1 focus:ring-[--primary]
          disabled:cursor-not-allowed disabled:opacity-50
          ${readOnly ? 'focus:ring-0 focus:border-[--border] cursor-default' : ''}
          ${className}
        `}
        readOnly={readOnly}
        {...props}
      />
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 