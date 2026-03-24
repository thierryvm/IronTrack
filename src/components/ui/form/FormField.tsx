'use client'

import React from'react'
import { cn} from'@/lib/utils'

interface FormFieldProps {
 children: React.ReactNode
 className?: string
}

interface FormLabelProps extends React.LabelHTMLAttributes<HTMLLabelElement> {
 children: React.ReactNode
 required?: boolean
 className?: string
}

interface FormControlProps {
 children: React.ReactNode
 className?: string
}

interface FormDescriptionProps extends React.HTMLAttributes<HTMLParagraphElement> {
 children: React.ReactNode
 className?: string
}

interface FormMessageProps extends React.HTMLAttributes<HTMLParagraphElement> {
 children?: React.ReactNode
 error?: boolean
 className?: string
}

// Composant principal FormField
export function FormField({ children, className}: FormFieldProps) {
 return (
 <div className={cn('space-y-2', className)}>
 {children}
 </div>
 )
}

// Label accessible avec indicateur requis
export function FormLabel({ children, required, className, ...props}: FormLabelProps) {
 return (
 <label 
 className={cn(
'text-sm font-medium leading-none text-foreground',
'peer-disabled:cursor-not-allowed peer-disabled:opacity-70',
 className
 )}
 {...props}
 >
 {children}
 {required && (
 <span 
 className="ml-1 text-safe-error" 
 aria-label="Champ obligatoire"
 >
 *
 </span>
 )}
 </label>
 )
}

// Container pour les contrôles de formulaire
export function FormControl({ children, className}: FormControlProps) {
 return (
 <div className={cn('relative', className)}>
 {children}
 </div>
 )
}

// Description d'aide accessible
export function FormDescription({ children, className, ...props}: FormDescriptionProps) {
 return (
 <p 
 className={cn('text-sm text-gray-600', className)}
 {...props}
 >
 {children}
 </p>
 )
}

// Message d'erreur ou de succès accessible
export function FormMessage({ children, error = false, className, ...props}: FormMessageProps) {
 if (!children) return null

 return (
 <p 
 className={cn(
'text-sm font-medium',
 error ?'text-red-600' :'text-green-600',
 className
 )}
 role={error ?'alert' :'status'}
 aria-live="polite"
 {...props}
 >
 {children}
 </p>
 )
}