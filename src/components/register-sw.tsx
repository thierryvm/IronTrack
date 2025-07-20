'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // Activer le SW même en dev, mais avec protection contre les erreurs
    const isDev = process.env.NODE_ENV === 'development';
    
    if (isDev) {
      console.log('Service Worker activé en mode développement (avec protection)');
    }

    if ('serviceWorker' in navigator) {
      window.addEventListener('load', () => {
        // Utiliser un SW différent selon l'environnement
        const swPath = isDev ? '/sw-dev.js' : '/sw.js';
        
        navigator.serviceWorker.register(swPath)
          .then((registration) => {
            if (isDev) {
              console.log('SW développement enregistré (minimal):', registration);
            } else {
              console.log('SW production enregistré (complet):', registration);
            }
          })
          .catch((error) => {
            if (isDev) {
              console.warn('SW dev - erreur:', error.message);
            } else {
              console.error('Erreur SW production:', error);
            }
          });
      });
    }
  }, []);
  return null;
} 