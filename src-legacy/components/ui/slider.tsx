'use client'

import React from 'react'
import { cn } from '@/lib/utils'

interface SliderProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'value' | 'onChange'> {
  value: number[]
  onValueChange: (value: number[]) => void
  max?: number
  min?: number
  step?: number
}

export function Slider({
  value,
  onValueChange,
  max = 100,
  min = 0,
  step = 1,
  className,
  ...props
}: SliderProps) {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = Number(event.target.value)
    onValueChange([newValue])
  }

  const percent = ((value[0] ?? min) - min) / (max - min) * 100

  return (
    <div className={cn('relative flex items-center select-none touch-none w-full', className)}>
      <div className="relative w-full h-6 flex items-center">
        {/* Track background */}
        <div className="absolute w-full h-2 rounded-full bg-secondary overflow-hidden">
          {/* Filled track */}
          <div
            className="h-full bg-primary rounded-full"
            style={{ width: `${percent}%` }}
          />
        </div>
        {/* Input range (invisible, handles interactions) */}
        <input
          type="range"
          min={min}
          max={max}
          step={step}
          value={value[0] ?? min}
          onChange={handleChange}
          className="absolute w-full opacity-0 h-6 cursor-pointer disabled:pointer-events-none disabled:opacity-50"
          {...props}
        />
        {/* Thumb */}
        <div
          className="absolute w-6 h-6 bg-primary border-[3px] border-white dark:border-white rounded-full shadow-md pointer-events-none transition-transform"
          style={{ left: `calc(${percent}% - 12px)` }}
        />
      </div>
    </div>
  )
}
