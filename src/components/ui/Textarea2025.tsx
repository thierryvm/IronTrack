'use client'

import * as React from 'react'
import { cn } from '@/lib/utils'

export interface Textarea2025Props
  extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  variant?: 'default' | 'ghost' | 'filled'
  isError?: boolean
  isSuccess?: boolean
  autoResize?: boolean
}

const Textarea2025 = React.forwardRef<HTMLTextAreaElement, Textarea2025Props>(
  ({ className, variant = 'default', isError, isSuccess, autoResize = false, onChange, ...props }, ref) => {
    const textareaRef = React.useRef<HTMLTextAreaElement>(null)
    
    // Auto-resize functionality
    const handleChange = React.useCallback((e: React.ChangeEvent<HTMLTextAreaElement>) => {
      if (autoResize && textareaRef.current) {
        textareaRef.current.style.height = 'auto'
        textareaRef.current.style.height = `${textareaRef.current.scrollHeight}px`
      }
      onChange?.(e)
    }, [autoResize, onChange])

    React.useImperativeHandle(ref, () => textareaRef.current!, [])

    return (
      <textarea
        className={cn(
          // Base styles
          'flex min-h-[80px] w-full rounded-lg border px-4 py-3 text-base transition-colors duration-200',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          'resize-none', // Disable manual resize if auto-resize is enabled
          
          // Variants
          {
            'border-gray-300 bg-white focus:border-orange-500 focus:ring-orange-500': 
              variant === 'default' && !isError && !isSuccess,
            'border-transparent bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-orange-500': 
              variant === 'ghost' && !isError && !isSuccess,
            'border-gray-200 bg-gray-50 focus:border-orange-500 focus:ring-orange-500': 
              variant === 'filled' && !isError && !isSuccess,
          },
          
          // States
          {
            'border-red-300 focus:border-red-500 focus:ring-red-500': isError,
            'border-green-300 focus:border-green-500 focus:ring-green-500': isSuccess,
          },
          
          // Auto-resize
          {
            'resize-y': !autoResize,
          },
          
          className
        )}
        ref={textareaRef}
        onChange={handleChange}
        {...props}
      />
    )
  }
)
Textarea2025.displayName = 'Textarea2025'

export { Textarea2025 }