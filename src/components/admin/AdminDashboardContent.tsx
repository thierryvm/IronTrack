import Link from 'next/link'
import {
  ArrowRight,
  BellRing,
  Clock3,
  RefreshCw,
  ShieldCheck,
  Ticket,
  type LucideIcon,
} from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export interface AdminDashboardStats {
  open_tickets: number
  in_progress_tickets: number
  tickets_24h: number
  tickets_7d: number
  new_users_24h: number
  new_users_7d: number
  admin_users: number
  workouts_24h: number
  workouts_7d: number
  feedback_tickets?: number
}

export interface AdminDashboardAction {
  href: string
  title: string
  description: string
  icon: LucideIcon
  badge?: string | null
  emphasis?: 'primary' | 'secondary'
}

export interface AdminDashboardTicket {
  id: string
  title: string
  category: string
  status: string
  priority: string
  created_at: string
}

export interface AdminDashboardActivity {
  id: string
  action: string
  target_type: string
  admin_email: string
  created_at: string
}

interface AdminDashboardContentProps {
  userEmail: string
  stats: AdminDashboardStats | null
  actions: AdminDashboardAction[]
  tickets: AdminDashboardTicket[]
  activity: AdminDashboardActivity[]
  refreshing: boolean
  onRefresh: () => void
}

const dateFormatter = new Intl.DateTimeFormat('fr-BE', {
  day: '2-digit',
  month: 'short',
  hour: '2-digit',
  minute: '2-digit',
})

function formatDateLabel(value: string) {
  return dateFormatter.format(new Date(value))
}

function formatStatusLabel(status: string) {
  const labels: Record<string, string> = {
    open: 'Ouvert',
    in_progress: 'En cours',
    resolved: 'Resolue',
    closed: 'Fermee',
    waiting_user: 'En attente',
  }

  return labels[status] ?? status
}

function formatActionLabel(action: string, targetType: string) {
  const actionLabel = action.replaceAll('_', ' ')
  const targetLabel = targetType.replaceAll('_', ' ')
  return `${actionLabel} · ${targetLabel}`
}

