'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // Supprimer les erreurs runtime.lastError causées par les extensions - SILENCIEUX
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('runtime.lastError') || args[0]?.includes?.('message channel closed')) {
        return; // Ignorer silencieusement
      }
      originalError.apply(console, args);
    };
    
    const isDevelopment = location.hostname === 'localhost' || location.hostname === '127.0.0.1';
    
    if ('serviceWorker' in navigator) {
      // Nettoyer d'abord tous les anciens SW
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          const promises = registrations.map(registration => registration.unregister());
          return Promise.all(promises);
        })
        .then(() => {
          // En développement : NE PAS enregistrer de SW
          if (isDevelopment) {
            return;
          }
          
          // En production : Enregistrer SW minimal PWA
          return navigator.serviceWorker.register('/sw-minimal.js', {
            scope: '/',
            updateViaCache: 'none'
          });
        })
        .then(registration => {
          if (registration && !isDevelopment) {
            // PWA uniquement en production
            if (registration.waiting) {
              registration.waiting.postMessage({ type: 'SKIP_WAITING' });
            }
          }
        })
        .catch(() => {
          // Erreurs ignorées - pas de logs
        });
    }
  }, []);
  return null;
} 