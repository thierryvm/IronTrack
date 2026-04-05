'use client'

import { Logo } from'@/components/shared/Logo'

interface LoadingStateProps {
 message?: string
}

export function LoadingState({ message ="Chargement…"}: LoadingStateProps) {
 return (
 <div className="flex min-h-[100dvh] items-center justify-center bg-background px-4">
 <div role="status" aria-live="polite" className="w-full max-w-md rounded-[28px] border border-border bg-card p-8 text-center shadow-lg">
 <div className="mb-6 flex justify-center">
 <Logo iconSize="md" />
 </div>
 <div className="mx-auto mb-4 inline-flex h-16 w-16 items-center justify-center rounded-full border border-border bg-muted/35 shadow-sm">
 <div className="h-8 w-8 animate-spin rounded-full border-b-2 border-primary"></div>
 </div>
 <p className="text-lg font-semibold text-foreground">{message}</p>
 <p className="mt-2 text-sm leading-6 text-safe-muted">
 Préparation de ton espace personnel et de ton parcours de départ.
 </p>
 </div>
 </div>
 )
}
