"use client"

import * as React from "react"
import * as LabelPrimitive from "@radix-ui/react-label"
import { cn } from "@/lib/utils"

interface AuthLabelProps extends React.ComponentProps<typeof LabelPrimitive.Root> {
  // Props spécifiques au label d'authentification
}

/**
 * Label spécialisé pour les formulaires d'authentification glassmorphism.
 * Utilise des couleurs adaptées aux fonds transparents.
 */
const AuthLabel = React.forwardRef<
  React.ElementRef<typeof LabelPrimitive.Root>,
  AuthLabelProps
>(({ className, ...props }, ref) => {
  return (
    <LabelPrimitive.Root
      ref={ref}
      className={cn(
        // Style de base similaire au Label ShadCN
        "flex items-center gap-2 text-sm leading-none font-medium select-none",
        // États disabled
        "group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50",
        "peer-disabled:cursor-not-allowed peer-disabled:opacity-50",
        // COULEUR SPÉCIFIQUE GLASSMORPHISM - Modifiée pour contraste
        "text-foreground font-semibold mb-1.5 ml-1",
        className
      )}
      {...props}
    />
  )
})
AuthLabel.displayName = "AuthLabel"

export { AuthLabel }