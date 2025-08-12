'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // DÉSACTIVER COMPLÈTEMENT en développement pour éviter erreurs runtime
    const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if (isDevelopment) {
      console.log('🔧 [DEV] Service Worker désactivé en développement');
      return;
    }
    
    // Service Worker uniquement en production
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw-minimal.js', {
        scope: '/',
        updateViaCache: 'none'
      })
      .then(registration => {
        console.log('✅ SW enregistré:', registration.scope);
      })
      .catch(error => {
        console.error('❌ SW échec:', error);
      });
    }
  }, []);
  return null;
} 