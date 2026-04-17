import * as React from 'react';

import { cn } from '@/lib/utils';

export type InputProps = React.InputHTMLAttributes<HTMLInputElement>;

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type = 'text', ...props }, ref) => {
    return (
      <input
        ref={ref}
        type={type}
        data-slot="input"
        className={cn(
          "flex w-full min-h-11 h-11 px-3.5 py-2.5",
          "font-[family-name:var(--font-sans)] text-sm leading-normal",
          "bg-[var(--color-background)] text-[var(--color-foreground)]",
          "border border-[var(--color-input)] rounded-[var(--radius-md)]",
          "shadow-[var(--shadow-1)]",
          "placeholder:text-[var(--color-muted-foreground)]/70",
          "transition-[border-color,box-shadow] duration-150",
          "[transition-timing-function:var(--ease-standard)]",
          "hover:border-[var(--color-foreground)]/40",
          "focus-visible:outline-none",
          "focus-visible:border-[var(--color-ring)]",
          "focus-visible:ring-2 focus-visible:ring-[var(--color-ring)]/30",
          "disabled:cursor-not-allowed disabled:opacity-50",
          "aria-[invalid=true]:border-[var(--color-destructive)]",
          "aria-[invalid=true]:focus-visible:ring-[var(--color-destructive)]/30",
          "file:border-0 file:bg-transparent file:text-sm file:font-medium",
          "file:text-[var(--color-foreground)]",
          className
        )}
        {...props}
      />
    );
  }
);
Input.displayName = 'Input';

export { Input };
