'use client';

import Link from 'next/link';
import { useEffect } from 'react';

import './globals.css';

/**
 * Dernier filet de sécurité — atteint uniquement si l'erreur survient AVANT
 * que le root layout localisé (`[locale]/layout.tsx`) ait pu render. Doit
 * fournir son propre `<html>/<body>`.
 *
 * On reste volontairement très minimal (pas de traduction, pas d'import
 * server) pour maximiser la robustesse : même si tout le reste est cassé,
 * cette page doit rendre.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    if (process.env.NODE_ENV !== 'production') {
      console.error('[global-error] fatal:', error);
    }
  }, [error]);

  return (
    <html lang="en">
      <body className="grain">
        <main className="mx-auto flex min-h-[100dvh] max-w-2xl flex-col justify-center px-6 py-16">
          <p className="font-mono text-xs uppercase tracking-[0.3em] text-muted-foreground">
            FATAL ERROR
          </p>
          <h1 className="mt-3 font-display text-5xl leading-tight text-foreground sm:text-6xl">
            Something broke.
          </h1>
          <p className="mt-5 max-w-prose text-base text-muted-foreground">
            An unexpected error occurred. Please retry or come back later.
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <button
              type="button"
              onClick={reset}
              className="inline-flex min-h-11 items-center border-2 border-foreground bg-foreground px-5 font-mono text-xs uppercase tracking-widest text-background transition hover:bg-foreground/90"
            >
              Retry ↻
            </button>
            <Link
              href="/"
              className="inline-flex min-h-11 items-center border-2 border-foreground px-5 font-mono text-xs uppercase tracking-widest text-foreground transition hover:bg-muted"
            >
              ← Home
            </Link>
          </div>
          {error.digest && (
            <p className="mt-10 font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              Digest: <code className="text-foreground">{error.digest}</code>
            </p>
          )}
        </main>
      </body>
    </html>
  );
}
