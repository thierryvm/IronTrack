import * as React from "react"
import { cn } from "@/lib/utils"

interface InputGlassmorphismProps extends React.ComponentProps<"input"> {
  icon?: React.ReactNode;
}

/**
 * Composant Input spécialisé pour les formulaires d'authentification avec effet glassmorphism.
 * Évite les conflits avec les styles shadcn/ui par défaut.
 */
const InputGlassmorphism = React.forwardRef<HTMLInputElement, InputGlassmorphismProps>(
  ({ className, type, icon, ...props }, ref) => {
    return (
      <div className="relative">
        {icon && (
          <div className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 pointer-events-none">
            {icon}
          </div>
        )}
        <input
          type={type}
          className={cn(
            // Reset des styles par défaut
            "w-full rounded-xl transition-all focus:outline-none",
            
            // Padding adaptatif selon présence d'icône
            icon ? "pl-12 pr-4 py-3" : "px-4 py-3",
            
            // Styles glassmorphism adaptatifs
            "bg-background/10 dark:bg-white/10",
            "backdrop-blur-md", 
            "border border-foreground/20",
            "text-foreground",
            
            // Placeholder adaptatif
            "placeholder:text-muted-foreground",
            
            // Focus state adaptatif
            "focus:bg-background/20 dark:focus:bg-white/15",
            "focus:border-foreground/30",
            "focus:[box-shadow:0_0_0_2px_rgba(249,115,22,0.3)!important]",
            
            // État disabled
            "disabled:opacity-50 disabled:cursor-not-allowed disabled:pointer-events-none",
            
            className
          )}
          ref={ref}
          {...props}
        />
      </div>
    )
  }
)
InputGlassmorphism.displayName = "InputGlassmorphism"

export { InputGlassmorphism }