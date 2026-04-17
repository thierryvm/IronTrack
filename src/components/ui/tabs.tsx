'use client';

import * as React from 'react';
import * as TabsPrimitive from '@radix-ui/react-tabs';

import { cn } from '@/lib/utils';

const Tabs = TabsPrimitive.Root;

const TabsList = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.List>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.List>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.List
    ref={ref}
    data-slot="tabs-list"
    className={cn(
      "inline-flex items-center gap-1",
      "p-1 rounded-[var(--radius-md)]",
      "bg-[var(--color-muted)] border border-[var(--color-border)]",
      "text-[var(--color-muted-foreground)]",
      className
    )}
    {...props}
  />
));
TabsList.displayName = TabsPrimitive.List.displayName;

const TabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Trigger>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Trigger>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Trigger
    ref={ref}
    data-slot="tabs-trigger"
    className={cn(
      "inline-flex items-center justify-center gap-1.5",
      "px-3.5 h-8 min-h-8",
      "rounded-[var(--radius-sm)]",
      "font-[family-name:var(--font-sans)] text-sm font-medium whitespace-nowrap",
      "transition-all duration-150",
      "[transition-timing-function:var(--ease-standard)]",
      "text-[var(--color-muted-foreground)]",
      "hover:text-[var(--color-foreground)]",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-[var(--color-ring)]/40",
      "disabled:pointer-events-none disabled:opacity-50",
      "data-[state=active]:bg-[var(--color-background)]",
      "data-[state=active]:text-[var(--color-foreground)]",
      "data-[state=active]:shadow-[var(--shadow-1)]",
      "data-[state=active]:border data-[state=active]:border-[var(--color-border)]",
      "cursor-pointer",
      "[&_svg]:size-4 [&_svg]:shrink-0",
      className
    )}
    {...props}
  />
));
TabsTrigger.displayName = TabsPrimitive.Trigger.displayName;

const TabsContent = React.forwardRef<
  React.ElementRef<typeof TabsPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof TabsPrimitive.Content>
>(({ className, ...props }, ref) => (
  <TabsPrimitive.Content
    ref={ref}
    data-slot="tabs-content"
    className={cn(
      "mt-4",
      "focus-visible:outline-none focus-visible:ring-2",
      "focus-visible:ring-[var(--color-ring)]/40",
      "rounded-[var(--radius-md)]",
      className
    )}
    {...props}
  />
));
TabsContent.displayName = TabsPrimitive.Content.displayName;

export { Tabs, TabsList, TabsTrigger, TabsContent };
