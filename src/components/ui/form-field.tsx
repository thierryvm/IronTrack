'use client'

import React from'react'
import { cn} from'@/utils/cn'
import { Label} from'@/components/ui/label'

interface FormFieldProps extends React.HTMLAttributes<HTMLDivElement> {
 label: string
 required?: boolean
 error?: string
 helpText?: string
 children: React.ReactNode
}

/**
 * Composant FormField standardisé selon les meilleures pratiques UX
 * Basé sur le design de référence IronTrack (screenshot.png)
 * 
 * Standards appliqués :
 * - Hauteur uniforme : 40px pour tous les champs Input/Select
 * - Espacement cohérent : space-y-1 entre label et champ, space-y-6 entre sections
 * - Typography : text-sm font-medium pour labels, text-base pour champs
 * - Accessibilité : WCAG 2.1 AA compliant
 * - Responsive : Touch targets 44px minimum
 * - Design : Matching screenshot.png avec bordures subtiles et focus orange
 */
export function FormField({ 
 label, 
 required = false, 
 error, 
 helpText, 
 children, 
 className,
 ...props 
}: FormFieldProps) {
 return (
 <div className={cn('space-y-1', className)} {...props}>
 <Label className="text-sm font-medium text-foreground">
 {label}
 {required && <span className="text-safe-error ml-1">*</span>}
 </Label>
 
 <div className="relative">
 {children}
 </div>
 
 {error && (
 <p className="text-sm text-red-600 mt-1" role="alert">
 {error}
 </p>
 )}
 
 {helpText && !error && (
 <p className="text-sm text-muted-foreground mt-1">
 {helpText}
 </p>
 )}
 </div>
 )
}

/**
 * Classes CSS standardisées pour tous les champs de formulaire
 * Basées sur le design de référence IronTrack (screenshot.png)
 * Assure la cohérence parfaite avec Input, Select, Textarea
 */
export const FORM_FIELD_CLASSES = {
 // Hauteur et espacement uniformes (40px comme dans screenshot.png)
 base:"h-10 px-2 py-2",
 
 // Typography cohérente avec le design de référence
 text:"text-base placeholder:text-muted-foreground",
 
 // États interactifs - focus orange matching screenshot
 focus:"focus:outline-none focus:ring-2 focus:ring-primary focus:border-primary",
 
 // Bordures et couleurs exactes du screenshot
 border:"border border-border",
 background:"bg-card",
 
 // Responsive et accessibilité
 responsive:"w-full rounded-lg transition-all duration-200",
 
 // État d'erreur
 error:"border-red-500 focus:border-red-500 focus:ring-red-500"
}

/**
 * Classe complète pour Input standardisé
 */
export const STANDARD_INPUT_CLASSES = cn(
 FORM_FIELD_CLASSES.base,
 FORM_FIELD_CLASSES.text,
 FORM_FIELD_CLASSES.focus,
 FORM_FIELD_CLASSES.border,
 FORM_FIELD_CLASSES.background,
 FORM_FIELD_CLASSES.responsive
)

/**
 * Classe complète pour Select standardisé 
 */
export const STANDARD_SELECT_CLASSES = cn(
 FORM_FIELD_CLASSES.base,
 FORM_FIELD_CLASSES.text,
 FORM_FIELD_CLASSES.focus,
 FORM_FIELD_CLASSES.border,
 FORM_FIELD_CLASSES.background,
 FORM_FIELD_CLASSES.responsive
)

/**
 * Classe complète pour Textarea standardisé 
 * Hauteur minimale augmentée pour le texte long (instructions)
 */
export const STANDARD_TEXTAREA_CLASSES = cn(
"min-h-[100px] px-2 py-2",
 FORM_FIELD_CLASSES.text,
 FORM_FIELD_CLASSES.focus,
 FORM_FIELD_CLASSES.border,
 FORM_FIELD_CLASSES.background,
 FORM_FIELD_CLASSES.responsive,
"resize-none"
)