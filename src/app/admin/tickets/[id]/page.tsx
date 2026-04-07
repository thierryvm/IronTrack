'use client'

import { useCallback, useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { AlertTriangle, Loader2 } from 'lucide-react'

import { AdminTicketDetailView } from '@/components/admin/AdminTicketDetailView'
import type {
  AdminTicketConversationItem,
  AdminTicketDetailData,
  AdminTicketPriority,
  AdminTicketStatus,
} from '@/components/admin/AdminTicketDetailView'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import ActionButton from '@/components/ui/action-button'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface TicketApiPayload {
  ticket: AdminTicketDetailData
  responses: AdminTicketConversationItem[]
}

function LoadingState() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex w-full max-w-md flex-col items-center gap-4 rounded-[28px] border border-border bg-card/86 px-6 py-10 text-center shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
        <div className="flex size-14 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary">
          <Loader2 className="size-6 animate-spin" />
        </div>
        <div className="space-y-2">
          <h1 className="text-xl font-semibold tracking-tight text-foreground">Chargement du ticket</h1>
          <p className="text-sm leading-6 text-safe-muted">
            Préparation du contexte, de la conversation et des actions admin.
          </p>
        </div>
      </div>
    </div>
  )
}

function AccessDeniedState({ onBack }: { onBack: () => void }) {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="w-full max-w-lg rounded-[30px] border border-border bg-card/88 p-6 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-8">
        <Alert
          variant="destructive"
          className="rounded-[24px] border-destructive/25 bg-destructive/10 px-5 py-4"
        >
          <AlertTriangle className="size-4" />
          <AlertTitle>Accès refusé</AlertTitle>
          <AlertDescription>
            Cette page est réservée aux rôles modérateur, admin ou super admin.
          </AlertDescription>
        </Alert>

        <ActionButton tone="secondary" onClick={onBack} className="mt-6 w-full justify-center">
          Retour au tableau admin
        </ActionButton>
      </div>
    </div>
  )
}

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = useMemo(() => {
    const rawId = params?.id
    return Array.isArray(rawId) ? rawId[0] : rawId
  }, [params])

  const { loading: authLoading, hasPermission } = useAdminAuth()

  const [ticket, setTicket] = useState<AdminTicketDetailData | null>(null)
  const [responses, setResponses] = useState<AdminTicketConversationItem[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [sending, setSending] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pendingStatus, setPendingStatus] = useState<AdminTicketStatus>('pending')
  const [pendingPriority, setPendingPriority] = useState<AdminTicketPriority>('medium')
  const [composerMessage, setComposerMessage] = useState('')
  const [isInternalNote, setIsInternalNote] = useState(false)

  const canModerate = hasPermission('moderator')

  const syncPayload = useCallback((payload: TicketApiPayload) => {
    setTicket(payload.ticket)
    setResponses(payload.responses)
    setPendingStatus(payload.ticket.status)
    setPendingPriority(payload.ticket.priority)
  }, [])

  const fetchTicket = useCallback(
    async (options?: { silent?: boolean }) => {
      if (!ticketId || !canModerate) {
        return
      }

      const silent = options?.silent ?? false

      try {
        setError(null)

        if (silent) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        const response = await fetch(`/api/admin/tickets/${ticketId}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | (Partial<TicketApiPayload> & { error?: string })
          | null

        if (!response.ok || !payload?.ticket) {
          throw new Error(payload?.error || 'Impossible de charger le ticket')
        }

        syncPayload({
          ticket: payload.ticket as AdminTicketDetailData,
          responses: Array.isArray(payload.responses)
            ? (payload.responses as AdminTicketConversationItem[])
            : [],
        })
      } catch (fetchError) {
        setError(
          fetchError instanceof Error ? fetchError.message : 'Erreur de chargement du ticket',
        )
      } finally {
        if (silent) {
          setRefreshing(false)
        } else {
          setLoading(false)
        }
      }
    },
    [canModerate, syncPayload, ticketId],
  )

  useEffect(() => {
    if (authLoading) {
      return
    }

    if (!ticketId || !canModerate) {
      setLoading(false)
      return
    }

    fetchTicket()
  }, [authLoading, canModerate, fetchTicket, ticketId])

  const handleSaveDecision = useCallback(async () => {
    if (!ticket) {
      return
    }

    if (pendingStatus === ticket.status && pendingPriority === ticket.priority) {
      return
    }

    try {
      setSaving(true)
      setError(null)

      const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: 'PATCH',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: pendingStatus,
          priority: pendingPriority,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | (Partial<TicketApiPayload> & { error?: string })
        | null

      if (!response.ok || !payload?.ticket) {
        throw new Error(payload?.error || 'Impossible d’enregistrer les changements')
      }

      syncPayload({
        ticket: payload.ticket as AdminTicketDetailData,
        responses: Array.isArray(payload.responses)
          ? (payload.responses as AdminTicketConversationItem[])
          : responses,
      })
    } catch (saveError) {
      setError(
        saveError instanceof Error ? saveError.message : 'Erreur lors de la mise à jour du ticket',
      )
    } finally {
      setSaving(false)
    }
  }, [pendingPriority, pendingStatus, responses, syncPayload, ticket])

  const handleSendMessage = useCallback(async () => {
    if (!ticket || composerMessage.trim().length === 0) {
      return
    }

    try {
      setSending(true)
      setError(null)

      const response = await fetch(`/api/admin/tickets/${ticket.id}`, {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: composerMessage.trim(),
          is_internal: isInternalNote,
        }),
      })

      const payload = (await response.json().catch(() => null)) as
        | (Partial<TicketApiPayload> & { error?: string })
        | null

      if (!response.ok || !payload?.ticket) {
        throw new Error(payload?.error || 'Impossible d’envoyer la réponse')
      }

      syncPayload({
        ticket: payload.ticket as AdminTicketDetailData,
        responses: Array.isArray(payload.responses)
          ? (payload.responses as AdminTicketConversationItem[])
          : responses,
      })

      setComposerMessage('')
      setIsInternalNote(false)
    } catch (sendError) {
      setError(
        sendError instanceof Error ? sendError.message : 'Erreur lors de l’envoi de la réponse',
      )
    } finally {
      setSending(false)
    }
  }, [composerMessage, isInternalNote, responses, syncPayload, ticket])

  if (authLoading || loading) {
    return <LoadingState />
  }

  if (!canModerate) {
    return <AccessDeniedState onBack={() => router.push('/admin/tickets')} />
  }

  if (!ticketId || !ticket) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-[30px] border border-border bg-card/88 p-6 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-8">
          <Alert
            variant="destructive"
            className="rounded-[24px] border-destructive/25 bg-destructive/10 px-5 py-4"
          >
            <AlertTriangle className="size-4" />
            <AlertTitle>Ticket indisponible</AlertTitle>
            <AlertDescription>
              {error || 'Le ticket demandé est introuvable ou n’a pas pu être chargé.'}
            </AlertDescription>
          </Alert>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            <ActionButton tone="secondary" onClick={() => router.push('/admin/tickets')} className="w-full justify-center">
              Retour tickets
            </ActionButton>
            <ActionButton tone="primary" onClick={() => fetchTicket()} className="w-full justify-center">
              Réessayer
            </ActionButton>
          </div>
        </div>
      </div>
    )
  }

  return (
    <AdminTicketDetailView
      ticket={ticket}
      responses={responses}
      loading={loading}
      refreshing={refreshing}
      saving={saving}
      sending={sending}
      error={error}
      pendingStatus={pendingStatus}
      pendingPriority={pendingPriority}
      composerMessage={composerMessage}
      isInternalNote={isInternalNote}
      onBack={() => router.push('/admin/tickets')}
      onRefresh={() => fetchTicket({ silent: true })}
      onStatusChange={setPendingStatus}
      onPriorityChange={setPendingPriority}
      onComposerMessageChange={setComposerMessage}
      onInternalNoteChange={setIsInternalNote}
      onSaveDecision={handleSaveDecision}
      onSendMessage={handleSendMessage}
    />
  )
}
