'use client'

import { forwardRef, InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

export interface Input2025Props extends InputHTMLAttributes<HTMLInputElement> {
  variant?: 'default' | 'ghost' | 'filled'
  inputSize?: 'sm' | 'md' | 'lg'
  isError?: boolean
  isSuccess?: boolean
}

const Input2025 = forwardRef<HTMLInputElement, Input2025Props>(
  ({ className, variant = 'default', inputSize = 'md', isError, isSuccess, type, ...props }, ref) => {
    return (
      <input
        type={type}
        className={cn(
          // Base styles
          'flex w-full rounded-lg border transition-colors duration-200',
          'file:border-0 file:bg-transparent file:text-sm file:font-medium',
          'placeholder:text-gray-400',
          'focus:outline-none focus:ring-2 focus:ring-offset-0',
          'disabled:cursor-not-allowed disabled:opacity-50',
          
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
          
          // Sizes
          {
            'px-3 py-2 text-sm': inputSize === 'sm',
            'px-4 py-3 text-base': inputSize === 'md',
            'px-5 py-4 text-lg': inputSize === 'lg',
          },
          
          className
        )}
        ref={ref}
        {...props}
      />
    )
  }
)
Input2025.displayName = 'Input2025'

export { Input2025 }