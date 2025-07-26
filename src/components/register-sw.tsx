'use client';

import { useEffect } from 'react';

export default function RegisterSW() {
  useEffect(() => {
    // Supprimer les erreurs runtime.lastError causées par les extensions
    const originalError = console.error;
    console.error = (...args) => {
      if (args[0]?.includes?.('runtime.lastError') || args[0]?.includes?.('message channel closed')) {
        // Ignorer silencieusement les erreurs d'extensions
        return;
      }
      originalError.apply(console, args);
    };
    
    // Détection de l'environnement avec Next.js
    const isDev = process.env.NODE_ENV === 'development';
    
    // TEMPORAIRE: Désactiver SW pour déboguer les problèmes de navigation
    if (isDev) {
      console.log('Service Worker temporairement désactivé en dev pour débogage');
      return;
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
            
            // Écouter les mises à jour du service worker
            registration.addEventListener('updatefound', () => {
              const newWorker = registration.installing;
              if (newWorker) {
                newWorker.addEventListener('statechange', () => {
                  if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
                    // Nouveau service worker disponible, recharger la page proprement
                    console.log('Nouveau service worker installé, rechargement...');
                    window.location.reload();
                  }
                });
              }
            });
          })
          .catch((error) => {
            // Ignorer les erreurs courantes non critiques
            const ignoredErrors = [
              'Load failed',
              'Request failed',
              'script error',
              'network error'
            ];
            
            const shouldIgnore = ignoredErrors.some(ignored => 
              error.message?.toLowerCase().includes(ignored.toLowerCase())
            );
            
            if (!shouldIgnore) {
              if (isDev) {
                console.warn('SW dev - erreur:', error.message);
              } else {
                // En production, loguer de manière silencieuse pour éviter le spam d'erreurs
                console.warn('Service Worker: ', error.message || 'Erreur mineure ignorée');
              }
            }
          });
      });
    }
  }, []);
  return null;
} 