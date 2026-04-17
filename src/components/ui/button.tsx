import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';

import { cn } from '@/lib/utils';

const buttonVariants = cva(
  [
    "inline-flex items-center justify-center gap-2 whitespace-nowrap",
    "font-[family-name:var(--font-sans)] font-medium text-sm",
    "transition-all duration-200 [transition-timing-function:var(--ease-standard)]",
    "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2",
    "focus-visible:[--tw-ring-color:var(--color-ring)] focus-visible:ring-[var(--color-ring)]",
    "focus-visible:ring-offset-[var(--color-background)]",
    "disabled:pointer-events-none disabled:opacity-50",
    "[&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
    "cursor-pointer select-none",
  ].join(' '),
  {
    variants: {
      variant: {
        default: [
          "bg-[var(--color-primary)] text-[var(--color-primary-foreground)]",
          "shadow-[var(--shadow-1)] hover:shadow-[var(--shadow-glow)]",
          "hover:bg-[var(--color-brand-hover)]",
          "active:bg-[var(--color-brand-deep)] active:shadow-[var(--shadow-1)]",
        ].join(' '),
        secondary: [
          "bg-[var(--color-secondary)] text-[var(--color-secondary-foreground)]",
          "border border-[var(--color-border)]",
          "hover:bg-[var(--color-accent)] hover:text-[var(--color-accent-foreground)]",
        ].join(' '),
        ghost: [
          "bg-transparent text-[var(--color-foreground)]",
          "hover:bg-[var(--color-muted)] hover:text-[var(--color-foreground)]",
        ].join(' '),
        outline: [
          "border border-[var(--color-border)] bg-transparent text-[var(--color-foreground)]",
          "hover:bg-[var(--color-muted)] hover:border-[var(--color-foreground)]",
        ].join(' '),
        destructive: [
          "bg-[var(--color-destructive)] text-[var(--color-destructive-foreground)]",
          "shadow-[var(--shadow-1)] hover:bg-[var(--color-destructive)]/90",
          "hover:shadow-[0_0_24px_rgba(255,61,61,0.35)]",
        ].join(' '),
        acid: [
          "bg-[var(--color-acid)] text-[var(--color-ink)]",
          "shadow-[var(--shadow-1)] hover:bg-[var(--color-acid-deep)] hover:text-[var(--color-ink)]",
          "hover:shadow-[0_0_24px_rgba(159,200,0,0.35)]",
        ].join(' '),
        link: [
          "bg-transparent text-[var(--color-primary)] underline-offset-4",
          "hover:underline hover:text-[var(--color-brand-hover)]",
          "h-auto p-0",
        ].join(' '),
      },
      size: {
        default: "h-11 min-h-11 px-5 py-2.5 rounded-[var(--radius-md)]",
        sm: "h-9 min-h-9 px-3 py-1.5 text-xs rounded-[var(--radius-sm)]",
        lg: "h-12 min-h-12 px-6 py-3 text-base rounded-[var(--radius-md)]",
        icon: "h-11 w-11 min-h-11 min-w-11 rounded-[var(--radius-md)]",
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button';
    return (
      <Comp
        ref={ref}
        data-slot="button"
        className={cn(buttonVariants({ variant, size, className }))}
        {...props}
      />
    );
  }
);
Button.displayName = 'Button';

export { Button, buttonVariants };
