'use client';

import { useEffect, useState } from 'react';

export default function SWEmergencyPage() {
  const [logs, setLogs] = useState<string[]>([]);
  const [isComplete, setIsComplete] = useState(false);

  const addLog = (message: string) => {
    const timestamped = `${new Date().toLocaleTimeString()} - ${message}`;
    setLogs(prev => [...prev, timestamped]);
    console.log('🚫', message);
  };

  useEffect(() => {
    const emergencyCleanup = async () => {
      addLog('🚫 URGENCE: Remplacement SW problématique par SW KILLER');

      if (!('serviceWorker' in navigator)) {
        addLog('❌ Service Workers non supportés');
        return;
      }

      try {
        // 1. Enregistrer le SW killer immédiatement
        addLog('📥 Enregistrement SW KILLER...');
        
        const registration = await navigator.serviceWorker.register('/sw-kill.js', {
          scope: '/',
          updateViaCache: 'none'
        });

        addLog('✅ SW KILLER enregistré avec succès');

        // 2. Forcer la mise à jour immédiate
        if (registration.waiting) {
          addLog('🔄 Activation SW KILLER en attente...');
          registration.waiting.postMessage({ type: 'SKIP_WAITING' });
        }

        if (registration.installing) {
          addLog('⏳ Installation SW KILLER...');
          registration.installing.addEventListener('statechange', (e) => {
            if ((e.target as ServiceWorker).state === 'activated') {
              addLog('✅ SW KILLER activé');
            }
          });
        }

        // 3. Écouter les changements d'état
        registration.addEventListener('updatefound', () => {
          addLog('🔄 Mise à jour SW détectée');
        });

        // 4. Vérifier l'état actuel
        setTimeout(async () => {
          const registrations = await navigator.serviceWorker.getRegistrations();
          addLog(`📊 Nombre de SW actifs: ${registrations.length}`);
          
          registrations.forEach((reg, index) => {
            addLog(`SW ${index + 1}: ${reg.scope} (${reg.active?.scriptURL || 'inactif'})`);
          });

          addLog('🎉 URGENCE RÉSOLUE: SW KILLER opérationnel');
          addLog('🔄 Rechargez la page dans 5 secondes...');
          
          setTimeout(() => {
            window.location.reload();
          }, 5000);
          
          setIsComplete(true);
        }, 3000);

      } catch (error) {
        addLog(`❌ ERREUR CRITIQUE: ${error}`);
        addLog('🚨 Rechargement forcé dans 3 secondes...');
        setTimeout(() => {
          window.location.reload();
        }, 3000);
      }
    };

    emergencyCleanup();
  }, []);

  return (
    <div className="min-h-screen bg-red-50 py-8 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="bg-white shadow-xl rounded-lg p-8 border-2 border-red-200">
          
          {/* Header d'urgence */}
          <div className="text-center mb-8">
            <div className="text-6xl mb-4">🚫</div>
            <h1 className="text-3xl font-bold text-red-600 mb-2">
              Résolution d'urgence SW
            </h1>
            <p className="text-red-700">
              Remplacement du Service Worker problématique en cours...
            </p>
          </div>

          {/* Logs en temps réel */}
          <div className="bg-gray-900 text-green-400 p-6 rounded-lg font-mono text-sm max-h-96 overflow-y-auto mb-6">
            {logs.map((log, index) => (
              <div key={index} className="mb-1">
                {log}
              </div>
            ))}
            {!isComplete && (
              <div className="flex items-center mt-2">
                <span className="animate-pulse text-yellow-400">▋</span>
                <span className="ml-2">Résolution en cours...</span>
              </div>
            )}
          </div>

          {/* Status */}
          <div className={`p-4 rounded-lg border-2 ${
            isComplete 
              ? 'bg-green-50 border-green-200' 
              : 'bg-yellow-50 border-yellow-200'
          }`}>
            <div className="flex items-center space-x-3">
              <div className={`w-4 h-4 rounded-full ${
                isComplete ? 'bg-green-500' : 'bg-yellow-500 animate-pulse'
              }`}></div>
              <span className="font-semibold">
                {isComplete 
                  ? '✅ SW KILLER activé - Rechargement automatique...' 
                  : '⏳ Remplacement SW en cours...'
                }
              </span>
            </div>
          </div>

          {/* Actions d'urgence */}
          <div className="mt-6 flex flex-col gap-4">
            <button
              onClick={() => window.location.href = '/'}
              className="w-full bg-green-600 hover:bg-green-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              🏠 Aller à l'accueil (force le nouveau SW)
            </button>
            
            <button
              onClick={() => window.location.reload()}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              🔄 Recharger cette page
            </button>

            <button
              onClick={() => {
                // Ouvrir un nouvel onglet pour éviter le SW
                window.open(window.location.origin, '_blank');
              }}
              className="w-full bg-purple-600 hover:bg-purple-700 text-white py-3 px-6 rounded-lg font-semibold transition-colors"
            >
              🆕 Ouvrir nouvel onglet (contournement)
            </button>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <h3 className="font-semibold text-blue-800 mb-2">
              🛠️ Si le problème persiste :
            </h3>
            <ol className="list-decimal list-inside space-y-1 text-blue-700 text-sm">
              <li>Fermez complètement le navigateur</li>
              <li>Rouvrez et visitez directement: <code className="bg-blue-100 px-1 rounded">localhost:3001</code></li>
              <li>Ou utilisez un navigateur privé/incognito</li>
              <li>En dernier recours: videz le cache navigateur</li>
            </ol>
          </div>

        </div>
      </div>
    </div>
  );
}