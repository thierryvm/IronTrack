'use client'

import * as React from 'react'
import { Loader2 } from 'lucide-react'
import { Button as ShadcnButton } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { cva } from 'class-variance-authority'

// 🎯 MIGRATION ULTRAHARDCORE: Button2025 → CHADCN optimisé
// Combine CHADCN base + fonctionnalités IronTrack custom

const ironTrackButtonVariants = cva(
  '', // Base vide, on utilise CHADCN comme base
  {
    variants: {
      variant: {
        // Hérite de CHADCN variants de base
        default: '',
        destructive: '',
        outline: '',
        secondary: '',
        ghost: '',
        link: '',
        // Ajout variant custom IronTrack
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white shadow-xs hover:from-green-600 hover:to-green-700 focus-visible:ring-green-500/20',
        // Override default avec gradient IronTrack
        'iron-primary': 'bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white shadow-xs hover:from-orange-700 hover:to-orange-800 focus-visible:ring-orange-500/20',
      },
      size: {
        default: '',
        sm: '',
        lg: '',
        icon: '',
        // Ajout tailles custom IronTrack
        md: 'h-11 px-5 py-3',
        xl: 'h-14 px-8 py-4 text-lg',
      },
      fullWidth: {
        true: 'w-full',
        false: '',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      fullWidth: false,
    },
  }
)

export interface ButtonMigratedProps
  extends Omit<React.ComponentProps<typeof ShadcnButton>, 'variant' | 'size'> {
  variant?: 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' | 'success' | 'iron-primary'
  size?: 'default' | 'sm' | 'lg' | 'icon' | 'md' | 'xl'
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

/**
 * 🚀 Button Migré CHADCN + IronTrack
 * 
 * FONCTIONNALITÉS HÉRITÉES:
 * ✅ Toutes variants CHADCN (accessibility, focus, etc.)
 * ✅ Loading state avec spinner
 * ✅ Icon support intégré  
 * ✅ fullWidth responsive
 * ✅ Gradient IronTrack (brand identity)
 * ✅ Variant success custom
 * ✅ WCAG 2.1 AA compliance
 * ✅ Mobile touch targets optimisés
 */
const ButtonMigrated = React.forwardRef<HTMLButtonElement, ButtonMigratedProps>(
  ({ 
    className, 
    variant, 
    size, 
    loading = false, 
    icon, 
    fullWidth = false, 
    children, 
    disabled, 
    ...props 
  }, ref) => {
    
    // Map variants IronTrack vers CHADCN
    const getShadcnVariant = () => {
      switch (variant) {
        case 'success':
        case 'iron-primary':
          return 'default' // On override le style avec nos classes custom
        default:
          return variant
      }
    }

    // Classes custom pour variants IronTrack
    const getCustomClasses = () => {
      const customVariant = ironTrackButtonVariants({ 
        variant, 
        size: size === 'md' || size === 'xl' ? size : undefined,
        fullWidth 
      })
      
      return cn(
        customVariant,
        // Override CHADCN pour variants custom
        {
          // Success gradient
          'bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 focus-visible:ring-green-500/20': variant === 'success',
          // IronTrack primary gradient  
          'bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 hover:from-orange-700 hover:to-orange-800 focus-visible:ring-orange-500/20': variant === 'iron-primary',
          // Loading state
          'opacity-50 cursor-not-allowed': loading,
        }
      )
    }

    return (
      <ShadcnButton
        ref={ref}
        variant={getShadcnVariant()}
        size={size === 'md' || size === 'xl' ? 'default' : size}
        className={cn(getCustomClasses(), className)}
        disabled={disabled || loading}
        {...props}
      >
        {/* Loading Spinner - WCAG compliant */}
        {loading && (
          <Loader2 
            className="h-6 w-6 animate-spin" 
            aria-hidden="true"
          />
        )}
        
        {/* Icon - Support accessibilité */}
        {icon && !loading && (
          <span className="shrink-0" aria-hidden="true">
            {icon}
          </span>
        )}
        
        {/* Children content */}
        <span className={cn(loading && 'opacity-0')}>
          {children}
        </span>
        
        {/* Screen reader loading state */}
        {loading && (
          <span className="sr-only">Chargement en cours...</span>
        )}
      </ShadcnButton>
    )
  }
)

ButtonMigrated.displayName = 'ButtonMigrated'

export { ButtonMigrated, ironTrackButtonVariants }