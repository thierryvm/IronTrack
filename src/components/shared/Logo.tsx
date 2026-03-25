import * as React from"react"
import { cn} from"@/lib/utils"

interface LogoProps {
 className?: string;
 variant?:'default' |'icon' |'text-only';
 iconSize?:'sm' |'md' |'lg';
}

export function Logo({ className, variant ='default', iconSize ='md'}: LogoProps) {
 const sizeClasses = {
 sm:"w-6 h-6 p-1",
 md:"w-8 h-8 p-1",
 lg:"w-10 h-10 p-2"
}

 const svgSizeClasses = {
 sm:"w-4 h-4",
 md:"w-5 h-5",
 lg:"w-6 h-6"
}

 const textClasses = {
 sm:"text-lg",
 md:"text-xl",
 lg:"text-2xl"
}

 return (
 <div className={cn("flex items-center gap-2", className)}>
 {variant !=='text-only' && (
 <div className={cn("relative flex items-center justify-center bg-primary rounded-xl shadow-sm shrink-0", sizeClasses[iconSize])}>
 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={cn("text-white", svgSizeClasses[iconSize])}>
 {/* Minimalist Dumbbell */}
 <path d="M6 4v16" />
 <path d="M18 4v16" />
 <path d="M6 12h12" />
 <path d="M3 8h6" />
 <path d="M3 16h6" />
 <path d="M15 8h6" />
 <path d="M15 16h6" />
 </svg>
 </div>
 )}
 
 {variant !=='icon' && (
 <span className={cn("font-extrabold tracking-tight", textClasses[iconSize])}>
 {/* text-[var(--brand-600)] = #ea580c — ratio 3.6:1 sur fond clair, WCAG AA large text ✓ */}
 Iron<span className="text-[var(--brand-600)] dark:text-primary">Track</span>
 </span>
 )}
 </div>
 )
}
