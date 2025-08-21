import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { motion } from "framer-motion"
import { Loader2 } from "lucide-react"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // Bouton principal - Style IronTrack (comme page d'accueil)
        default: "bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white hover:from-orange-600 hover:to-red-600 focus:from-orange-600 focus:to-red-600 shadow-md hover:shadow-lg",
        // Bouton secondaire
        secondary: "bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700 focus:bg-gray-200 dark:bg-gray-700",
        // Bouton danger
        destructive: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 shadow-md hover:shadow-lg",
        // Bouton contour
        outline: "border border-gray-300 dark:border-gray-600 bg-transparent text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 hover:border-gray-400",
        // Bouton ghost
        ghost: "text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:bg-gray-800 hover:text-gray-900 dark:text-gray-100",
        // Bouton succès
        success: "bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 shadow-md hover:shadow-lg",
        // Bouton lien
        link: "text-orange-800 dark:text-orange-300 underline-offset-4 hover:underline",
      },
      size: {
        sm: "h-10 px-3 py-2 text-xs",     // 40px minimum
        default: "h-11 px-4 py-2",        // 44px conforme WCAG
        md: "h-12 px-5 py-3",            // 48px recommandé
        lg: "h-14 px-6 py-3 text-base",  // 56px optimal
        xl: "h-16 px-8 py-4 text-lg",    // 64px large
        icon: "h-11 w-11",               // 44px conforme WCAG
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
  icon?: React.ReactNode
  fullWidth?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, icon, fullWidth = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    
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
            <span className="flex items-center gap-2">
              <Loader2 className="h-6 w-6 animate-spin" />
              {children && <span>Chargement...</span>}
            </span>
          ) : (
            <span className="flex items-center gap-2">
              {icon && <span className="flex-shrink-0">{icon}</span>}
              {children}
            </span>
          )}
        </Comp>
      </motion.div>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
