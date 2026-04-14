'use client'

import type { ReactNode } from 'react'
import Link from 'next/link'
import { ChevronRight } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'

import type { HomeQuickAction } from './homepage-types'

interface HomePageQuickActionsProps {
  actions: HomeQuickAction[]
}

interface ActionShellProps {
  action: HomeQuickAction
  className: string
  children: ReactNode
}

function ActionShell({ action, className, children }: ActionShellProps) {
  if (action.onClick) {
    return (
      <Button type="button" variant="ghost" className={className} onClick={action.onClick}>
        {children}
      </Button>
    )
  }

  return (
    <Button asChild variant="ghost" className={className}>
      <Link href={action.href || '#'}>{children}</Link>
    </Button>
  )
}

function ActionIcon({ action }: { action: HomeQuickAction }) {
  return (
    <div className="flex size-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
      <action.icon className="h-5 w-5" aria-hidden="true" />
    </div>
  )
}

function ActionCard({ action }: { action: HomeQuickAction }) {
  return (
    <ActionShell
      action={action}
      className="group h-full min-h-[168px] w-full flex-col items-start whitespace-normal rounded-[26px] border border-border/70 bg-background/68 p-4 text-left shadow-none transition-transform duration-200 motion-reduce:transition-none hover:-translate-y-0.5 hover:border-primary/35 hover:bg-background/82 xl:min-h-[92px] xl:flex-row xl:items-center xl:gap-4 xl:rounded-[22px] xl:p-4"
    >
      <div className="flex w-full items-start justify-between gap-4 xl:w-auto xl:flex-none xl:justify-start">
        <ActionIcon action={action} />
        <ChevronRight
          className="mt-1 h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 xl:hidden"
          aria-hidden="true"
          data-icon="inline-end"
        />
      </div>

      <div className="mt-6 flex flex-1 flex-col justify-end xl:mt-0 xl:min-w-0 xl:justify-center">
        <div className="min-h-[2.9rem] xl:min-h-0">
          <h3 className="line-clamp-2 max-w-[13ch] text-[1.28rem] font-bold leading-[1.08] tracking-[-0.02em] text-foreground xl:max-w-none xl:text-[1.08rem] xl:leading-tight">
            {action.name}
          </h3>
        </div>
        <div className="min-h-[3.2rem] pt-3 xl:min-h-0 xl:pt-1.5">
          <p className="line-clamp-2 max-w-[24ch] text-sm leading-6 text-muted-foreground xl:max-w-none xl:line-clamp-1 xl:text-[0.95rem] xl:leading-6">
            {action.description}
          </p>
        </div>
      </div>

      <ChevronRight
        className="hidden h-4 w-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5 xl:block"
        aria-hidden="true"
        data-icon="inline-end"
      />
    </ActionShell>
  )
}

export default function HomePageQuickActions({ actions }: HomePageQuickActionsProps) {
  return (
    <Card className="h-full rounded-[30px] border-border/80 bg-card/88 shadow-sm">
      <CardContent className="flex h-full flex-col p-5 sm:p-6">
        <div className="mb-6 flex flex-col gap-3">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Actions rapides
            </p>
            <h2 className="mt-2 text-2xl font-bold text-foreground">Passe de l’intention à l’action</h2>
          </div>
          <p className="max-w-xl text-sm leading-6 text-muted-foreground">
            Six accès directs, sur un rail compact et cohérent, pour passer vite d’un bloc à
            l’autre sans casser le rythme.
          </p>
        </div>

        <div className="grid flex-1 auto-rows-fr gap-4 md:grid-cols-2 xl:grid-cols-1">
          {actions.map((action) => (
            <ActionCard key={action.name} action={action} />
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
