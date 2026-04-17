'use client';

import { useEffect, useState } from 'react';
import { useTranslations } from 'next-intl';

export function ScrollToTop() {
  const t = useTranslations('common');
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 600);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <button
      type="button"
      aria-label={t('scrollToTop')}
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      className={[
        'fixed bottom-6 right-6 z-50 inline-flex h-12 w-12 items-center justify-center rounded-full transition-all duration-200',
        'border-2 hover:-translate-y-[2px]',
        visible
          ? 'pointer-events-auto opacity-100'
          : 'pointer-events-none opacity-0',
      ].join(' ')}
      style={{
        background: 'var(--color-brand)',
        color: 'var(--color-primary-foreground)',
        borderColor: 'var(--color-foreground)',
        boxShadow: 'var(--shadow-glow)',
      }}
    >
      <svg
        aria-hidden="true"
        viewBox="0 0 24 24"
        className="h-5 w-5"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="square"
        strokeLinejoin="miter"
      >
        <path d="M12 19V5M5 12l7-7 7 7" />
      </svg>
    </button>
  );
}
