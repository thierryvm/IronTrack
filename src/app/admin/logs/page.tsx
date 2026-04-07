'use client'

import type { ReactNode } from 'react'
import { useCallback, useEffect, useMemo, useState } from 'react'
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Eye,
  Loader2,
  RefreshCw,
  Search,
  Shield,
} from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id: string | null
  details: Record<string, unknown>
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin_email: string
  admin_full_name: string | null
}

interface Filters {
  action: string
  target_type: string
  date_range: string
  search: string
}

interface Pagination {
  page: number
  limit: number
  total: number
  pages: number
  hasNext: boolean
  hasPrev: boolean
}

const DEFAULT_FILTERS: Filters = {
  action: 'all',
  target_type: 'all',
  date_range: '24h',
  search: '',
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

function humanizeToken(value: string) {
  return value.replaceAll('_', ' ')
}

function getActionMeta(action: string) {
  if (action.includes('unauthorized') || action.includes('failed')) {
    return {
      badgeClass: 'border-destructive/20 bg-destructive/10 text-safe-error',
      icon: <AlertTriangle className="size-4" />,
      label: 'Attention',
    }
  }

  if (action.includes('view') || action.includes('access')) {
    return {
      badgeClass: 'border-primary/20 bg-primary/10 text-primary',
      icon: <Eye className="size-4" />,
      label: 'Consultation',
    }
  }

  if (action.includes('success') || action.includes('update')) {
    return {
      badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-safe-success',
      icon: <CheckCircle2 className="size-4" />,
      label: 'Succès',
    }
  }

  return {
    badgeClass: 'border-border bg-background/70 text-safe-muted',
    icon: <Activity className="size-4" />,
    label: 'Journal',
  }
}

function SummaryCard({
  icon,
  eyebrow,
  title,
  helper,
}: {
  icon: ReactNode
  eyebrow: string
  title: string
  helper: string
}) {
  return (
    <Card className="rounded-[24px] border-border bg-card/84 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
      <div className="flex items-start gap-3">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary">
          {icon}
        </div>
        <div className="min-w-0">
          <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">{eyebrow}</p>
          <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">{title}</p>
          <p className="mt-1 text-sm leading-6 text-safe-muted">{helper}</p>
        </div>
      </div>
    </Card>
  )
}

function LogCard({ log }: { log: AdminLog }) {
  const actionMeta = getActionMeta(log.action)

  return (
    <Card className="rounded-[24px] border-border bg-card/84 p-5 shadow-[0_16px_36px_rgba(0,0,0,0.14)]">
      <div className="flex flex-col gap-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className={actionMeta.badgeClass}>
                {actionMeta.icon}
                <span className="ml-1">{actionMeta.label}</span>
              </Badge>
              <Badge variant="outline" className="border-border bg-background/70 text-foreground">
                {humanizeToken(log.target_type || 'unknown')}
              </Badge>
            </div>

            <h2 className="mt-3 break-words text-lg font-semibold tracking-tight text-foreground">
              {humanizeToken(log.action || 'action inconnue')}
            </h2>
            <p className="mt-2 break-words text-sm text-safe-muted">
              {log.admin_full_name || log.admin_email}
            </p>
          </div>

          <div className="shrink-0 text-left text-sm text-safe-muted sm:text-right">
            <p>{formatLongDate(log.created_at)}</p>
            {log.target_id ? <p className="mt-1">ID {log.target_id.slice(0, 8)}…</p> : null}
          </div>
        </div>

        <div className="grid gap-3 text-sm text-safe-muted">
          <p className="break-all">Admin : {log.admin_email}</p>
          {log.ip_address ? <p>IP : {log.ip_address}</p> : null}
          {log.user_agent ? <p className="line-clamp-2 break-words">Agent : {log.user_agent}</p> : null}
        </div>

        {log.details && Object.keys(log.details).length > 0 ? (
          <details className="rounded-[20px] border border-border bg-background/60 px-4 py-4">
            <summary className="cursor-pointer text-sm font-semibold text-primary">
              Voir les détails JSON
            </summary>
            <pre className="mt-4 overflow-x-auto rounded-[16px] border border-border bg-card/90 p-4 text-xs leading-6 text-foreground">
              {JSON.stringify(log.details, null, 2)}
            </pre>
          </details>
        ) : null}
      </div>
    </Card>
  )
}

export default function AdminLogsPage() {
  const { hasPermission } = useAdminAuth()

  const [logs, setLogs] = useState<AdminLog[]>([])
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 50,
    total: 0,
    pages: 0,
    hasNext: false,
    hasPrev: false,
  })

  const canViewLogs = hasPermission('admin')

  const fetchLogs = useCallback(
    async (page = 1, nextFilters = filters, silent = false) => {
      if (!canViewLogs) {
        return
      }

      try {
        setError(null)
        if (silent) {
          setRefreshing(true)
        } else {
          setLoading(true)
        }

        const params = new URLSearchParams({
          page: String(page),
          limit: '50',
          date_range: nextFilters.date_range,
        })

        if (nextFilters.action !== 'all') {
          params.set('action', nextFilters.action)
        }
        if (nextFilters.target_type !== 'all') {
          params.set('target_type', nextFilters.target_type)
        }
        if (nextFilters.search.trim()) {
          params.set('search', nextFilters.search.trim())
        }

        const response = await fetch(`/api/admin/logs?${params.toString()}`, {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        })

        const payload = (await response.json().catch(() => null)) as
          | { logs?: AdminLog[]; pagination?: Pagination; error?: string }
          | null

        if (!response.ok || !payload?.logs || !payload.pagination) {
          throw new Error(payload?.error || 'Impossible de charger les logs')
        }

        setLogs(payload.logs)
        setPagination(payload.pagination)
      } catch (fetchError) {
        setError(fetchError instanceof Error ? fetchError.message : 'Erreur de chargement des logs')
      } finally {
        if (silent) {
          setRefreshing(false)
        } else {
          setLoading(false)
        }
      }
    },
    [canViewLogs],
  )

  useEffect(() => {
    if (!canViewLogs) {
      setLoading(false)
      return
    }

    void fetchLogs(1, filters)
  }, [canViewLogs, fetchLogs, filters])

  const summary = useMemo(() => {
    const critical = logs.filter((log) => log.action.includes('unauthorized') || log.action.includes('failed')).length
    const consults = logs.filter((log) => log.action.includes('view') || log.action.includes('access')).length
    const writeActions = logs.filter((log) => log.action.includes('update') || log.action.includes('delete')).length

    return {
      critical,
      consults,
      writeActions,
    }
  }, [logs])

  if (!canViewLogs) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-lg rounded-[30px] border border-border bg-card/88 p-6 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-8">
          <Alert
            variant="destructive"
            className="rounded-[24px] border-destructive/25 bg-destructive/10 px-5 py-4"
          >
            <AlertTriangle className="size-4" />
            <AlertTitle>Accès aux logs restreint</AlertTitle>
            <AlertDescription>
              Cette surface est réservée aux admins et super admins.
            </AlertDescription>
          </Alert>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <div className="flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                    Audit trail
                  </Badge>
                  <Badge variant="outline" className="border-border bg-background/70 text-foreground">
                    Admin uniquement
                  </Badge>
                </div>
                <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                  Logs système
                </h1>
                <p className="mt-3 max-w-3xl text-sm leading-7 text-safe-muted sm:text-base">
                  Lecture claire des actions admin, y compris sur petit écran, avec détails techniques dépliables seulement quand c’est utile.
                </p>
              </div>

              <ActionButton
                tone="secondary"
                onClick={() => fetchLogs(pagination.page, filters, true)}
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

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={<Activity className="size-5" />}
                eyebrow="Résultats"
                title={pagination.total.toLocaleString('fr-BE')}
                helper="Nombre total de logs correspondant au filtre courant"
              />
              <SummaryCard
                icon={<AlertTriangle className="size-5" />}
                eyebrow="Sensibles"
                title={String(summary.critical)}
                helper="Tentatives ou événements qui demandent une vérification"
              />
              <SummaryCard
                icon={<Eye className="size-5" />}
                eyebrow="Consultations"
                title={String(summary.consults)}
                helper="Actions de lecture ou d’accès visibles sur la page actuelle"
              />
              <SummaryCard
                icon={<Shield className="size-5" />}
                eyebrow="Écritures"
                title={String(summary.writeActions)}
                helper="Modifications explicites détectées sur la page actuelle"
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
            <AlertTitle>Chargement incomplet</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-[28px] border-border bg-card/86 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_220px_220px_220px]">
            <div className="grid gap-2">
              <Label htmlFor="admin-logs-search">Recherche</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-safe-muted" />
                <Input
                  id="admin-logs-search"
                  value={filters.search}
                  onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
                  placeholder="Action, API ou type de cible"
                  className="h-12 rounded-2xl bg-background/70 pl-11"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-logs-period">Période</Label>
              <Select
                value={filters.date_range}
                onValueChange={(value) => setFilters((current) => ({ ...current, date_range: value }))}
              >
                <SelectTrigger id="admin-logs-period" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                  <SelectValue placeholder="Période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Dernière heure</SelectItem>
                  <SelectItem value="24h">24 heures</SelectItem>
                  <SelectItem value="7d">7 jours</SelectItem>
                  <SelectItem value="30d">30 jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-logs-action">Action</Label>
              <Select
                value={filters.action}
                onValueChange={(value) => setFilters((current) => ({ ...current, action: value }))}
              >
                <SelectTrigger id="admin-logs-action" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="admin_access">Accès admin</SelectItem>
                  <SelectItem value="view_admin_logs">Consultation logs</SelectItem>
                  <SelectItem value="unauthorized_admin_access_attempt">Accès non autorisé</SelectItem>
                  <SelectItem value="user_management">Gestion utilisateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-logs-target">Cible</Label>
              <Select
                value={filters.target_type}
                onValueChange={(value) => setFilters((current) => ({ ...current, target_type: value }))}
              >
                <SelectTrigger id="admin-logs-target" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                  <SelectValue placeholder="Toutes les cibles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes</SelectItem>
                  <SelectItem value="admin_panel">Interface admin</SelectItem>
                  <SelectItem value="user_account">Comptes utilisateurs</SelectItem>
                  <SelectItem value="admin_logs">Logs système</SelectItem>
                  <SelectItem value="admin_api">APIs admin</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="mt-4 flex flex-col gap-3 sm:flex-row">
            <ActionButton
              tone="primary"
              onClick={() => fetchLogs(1, filters)}
              className="w-full justify-center sm:w-auto"
            >
              Appliquer les filtres
            </ActionButton>
            <ActionButton
              tone="secondary"
              onClick={() => {
                setFilters(DEFAULT_FILTERS)
                void fetchLogs(1, DEFAULT_FILTERS)
              }}
              className="w-full justify-center sm:w-auto"
            >
              Réinitialiser
            </ActionButton>
          </div>
        </Card>

        <section className="flex flex-col gap-4">
          {loading ? (
            <Card className="rounded-[28px] border-border bg-card/86 p-8 text-center shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
              <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary">
                <Loader2 className="size-6 animate-spin" />
              </div>
              <p className="mt-4 text-base font-semibold text-foreground">Chargement des logs</p>
              <p className="mt-2 text-sm text-safe-muted">
                Consolidation de la page demandée et des filtres actifs.
              </p>
            </Card>
          ) : logs.length > 0 ? (
            logs.map((log) => <LogCard key={log.id} log={log} />)
          ) : (
            <Card className="rounded-[28px] border-border bg-card/86 p-8 text-center shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
              <p className="text-base font-semibold text-foreground">Aucun log trouvé</p>
              <p className="mt-2 text-sm text-safe-muted">
                Essaie une autre période ou élargis la recherche.
              </p>
            </Card>
          )}
        </section>

        {pagination.pages > 1 ? (
          <Card className="rounded-[28px] border-border bg-card/86 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="text-sm text-safe-muted">
                Page {pagination.page} sur {pagination.pages} • {pagination.total.toLocaleString('fr-BE')} logs
              </div>

              <div className="grid grid-cols-2 gap-3 sm:flex">
                <ActionButton
                  tone="secondary"
                  onClick={() => fetchLogs(pagination.page - 1, filters)}
                  disabled={!pagination.hasPrev}
                  className="w-full justify-center sm:w-auto"
                >
                  Précédent
                </ActionButton>
                <ActionButton
                  tone="secondary"
                  onClick={() => fetchLogs(pagination.page + 1, filters)}
                  disabled={!pagination.hasNext}
                  className="w-full justify-center sm:w-auto"
                >
                  Suivant
                </ActionButton>
              </div>
            </div>
          </Card>
        ) : null}
      </div>
    </div>
  )
}