export function AdminDashboardContent({
  userEmail,
  stats,
  actions,
  tickets,
  activity,
  refreshing,
  onRefresh,
}: AdminDashboardContentProps) {
  const statCards = [
    {
      label: 'Tickets ouverts',
      value: stats?.open_tickets ?? 0,
      helper: `${stats?.in_progress_tickets ?? 0} en traitement`,
      accent: 'text-primary',
    },
    {
      label: 'Nouveaux utilisateurs',
      value: stats?.new_users_7d ?? 0,
      helper: `${stats?.new_users_24h ?? 0} sur 24h`,
      accent: 'text-safe-success',
    },
    {
      label: 'Workouts 7 jours',
      value: stats?.workouts_7d ?? 0,
      helper: `${stats?.workouts_24h ?? 0} sur 24h`,
      accent: 'text-safe-info',
    },
    {
      label: 'Admins actifs',
      value: stats?.admin_users ?? 0,
      helper: `${stats?.feedback_tickets ?? 0} feedback tickets`,
      accent: 'text-safe-warning',
    },
  ]

  return (
    <div className="space-y-5">
      <Card className="rounded-[28px] border-border bg-card/92 p-5 shadow-card">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div className="space-y-3">
            <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
              Cockpit admin mobile-first
            </Badge>
            <div>
              <h1 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                Admin simple, rapide et exploitable
              </h1>
              <p className="mt-2 max-w-2xl text-sm leading-7 text-muted-foreground">
                Priorise les tickets, surveille les mouvements utiles et ouvre la bonne action sans
                te battre contre un tableau de bord desktop plaque sur mobile.
              </p>
            </div>
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-border/70 bg-background/55 px-3 py-1.5 text-xs text-safe-muted">
              <ShieldCheck className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
              Session admin : {userEmail}
            </div>
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <ActionButton asChild tone="primary" className="justify-center gap-2">
              <Link href="/admin/tickets?status=open">
                <Ticket className="h-4 w-4" aria-hidden="true" />
                Traiter les tickets ouverts
              </Link>
            </ActionButton>
            <ActionButton
              type="button"
              tone="secondary"
              onClick={onRefresh}
              disabled={refreshing}
              className="justify-center gap-2"
            >
              <RefreshCw className={cn('h-4 w-4', refreshing && 'animate-spin')} aria-hidden="true" />
              {refreshing ? 'Actualisation...' : 'Rafraichir'}
            </ActionButton>
          </div>
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {statCards.map((item) => (
          <Card key={item.label} className="rounded-[22px] border-border bg-card/88 p-4 shadow-card">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
              {item.label}
            </p>
            <p className={cn('mt-3 text-3xl font-semibold tracking-tight', item.accent)}>{item.value}</p>
            <p className="mt-2 text-sm text-muted-foreground">{item.helper}</p>
          </Card>
        ))}
      </div>

      <div className="grid gap-5 xl:grid-cols-[1.1fr_0.9fr]">
        <Card className="rounded-[26px] border-border bg-card/90 p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">
                Workflows
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Actions admin utiles</h2>
            </div>
            <Badge variant="outline" className="border-border bg-background/65 text-foreground">
              {actions.length}
            </Badge>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2">
            {actions.map((action) => {
              const Icon = action.icon
              return (
                <Link
                  key={action.href}
                  href={action.href}
                  className={cn(
                    'group rounded-[22px] border p-4 transition-colors',
                    action.emphasis === 'primary'
                      ? 'border-primary/20 bg-primary/8 hover:bg-primary/12'
                      : 'border-border bg-background/45 hover:bg-accent',
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex size-11 items-center justify-center rounded-2xl border border-border/70 bg-card">
                      <Icon className="h-5 w-5 text-primary" aria-hidden="true" />
                    </div>
                    {action.badge ? (
                      <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                        {action.badge}
                      </Badge>
                    ) : null}
                  </div>
                  <h3 className="mt-4 text-base font-semibold text-foreground">{action.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">{action.description}</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-sm font-medium text-primary">
                    Ouvrir
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                  </div>
                </Link>
              )
            })}
          </div>
        </Card>

        <Card className="rounded-[26px] border-border bg-card/90 p-5 shadow-card">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">
                Radar
              </p>
              <h2 className="mt-1 text-lg font-semibold text-foreground">Activite recente</h2>
            </div>
            <BellRing className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>

          <div className="mt-5 space-y-3">
            {activity.length === 0 ? (
              <div className="rounded-[20px] border border-dashed border-border/80 bg-background/40 px-4 py-8 text-center text-sm text-safe-muted">
                Aucune activite admin recente a afficher.
              </div>
            ) : (
              activity.map((entry) => (
                <div key={entry.id} className="rounded-[20px] border border-border/70 bg-background/45 p-4">
                  <p className="text-sm font-semibold text-foreground">
                    {formatActionLabel(entry.action, entry.target_type)}
                  </p>
                  <p className="mt-2 text-sm text-muted-foreground">{entry.admin_email}</p>
                  <div className="mt-3 inline-flex items-center gap-2 text-xs text-safe-muted">
                    <Clock3 className="h-3.5 w-3.5" aria-hidden="true" />
                    {formatDateLabel(entry.created_at)}
                  </div>
                </div>
              ))
            )}
          </div>
        </Card>
      </div>

      <Card className="rounded-[26px] border-border bg-card/90 p-5 shadow-card">
        <div className="flex items-start justify-between gap-3">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">
              Ticket queue
            </p>
            <h2 className="mt-1 text-lg font-semibold text-foreground">Dernieres demandes support</h2>
          </div>
          <ActionButton asChild tone="secondary" className="hidden sm:inline-flex">
            <Link href="/admin/tickets">Voir toute la file</Link>
          </ActionButton>
        </div>

        <div className="mt-5 space-y-3">
          {tickets.length === 0 ? (
            <div className="rounded-[20px] border border-dashed border-border/80 bg-background/40 px-4 py-8 text-center text-sm text-safe-muted">
              Aucun ticket recent.
            </div>
          ) : (
            tickets.map((ticket) => (
              <Link
                key={ticket.id}
                href={`/admin/tickets/${ticket.id}`}
                className="block rounded-[20px] border border-border/70 bg-background/45 p-4 transition-colors hover:bg-accent"
              >
                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                  <div className="min-w-0">
                    <p className="text-base font-semibold text-foreground">{ticket.title}</p>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {ticket.category} · priorite {ticket.priority}
                    </p>
                  </div>
                  <Badge variant="outline" className="w-fit border-border bg-card text-foreground">
                    {formatStatusLabel(ticket.status)}
                  </Badge>
                </div>
                <p className="mt-3 text-xs text-safe-muted">{formatDateLabel(ticket.created_at)}</p>
              </Link>
            ))
          )}
        </div>

        <ActionButton asChild tone="secondary" className="mt-4 w-full justify-center sm:hidden">
          <Link href="/admin/tickets">Voir toute la file</Link>
        </ActionButton>
      </Card>
    </div>
  )
}
