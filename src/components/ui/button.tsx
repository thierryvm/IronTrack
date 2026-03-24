import * as React from"react"
import { Slot} from"@radix-ui/react-slot"
import { cva, type VariantProps} from"class-variance-authority"
import { Loader2} from"lucide-react"
// MotionWrapper supprimé pour éviter erreurs Framer Motion

import { cn} from"@/lib/utils"

const buttonVariants = cva(
"inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
 {
 variants: {
 variant: {
 default:"bg-primary text-primary-foreground hover:bg-primary-hover shadow-button",
 secondary:"bg-secondary text-secondary-foreground hover:bg-secondary-hover shadow-button",
 destructive:"bg-destructive text-destructive-foreground hover:bg-destructive-hover shadow-button",
  outline: "border border-border bg-transparent hover:bg-accent hover:text-accent-foreground shadow-sm",
 overlay:"bg-black/10 text-white border border-white/30 backdrop-blur-sm hover:bg-black/20 hover:border-white/40 shadow-button",
 ghost:"hover:bg-accent hover:text-accent-foreground",
 success:"bg-success text-success-foreground hover:bg-success-hover shadow-button",
 warning:"bg-warning text-warning-foreground hover:bg-warning-hover shadow-button",
 orange:"bg-primary text-primary-foreground hover:bg-primary-hover shadow-button",
 link:"text-foreground underline-offset-4 hover:underline",
},
  size: {
  sm:"h-10 px-2 py-2 text-sm",
  default:"h-12 px-4 py-2 text-base",
  md:"h-12 px-4 py-2 text-base",
 lg:"h-14 px-6 py-2 text-lg",
 xl:"h-16 px-8 py-4 text-xl",
 icon:"h-11 w-11",
},
},
 defaultVariants: {
 variant:"default",
 size:"default",
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
 ({ className, variant, size, asChild = false, loading = false, icon, fullWidth = false, children, disabled, ...props}, ref) => {
 const Comp = asChild ? Slot :"button"
 
 return (
 <Comp
 className={cn(
 buttonVariants({ variant, size, className}),
 fullWidth &&'w-full'
 )}
 ref={ref}
 disabled={disabled || loading}
 {...props}
 >
{loading ? (
 <span className="flex items-center">
 <Loader2 className="h-6 w-6 animate-spin" />
 {children &&"Chargement..."}
 </span>
 ) : (
 <span className="contents">
 {icon}
 {children}
 </span>
 )}
 </Comp>
 )
}
)
Button.displayName ="Button"

export { Button, buttonVariants}
