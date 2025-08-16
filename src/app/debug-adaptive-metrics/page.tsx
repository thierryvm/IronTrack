'use client'

import { useState } from 'react'
import { AdaptiveMetricsForm } from '@/components/exercises/AdaptiveMetricsForm'
import { CardioMetrics, StrengthMetrics } from '@/types/performance'

// 🧪 PAGE TEST - Validation AdaptiveMetricsForm avec composants remplacés
export default function DebugAdaptiveMetricsPage() {
  // États pour les métriques cardio
  const [cardioData, setCardioData] = useState<CardioMetrics>({
    duration_seconds: 1800, // 30 min
    distance: 5000, // 5km pour rameur
    distance_unit: 'm',
    heart_rate: 150,
    rowing: {
      stroke_rate: 24,
      watts: 200
    }
  })
  
  // États pour les métriques musculation
  const [strengthData, setStrengthData] = useState<StrengthMetrics>({
    weight: 80,
    reps: 10,
    sets: 3,
    rpe: 7,
    rest_seconds: 90
  })

  // Scénarios de test
  const testScenarios = [
    {
      name: 'Rameur Endurance',
      equipment: 'Rameur',
      exerciseType: 'Cardio' as const,
      description: 'Test PowerInput2025 pour Watts (50-500W)'
    },
    {
      name: 'Développé Couché',
      equipment: 'Banc + Barre',
      exerciseType: 'Musculation' as const,
      description: 'Test TimeInput2025 pour repos (30-300s)'
    },
    {
      name: 'Vélo Stationnaire',
      equipment: 'Vélo',
      exerciseType: 'Cardio' as const,
      description: 'Test NumberWheels conservés (cadence, résistance)'
    }
  ]

  const [activeScenario, setActiveScenario] = useState(0)
  const currentScenario = testScenarios[activeScenario]

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">
          🧪 TEST: AdaptiveMetricsForm - Composants Remplacés
        </h1>

        {/* Introduction */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold text-blue-900 mb-3">
            Corrections Appliquées
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>
              <strong>✅ PowerInput2025</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Remplace NumberWheel Watts (50-500W)</li>
                <li>Presets métaboliques débutant→elite</li>
                <li>Contrôles +/- tactiles</li>
                <li>Édition directe optimisée</li>
              </ul>
            </div>
            <div>
              <strong>✅ TimeInput2025</strong>
              <ul className="list-disc list-inside mt-1 space-y-1">
                <li>Remplace NumberWheel temps repos (30-300s)</li>
                <li>Format minutes:secondes intuitif</li>
                <li>Presets métaboliques (Force/Hypertrophie/Endurance)</li>
                <li>Ajustements rapides ±15s/30s</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Sélecteur de scénario */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📋 Scénarios de Test
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testScenarios.map((scenario, index) => (
              <button
                key={index}
                onClick={() => setActiveScenario(index)}
                className={`p-4 rounded-lg border-2 transition-colors text-left ${
                  activeScenario === index
                    ? 'border-orange-500 bg-orange-50'
                    : 'border-gray-200 hover:border-gray-300'
                }`}
              >
                <h4 className="font-semibold text-gray-900">{scenario.name}</h4>
                <p className="text-sm text-gray-600 mt-1">{scenario.equipment}</p>
                <p className="text-sm text-gray-500 mt-2">{scenario.description}</p>
                <div className={`inline-block px-2 py-1 rounded text-xs font-medium mt-2 ${
                  scenario.exerciseType === 'Cardio'
                    ? 'bg-blue-100 text-blue-800'
                    : 'bg-orange-100 text-orange-800'
                }`}>
                  {scenario.exerciseType}
                </div>
              </button>
            ))}
          </div>
        </div>

        {/* Formulaire de test */}
        <div className="bg-white rounded-lg shadow p-6 mb-8">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            🎛️ Test: {currentScenario.name}
            <span className="text-sm font-normal text-gray-500">
              ({currentScenario.equipment})
            </span>
          </h3>
          
          <AdaptiveMetricsForm
            exerciseType={currentScenario.exerciseType}
            equipment={currentScenario.equipment}
            exerciseName={currentScenario.name}
            cardioData={cardioData}
            strengthData={strengthData}
            setCardioData={setCardioData}
            setStrengthData={setStrengthData}
          />
        </div>

        {/* État actuel des données */}
        <div className="bg-gray-100 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            📊 État Actuel des Données
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Cardio Metrics</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(cardioData, null, 2)}
              </pre>
            </div>
            <div>
              <h4 className="font-semibold text-gray-800 mb-2">Strength Metrics</h4>
              <pre className="text-xs bg-white p-3 rounded border overflow-auto">
                {JSON.stringify(strengthData, null, 2)}
              </pre>
            </div>
          </div>
        </div>

        {/* Instructions test */}
        <div className="mt-8 bg-green-50 border border-green-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-green-900 mb-3">
            🧪 Instructions de Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-green-800">
            <li><strong>Scénario Rameur</strong> : Tester PowerInput2025 avec presets watts</li>
            <li><strong>Scénario Musculation</strong> : Tester TimeInput2025 avec format temps</li>
            <li><strong>Scénario Vélo</strong> : Vérifier NumberWheels conservés fonctionnent</li>
            <li><strong>Mobile</strong> : Redimensionner et tester touch targets</li>
            <li><strong>UX</strong> : Comparer facilité d'usage vs anciens NumberWheels</li>
          </ol>
          
          <div className="mt-4 bg-green-100 rounded p-3">
            <p className="text-sm text-green-800">
              <strong>Objectif:</strong> Valider que PowerInput2025 et TimeInput2025 offrent une meilleure UX 
              que les NumberWheels pour les plages de valeurs larges (Watts 50-500W, Temps 30-300s)
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}