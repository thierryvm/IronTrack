'use client';

import * as React from 'react';
import * as LabelPrimitive from '@radix-ui/react-label';

import { cn } from '@/lib/utils';

const Label = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof LabelPrimitive.Root>
>(({ className, ...props }, ref) => (
  <LabelPrimitive.Root
    ref={ref}
    data-slot="label"
    className={cn(
      "font-[family-name:var(--font-sans)]",
      "text-sm font-medium leading-none text-[var(--color-foreground)]",
      "select-none",
      "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
      "group-data-[disabled=true]:pointer-events-none",
      "group-data-[disabled=true]:opacity-50",
      className
    )}
    {...props}
  />
));
Label.displayName = LabelPrimitive.Root.displayName;

export { Label };
