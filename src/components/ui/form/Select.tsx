'use client'

import React, { forwardRef, useId } from 'react'
import { ChevronDown } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string
  description?: string
  error?: string
  required?: boolean
  placeholder?: string
  options: Array<{
    value: string | number
    label: string
    disabled?: boolean
  }>
}

const Select = forwardRef<HTMLSelectElement, SelectProps>(
  ({ 
    className, 
    label, 
    description, 
    error, 
    required, 
    placeholder,
    options,
    id,
    ...props 
  }, ref) => {
    const generatedId = useId()
    const selectId = id || props.name || generatedId
    const descriptionId = description ? `${selectId}-description` : undefined
    const errorId = error ? `${selectId}-error` : undefined

    return (
      <div className="space-y-2">
        {label && (
          <label 
            htmlFor={selectId}
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
          <select
            id={selectId}
            className={cn(
              // Base styles
              'flex h-12 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 pr-10',
              'text-sm text-gray-900',
              'transition-colors duration-200',
              'appearance-none cursor-pointer',
              
              // Focus styles - WCAG AA compliant
              'focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500/30',
              
              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50 disabled:bg-gray-50',
              
              // Error styles
              error && 'border-red-500 focus:border-red-500 focus:ring-red-500/20',
              
              // Placeholder styles
              'invalid:text-gray-500',
              
              className
            )}
            ref={ref}
            aria-describedby={cn(descriptionId, errorId)}
            aria-invalid={error ? 'true' : undefined}
            aria-required={required}
            {...props}
          >
            {placeholder && (
              <option value="" disabled>
                {placeholder}
              </option>
            )}
            {options.map((option) => (
              <option
                key={option.value}
                value={option.value}
                disabled={option.disabled}
              >
                {option.label}
              </option>
            ))}
          </select>
          
          {/* Icône chevron personnalisée */}
          <ChevronDown className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400 pointer-events-none" />
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

Select.displayName = 'Select'

export { Select }