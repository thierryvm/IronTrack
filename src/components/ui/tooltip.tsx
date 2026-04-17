'use client';

import * as React from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

import { cn } from '@/lib/utils';

const TooltipProvider = TooltipPrimitive.Provider;
const Tooltip = TooltipPrimitive.Root;
const TooltipTrigger = TooltipPrimitive.Trigger;

const TooltipContent = React.forwardRef<
  React.ElementRef<typeof TooltipPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TooltipPrimitive.Content>
>(({ className, sideOffset = 6, children, ...props }, ref) => (
  <TooltipPrimitive.Portal>
    <TooltipPrimitive.Content
      ref={ref}
      sideOffset={sideOffset}
      data-slot="tooltip-content"
      className={cn(
        "z-50 overflow-hidden",
        "bg-[var(--color-ink)] text-[var(--color-chalk)]",
        "dark:bg-[var(--color-chalk)] dark:text-[var(--color-ink)]",
        "rounded-[var(--radius-sm)] shadow-[var(--shadow-2)]",
        "px-2.5 py-1.5",
        "text-xs font-medium leading-none",
        "font-[family-name:var(--font-sans)]",
        "max-w-[260px]",
        "data-[state=delayed-open]:animate-in data-[state=closed]:animate-out",
        "data-[state=delayed-open]:fade-in-0 data-[state=closed]:fade-out-0",
        "data-[state=delayed-open]:zoom-in-95 data-[state=closed]:zoom-out-95",
        "data-[side=bottom]:slide-in-from-top-1",
        "data-[side=left]:slide-in-from-right-1",
        "data-[side=right]:slide-in-from-left-1",
        "data-[side=top]:slide-in-from-bottom-1",
        className
      )}
      {...props}
    >
      {children}
      <TooltipPrimitive.Arrow className="fill-[var(--color-ink)] dark:fill-[var(--color-chalk)]" />
    </TooltipPrimitive.Content>
  </TooltipPrimitive.Portal>
));
TooltipContent.displayName = TooltipPrimitive.Content.displayName;

export { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider };
