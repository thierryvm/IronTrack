'use client'

import { useState } from 'react'
import { PowerInput2025 } from '@/components/ui/PowerInput2025'
import { TimeInput2025 } from '@/components/ui/TimeInput2025'
import { NumberWheel } from '@/components/ui/NumberWheel'

// 🔧 PAGE DEMO - Comparaison NumberWheels vs Alternatives UX
export default function DebugInputsPage() {
  const [powerValue, setPowerValue] = useState(150)
  const [powerWheelValue, setPowerWheelValue] = useState(150)
  
  const [timeValue, setTimeValue] = useState(60)
  const [timeWheelValue, setTimeWheelValue] = useState(60)

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔧 DEMO: NumberWheels vs Alternatives UX
        </h1>
        
        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Problèmes NumberWheels Identifiés
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>❌ Problème 1: Puissance Watts</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Range: 50-500W (45 valeurs)</li>
                <li>Pour passer de 100W à 300W = 20 scrolls</li>
                <li>UX horrible sur mobile</li>
                <li>Pas de presets métaboliques</li>
              </ul>
            </div>
            <div>
              <strong>❌ Problème 2: Temps de repos</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Range: 30-300s (18 valeurs)</li>
                <li>Utilisateurs pensent en minutes</li>
                <li>Pas de contexte métabolique</li>
                <li>Scrolling inapproprié pour le temps</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          
          {/* PROBLÈME 1: PUISSANCE WATTS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              ⚡ PUISSANCE (Watts)
            </h2>
            
            {/* Alternative optimisée */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Solution: PowerInput2025
              </h3>
              <PowerInput2025
                label="Puissance Rameur"
                value={powerValue}
                onChange={setPowerValue}
                min={50}
                max={500}
                step={10}
                unit="W"
                presets={[
                  { label: 'Débutant', value: 100 },
                  { label: 'Moyen', value: 150 },
                  { label: 'Bon', value: 200 },
                  { label: 'Excellent', value: 250 },
                  { label: 'Elite', value: 300 }
                ]}
              />
              <div className="mt-3 text-sm text-green-700">
                <strong>Avantages:</strong> Presets rapides, +/- tactile, édition directe, contexte métabolique
              </div>
            </div>

            {/* NumberWheel problématique */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                ❌ Problème: NumberWheel
              </h3>
              <div className="text-center">
                <NumberWheel
                  label="Puissance (Watts)"
                  value={powerWheelValue}
                  onChange={setPowerWheelValue}
                  min={50}
                  max={500}
                  step={10}
                />
              </div>
              <div className="mt-3 text-sm text-red-700">
                <strong>Problèmes:</strong> 45 valeurs à scroller, pas de presets, UX frustrante
              </div>
            </div>
          </div>

          {/* PROBLÈME 2: TEMPS DE REPOS */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold text-center">
              ⏱️ TEMPS DE REPOS
            </h2>
            
            {/* Alternative optimisée */}
            <div className="bg-green-50 border border-green-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-green-800 mb-4">
                ✅ Solution: TimeInput2025
              </h3>
              <TimeInput2025
                label="Repos entre séries"
                value={timeValue}
                onChange={setTimeValue}
                min={30}
                max={300}
              />
              <div className="mt-3 text-sm text-green-700">
                <strong>Avantages:</strong> Format min:sec, presets métaboliques, ajustements ±15/30s
              </div>
            </div>

            {/* NumberWheel problématique */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
              <h3 className="text-lg font-semibold text-red-800 mb-4">
                ❌ Problème: NumberWheel
              </h3>
              <div className="text-center">
                <NumberWheel
                  label="Repos entre séries (sec)"
                  value={timeWheelValue}
                  onChange={setTimeWheelValue}
                  min={30}
                  max={300}
                  step={15}
                />
              </div>
              <div className="mt-3 text-sm text-red-700">
                <strong>Problèmes:</strong> Pas intuitif, aucun contexte métabolique, format inadapté
              </div>
            </div>
          </div>
        </div>

        {/* Comparaison valeurs */}
        <div className="mt-8 bg-white border border-gray-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 Comparaison Valeurs Actuelles
          </h3>
          <div className="grid grid-cols-2 gap-8 text-center">
            <div>
              <h4 className="font-semibold text-green-800">PowerInput2025</h4>
              <div className="text-2xl font-bold text-green-600">{powerValue}W</div>
            </div>
            <div>
              <h4 className="font-semibold text-green-800">TimeInput2025</h4>
              <div className="text-2xl font-bold text-green-600">
                {Math.floor(timeValue / 60)}min{timeValue % 60 > 0 ? `${timeValue % 60}s` : ''}
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-8 text-center mt-4">
            <div>
              <h4 className="font-semibold text-red-800">NumberWheel</h4>
              <div className="text-2xl font-bold text-red-600">{powerWheelValue}W</div>
            </div>
            <div>
              <h4 className="font-semibold text-red-800">NumberWheel</h4>
              <div className="text-2xl font-bold text-red-600">{timeWheelValue}s</div>
            </div>
          </div>
        </div>

        {/* Instructions test */}
        <div className="mt-8 bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-3">
            🧪 Instructions de Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-gray-700">
            <li><strong>Tester sur mobile</strong> : Redimensionner la fenêtre en mode mobile</li>
            <li><strong>Comparer UX</strong> : Essayer de changer rapidement les valeurs</li>
            <li><strong>Presets</strong> : Utiliser les boutons presets vs scroll manuel</li>
            <li><strong>Accessibilité</strong> : Vérifier touch targets 44px minimum</li>
            <li><strong>Performance</strong> : Observer fluidité et réactivité</li>
          </ol>
        </div>
      </div>
    </div>
  )
}