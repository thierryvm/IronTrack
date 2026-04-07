'use client'

import type { ReactNode } from 'react'
import { useEffect, useMemo, useState } from 'react'
import {
  AlertTriangle,
  Crown,
  Loader2,
  Search,
  Shield,
  Trash2,
  UserRound,
  UserX,
  Users,
} from 'lucide-react'

import ActionButton from '@/components/ui/action-button'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { Checkbox } from '@/components/ui/checkbox'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { AdminUser, useAdminUserManagement, UserStats } from '@/hooks/useAdminUserManagement'

type RoleFilter = 'all' | 'user' | 'moderator' | 'admin' | 'super_admin'
type StatusFilter = 'all' | 'active' | 'banned'
type SortMode = 'recent' | 'activity' | 'workouts' | 'role'
type BanDuration = '24h' | '7d' | '30d' | 'permanent'

function formatLongDate(value?: string) {
  if (!value) {
    return 'Non disponible'
  }

  return new Intl.DateTimeFormat('fr-BE', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function getRoleMeta(role: AdminUser['role']) {
  switch (role) {
    case 'super_admin':
      return {
        label: 'Super admin',
        badgeClass: 'border-violet-500/20 bg-violet-500/10 text-safe-info',
        icon: <Crown className="size-4" />,
      }
    case 'admin':
      return {
        label: 'Admin',
        badgeClass: 'border-primary/20 bg-primary/10 text-primary',
        icon: <Shield className="size-4" />,
      }
    case 'moderator':
      return {
        label: 'Modérateur',
        badgeClass: 'border-amber-500/20 bg-amber-500/10 text-safe-warning',
        icon: <Shield className="size-4" />,
      }
    default:
      return {
        label: 'Utilisateur',
        badgeClass: 'border-border bg-background/70 text-safe-muted',
        icon: <UserRound className="size-4" />,
      }
  }
}

function getStatusMeta(user: AdminUser) {
  if (user.is_banned) {
    return {
      label: 'Banni',
      badgeClass: 'border-destructive/20 bg-destructive/10 text-safe-error',
    }
  }

  if (user.is_active) {
    return {
      label: 'Actif',
      badgeClass: 'border-emerald-500/20 bg-emerald-500/10 text-safe-success',
    }
  }

  return {
    label: 'Inactif',
    badgeClass: 'border-border bg-background/70 text-safe-muted',
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

function UserCard({
  user,
  selected,
  onSelect,
}: {
  user: AdminUser
  selected: boolean
  onSelect: () => void
}) {
  const roleMeta = getRoleMeta(user.role)
  const statusMeta = getStatusMeta(user)

  return (
    <Card
      className={`rounded-[24px] border p-5 shadow-[0_16px_36px_rgba(0,0,0,0.14)] transition-colors ${
        selected
          ? 'border-primary/30 bg-primary/8'
          : 'border-border bg-card/84 hover:border-primary/15 hover:bg-card'
      }`}
    >
      <div className="flex flex-col gap-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-lg font-semibold tracking-tight text-foreground">
              {user.pseudo || user.full_name || user.email.split('@')[0]}
            </p>
            <p className="mt-1 break-all text-sm text-safe-muted">{user.email}</p>
          </div>

          <Badge variant="outline" className={statusMeta.badgeClass}>
            {statusMeta.label}
          </Badge>
        </div>

        <div className="flex flex-wrap gap-2">
          <Badge variant="outline" className={roleMeta.badgeClass}>
            {roleMeta.icon}
            <span className="ml-1">{roleMeta.label}</span>
          </Badge>
          <Badge variant="outline" className="border-border bg-background/70 text-foreground">
            {user.total_workouts} séance{user.total_workouts > 1 ? 's' : ''}
          </Badge>
        </div>

        <div className="grid gap-2 text-sm text-safe-muted">
          <p>Créé le {formatLongDate(user.created_at)}</p>
          <p>Dernière activité : {formatLongDate(user.last_active || user.last_workout)}</p>
        </div>

        <ActionButton tone={selected ? 'primary' : 'secondary'} onClick={onSelect} className="w-full justify-center">
          {selected ? 'Fiche ouverte' : 'Ouvrir la fiche'}
        </ActionButton>
      </div>
    </Card>
  )
}

export default function AdminUsersPage() {
  const { hasPermission } = useAdminAuth()
  const { users, loading, error, updateUserRole, banUser, deleteUser, getUserStats, clearError } =
    useAdminUserManagement()

  const [search, setSearch] = useState('')
  const [roleFilter, setRoleFilter] = useState<RoleFilter>('all')
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all')
  const [sortMode, setSortMode] = useState<SortMode>('recent')
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null)
  const [selectedRole, setSelectedRole] = useState<AdminUser['role']>('user')
  const [banReason, setBanReason] = useState('')
  const [banDuration, setBanDuration] = useState<BanDuration>('7d')
  const [deleteConfirm, setDeleteConfirm] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)
  const [userStats, setUserStats] = useState<UserStats | null>(null)
  const [statsLoading, setStatsLoading] = useState(false)
  const [roleSaving, setRoleSaving] = useState(false)
  const [banSaving, setBanSaving] = useState(false)
  const [deleteSaving, setDeleteSaving] = useState(false)

  const canManageUsers = hasPermission('admin')
  const canManageRoles = hasPermission('super_admin')

  const selectedUser = useMemo(
    () => users.find((user) => user.id === selectedUserId) || null,
    [selectedUserId, users],
  )

  useEffect(() => {
    if (!selectedUser && users.length > 0) {
      setSelectedUserId(users[0].id)
    }
  }, [selectedUser, users])

  useEffect(() => {
    if (!selectedUser) {
      setUserStats(null)
      return
    }

    setSelectedRole(selectedUser.role)
    setDeleteConfirm(false)

    if (!canManageUsers) {
      setUserStats(null)
      return
    }

    let cancelled = false

    const loadStats = async () => {
      setStatsLoading(true)
      const stats = await getUserStats(selectedUser.id)
      if (!cancelled) {
        setUserStats(stats)
        setStatsLoading(false)
      }
    }

    void loadStats()

    return () => {
      cancelled = true
    }
  }, [canManageUsers, getUserStats, selectedUser])

  const filteredUsers = useMemo(() => {
    const loweredSearch = search.trim().toLowerCase()

    return [...users]
      .filter((user) => {
        if (roleFilter !== 'all' && user.role !== roleFilter) {
          return false
        }

        if (statusFilter === 'active' && user.is_banned) {
          return false
        }

        if (statusFilter === 'banned' && !user.is_banned) {
          return false
        }

        if (!loweredSearch) {
          return true
        }

        return (
          user.email.toLowerCase().includes(loweredSearch) ||
          (user.full_name || '').toLowerCase().includes(loweredSearch) ||
          (user.pseudo || '').toLowerCase().includes(loweredSearch)
        )
      })
      .sort((left, right) => {
        switch (sortMode) {
          case 'activity': {
            const leftValue = new Date(left.last_active || left.last_workout || 0).getTime()
            const rightValue = new Date(right.last_active || right.last_workout || 0).getTime()
            return rightValue - leftValue
          }
          case 'workouts':
            return right.total_workouts - left.total_workouts
          case 'role': {
            const order: Record<AdminUser['role'], number> = {
              super_admin: 4,
              admin: 3,
              moderator: 2,
              user: 1,
            }

            return order[right.role] - order[left.role]
          }
          default:
            return new Date(right.created_at).getTime() - new Date(left.created_at).getTime()
        }
      })
  }, [roleFilter, search, sortMode, statusFilter, users])

  const summary = useMemo(
    () => ({
      total: users.length,
      active: users.filter((user) => !user.is_banned).length,
      banned: users.filter((user) => user.is_banned).length,
      elevated: users.filter((user) => user.role !== 'user').length,
    }),
    [users],
  )

  const handleRoleSave = async () => {
    if (!selectedUser || !canManageRoles || selectedRole === selectedUser.role) {
      return
    }

    setRoleSaving(true)
    setActionError(null)
    clearError()

    const success = await updateUserRole(selectedUser.id, selectedRole)
    if (!success) {
      setActionError("Impossible de mettre à jour le rôle de l'utilisateur.")
    }
    setRoleSaving(false)
  }

  const handleBanAction = async () => {
    if (!selectedUser || !canManageUsers) {
      return
    }

    setBanSaving(true)
    setActionError(null)
    clearError()

    const now = new Date()
    const durations: Record<BanDuration, Date> = {
      '24h': new Date(now.getTime() + 24 * 60 * 60 * 1000),
      '7d': new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000),
      '30d': new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000),
      permanent: new Date(now.getTime() + 3650 * 24 * 60 * 60 * 1000),
    }

    const success = selectedUser.is_banned
      ? await banUser(selectedUser.id, {})
      : await banUser(selectedUser.id, {
          banned_until: durations[banDuration],
          ban_reason: banReason.trim() || undefined,
        })

    if (!success) {
      setActionError(
        selectedUser.is_banned
          ? "Impossible de réactiver l'utilisateur."
          : "Impossible d'appliquer le bannissement.",
      )
    } else if (!selectedUser.is_banned) {
      setBanReason('')
      setBanDuration('7d')
    }

    setBanSaving(false)
  }

  const handleDeleteUser = async () => {
    if (!selectedUser || !canManageRoles || !deleteConfirm) {
      return
    }

    setDeleteSaving(true)
    setActionError(null)
    clearError()

    const success = await deleteUser(selectedUser.id)
    if (!success) {
      setActionError("Impossible de supprimer l'utilisateur.")
    } else {
      setSelectedUserId(null)
      setDeleteConfirm(false)
    }

    setDeleteSaving(false)
  }

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <div className="flex flex-col gap-4">
            <div>
              <div className="flex flex-wrap gap-2">
                <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                  Admin users
                </Badge>
                <Badge variant="outline" className="border-border bg-background/70 text-foreground">
                  Mobile-first
                </Badge>
              </div>
              <h1 className="mt-4 text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                Utilisateurs
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-safe-muted sm:text-base">
                Recherche rapide, lecture claire et actions d’administration sans table illisible ni modales empilées.
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
              <SummaryCard
                icon={<Users className="size-5" />}
                eyebrow="Comptes"
                title={String(summary.total)}
                helper="Nombre total d’utilisateurs remontés par l’API admin"
              />
              <SummaryCard
                icon={<UserRound className="size-5" />}
                eyebrow="Actifs"
                title={String(summary.active)}
                helper="Comptes actuellement exploitables sans blocage explicite"
              />
              <SummaryCard
                icon={<UserX className="size-5" />}
                eyebrow="Bannis"
                title={String(summary.banned)}
                helper="Comptes bloqués, à vérifier avant support ou relance"
              />
              <SummaryCard
                icon={<Shield className="size-5" />}
                eyebrow="Rôles élevés"
                title={String(summary.elevated)}
                helper="Modérateurs, admins et super admins en circulation"
              />
            </div>
          </div>
        </section>

        {error || actionError ? (
          <Alert
            variant="destructive"
            className="rounded-[24px] border-destructive/25 bg-destructive/10 px-5 py-4"
          >
            <AlertTriangle className="size-4" />
            <AlertTitle>Action ou chargement incomplet</AlertTitle>
            <AlertDescription>{actionError || error}</AlertDescription>
          </Alert>
        ) : null}

        <Card className="rounded-[28px] border-border bg-card/86 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-[minmax(0,1.2fr)_220px_220px_220px]">
            <div className="grid gap-2">
              <Label htmlFor="admin-users-search">Recherche</Label>
              <div className="relative">
                <Search className="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-safe-muted" />
                <Input
                  id="admin-users-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Nom, pseudo ou email"
                  className="h-12 rounded-2xl bg-background/70 pl-11"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-users-role-filter">Rôle</Label>
              <Select value={roleFilter} onValueChange={(value) => setRoleFilter(value as RoleFilter)}>
                <SelectTrigger id="admin-users-role-filter" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                  <SelectValue placeholder="Tous les rôles" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les rôles</SelectItem>
                  <SelectItem value="user">Utilisateur</SelectItem>
                  <SelectItem value="moderator">Modérateur</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                  <SelectItem value="super_admin">Super admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-users-status-filter">Statut</Label>
              <Select value={statusFilter} onValueChange={(value) => setStatusFilter(value as StatusFilter)}>
                <SelectTrigger id="admin-users-status-filter" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                  <SelectValue placeholder="Tous les statuts" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les statuts</SelectItem>
                  <SelectItem value="active">Actifs</SelectItem>
                  <SelectItem value="banned">Bannis</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="admin-users-sort">Tri</Label>
              <Select value={sortMode} onValueChange={(value) => setSortMode(value as SortMode)}>
                <SelectTrigger id="admin-users-sort" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                  <SelectValue placeholder="Trier par" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="recent">Création récente</SelectItem>
                  <SelectItem value="activity">Activité récente</SelectItem>
                  <SelectItem value="workouts">Séances réalisées</SelectItem>
                  <SelectItem value="role">Rôle</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </Card>

        <section className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_400px]">
          <div className="flex min-w-0 flex-col gap-4">
            {loading ? (
              <Card className="rounded-[28px] border-border bg-card/86 p-8 text-center shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
                <div className="mx-auto flex size-14 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary">
                  <Loader2 className="size-6 animate-spin" />
                </div>
                <p className="mt-4 text-base font-semibold text-foreground">Chargement des utilisateurs</p>
                <p className="mt-2 text-sm text-safe-muted">Préparation de la liste et des actions admin.</p>
              </Card>
            ) : filteredUsers.length > 0 ? (
              filteredUsers.map((user) => (
                <UserCard
                  key={user.id}
                  user={user}
                  selected={user.id === selectedUserId}
                  onSelect={() => setSelectedUserId(user.id)}
                />
              ))
            ) : (
              <Card className="rounded-[28px] border-border bg-card/86 p-8 text-center shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
                <p className="text-base font-semibold text-foreground">Aucun utilisateur ne correspond aux filtres.</p>
                <p className="mt-2 text-sm text-safe-muted">
                  Réinitialise la recherche ou change le filtre de statut.
                </p>
              </Card>
            )}
          </div>

          <div className="min-w-0">
            <div className="flex flex-col gap-6 xl:sticky xl:top-6">
              {selectedUser ? (
                <>
                  <Card className="rounded-[28px] border-border bg-card/88 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                          Fiche utilisateur
                        </p>
                        <h2 className="mt-2 break-words text-2xl font-semibold tracking-tight text-foreground">
                          {selectedUser.pseudo || selectedUser.full_name || selectedUser.email}
                        </h2>
                        <p className="mt-2 break-all text-sm text-safe-muted">{selectedUser.email}</p>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <Badge variant="outline" className={getRoleMeta(selectedUser.role).badgeClass}>
                          {getRoleMeta(selectedUser.role).label}
                        </Badge>
                        <Badge variant="outline" className={getStatusMeta(selectedUser).badgeClass}>
                          {getStatusMeta(selectedUser).label}
                        </Badge>
                      </div>

                      <div className="grid gap-3 text-sm text-safe-muted">
                        <p>Création : {formatLongDate(selectedUser.created_at)}</p>
                        <p>Dernière activité : {formatLongDate(selectedUser.last_active || selectedUser.last_workout)}</p>
                        <p>Onboarding : {selectedUser.is_onboarding_complete ? 'Terminé' : 'Incomplet'}</p>
                      </div>
                    </div>
                  </Card>

                  <Card className="rounded-[28px] border-border bg-card/88 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
                    <div className="flex flex-col gap-4">
                      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                        Statistiques
                      </p>

                      {statsLoading ? (
                        <div className="flex items-center gap-3 rounded-[20px] border border-border bg-background/60 px-4 py-4 text-sm text-safe-muted">
                          <Loader2 className="size-4 animate-spin text-primary" />
                          Chargement des statistiques utilisateur
                        </div>
                      ) : userStats ? (
                        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-1">
                          <div className="rounded-[20px] border border-border bg-background/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">Séances</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">{userStats.total_workouts}</p>
                          </div>
                          <div className="rounded-[20px] border border-border bg-background/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">Exercices</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">{userStats.total_exercises}</p>
                          </div>
                          <div className="rounded-[20px] border border-border bg-background/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">Tickets</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">{userStats.support_tickets}</p>
                          </div>
                          <div className="rounded-[20px] border border-border bg-background/60 p-4">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">Ancienneté</p>
                            <p className="mt-2 text-2xl font-semibold text-foreground">{userStats.account_age_days} j</p>
                          </div>
                        </div>
                      ) : (
                        <div className="rounded-[20px] border border-dashed border-border px-4 py-6 text-sm text-safe-muted">
                          Aucune statistique détaillée disponible pour ce profil.
                        </div>
                      )}
                    </div>
                  </Card>

                  <Card className="rounded-[28px] border-border bg-card/88 p-5 shadow-[0_22px_48px_rgba(0,0,0,0.16)] sm:p-6">
                    <div className="flex flex-col gap-5">
                      <div>
                        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                          Actions admin
                        </p>
                        <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">
                          Décisions centralisées
                        </h2>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="admin-users-role">Rôle</Label>
                        <Select value={selectedRole} onValueChange={(value) => setSelectedRole(value as AdminUser['role'])}>
                          <SelectTrigger id="admin-users-role" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                            <SelectValue placeholder="Choisir un rôle" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="user">Utilisateur</SelectItem>
                            <SelectItem value="moderator">Modérateur</SelectItem>
                            <SelectItem value="admin">Admin</SelectItem>
                            <SelectItem value="super_admin">Super admin</SelectItem>
                          </SelectContent>
                        </Select>

                        <ActionButton
                          tone="primary"
                          onClick={handleRoleSave}
                          disabled={!canManageRoles || selectedRole === selectedUser.role || roleSaving}
                          className="w-full justify-center"
                        >
                          {roleSaving ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
                          Mettre à jour le rôle
                        </ActionButton>
                      </div>

                      <div className="grid gap-3">
                        <Label htmlFor="admin-users-ban-reason">Motif</Label>
                        <Textarea
                          id="admin-users-ban-reason"
                          value={banReason}
                          onChange={(event) => setBanReason(event.target.value)}
                          placeholder="Motif visible pour le suivi admin"
                          className="min-h-[120px] rounded-[22px] border-border bg-background/70 px-4 py-4 leading-7"
                        />

                        <div className="grid gap-2">
                          <Label htmlFor="admin-users-ban-duration">Durée du blocage</Label>
                          <Select value={banDuration} onValueChange={(value) => setBanDuration(value as BanDuration)}>
                            <SelectTrigger id="admin-users-ban-duration" className="h-12 w-full rounded-2xl bg-background/70 px-4">
                              <SelectValue placeholder="Durée du blocage" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="24h">24 heures</SelectItem>
                              <SelectItem value="7d">7 jours</SelectItem>
                              <SelectItem value="30d">30 jours</SelectItem>
                              <SelectItem value="permanent">Long terme</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>

                        <ActionButton
                          tone={selectedUser.is_banned ? 'secondary' : 'primary'}
                          onClick={handleBanAction}
                          disabled={!canManageUsers || banSaving}
                          className="w-full justify-center"
                        >
                          {banSaving ? <Loader2 className="size-4 animate-spin" data-icon="inline-start" /> : null}
                          {selectedUser.is_banned ? 'Réactiver le compte' : 'Appliquer le blocage'}
                        </ActionButton>
                      </div>

                      <div className="rounded-[22px] border border-border bg-background/60 p-4">
                        <div className="flex items-start gap-3">
                          <Checkbox
                            id="admin-users-delete-confirm"
                            checked={deleteConfirm}
                            onCheckedChange={(checked) => setDeleteConfirm(checked === true)}
                            className="mt-1 size-5 rounded-md"
                          />
                          <div className="min-w-0">
                            <Label htmlFor="admin-users-delete-confirm" className="cursor-pointer">
                              Je confirme la suppression définitive
                            </Label>
                            <p className="mt-1 text-sm leading-6 text-safe-muted">
                              Réservé au super admin. À utiliser seulement si le compte doit disparaître du système.
                            </p>
                          </div>
                        </div>
                      </div>

                      <ActionButton
                        tone="secondary"
                        onClick={handleDeleteUser}
                        disabled={!canManageRoles || !deleteConfirm || deleteSaving}
                        className="w-full justify-center border-destructive/20 bg-destructive/10 text-safe-error hover:bg-destructive/15"
                      >
                        {deleteSaving ? (
                          <Loader2 className="size-4 animate-spin" data-icon="inline-start" />
                        ) : (
                          <Trash2 className="size-4" data-icon="inline-start" />
                        )}
                        Supprimer le compte
                      </ActionButton>
                    </div>
                  </Card>
                </>
              ) : (
                <Card className="rounded-[28px] border-border bg-card/88 p-8 text-center shadow-[0_22px_48px_rgba(0,0,0,0.16)]">
                  <p className="text-base font-semibold text-foreground">Sélectionne un utilisateur</p>
                  <p className="mt-2 text-sm text-safe-muted">
                    La fiche détaillée et les actions admin apparaîtront ici.
                  </p>
                </Card>
              )}
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}
