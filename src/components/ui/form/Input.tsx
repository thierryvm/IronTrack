'use client'

import React, { forwardRef, useId } from 'react'
import { cn } from '@/lib/utils'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
}

const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ 
    className, 
    type = 'text', 
    label, 
    description, 
    error, 
    required, 
    leftIcon, 
    rightIcon,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const inputId = id || props.name || generatedId
    const descriptionId = description ? `${inputId}-description` : undefined
    const errorId = error ? `${inputId}-error` : undefined

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={inputId}
            className={cn(
              'text-sm font-medium leading-none text-gray-900',
              'peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
            )}
          >
            {label}
            {required && (
              <span className="ml-1 text-red-500" aria-label="Champ obligatoire">
                *
              </span>
            )}
          </label>
        )}
        
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {leftIcon}
            </div>
          )}
          
          <input
            id={inputId}
            type={type}
            className={cn(
              // Base styles
              'flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2',
              'text-sm text-gray-900 placeholder:text-gray-500',
              'transition-colors duration-200',
              
              // Focus styles - WCAG AA compliant avec bordure fine
              'focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30',
              
              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
              
              // Error styles
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              
              // Icon padding
              leftIcon && 'pl-10',
              rightIcon && 'pr-10',
              
              className
            )}
            ref={ref}
            aria-describedby={cn(descriptionId, errorId)}
            aria-invalid={error ? 'true' : undefined}
            aria-required={required}
            {...props}
          />
          
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
              {rightIcon}
            </div>
          )}
        </div>

        {description && (
          <p 
            id={descriptionId}
            className="text-sm text-gray-600"
          >
            {description}
          </p>
        )}

        {error && (
          <p 
            id={errorId}
            className="text-sm font-medium text-red-600"
            role="alert"
            aria-live="polite"
          >
            {error}
          </p>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }