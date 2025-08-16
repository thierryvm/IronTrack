'use client'

import { ExerciseEditForm2025 } from '@/components/exercises/ExerciseEditForm2025'
import { ExerciseEditForm2025Fixed } from '@/components/exercises/ExerciseEditForm2025Fixed'

// 🔧 PAGE COMPARAISON - Original vs Fixed
export default function DebugComparePage() {
  const exerciseId = "266" // Exercice avec bug image

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <h1 className="text-3xl font-bold text-center mb-8">
          🔧 COMPARAISON: Original vs Fixed
        </h1>
        
        <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
          {/* Colonne 1: Version Originale */}
          <div className="space-y-4">
            <div className="bg-red-100 border border-red-300 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-red-800">
                ❌ Version Originale (avec bug)
              </h2>
              <p className="text-red-700 text-sm mt-1">
                ExerciseEditForm2025 - Image ne s'affiche pas
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <ExerciseEditForm2025 exerciseId={exerciseId} />
            </div>
          </div>

          {/* Colonne 2: Version Corrigée */}
          <div className="space-y-4">
            <div className="bg-green-100 border border-green-300 rounded-lg p-4">
              <h2 className="text-xl font-semibold text-green-800">
                ✅ Version Corrigée (avec fix)
              </h2>
              <p className="text-green-700 text-sm mt-1">
                ExerciseEditForm2025Fixed - Gestion robuste image
              </p>
            </div>
            
            <div className="bg-white rounded-lg shadow-lg overflow-hidden">
              <ExerciseEditForm2025Fixed exerciseId={exerciseId} />
            </div>
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            🔍 Instructions de Test
          </h3>
          <ol className="list-decimal list-inside space-y-2 text-blue-800">
            <li><strong>Ouvrir DevTools</strong> (F12) → Onglet Console</li>
            <li><strong>Comparer les logs</strong> des deux versions</li>
            <li><strong>Observer l'affichage</strong> des images dans chaque colonne</li>
            <li><strong>Vérifier debug info</strong> dans la version corrigée</li>
            <li><strong>Noter les différences</strong> de comportement</li>
          </ol>
          
          <div className="mt-4 bg-blue-100 rounded p-3">
            <p className="text-sm text-blue-800">
              <strong>Exercice testé:</strong> #266 "Rameur endurance"<br/>
              <strong>Image URL:</strong> Supabase Storage public URL<br/>
              <strong>Problème attendu:</strong> Version originale ne montre pas l'image
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}