import { notFound } from 'next/navigation';

/**
 * Catch-all route sous `/[locale]/…` — déclenche `notFound()` pour que
 * le `[locale]/not-found.tsx` (localisé) prenne le relais.
 *
 * Sans ce fichier, Next.js remonte au `app/not-found.tsx` non-localisé.
 */
export default function CatchAllPage() {
  notFound();
}
