import * as React from 'react'

import { Button, type ButtonProps } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export type ActionButtonTone = 'primary' | 'secondary' | 'icon'

export interface ActionButtonProps extends ButtonProps {
  tone?: ActionButtonTone
}

const toneClasses: Record<ActionButtonTone, string> = {
  primary:
    'border border-primary/20 bg-primary text-primary-foreground shadow-[0_14px_30px_rgba(234,88,12,0.24)] hover:border-primary/30 hover:bg-primary-hover',
  secondary:
    'border border-border bg-card/88 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:border-primary/15 hover:bg-accent',
  icon:
    'size-11 border border-border bg-card/88 px-0 text-foreground shadow-[0_8px_24px_rgba(0,0,0,0.14)] hover:border-primary/15 hover:bg-accent',
}

export default function ActionButton({
  tone = 'secondary',
  className,
  size,
  ...props
}: ActionButtonProps) {
  return (
    <Button
      size={tone === 'icon' ? 'icon' : size}
      variant={tone === 'primary' ? 'default' : 'outline'}
      className={cn(
        'min-h-[44px] rounded-[18px] font-semibold tracking-[-0.01em] touch-manipulation [&_[data-icon="inline-end"]]:ml-auto [&_[data-icon="inline-start"]]:mr-0.5',
        toneClasses[tone],
        className,
      )}
      {...props}
    />
  )
}
