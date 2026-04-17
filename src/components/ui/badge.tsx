import * as React from 'react';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const badgeVariants = cva(
  [
    "inline-flex items-center justify-center gap-1.5",
    "px-2.5 py-1 rounded-[var(--radius-sm)]",
    "text-[11px] leading-none font-medium",
    "font-[family-name:var(--font-mono)]",
    "uppercase tracking-[0.12em]",
    "border border-transparent",
    "transition-colors duration-150",
    "whitespace-nowrap",
    "[&_svg]:size-3 [&_svg]:shrink-0",
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-muted)] text-[var(--color-foreground)]",
          "border-[var(--color-border)]",
        ].join(' '),
        brand: [
          "bg-[var(--color-brand)] text-white",
          "shadow-[var(--shadow-1)]",
        ].join(' '),
        acid: [
          "bg-[var(--color-acid)] text-[var(--color-ink)]",
        ].join(' '),
        pulse: [
          "bg-[var(--color-pulse)] text-white",
        ].join(' '),
        outline: [
          "bg-transparent text-[var(--color-foreground)]",
          "border-[var(--color-border)]",
        ].join(' '),
        secondary: [
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
          "border-[var(--color-border)]",
        ].join(' '),
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <span
      data-slot="badge"
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    />
  );
}

export { Badge, badgeVariants };
