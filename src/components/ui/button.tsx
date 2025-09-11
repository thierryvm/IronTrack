import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"
import { Loader2 } from "lucide-react"
// MotionWrapper supprimé pour éviter erreurs Framer Motion

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
  {
    variants: {
      variant: {
        // BOUTON PRIMAIRE - Actions principales (WCAG AAA)
        default: "bg-slate-800 dark:bg-slate-700 text-white hover:bg-slate-900 dark:hover:bg-slate-600 shadow-md hover:shadow-lg",
        // BOUTON SECONDAIRE - Actions secondaires (WCAG AAA)
        secondary: "bg-white dark:bg-slate-800 text-slate-800 dark:text-white border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md",
        // BOUTON DANGER
        destructive: "bg-red-600 dark:bg-red-700 text-white hover:bg-red-700 dark:hover:bg-red-600 shadow-md hover:shadow-lg",
        // BOUTON OUTLINE - Adaptatif thème (WCAG AA)
        outline: "border border-gray-300 dark:border-gray-600 bg-white dark:bg-slate-800 text-gray-900 dark:text-white hover:bg-gray-50 dark:hover:bg-slate-700 shadow-sm hover:shadow-md",
        // BOUTON OVERLAY - Pour modals avec fond sombre
        overlay: "bg-white/10 text-white border border-white/30 backdrop-blur-sm hover:bg-white/20 hover:border-white/40 shadow-sm hover:shadow-md",
        // BOUTON GHOST
        ghost: "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100",
        // BOUTON SUCCÈS
        success: "bg-green-600 dark:bg-green-700 text-white hover:bg-green-700 dark:hover:bg-green-600 shadow-md hover:shadow-lg",
        // BOUTON ORANGE - Actions principales IronTrack
        orange: "bg-orange-600 dark:bg-orange-600 text-white hover:bg-orange-700 dark:hover:bg-orange-700 shadow-md hover:shadow-lg",
        // BOUTON LIEN
        link: "text-slate-800 dark:text-slate-300 underline-offset-4 hover:underline",
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
            <Loader2 className="h-6 w-6 animate-spin" />
            {children && "Chargement..."}
          </>
        ) : (
          <>
            {icon}
            {children}
          </>
        )}
      </Comp>
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
