export const ADMIN_ROLES = ['moderator', 'admin', 'super_admin'] as const
export const ELEVATED_ADMIN_ROLES = ['admin', 'super_admin'] as const

export type AdminRole = (typeof ADMIN_ROLES)[number]

const ROLE_HIERARCHY: Record<AdminRole, number> = {
  moderator: 1,
  admin: 2,
  super_admin: 3,
}

export function isAdminRole(role: string | null | undefined): role is AdminRole {
  return typeof role === 'string' && ADMIN_ROLES.includes(role as AdminRole)
}

export function hasAdminPermission(
  role: string | null | undefined,
  minimumRole: AdminRole = 'moderator'
): boolean {
  if (!isAdminRole(role)) {
    return false
  }

  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY[minimumRole]
}

export function isUserCurrentlyBanned(
  isBanned: boolean | null | undefined,
  bannedUntil: string | null | undefined,
  now = new Date()
): boolean {
  if (!isBanned && !bannedUntil) {
    return false
  }

  if (!bannedUntil) {
    return Boolean(isBanned)
  }

  const bannedUntilDate = new Date(bannedUntil)

  if (Number.isNaN(bannedUntilDate.getTime())) {
    return Boolean(isBanned)
  }

  return bannedUntilDate > now
}

export function maskAdminIdentifier(identifier: string | null | undefined): string {
  if (!identifier) {
    return 'admin_inconnu'
  }

  return `admin_${identifier.replace(/[^a-zA-Z0-9]/g, '').slice(0, 8) || 'anon'}...`
}
