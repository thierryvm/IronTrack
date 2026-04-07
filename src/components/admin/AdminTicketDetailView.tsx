'use client'

import type { ReactNode } from 'react'
import {
  AlertTriangle,
  ArrowLeft,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Loader2,
  LockKeyhole,
  Mail,
  MessageSquareText,
  RefreshCw,
  Save,
  SendHorizonal,
  ShieldCheck,
  UserRound,
} from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

export type AdminTicketStatus =
  | 'open'
  | 'pending'
  | 'in_progress'
  | 'waiting_user'
  | 'resolved'
  | 'closed'
  | 'archived'

export type AdminTicketPriority = 'low' | 'medium' | 'high' | 'critical'
export type AdminTicketCategory = 'bug' | 'feature' | 'help' | 'feedback' | 'account' | 'payment' | 'general'

export interface AdminTicketDetailData {
  id: string
  title: string
  description: string
  category: AdminTicketCategory
  priority: AdminTicketPriority
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

export interface AdminTicketConversationItem {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_internal: boolean
  is_solution: boolean
  created_at: string
  updated_at: string
  user_email: string
  user_full_name: string
  user_pseudo: string | null
}

interface AdminTicketDetailViewProps {
  ticket: AdminTicketDetailData
  responses: AdminTicketConversationItem[]
  loading?: boolean
  refreshing?: boolean
  saving?: boolean
  sending?: boolean
  error?: string | null
  pendingStatus: AdminTicketStatus
  pendingPriority: AdminTicketPriority
  composerMessage: string
  isInternalNote: boolean
  onBack: () => void
  onRefresh: () => void
  onStatusChange: (value: AdminTicketStatus) => void
  onPriorityChange: (value: AdminTicketPriority) => void
  onComposerMessageChange: (value: string) => void
  onInternalNoteChange: (value: boolean) => void
  onSaveDecision: () => void
  onSendMessage: () => void
}

const statusOptions: Array<{ value: AdminTicketStatus; label: string }> = [
  { value: 'pending', label: 'En attente' },
  { value: 'open', label: 'Ouvert' },
  { value: 'in_progress', label: 'En cours' },
  { value: 'waiting_user', label: 'Attente utilisateur' },
  { value: 'resolved', label: 'Résolu' },
  { value: 'closed', label: 'Fermé' },
  { value: 'archived', label: 'Archivé' },
]

const priorityOptions: Array<{ value: AdminTicketPriority; label: string }> = [
  { value: 'low', label: 'Faible' },
  { value: 'medium', label: 'Normale' },
  { value: 'high', label: 'Élevée' },
  { value: 'critical', label: 'Critique' },
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

function getPriorityMeta(priority: AdminTicketPriority) {
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

function getCategoryLabel(category: AdminTicketCategory) {
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

function formatLongDate(value: string) {
  return new Intl.DateTimeFormat('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function formatTime(value: string) {
  return new Intl.DateTimeFormat('fr-BE', {
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function SummaryPanel({
  icon,
  eyebrow,
  title,
  description,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <Card className="rounded-[24px] border-border bg-card/84 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">{eyebrow}</p>
          <p className="mt-2 break-words text-base font-semibold tracking-tight text-foreground">{title}</p>
          <p className="mt-1 break-words text-sm leading-6 text-safe-muted">{description}</p>
        </div>
      </div>
    </Card>
  )
}

function ConversationItem({
  item,
  requesterId,
}: {
  item: AdminTicketConversationItem
  requesterId: string
}) {
  const isRequester = item.user_id === requesterId
  const itemMeta = item.is_internal
    ? {
        badgeClass: 'border-amber-500/20 bg-amber-500/10 text-safe-warning',
        label: 'Note interne',
      }
    : isRequester
      ? {
          badgeClass: 'border-border bg-background/70 text-safe-muted',
          label: 'Utilisateur',
        }
      : {
          badgeClass: 'border-primary/20 bg-primary/10 text-primary',
          label: 'Réponse admin',
        }

  return (
    <Card className="rounded-[24px] border-border bg-card/82 p-4 shadow-[0_14px_30px_rgba(0,0,0,0.12)]">
      <div className="flex flex-col gap-3">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <Badge variant="outline" className={itemMeta.badgeClass}>
                {itemMeta.label}
              </Badge>
              {item.is_solution ? (
                <Badge variant="outline" className="border-emerald-500/20 bg-emerald-500/10 text-safe-success">
                  Solution
                </Badge>
              ) : null}
            </div>
            <p className="mt-3 break-words text-base font-semibold text-foreground">
              {item.user_full_name || item.user_pseudo || item.user_email}
            </p>
            <p className="text-sm text-safe-muted">{item.user_email}</p>
          </div>

          <div className="shrink-0 text-left text-sm text-safe-muted sm:text-right">
            <p>{formatLongDate(item.created_at)}</p>
            <p className="mt-1">{formatTime(item.created_at)}</p>
          </div>
        </div>

        <div
          className={cn(
            'rounded-[20px] border px-4 py-4 text-sm leading-7',
            item.is_internal
              ? 'border-amber-500/20 bg-amber-500/8 text-foreground'
              : 'border-border bg-background/60 text-foreground',
          )}
        >
          <p className="whitespace-pre-wrap break-words">{item.message}</p>
        </div>
      </div>
    </Card>
  )
}

export function AdminTicketDetailView({
  ticket,
  responses,
  loading = false,
  refreshing = false,
  saving = false,
  sending = false,
  error,
  pendingStatus,
  pendingPriority,
  composerMessage,
  isInternalNote,
  onBack,
  onRefresh,
  onStatusChange,
  onPriorityChange,
  onComposerMessageChange,
  onInternalNoteChange,
  onSaveDecision,
  onSendMessage,
}: AdminTicketDetailViewProps) {
  const statusMeta = getStatusMeta(ticket.status)
  const priorityMeta = getPriorityMeta(ticket.priority)
  const hasPendingChanges =
    pendingStatus !== ticket.status || pendingPriority !== ticket.priority

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <div className="flex flex-col gap-5">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Ticket admin
                  </Badge>
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

                <h1 className="mt-4 break-words text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                  {ticket.title}
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-safe-muted sm:text-base">
                  Reprends le contexte, ajuste le statut, puis réponds sans perdre le fil de la conversation.
                </p>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex sm:flex-wrap sm:justify-end">
                <ActionButton
                  tone="secondary"
                  onClick={onBack}
                  className="w-full justify-center sm:w-auto"
                >
                  <ArrowLeft className="size-4" data-icon="inline-start" />
                  Retour tickets
                </ActionButton>
                <ActionButton
                  tone="secondary"
                  onClick={onRefresh}
                  disabled={refreshing || loading}
                  className="w-full justify-center sm:w-auto"
                >
                  {refreshing ? (
                    <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                  ) : (
                    <RefreshCw className="size-4" data-icon="inline-start" />
                  )}
                  Actualiser
                </ActionButton>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryPanel
                icon={<UserRound className="size-5" />}
                eyebrow="Demandeur"
                title={ticket.user_full_name || 'Nom non défini'}
                description={ticket.user_email}
              />
              <SummaryPanel
                icon={<MessageSquareText className="size-5" />}
                eyebrow="Conversation"
                title={`${responses.length} message${responses.length > 1 ? 's' : ''}`}
                description="Historique complet du ticket et des réponses admin"
              />
              <SummaryPanel
                icon={<CalendarDays className="size-5" />}
                eyebrow="Création"
                title={formatLongDate(ticket.created_at)}
                description="Date de soumission initiale du ticket"
              />
              <SummaryPanel
                icon={<Clock3 className="size-5" />}
                eyebrow="Dernière activité"
                title={formatLongDate(ticket.updated_at)}
                description="Utile pour prioriser les relances côté support"
              />
            </div>
          </div>
        </section>

        {error ? (
          <Alert
            variant="destructive"
            className="rounded-[24px] border-destructive/25 bg-destructive/10 px-5 py-4"
          >
            <AlertTriangle className="size-4" />
            <AlertTitle>Impossible de finaliser l’action</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.45fr)_390px]">
          <div className="flex min-w-0 flex-col gap-6">
            <Card className="rounded-[28px] border-border bg-card/86 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                      Description initiale
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      Contexte communiqué par l’utilisateur
                    </h2>
                  </div>
                  <p className="text-sm text-safe-muted">
                    {getCategoryLabel(ticket.category)} • {priorityMeta.label}
                  </p>
                </div>

                <div className="rounded-[24px] border border-border bg-background/60 px-4 py-4 text-sm leading-7 text-foreground sm:px-5">
                  <p className="whitespace-pre-wrap break-words">
                    {ticket.description || 'Aucune description fournie sur ce ticket.'}
                  </p>
                </div>
              </div>
            </Card>

            <Card className="rounded-[28px] border-border bg-card/86 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
              <div className="flex flex-col gap-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                      Conversation
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      Historique lisible, y compris sur mobile
                    </h2>
                  </div>
                  <p className="text-sm text-safe-muted">
                    {responses.length} entrée{responses.length > 1 ? 's' : ''}
                  </p>
                </div>

                <div className="flex flex-col gap-4">
                  {responses.length > 0 ? (
                    responses.map((item) => (
                      <ConversationItem key={item.id} item={item} requesterId={ticket.user_id} />
                    ))
                  ) : (
                    <div className="rounded-[24px] border border-dashed border-border px-4 py-8 text-center text-sm text-safe-muted">
                      Aucun échange pour le moment. Tu peux répondre directement depuis le panneau d’action.
                    </div>
                  )}
                </div>
              </div>
            </Card>
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-6 xl:sticky xl:top-6">
              <Card className="rounded-[28px] border-border bg-card/88 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                      Décision support
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      Statut et priorité
                    </h2>
                  </div>

                  <div className="grid gap-4">
                    <div className="grid gap-2">
                      <Label htmlFor="admin-ticket-status">Statut</Label>
                      <Select value={pendingStatus} onValueChange={(value) => onStatusChange(value as AdminTicketStatus)}>
                        <SelectTrigger id="admin-ticket-status" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                          <SelectValue placeholder="Choisir un statut" />
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

                    <div className="grid gap-2">
                      <Label htmlFor="admin-ticket-priority">Priorité</Label>
                      <Select
                        value={pendingPriority}
                        onValueChange={(value) => onPriorityChange(value as AdminTicketPriority)}
                      >
                        <SelectTrigger id="admin-ticket-priority" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                          <SelectValue placeholder="Choisir une priorité" />
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
                  </div>

                  <ActionButton
                    tone="primary"
                    onClick={onSaveDecision}
                    disabled={!hasPendingChanges || saving}
                    className="w-full justify-center"
                  >
                    {saving ? (
                      <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                    ) : (
                      <Save className="size-4" data-icon="inline-start" />
                    )}
                    Enregistrer les changements
                  </ActionButton>
                </div>
              </Card>

              <Card className="rounded-[28px] border-border bg-card/88 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
                <div className="flex flex-col gap-5">
                  <div>
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                      Réponse rapide
                    </p>
                    <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                      Répondre sans friction
                    </h2>
                    <p className="mt-2 text-sm leading-6 text-safe-muted">
                      Une réponse publique bascule le ticket en attente utilisateur. Une note interne reste visible uniquement pour l’équipe.
                    </p>
                  </div>

                  <div className="grid gap-3">
                    <Label htmlFor="admin-ticket-reply">Message</Label>
                    <Textarea
                      id="admin-ticket-reply"
                      value={composerMessage}
                      onChange={(event) => onComposerMessageChange(event.target.value)}
                      placeholder="Rédige une réponse claire, courte et actionnable."
                      className="min-h-[168px] rounded-[22px] border-border bg-background/70 px-4 py-4 leading-7"
                    />
                  </div>

                  <div className="rounded-[20px] border border-border bg-background/60 p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        id="admin-ticket-internal-note"
                        checked={isInternalNote}
                        onCheckedChange={(checked) => onInternalNoteChange(checked === true)}
                        className="mt-1 size-5 rounded-md"
                      />
                      <div className="min-w-0">
                        <Label htmlFor="admin-ticket-internal-note" className="cursor-pointer">
                          Enregistrer comme note interne
                        </Label>
                        <p className="mt-1 text-sm leading-6 text-safe-muted">
                          Idéal pour transmettre du contexte à l’équipe sans notifier l’utilisateur.
                        </p>
                      </div>
                    </div>
                  </div>

                  <ActionButton
                    tone="primary"
                    onClick={onSendMessage}
                    disabled={sending || composerMessage.trim().length === 0}
                    className="w-full justify-center"
                  >
                    {sending ? (
                      <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                    ) : (
                      <SendHorizonal className="size-4" data-icon="inline-start" />
                    )}
                    {isInternalNote ? 'Ajouter la note interne' : 'Envoyer la réponse'}
                  </ActionButton>

                  <Alert className="rounded-[22px] border-primary/16 bg-primary/8 px-4 py-4">
                    <ShieldCheck className="size-4" />
                    <AlertTitle>Repère équipe</AlertTitle>
                    <AlertDescription>
                      {ticket.admin_full_name || ticket.admin_email
                        ? `Ticket actuellement suivi par ${ticket.admin_full_name || ticket.admin_email}.`
                        : 'Aucun référent admin explicite pour le moment.'}
                    </AlertDescription>
                  </Alert>

                  <Alert className="rounded-[22px] border-border bg-background/55 px-4 py-4">
                    {isInternalNote ? <LockKeyhole className="size-4" /> : <CheckCircle2 className="size-4" />}
                    <AlertTitle>{isInternalNote ? 'Mode note interne' : 'Mode réponse utilisateur'}</AlertTitle>
                    <AlertDescription>
                      {isInternalNote
                        ? 'Cette entrée restera privée et n’altèrera pas le flux utilisateur.'
                        : 'Le ticket passera automatiquement en attente utilisateur après l’envoi.'}
                    </AlertDescription>
                  </Alert>
                </div>
              </Card>

              <Card className="rounded-[28px] border-border bg-card/88 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
                <div className="flex flex-col gap-4">
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                    Contacts liés
                  </p>

                  <div className="grid gap-3">
                    <div className="rounded-[20px] border border-border bg-background/60 p-4">
                      <div className="flex items-start gap-3">
                        <Mail className="mt-0.5 size-4 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">Utilisateur</p>
                          <p className="break-words text-sm text-safe-muted">{ticket.user_email}</p>
                        </div>
                      </div>
                    </div>

                    <div className="rounded-[20px] border border-border bg-background/60 p-4">
                      <div className="flex items-start gap-3">
                        <UserRound className="mt-0.5 size-4 text-primary" />
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-foreground">Assigné à</p>
                          <p className="break-words text-sm text-safe-muted">
                            {ticket.admin_full_name || ticket.admin_email || 'Non assigné'}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
