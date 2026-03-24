import * as React from "react"
import ThemeToggle from "@/components/ui/ThemeToggle"
import { Logo } from "@/components/shared/Logo"

interface DesignSystemLayoutProps {
  children: React.ReactNode
}

export function DesignSystemLayout({ children }: DesignSystemLayoutProps) {
  return (
    <div className="min-h-screen bg-background pb-mobile-nav relative">
      <div className="absolute top-8 left-8">
        <Logo iconSize="md" />
      </div>

      <div className="max-w-6xl mx-auto space-y-24 p-8 pt-24">
        
        {/* Header (Intro) */}
        <div className="space-y-4">
          <div className="flex justify-between items-start gap-4">
            <div className="flex-1 min-w-0">
              <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl text-foreground">
                Design System
              </h1>
              <p className="text-xl text-muted-foreground mt-2 max-w-2xl">
                Ce guide visuel regroupe l'ensemble des composants standards de l'application IronTrack, respectant strictement la norme V5.
              </p>
            </div>
            {/* Theme Toggle existant */}
            <div className="shrink-0 mt-1">
              <ThemeToggle />
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="space-y-24">
          {children}
        </div>
      </div>
    </div>
  )
}
