'use client'

import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import {
  Activity,
  Download,
  FileText,
  Image,
  MessageSquare,
  Shield,
  Users,
} from 'lucide-react'

import {
  AdminDashboardContent,
  type AdminDashboardAction,
  type AdminDashboardActivity,
  type AdminDashboardStats,
  type AdminDashboardTicket,
} from '@/components/admin/AdminDashboardContent'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Card } from '@/components/ui/card'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { createClient } from '@/utils/supabase/client'

const QUICK_ACTIONS: Array<
  Omit<AdminDashboardAction, 'badge'> & {
    permission: 'moderator' | 'admin' | 'super_admin'
    badgeKey?: keyof AdminDashboardStats
  }
> = [
  {
    href: '/admin/tickets?status=open',
    title: 'Traiter les tickets',
    description: 'Priorise les demandes ouvertes et repars directement de la file support.',
    icon: MessageSquare,
    permission: 'moderator',
    badgeKey: 'open_tickets',
    emphasis: 'primary',
  },
  {
    href: '/admin/users',
    title: 'Gerer les utilisateurs',
    description: 'Roles, moderation et verification des profils sans bruit visuel.',
    icon: Users,
    permission: 'admin',
  },
  {
    href: '/admin/logs',
    title: 'Relire les logs',
    description: 'Audit, traces recentes et verification de l activite sensible.',
    icon: Activity,
    permission: 'admin',
  },
  {
    href: '/admin/exports',
    title: 'Exporter les donnees',
    description: 'Genere les exports admin sans repasser par plusieurs menus.',
    icon: Download,
    permission: 'admin',
  },
  {
    href: '/admin/documentation',
    title: 'Documentation',
    description: 'Retrouve les procedures, audits et notes de reference internes.',
    icon: FileText,
    permission: 'admin',
  },
  {
    href: '/admin/image-optimization',
    title: 'Images produit',
    description: 'Optimise les medias et corrige les assets sans quitter l espace admin.',
    icon: Image,
    permission: 'admin',
  },
]

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<AdminDashboardStats | null>(null)
  const [recentActivity, setRecentActivity] = useState<AdminDashboardActivity[]>([])
  const [recentTickets, setRecentTickets] = useState<AdminDashboardTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [errorMessage, setErrorMessage] = useState<string | null>(null)

  const { user, hasPermission, getAdminStats, logAdminAction, loading: authLoading } = useAdminAuth()
  const supabase = useMemo(() => createClient(), [])
  const refreshLockRef = useRef(false)
  const hasLoggedViewRef = useRef(false)

  const loadDashboardData = useCallback(async () => {
    if (refreshLockRef.current) {
      return
    }

    refreshLockRef.current = true
    setRefreshing(true)
    setErrorMessage(null)

    try {
      const [statsResult, activityResult, ticketsResult] = await Promise.allSettled([
        fetch('/api/admin/stats', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }),
        fetch('/api/admin/activity', {
          method: 'GET',
          credentials: 'include',
          cache: 'no-store',
        }),
        supabase
          .from('support_tickets')
          .select('id, title, category, status, priority, created_at')
          .order('created_at', { ascending: false })
          .limit(5),
      ])

      if (statsResult.status === 'fulfilled' && statsResult.value.ok) {
        setStats((await statsResult.value.json()) as AdminDashboardStats)
      } else {
        const fallbackStats = await getAdminStats()
        setStats((fallbackStats as AdminDashboardStats | null) ?? null)
      }

      if (activityResult.status === 'fulfilled' && activityResult.value.ok) {
        const activityPayload = (await activityResult.value.json()) as {
          activity?: Array<{
            id: string
            action: string
            target_type: string
            created_at: string
            admin_info?: { email_masked?: string }
          }>
        }

        setRecentActivity(
          (activityPayload.activity ?? []).map((entry) => ({
            id: entry.id,
            action: entry.action,
            target_type: entry.target_type,
            created_at: entry.created_at,
            admin_email: entry.admin_info?.email_masked ?? 'admin inconnu',
          })),
        )
      } else {
        setRecentActivity([])
      }

      if (ticketsResult.status === 'fulfilled') {
        setRecentTickets((ticketsResult.value.data as AdminDashboardTicket[] | null) ?? [])
      } else {
        setRecentTickets([])
      }

      if (!hasLoggedViewRef.current) {
        await logAdminAction('dashboard_viewed', 'admin_dashboard')
        hasLoggedViewRef.current = true
      }
    } catch {
      setErrorMessage('Le dashboard admin ne peut pas etre charge correctement pour le moment.')
    } finally {
      refreshLockRef.current = false
      setRefreshing(false)
      setLoading(false)
    }
  }, [getAdminStats, logAdminAction, supabase])

  useEffect(() => {
    if (!authLoading && hasPermission('moderator') && !stats) {
      void loadDashboardData()
    }
  }, [authLoading, hasPermission, loadDashboardData, stats])

  const visibleActions = useMemo(
    () =>
      QUICK_ACTIONS.filter((action) => hasPermission(action.permission)).map((action) => ({
        href: action.href,
        title: action.title,
        description: action.description,
        icon: action.icon,
        emphasis: action.emphasis,
        badge: action.badgeKey && stats ? `${stats[action.badgeKey] ?? 0}` : null,
      })),
    [hasPermission, stats],
  )

  if (authLoading || (loading && !stats && !errorMessage)) {
    return (
      <div className="space-y-5">
        <Card className="rounded-[28px] border-border bg-card/90 p-5 shadow-card">
          <div className="space-y-3 animate-pulse">
            <div className="h-6 w-40 rounded bg-muted" />
            <div className="h-10 w-3/4 rounded bg-muted" />
            <div className="h-4 w-full rounded bg-muted" />
          </div>
        </Card>
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <Card key={index} className="rounded-[22px] border-border bg-card/88 p-4 shadow-card">
              <div className="space-y-3 animate-pulse">
                <div className="h-4 w-24 rounded bg-muted" />
                <div className="h-9 w-16 rounded bg-muted" />
                <div className="h-4 w-28 rounded bg-muted" />
              </div>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!user || !hasPermission('moderator')) {
    return (
      <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
        <Shield className="h-4 w-4" aria-hidden="true" />
        <AlertTitle>Acces admin requis</AlertTitle>
        <AlertDescription>
          Cette surface reste reservee aux comptes disposant d un role moderateur ou superieur.
        </AlertDescription>
      </Alert>
    )
  }

  return (
    <div className="space-y-5">
      {errorMessage ? (
        <Alert className="border-destructive/30 bg-destructive/10 text-foreground">
          <AlertTitle>Chargement partiel</AlertTitle>
          <AlertDescription>{errorMessage}</AlertDescription>
        </Alert>
      ) : null}

      <AdminDashboardContent
        userEmail={user.email}
        stats={stats}
        actions={visibleActions}
        tickets={recentTickets}
        activity={recentActivity}
        refreshing={refreshing}
        onRefresh={() => void loadDashboardData()}
      />
    </div>
  )
}
