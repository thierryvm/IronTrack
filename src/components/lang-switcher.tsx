'use client';

import { useLocale, useTranslations } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';
import { useTransition } from 'react';

import { LOCALES, type Locale } from '@/i18n/request';

/**
 * Switcher FR / NL / EN — réécrit le chemin courant sur la locale cible.
 * Optimiste : startTransition pour garder l'UI réactive pendant la navigation.
 */
export function LangSwitcher() {
  const t = useTranslations('langSwitcher');
  const current = useLocale() as Locale;
  const router = useRouter();
  const pathname = usePathname();
  const [isPending, startTransition] = useTransition();

  function switchTo(target: Locale) {
    if (target === current) return;
    // Remplace `/current/...` par `/target/...`
    const segments = (pathname ?? '/').split('/');
    if (segments[1] && (LOCALES as readonly string[]).includes(segments[1])) {
      segments[1] = target;
    } else {
      segments.splice(1, 0, target);
    }
    const next = segments.join('/') || `/${target}`;
    startTransition(() => {
      router.replace(next);
    });
  }

  return (
    <nav
      aria-label={t('label')}
      className="mono inline-flex items-center gap-0 rounded-full border text-xs font-semibold"
      style={{
        borderColor: 'var(--color-border)',
        opacity: isPending ? 0.6 : 1,
      }}
    >
      {LOCALES.map((loc) => {
        const active = loc === current;
        return (
          <button
            key={loc}
            type="button"
            onClick={() => switchTo(loc)}
            aria-current={active ? 'true' : undefined}
            className="min-h-11 min-w-11 rounded-full px-3 py-2 uppercase tracking-[0.14em] transition-colors"
            style={{
              background: active ? 'var(--color-foreground)' : 'transparent',
              color: active
                ? 'var(--color-background)'
                : 'var(--color-foreground)',
            }}
          >
            {t(loc)}
          </button>
        );
      })}
    </nav>
  );
}
