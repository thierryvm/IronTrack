/**
 * Rate-limit en mémoire (fixed-window) — stub pour PR #39.
 *
 * Limitations :
 *   - Stocke en RAM par instance (pas distribué)
 *   - Suffisant en preview / single-region
 *   - À remplacer par Upstash Redis quand on l'aura ajouté
 *
 * Usage :
 *   const ok = rateLimit(`login:${ip}`, { limit: 5, windowMs: 60_000 });
 *   if (!ok) return { error: 'too_many_requests' };
 */

type Entry = { count: number; resetAt: number };

const store = new Map<string, Entry>();

export interface RateLimitOptions {
  /** Nombre max de hits dans la fenêtre. */
  limit: number;
  /** Durée de la fenêtre en millisecondes. */
  windowMs: number;
}

export function rateLimit(
  key: string,
  { limit, windowMs }: RateLimitOptions,
): { ok: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = store.get(key);

  if (!entry || entry.resetAt < now) {
    const fresh = { count: 1, resetAt: now + windowMs };
    store.set(key, fresh);
    return { ok: true, remaining: limit - 1, resetAt: fresh.resetAt };
  }

  entry.count += 1;
  const ok = entry.count <= limit;
  return { ok, remaining: Math.max(0, limit - entry.count), resetAt: entry.resetAt };
}

/**
 * Extrait l'IP depuis les headers Next/Vercel.
 * Fallback : 'unknown' (rate-limit toujours appliqué globalement).
 */
export function getClientIp(headers: Headers): string {
  return (
    headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    headers.get('x-real-ip') ??
    'unknown'
  );
}
