import * as React from"react"
import { cn} from"@/lib/utils"

interface InputGlassmorphismProps extends React.ComponentProps<"input"> {
 icon?: React.ReactNode;
}

/**
 * Composant Input spécialisé pour les formulaires d'authentification avec effet glassmorphism.
 * Évite les conflits avec les styles shadcn/ui par défaut.
 */
const InputGlassmorphism = React.forwardRef<HTMLInputElement, InputGlassmorphismProps>(
 ({ className, type, icon, ...props}, ref) => {
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
"auth-input w-full rounded-xl transition-all focus:outline-none",
 
 // Resizing adaptatif selon présence d'icône avec hauteur tactile compacte sur mobile
 icon ?"pl-12 pr-4 h-11 sm:h-12" :"px-4 h-11 sm:h-12",
 
 // Styles dark premium lisibles, y compris avec autofill
"bg-[#16181f]",
"backdrop-blur-xl", 
"border border-white/10",
"text-foreground",
"shadow-sm",
 
 // Placeholder adaptatif
"placeholder:text-muted-foreground",
 
 // Focus state adaptatif
"focus:bg-[#1b1e27]",
"focus:border-primary/50",
"focus:ring-4 focus:ring-primary/10",
 
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
InputGlassmorphism.displayName ="InputGlassmorphism"

export { InputGlassmorphism}
