'use client'

import React, { forwardRef } from 'react'
import { cn } from '@/lib/utils'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  resize?: boolean
}

const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    required, 
    resize = true,
    id,
    ...props 
  }, ref) => {
    const textareaId = id || props.name || 'textarea'
    const descriptionId = description ? `${textareaId}-description` : undefined
    const errorId = error ? `${textareaId}-error` : undefined

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={textareaId}
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
        
        <textarea
          id={textareaId}
          className={cn(
            // Base styles
            'flex min-h-[80px] w-full rounded-lg border border-gray-300 bg-white px-3 py-2',
            'text-sm text-gray-900 placeholder:text-gray-500',
            'transition-colors duration-200',
            
            // Focus styles - WCAG AA compliant
            'focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30',
            
            // Disabled styles
            'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
            
            // Error styles
            error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
            
            // Resize control
            !resize && 'resize-none',
            
            className
          )}
          ref={ref}
          aria-describedby={cn(descriptionId, errorId)}
          aria-invalid={error ? 'true' : undefined}
          aria-required={required}
          {...props}
        />

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

Textarea.displayName = 'Textarea'

export { Textarea }