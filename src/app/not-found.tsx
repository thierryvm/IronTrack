import Link from 'next/link';

import { DEFAULT_LOCALE } from '@/i18n/request';
import './globals.css';

export const metadata = {
  title: '404 · IronTrack',
  robots: { index: false, follow: false },
};

/**
 * Fallback 404 global — atteint uniquement si une route n'a PAS matché le
 * middleware next-intl (cas rare : assets, routes malformées). En pratique
 * quasi-tout passe par `[locale]/not-found.tsx` qui est localisé.
 *
 * On fournit notre propre `<html>/<body>` parce que le seul root layout de
 * l'app vit sous `[locale]/layout.tsx` et n'enveloppe donc pas ce fichier.
 * Pas de dépendance i18n ici (locale inconnue) → texte générique anglais.
 */
export default function GlobalNotFound() {
  return (
    <html lang="en">
      <body className="grain">
        <main className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            ERROR 404
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-foreground sm:text-6xl">
            Nothing here.
          </h1>
          <p className="mt-5 max-w-prose text-base text-muted-foreground">
            This page does not exist. Head back home.
          </p>
          <nav className="mt-10 flex flex-wrap gap-4">
            <Link
              href={`/${DEFAULT_LOCALE}`}
              className="inline-flex min-h-11 items-center border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90"
            >
              ← Home
            </Link>
          </nav>
        </main>
      </body>
    </html>
  );
}
