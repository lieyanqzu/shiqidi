interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  options: {
    label: string;
    value: string;
  }[];
}

export function Select({ 
  label, 
  error, 
  options,
  className, 
  ...props 
}: SelectProps) {
  return (
    <div className="space-y-2">
      {label && (
        <label className="text-sm font-medium text-[--component-foreground]">
          {label}
        </label>
      )}
      <div className="relative">
        <select
          className={`
            w-full rounded-md border border-[--border] bg-[--component-background] px-3 pr-10 py-2 text-sm text-[--component-foreground]
            appearance-none
            focus:border-[--primary] focus:outline-none focus:ring-1 focus:ring-[--primary]
            disabled:cursor-not-allowed disabled:opacity-50
            ${className}
          `}
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value} className="bg-[--component-background]">
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg className="h-4 w-4 fill-current text-[--component-foreground-muted]" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      {error && (
        <p className="text-sm text-red-500">{error}</p>
      )}
    </div>
  );
} 