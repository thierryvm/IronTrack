import * as React from "react"
import { cn } from "@/lib/utils"

interface ComponentSectionProps extends React.HTMLAttributes<HTMLElement> {
  title: string
  description?: string
  children: React.ReactNode
}

export function ComponentSection({ title, description, className, children, ...props }: ComponentSectionProps) {
  return (
    <section className={cn("space-y-6", className)} {...props}>
      <div className="border-b border-border pb-4">
        <h2 className="text-3xl font-bold tracking-tight text-foreground">
          {title}
        </h2>
        {description && (
          <p className="text-muted-foreground mt-2 text-lg">{description}</p>
        )}
      </div>
      <div className="space-y-6">
        {children}
      </div>
    </section>
  )
}
