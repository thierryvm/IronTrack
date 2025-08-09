'use client'

/**
 * 🧹 PAGE NETTOYAGE SERVICE WORKER - ULTRAHARDCORE
 * 
 * Page de nettoyage accessible via /cleanup-sw pour résoudre 
 * tous les conflits de Service Workers et caches
 */

import { useEffect, useState } from 'react'

export default function CleanupServiceWorkerPage() {
  const [isComplete, setIsComplete] = useState(false)
  const [logs, setLogs] = useState<string[]>([])

  const addLog = (message: string) => {
    console.log(message)
    setLogs(prev => [...prev, message])
  }

  useEffect(() => {
    const performCleanup = async () => {
      try {
        addLog('🧹 NETTOYAGE ULTRAHARDCORE - Démarrage...')
        
        // 1. Désinscrire TOUS les Service Workers
        if ('serviceWorker' in navigator) {
          const registrations = await navigator.serviceWorker.getRegistrations()
          
          for (const registration of registrations) {
            addLog(`🗑️ Désinscription SW: ${registration.scope}`)
            await registration.unregister()
          }
          
          addLog('✅ Tous les Service Workers ont été supprimés')
        }

        // 2. Nettoyer tous les caches
        if ('caches' in window) {
          const cacheNames = await caches.keys()
          
          for (const cacheName of cacheNames) {
            addLog(`🗑️ Suppression cache: ${cacheName}`)
            await caches.delete(cacheName)
          }
          
          addLog('✅ Tous les caches ont été supprimés')
        }

        // 3. Nettoyer localStorage
        const keysToRemove: string[] = []
        for (let i = 0; i < localStorage.length; i++) {
          const key = localStorage.key(i)
          if (key && (key.includes('sw-') || key.includes('cache-') || key.includes('irontrack-cache'))) {
            keysToRemove.push(key)
          }
        }
        
        keysToRemove.forEach(key => {
          localStorage.removeItem(key)
          addLog(`🗑️ Suppression localStorage: ${key}`)
        })
        
        addLog('✅ localStorage nettoyé')
        
        // 4. Finalisation
        addLog('🎉 NETTOYAGE TERMINÉ !')
        addLog('📋 Actions recommandées :')
        addLog('1. Fermer complètement le navigateur')
        addLog('2. Rouvrir et visiter /')
        addLog('3. Le nouveau Service Worker se réinstallera automatiquement')
        
        setIsComplete(true)
        
      } catch (error) {
        addLog(`❌ Erreur nettoyage: ${error}`)
      }
    }

    // Démarrer le nettoyage après un court délai
    const timeout = setTimeout(performCleanup, 1000)
    return () => clearTimeout(timeout)
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="bg-white shadow-lg rounded-lg p-8">
          <h1 className="text-3xl font-bold text-orange-600 mb-6 flex items-center">
            🧹 Nettoyage IronTrack
          </h1>
          
          <p className="text-gray-600 mb-6">
            Nettoyage des Service Workers et caches en cours...
          </p>
          
          <div className="bg-gray-100 rounded-lg p-4 mb-6 min-h-96">
            <h3 className="font-semibold mb-3">📋 Journal de nettoyage :</h3>
            <div className="space-y-1 font-mono text-sm">
              {logs.map((log, index) => (
                <div key={index} className="text-gray-700">
                  {log}
                </div>
              ))}
              {!isComplete && (
                <div className="text-orange-600 animate-pulse">
                  ⏳ Nettoyage en cours...
                </div>
              )}
            </div>
          </div>
          
          {isComplete && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
              <h3 className="font-semibold text-green-800 mb-2">
                🎉 Nettoyage terminé !
              </h3>
              <ul className="text-green-700 space-y-1">
                <li>• Tous les Service Workers conflictuels ont été supprimés</li>
                <li>• Le cache navigateur a été nettoyé</li>
                <li>• Les données localStorage obsolètes ont été supprimées</li>
              </ul>
            </div>
          )}
          
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="font-semibold text-blue-800 mb-2">
              📋 Actions recommandées :
            </h3>
            <ol className="text-blue-700 space-y-1">
              <li>1. Fermer complètement le navigateur (tous les onglets)</li>
              <li>2. Rouvrir et visiter la <a href="/" className="underline hover:no-underline">page d'accueil</a></li>
              <li>3. Le nouveau Service Worker se réinstallera automatiquement</li>
            </ol>
          </div>
          
          <div className="mt-6 flex gap-4">
            <a 
              href="/"
              className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition-colors"
            >
              ← Retour à IronTrack
            </a>
            <button
              onClick={() => window.location.reload()}
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors"
            >
              🔄 Relancer le nettoyage
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}