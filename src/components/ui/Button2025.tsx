'use client'

import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { motion } from 'framer-motion'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        // Bouton principal - Style IronTrack
        default: 'bg-gradient-to-r from-orange-600 to-orange-700 text-white hover:from-orange-600 hover:to-orange-700 focus:from-orange-600 focus:to-orange-700 shadow-md hover:shadow-lg',
        // Bouton secondaire
        secondary: 'bg-gray-100 text-gray-700 hover:bg-gray-200 focus:bg-gray-200',
        // Bouton danger
        destructive: 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg',
        // Bouton contour
        outline: 'border border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50 hover:border-gray-400',
        // Bouton ghost
        ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
        // Bouton succès
        success: 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg',
        // Bouton lien
        link: 'text-orange-800 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 px-3 py-2 text-xs',
        default: 'h-10 px-4 py-2',
        md: 'h-11 px-5 py-3',
        lg: 'h-12 px-6 py-3 text-base',
        xl: 'h-14 px-8 py-4 text-lg',
        icon: 'h-10 w-10',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
    },
  }
)

export interface Button2025Props
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button2025 = React.forwardRef<HTMLButtonElement, Button2025Props>(
  ({ className, variant, size, asChild = false, loading = false, icon, fullWidth = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    
    return (
      <motion.div
        whileHover={{ scale: disabled || loading ? 1 : 1.02 }}
        whileTap={{ scale: disabled || loading ? 1 : 0.98 }}
        className={fullWidth ? 'w-full' : 'w-auto'}
      >
        <Comp
          className={cn(
            buttonVariants({ variant, size, className }),
            fullWidth && 'w-full'
          )}
          ref={ref}
          disabled={disabled || loading}
          {...props}
        >
          {loading ? (
            <>
              <Loader2 className="h-4 w-4 animate-spin" />
              {children && <span>Chargement...</span>}
            </>
          ) : (
            <>
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {children}
            </>
          )}
        </Comp>
      </motion.div>
    )
  }
)
Button2025.displayName = 'Button2025'

export { Button2025, buttonVariants }