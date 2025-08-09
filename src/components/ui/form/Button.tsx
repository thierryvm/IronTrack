'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'destructive'
  size?: 'sm' | 'md' | 'lg'
  loading?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({
    className,
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon,
    rightIcon,
    children,
    disabled,
    ...props
  }, ref) => {
    const isDisabled = disabled || loading

    return (
      <button
        className={cn(
          // Base styles
          'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
          'transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2',
          'disabled:pointer-events-none disabled:opacity-50',
          
          // Variant styles
          {
            // Primary - Orange IronTrack
            'bg-orange-600 text-white hover:bg-orange-700 focus:ring-orange-500/20': 
              variant === 'primary',
            
            // Secondary - Gray
            'bg-gray-100 text-gray-900 hover:bg-gray-200 focus:ring-gray-500/20': 
              variant === 'secondary',
            
            // Outline
            'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50 focus:ring-gray-500/20': 
              variant === 'outline',
            
            // Ghost
            'text-gray-700 hover:bg-gray-100 focus:ring-gray-500/20': 
              variant === 'ghost',
            
            // Destructive - Red
            'bg-red-500 text-white hover:bg-red-600 focus:ring-red-500/20': 
              variant === 'destructive',
          },
          
          // Size styles
          {
            'h-8 px-3 text-sm': size === 'sm',
            'h-10 px-4 text-sm': size === 'md',
            'h-12 px-6 text-base': size === 'lg',
          },
          
          className
        )}
        disabled={isDisabled}
        ref={ref}
        {...props}
      >
        {loading && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}
        {!loading && leftIcon && leftIcon}
        
        {children}
        
        {!loading && rightIcon && rightIcon}
      </button>
    )
  }
)

Button.displayName = 'Button'

export { Button }