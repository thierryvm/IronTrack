/**
 * Constantes + helpers avatar (partagés client + serveur).
 *
 * Le bucket Supabase `avatars` est public et accepte image/jpeg, image/png,
 * image/webp, image/gif avec une limite de 5 MB (configuré côté Supabase).
 * Les policies RLS imposent que le chemin commence par `${auth.uid()}/`.
 */

export const AVATAR_BUCKET = 'avatars';

export const AVATAR_MAX_BYTES = 5 * 1024 * 1024; // 5 MB

export const AVATAR_MIME_TYPES = [
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
] as const;

export type AvatarMimeType = (typeof AVATAR_MIME_TYPES)[number];

const EXT_BY_MIME: Record<AvatarMimeType, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
  'image/gif': 'gif',
};

export function isAvatarMimeType(mime: string): mime is AvatarMimeType {
  return (AVATAR_MIME_TYPES as readonly string[]).includes(mime);
}

export function avatarExtFor(mime: AvatarMimeType): string {
  return EXT_BY_MIME[mime];
}

/**
 * Construit un chemin safe pour un nouvel avatar.
 * Format : `${userId}/${uuid}.${ext}` — RLS storage le requiert.
 */
export function buildAvatarPath(userId: string, mime: AvatarMimeType): string {
  const uuid = crypto.randomUUID();
  return `${userId}/${uuid}.${avatarExtFor(mime)}`;
}

/**
 * Extrait le path Storage (`userId/uuid.ext`) depuis une URL publique Supabase.
 * Retourne `null` si ce n'est pas une URL du bucket `avatars`.
 */
export function pathFromPublicUrl(url: string | null | undefined): string | null {
  if (!url) return null;
  const marker = `/storage/v1/object/public/${AVATAR_BUCKET}/`;
  const idx = url.indexOf(marker);
  if (idx < 0) return null;
  return url.slice(idx + marker.length).split('?')[0] ?? null;
}

/**
 * Initiales (1 ou 2 lettres max) à afficher dans l'Avatar quand pas d'image.
 */
export function initialsFor(displayName: string): string {
  const s = displayName.trim();
  if (!s) return '?';
  const parts = s.split(/[\s_.-]+/).filter(Boolean);
  if (parts.length === 0) return s.slice(0, 1).toUpperCase();
  if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
  return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
}
