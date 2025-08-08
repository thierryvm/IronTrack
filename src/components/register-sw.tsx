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
    
    // 🚫 DÉSACTIVATION COMPLÈTE SERVICE WORKERS - MODE DÉVELOPPEMENT
    console.log('🚫 Service Worker: DÉSACTIVATION COMPLÈTE pour résolution erreurs');
    
    if ('serviceWorker' in navigator) {
      // Désactiver TOUS les Service Workers existants
      navigator.serviceWorker.getRegistrations()
        .then(registrations => {
          console.log(`🧹 Désactivation complète de ${registrations.length} Service Workers`);
          
          const promises = registrations.map(registration => {
            console.log('🗑️ Suppression complète SW:', registration.scope);
            return registration.unregister();
          });
          return Promise.all(promises);
        })
        .then(() => {
          console.log('✅ TOUS les Service Workers supprimés - Mode développement pur');
          // NE PAS ENREGISTRER DE NOUVEAU SW
          
          // Nettoyer les caches résiduels
          if ('caches' in window) {
            return caches.keys().then(cacheNames => {
              return Promise.all(
                cacheNames.map(cacheName => {
                  console.log('🧹 Suppression cache:', cacheName);
                  return caches.delete(cacheName);
                })
              );
            });
          }
        })
        .then(() => {
          console.log('✅ Tous les caches supprimés - Environnement propre');
        })
        .catch(error => {
          console.warn('Nettoyage SW: Erreur (non-critique):', error);
        });
    }
  }, []);
  return null;
} 