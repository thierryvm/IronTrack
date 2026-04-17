import type { Locale } from '@/i18n/request';

const INTL_LOCALE: Record<Locale, string> = {
  fr: 'fr-BE',
  nl: 'nl-BE',
  en: 'en-GB',
};

/**
 * Formate une date ISO en "il y a 3 jours" / "3 days ago" / "3 dagen geleden".
 *
 * Seuils : minutes, heures, jours, semaines, mois. Au-delà d'1 an on bascule
 * sur une date absolue courte pour rester lisible.
 *
 * Attention hydration : cette fonction renvoie un rendu basé sur `Date.now()`
 * côté SERVEUR. À utiliser uniquement en Server Component pour garder un
 * rendu stable (pas de drift client/serveur).
 */
export function formatRelativeDate(
  iso: string | null | undefined,
  locale: Locale,
  now: Date = new Date(),
): string {
  if (!iso) return '—';

  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return '—';

  const diffMs = date.getTime() - now.getTime();
  const diffSec = Math.round(diffMs / 1000);
  const absSec = Math.abs(diffSec);

  const rtf = new Intl.RelativeTimeFormat(INTL_LOCALE[locale], {
    numeric: 'auto',
    style: 'short',
  });

  if (absSec < 60) return rtf.format(diffSec, 'second');
  if (absSec < 3600) return rtf.format(Math.round(diffSec / 60), 'minute');
  if (absSec < 86400) return rtf.format(Math.round(diffSec / 3600), 'hour');
  if (absSec < 604800) return rtf.format(Math.round(diffSec / 86400), 'day');
  if (absSec < 2629800) return rtf.format(Math.round(diffSec / 604800), 'week');
  if (absSec < 31557600)
    return rtf.format(Math.round(diffSec / 2629800), 'month');

  // > 1 an : date absolue
  return new Intl.DateTimeFormat(INTL_LOCALE[locale], {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date);
}

/**
 * Formate une durée en secondes : "45 min" / "1 h 20 min" / "—".
 */
export function formatDuration(
  seconds: number | null | undefined,
  locale: Locale,
): string {
  if (seconds === null || seconds === undefined || seconds <= 0) return '—';

  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);

  const hLabel = locale === 'en' ? 'h' : 'h';
  const mLabel = locale === 'en' ? 'min' : 'min';

  if (h === 0) return `${m} ${mLabel}`;
  if (m === 0) return `${h} ${hLabel}`;
  return `${h} ${hLabel} ${m} ${mLabel}`;
}

/**
 * Formate une distance. Règles :
 *  - Si unit = 'm' et distance >= 1000 : convertit en km (3 500 m → 3,5 km)
 *  - Sinon on garde l'unité d'origine
 *  - Nombre localisé (virgule en fr/nl, point en en)
 */
export function formatDistance(
  distance: number | null | undefined,
  unit: string | null | undefined,
  locale: Locale,
): string | null {
  if (distance === null || distance === undefined || distance <= 0) return null;

  const nf = new Intl.NumberFormat(INTL_LOCALE[locale], {
    maximumFractionDigits: 2,
  });

  if (unit === 'm' && distance >= 1000) {
    return `${nf.format(distance / 1000)} km`;
  }
  return `${nf.format(distance)} ${unit ?? 'm'}`;
}
