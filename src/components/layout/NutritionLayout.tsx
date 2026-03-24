import * as React from "react"

interface NutritionLayoutProps {
  children: React.ReactNode
}

export function NutritionLayout({ children }: NutritionLayoutProps) {
  return (
    <div className="min-h-screen bg-background">
      {children}
    </div>
  )
}

export function NutritionLayoutContainer({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">
      {children}
    </div>
  )
}
NutritionLayout.Container = NutritionLayoutContainer

export function NutritionLayoutCard({ children, title, headerRight }: { children: React.ReactNode, title?: string, headerRight?: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-xl shadow-md p-6">
      {(title || headerRight) && (
        <div className="flex items-center justify-between mb-4">
          {title && <h3 className="text-lg font-semibold text-foreground">{title}</h3>}
          {headerRight && <div className="text-sm text-muted-foreground">{headerRight}</div>}
        </div>
      )}
      {children}
    </div>
  )
}
NutritionLayout.Card = NutritionLayoutCard

export function NutritionLayoutGrid({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      {children}
    </div>
  )
}
NutritionLayout.Grid = NutritionLayoutGrid

export function NutritionLayoutScreenLoader() {
  return (
    <div className="flex h-screen items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
    </div>
  )
}
NutritionLayout.ScreenLoader = NutritionLayoutScreenLoader

export function NutritionLayoutBlockLoader({ height = 'h-64', text = 'Chargement...' }: { height?: string, text?: string }) {
  return (
    <div className={`animate-pulse bg-muted ${height} rounded-lg flex items-center justify-center`}>
      <span className="text-muted-foreground">{text}</span>
    </div>
  )
}
NutritionLayout.BlockLoader = NutritionLayoutBlockLoader

export function NutritionLayoutFooterText({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-4 text-xs text-muted-foreground text-center">
      {children}
    </div>
  )
}
NutritionLayout.FooterText = NutritionLayoutFooterText


