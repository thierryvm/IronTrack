'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import {
  AlertTriangle,
  CheckCircle2,
  ChevronRight,
  Clock3,
  MessageSquare,
  RefreshCw,
  Search,
} from 'lucide-react'

import { useAdminAuth } from '@/contexts/AdminAuthContext'
import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { SupportTicketCategory, SupportTicketPriority } from '@/types/support'

type AdminTicketStatus = 'open' | 'pending' | 'in_progress' | 'waiting_user' | 'resolved' | 'closed' | 'archived'
type TicketStatusFilter = AdminTicketStatus | 'all'
type TicketPriorityFilter = SupportTicketPriority | 'all'
type TicketCategoryFilter = SupportTicketCategory | 'general' | 'all'

interface AdminTicket {
  id: string
  title: string
  description: string
  category: TicketCategoryFilter
  priority: SupportTicketPriority
  status: AdminTicketStatus
  user_id: string
  assigned_to: string | null
  created_at: string
  updated_at: string
  user_email: string
  user_full_name: string
  admin_email: string | null
  admin_full_name: string | null
  response_count: number
}

const statusOptions: Array<{ value: TicketStatusFilter; label: string }> = [
  { value: 'all', label: 'Tous les statuts' },
  { value: 'pending', label: 'En attente' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_user', label: 'Attente utilisateur' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
]

const priorityOptions: Array<{ value: TicketPriorityFilter; label: string }> = [
  { value: 'all', label: 'Toutes priorités' },
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Normale' },
  { value: 'high', label: 'Élevée' },
  { value: 'critical', label: 'Critique' },
]

const categoryOptions: Array<{ value: TicketCategoryFilter; label: string }> = [
  { value: 'all', label: 'Toutes catégories' },
  { value: 'bug', label: 'Bug' },
  { value: 'feature', label: 'Fonctionnalité' },
  { value: 'help', label: 'Aide' },
  { value: 'feedback', label: 'Feedback' },
  { value: 'account', label: 'Compte' },
  { value: 'payment', label: 'Paiement' },
  { value: 'general', label: 'Général' },
]

function getStatusMeta(status: AdminTicketStatus) {
  switch (status) {
    case 'pending':
      return {
        label: 'En attente',
        badgeClass: 'border-amber-500/20 bg-amber-500/10 text-safe-warning',
      }
    case 'open':
      return {
        label: 'Ouvert',
        badgeClass: 'border-primary/20 bg-primary/10 text-primary',
      }
    case 'in_progress':
      return {
        label: 'En cours',
        badgeClass: 'border-sky-500/20 bg-sky-500/10 text-safe-info',
      }
    case 'waiting_user':
      return {
        label: 'Attente utilisateur',
        badgeClass: 'border-violet-500/20 bg-violet-500/10 text-safe-info',
      }
    case 'resolved':
      return {
        label: 'Résolu',
        badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-safe-success',
      }
    case 'closed':
      return {
        label: 'Fermé',
        badgeClass: 'border-border bg-background/70 text-safe-muted',
      }
    default:
      return {
        label: 'Archivé',
        badgeClass: 'border-border bg-background/70 text-safe-muted',
      }
  }
}

function getPriorityMeta(priority: SupportTicketPriority) {
  switch (priority) {
    case 'low':
      return {
        label: 'Faible',
        badgeClass: 'border-border bg-background/70 text-safe-muted',
      }
    case 'medium':
      return {
        label: 'Normale',
        badgeClass: 'border-primary/20 bg-primary/10 text-primary',
      }
    case 'high':
      return {
        label: 'Élevée',
        badgeClass: 'border-amber-500/20 bg-amber-500/10 text-safe-warning',
      }
    default:
      return {
        label: 'Critique',
        badgeClass: 'border-destructive/20 bg-destructive/10 text-safe-error',
      }
  }
}

function getCategoryLabel(category: TicketCategoryFilter) {
  switch (category) {
    case 'bug':
      return 'Bug'
    case 'feature':
      return 'Fonctionnalité'
    case 'help':
      return 'Aide'
    case 'feedback':
      return 'Feedback'
    case 'account':
      return 'Compte'
    case 'payment':
      return 'Paiement'
    default:
      return 'Général'
  }
}

function SummaryCard({
  label,
  value,
  helper,
}: {
  label: string
  value: string | number
  helper: string
}) {
  return (
    <Card className="rounded-[24px] border-border bg-card/82 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-safe-muted">{label}</p>
      <p className="mt-3 text-3xl font-semibold tracking-tight text-foreground">{value}</p>
      <p className="mt-2 text-sm text-safe-muted">{helper}</p>
    </Card>
  )
}

function TicketCard({
  ticket,
  canModerate,
  isUpdating,
  onStatusChange,
}: {
  ticket: AdminTicket
  canModerate: boolean
  isUpdating: boolean
  onStatusChange: (ticketId: string, status: AdminTicketStatus) => void
}) {
  const statusMeta = getStatusMeta(ticket.status)
  const priorityMeta = getPriorityMeta(ticket.priority)

  return (
    <Card className="rounded-[26px] border-border bg-card/84 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0 space-y-3">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={statusMeta.badgeClass}>
                {statusMeta.label}
              </Badge>
              <Badge variant="outline" className={priorityMeta.badgeClass}>
                {priorityMeta.label}
              </Badge>
              <Badge variant="outline" className="border-border bg-background/70 text-foreground">
                {getCategoryLabel(ticket.category)}
              </Badge>
            </div>

            <div>
              <h2 className="break-words text-xl font-semibold tracking-tight text-foreground">
                {ticket.title}
              </h2>
              <p className="mt-2 line-clamp-3 text-sm leading-7 text-muted-foreground">
                {ticket.description || 'Aucune description disponible pour ce ticket.'}
              </p>
            </div>
          </div>

          <div className="shrink-0 rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
              Réponses
            </p>
            <p className="mt-2 text-lg font-semibold text-foreground">{ticket.response_count}</p>
          </div>
        </div>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
              Demandeur
            </p>
            <p className="mt-2 break-words text-sm font-medium text-foreground">
              {ticket.user_full_name !== 'Nom non défini' ? ticket.user_full_name : ticket.user_email}
            </p>
            <p className="mt-1 break-words text-xs text-safe-muted">{ticket.user_email}</p>
          </div>

          <div className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
              Créé le
            </p>
            <p className="mt-2 text-sm font-medium text-foreground">
              {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
            </p>
            <p className="mt-1 text-xs text-safe-muted">
              {new Date(ticket.created_at).toLocaleTimeString('fr-FR', {
                hour: '2-digit',
                minute: '2-digit',
              })}
            </p>
          </div>

          <div className="rounded-[18px] border border-border/70 bg-background/55 px-4 py-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
              Assignation
            </p>
            <p className="mt-2 break-words text-sm font-medium text-foreground">
              {ticket.admin_full_name || ticket.admin_email || 'Non assigné'}
            </p>
            <p className="mt-1 text-xs text-safe-muted">
              Mis à jour le {new Date(ticket.updated_at).toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2">
            {canModerate && ticket.status === 'open' ? (
              <ActionButton
                type="button"
                tone="secondary"
                onClick={() => onStatusChange(ticket.id, 'in_progress')}
                disabled={isUpdating}
                className="gap-2"
              >
                <AlertTriangle className="h-4 w-4" aria-hidden="true" />
                <span>{isUpdating ? 'Mise à jour...' : 'Prendre en charge'}</span>
              </ActionButton>
            ) : null}

            {canModerate && (ticket.status === 'in_progress' || ticket.status === 'waiting_user') ? (
              <ActionButton
                type="button"
                tone="secondary"
                onClick={() => onStatusChange(ticket.id, 'resolved')}
                disabled={isUpdating}
                className="gap-2"
              >
                <CheckCircle2 className="h-4 w-4" aria-hidden="true" />
                <span>{isUpdating ? 'Mise à jour...' : 'Marquer résolu'}</span>
              </ActionButton>
            ) : null}
          </div>

          <ActionButton asChild type="button" tone="primary" className="gap-2 self-start sm:self-auto">
            <Link href={`/admin/tickets/${ticket.id}`}>
              <span>Ouvrir le ticket</span>
              <ChevronRight className="h-4 w-4" aria-hidden="true" data-icon="inline-end" />
            </Link>
          </ActionButton>
        </div>
      </div>
    </Card>
  )
}

export default function AdminTicketsPage() {
  const { isAuthenticated, loading: authLoading, hasPermission } = useAdminAuth()
  const [tickets, setTickets] = useState<AdminTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<TicketStatusFilter>('all')
  const [priorityFilter, setPriorityFilter] = useState<TicketPriorityFilter>('all')
  const [categoryFilter, setCategoryFilter] = useState<TicketCategoryFilter>('all')
  const [updatingTicketId, setUpdatingTicketId] = useState<string | null>(null)

  const canModerate = hasPermission('moderator')

  const fetchTickets = useCallback(async () => {
    if (!isAuthenticated || !canModerate) {
      setLoading(false)
      return
    }

    try {
      setLoading(true)
      setError(null)

      const response = await fetch('/api/admin/tickets', { cache: 'no-store' })
      const payload = (await response.json()) as { error?: string; tickets?: AdminTicket[] }

      if (!response.ok) {
        throw new Error(payload.error || 'Impossible de charger les tickets admin.')
      }

      setTickets(payload.tickets ?? [])
    } catch (caughtError) {
      setError(
        caughtError instanceof Error
          ? caughtError.message
          : 'Impossible de charger les tickets admin pour le moment.',
      )
      setTickets([])
    } finally {
      setLoading(false)
    }
  }, [canModerate, isAuthenticated])

  useEffect(() => {
    if (!authLoading) {
      void fetchTickets()
    }
  }, [authLoading, fetchTickets])

  const filteredTickets = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase()

    return tickets.filter((ticket) => {
      if (statusFilter !== 'all' && ticket.status !== statusFilter) return false
      if (priorityFilter !== 'all' && ticket.priority !== priorityFilter) return false
      if (categoryFilter !== 'all' && ticket.category !== categoryFilter) return false

      if (!normalizedSearch) return true

      return [
        ticket.title,
        ticket.description,
        ticket.user_email,
        ticket.user_full_name,
        ticket.admin_email || '',
      ]
        .join(' ')
        .toLowerCase()
        .includes(normalizedSearch)
    })
  }, [categoryFilter, priorityFilter, searchTerm, statusFilter, tickets])

  const stats = useMemo(() => {
    const openCount = tickets.filter((ticket) => ticket.status === 'open' || ticket.status === 'pending').length
    const inProgressCount = tickets.filter((ticket) => ticket.status === 'in_progress').length
    const resolvedCount = tickets.filter((ticket) => ticket.status === 'resolved').length
    const criticalCount = tickets.filter((ticket) => ticket.priority === 'critical').length

    return { openCount, inProgressCount, resolvedCount, criticalCount }
  }, [tickets])

  const handleStatusChange = useCallback(
    async (ticketId: string, status: AdminTicketStatus) => {
      try {
        setUpdatingTicketId(ticketId)
        setError(null)

        const response = await fetch(`/api/admin/tickets/${ticketId}/status`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status }),
        })

        const payload = (await response.json()) as { error?: string }

        if (!response.ok) {
          throw new Error(payload.error || 'Mise à jour impossible.')
        }

        setTickets((currentTickets) =>
          currentTickets.map((ticket) =>
            ticket.id === ticketId
              ? {
                  ...ticket,
                  status,
                  updated_at: new Date().toISOString(),
                }
              : ticket,
          ),
        )
      } catch (caughtError) {
        setError(
          caughtError instanceof Error
            ? caughtError.message
            : 'Impossible de mettre à jour ce ticket pour le moment.',
        )
      } finally {
        setUpdatingTicketId(null)
      }
    },
    [],
  )

  if (!authLoading && !canModerate) {
    return (
      <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
        <AlertDescription>Accès administrateur insuffisant pour consulter les tickets.</AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] border border-border bg-card/84 px-5 py-5 shadow-[0_24px_56px_rgba(0,0,0,0.22)] sm:px-6 sm:py-6">
        <div className="flex flex-col gap-5 xl:flex-row xl:items-start xl:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-primary">
              Tickets admin
            </p>
            <h1 className="text-3xl font-semibold tracking-tight text-foreground sm:text-4xl">
              Triage lisible, actions utiles, zéro écran parasite.
            </h1>
            <p className="max-w-2xl text-sm leading-7 text-muted-foreground sm:text-base">
              Regroupe les demandes ouvertes, identifie les urgences et ouvre la fiche complète
              uniquement quand il faut répondre ou modérer.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <ActionButton type="button" tone="secondary" onClick={() => void fetchTickets()} className="gap-2">
              <RefreshCw className="h-4 w-4" aria-hidden="true" />
              <span>Actualiser</span>
            </ActionButton>
          </div>
        </div>
      </section>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="À traiter" value={stats.openCount} helper="ouverts ou en attente" />
        <SummaryCard label="En cours" value={stats.inProgressCount} helper="déjà pris en charge" />
        <SummaryCard label="Résolus" value={stats.resolvedCount} helper="tickets fermables ensuite" />
        <SummaryCard label="Critiques" value={stats.criticalCount} helper="priorité maximale" />
      </div>

      <Card className="rounded-[26px] border-border bg-card/82 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
        <div className="grid gap-4 xl:grid-cols-[minmax(0,1.3fr)_repeat(3,minmax(0,0.7fr))]">
          <div className="space-y-2">
            <Label htmlFor="admin-ticket-search">Recherche</Label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-safe-muted"
                aria-hidden="true"
              />
              <Input
                id="admin-ticket-search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Titre, description, email..."
                className="h-12 rounded-full border-border bg-background/60 pl-11"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-ticket-status">Statut</Label>
            <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as TicketStatusFilter)}>
              <SelectTrigger id="admin-ticket-status" className="h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {statusOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-ticket-priority">Priorité</Label>
            <Select
              value={priorityFilter}
              onValueChange={(value) => setPriorityFilter(value as TicketPriorityFilter)}
            >
              <SelectTrigger id="admin-ticket-priority" className="h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {priorityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="admin-ticket-category">Catégorie</Label>
            <Select
              value={categoryFilter}
              onValueChange={(value) => setCategoryFilter(value as TicketCategoryFilter)}
            >
              <SelectTrigger id="admin-ticket-category" className="h-12 rounded-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {categoryOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {error ? (
        <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      ) : null}

      {loading ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card
              key={index}
              className="h-[260px] rounded-[26px] border-border bg-card/82 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]"
            >
              <div className="h-full animate-pulse rounded-[20px] bg-background/55" />
            </Card>
          ))}
        </div>
      ) : filteredTickets.length > 0 ? (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredTickets.map((ticket) => (
            <TicketCard
              key={ticket.id}
              ticket={ticket}
              canModerate={canModerate}
              isUpdating={updatingTicketId === ticket.id}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      ) : (
        <Card className="rounded-[26px] border border-dashed border-border bg-card/72 px-5 py-12 text-center shadow-[0_18px_40px_rgba(0,0,0,0.12)]">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full border border-border bg-background/55">
            <MessageSquare className="h-6 w-6 text-primary" aria-hidden="true" />
          </div>
          <h2 className="mt-4 text-xl font-semibold text-foreground">Aucun ticket à afficher</h2>
          <p className="mt-2 text-sm leading-6 text-muted-foreground">
            Ajuste les filtres ou recharge la liste si tu attends de nouvelles demandes.
          </p>
        </Card>
      )}

      <Card className="rounded-[24px] border-border bg-card/72 px-4 py-4 shadow-[0_14px_28px_rgba(0,0,0,0.12)]">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2 text-sm text-safe-muted">
            <Clock3 className="h-4 w-4" aria-hidden="true" />
            <span>{filteredTickets.length} ticket(s) visibles</span>
          </div>
          <div className="text-sm text-safe-muted">
            Les réponses, pièces jointes et notes restent dans la fiche ticket dédiée.
          </div>
        </div>
      </Card>
    </div>
  )
}
