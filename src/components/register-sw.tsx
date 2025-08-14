'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // DÉSACTIVER COMPLÈTEMENT en développement pour éviter erreurs runtime
    const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      return;
    }
    
    // Service Worker uniquement en production
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-minimal.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then(() => {
        // SW enregistré silencieusement pour éviter pollution console
      })
      .catch(() => {
        // SW échec silencieux - non critique
      });
    }
  }, []);
  return null;
} 