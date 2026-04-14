'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    const isDevelopment =
      window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';
    const devCleanupSessionKey = 'irontrack-dev-sw-cleanup-v2';

    async function cleanupDevelopmentServiceWorkers() {
      if (!('serviceWorker' in navigator)) {
        return;
      }

      const registrations = await navigator.serviceWorker.getRegistrations();
      const cacheKeys =
        typeof window !== 'undefined' && 'caches' in window ? await window.caches.keys() : [];

      await Promise.allSettled(registrations.map((registration) => registration.unregister()));
      await Promise.allSettled(cacheKeys.map((cacheKey) => window.caches.delete(cacheKey)));

      const hadAnythingToClean = registrations.length > 0 || cacheKeys.length > 0;

      if (hadAnythingToClean) {
        if (!window.sessionStorage.getItem(devCleanupSessionKey)) {
          window.sessionStorage.setItem(devCleanupSessionKey, 'done');
          window.location.reload();
          return;
        }
      } else {
        window.sessionStorage.removeItem(devCleanupSessionKey);
      }
    }

    if (isDevelopment) {
      void cleanupDevelopmentServiceWorkers();
      return;
    }

    if ('serviceWorker' in navigator) {
      navigator.serviceWorker
        .register('/sw-minimal.js', {
          scope: '/',
          updateViaCache: 'none',
        })
        .then(() => {
          // SW registered silently to avoid console pollution
        })
        .catch(() => {
          // SW registration is non-critical
        });
    }
  }, []);

  return null;
}
