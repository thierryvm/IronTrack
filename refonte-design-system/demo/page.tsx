'use client'

import { useState } from 'react'
import { Plus, Eye, Edit, Trash2, Copy, MoreVertical, Target, Dumbbell, TrendingUp, Calendar } from 'lucide-react'
import Image from 'next/image'

// Mock data pour démonstration
const mockExercises = [
  {
    id: 1,
    name: "Développé couché",
    muscle_group: "Pectoraux",
    equipment: "Barre olympique",
    difficulty: "Intermédiaire" as const,
    exercise_type: "Musculation" as const,
    image_url: "/images/exercises/bench-press.jpg",
    last_performance: {
      weight: 80,
      reps: 8,
      sets: 3,
      performed_at: "2025-01-29"
    }
  },
  {
    id: 2,
    name: "Rameur",
    muscle_group: "Corps entier",
    equipment: "Rameur",
    difficulty: "Débutant" as const,
    exercise_type: "Cardio" as const,
    image_url: "/images/exercises/rowing.jpg",
    last_performance: {
      distance: 2000,
      duration: 510, // 8:30
      stroke_rate: 28,
      watts: 180,
      performed_at: "2025-01-29"
    }
  }
]

// Nouveau composant ExerciseCard2025
interface ExerciseCard2025Props {
  exercise: typeof mockExercises[0]
  variant?: 'default' | 'compact' | 'detailed'
  onAddPerformance: (id: number) => void
  onViewDetails: (id: number) => void
  onEdit?: (id: number) => void
  onDelete?: (id: number) => void
}

function ExerciseCard2025({ 
  exercise, 
  variant = 'default',
  onAddPerformance,
  onViewDetails,
  onEdit,
  onDelete
}: ExerciseCard2025Props) {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  const formatPerformance = () => {
    const perf = exercise.last_performance
    if (exercise.exercise_type === 'Musculation') {
      return `${perf.weight}kg × ${perf.reps} reps × ${perf.sets} sets`
    } else {
      // Cardio - Format intelligent selon type
      const parts = []
      if (perf.distance) {
        parts.push(exercise.name.toLowerCase().includes('rameur') 
          ? `${perf.distance}m` 
          : `${perf.distance}km`)
      }
      if (perf.duration) {
        const minutes = Math.floor(perf.duration / 60)
        const seconds = perf.duration % 60
        parts.push(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
      if (perf.stroke_rate) parts.push(`${perf.stroke_rate} SPM`)
      if (perf.watts) parts.push(`${perf.watts}W`)
      return parts.join(' • ')
    }
  }

  const difficultyColors = {
    'Débutant': 'bg-green-100 text-green-700',
    'Intermédiaire': 'bg-yellow-100 text-yellow-700',
    'Avancé': 'bg-red-100 text-red-700'
  }

  return (
    <div className="bg-white rounded-xl shadow-md hover:shadow-lg border border-gray-100 
                    hover:border-orange-200 transition-all duration-300 overflow-hidden group">
      {/* Image héro optimisée */}
      <div className="relative h-48 w-full bg-gradient-to-br from-orange-100 to-orange-200">
        <div className="absolute inset-0 flex items-center justify-center">
          <Dumbbell className="h-16 w-16 text-orange-400" />
        </div>
        <div className="absolute top-4 right-4">
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColors[exercise.difficulty]}`}>
            {exercise.difficulty}
          </span>
        </div>
      </div>

      <div className="p-6">
        {/* Header avec titre et metadata */}
        <div className="mb-4">
          <h3 className="text-xl font-bold text-gray-900 group-hover:text-orange-800 transition-colors mb-1">
            {exercise.name}
          </h3>
          <div className="flex items-center space-x-4 text-sm text-gray-500">
            <div className="flex items-center space-x-1">
              <Target className="h-4 w-4" />
              <span>{exercise.muscle_group}</span>
            </div>
            <div className="flex items-center space-x-1">
              <Dumbbell className="h-4 w-4" />
              <span>{exercise.equipment}</span>
            </div>
          </div>
        </div>

        {/* Section performance avec design amélioré */}
        <div className="mb-6 p-3 bg-gray-50 rounded-lg">
          <div className="flex items-center space-x-2 text-sm mb-1">
            <TrendingUp className="h-4 w-4 text-orange-500" />
            <span className="text-gray-600 font-medium">Dernière performance</span>
          </div>
          <p className="text-base font-semibold text-gray-900">
            {formatPerformance()}
          </p>
          <p className="text-xs text-gray-500 mt-1 flex items-center">
            <Calendar className="h-3 w-3 mr-1" />
            {new Date(exercise.last_performance.performed_at).toLocaleDateString('fr-FR')}
          </p>
        </div>

        {/* NOUVELLE HIÉRARCHIE D'ACTIONS */}
        <div className="flex items-center space-x-3">
          {/* ACTION PRIMAIRE - CTA Évident */}
          <button
            onClick={() => onAddPerformance(exercise.id)}
            className="flex-1 bg-gradient-to-r from-orange-600 to-orange-700 
                       text-white font-semibold py-3 px-4 rounded-lg 
                       hover:from-orange-600 hover:to-orange-700 
                       transition-all duration-200 
                       flex items-center justify-center gap-2
                       shadow-md hover:shadow-lg
                       focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
            aria-label={`Ajouter une nouvelle performance pour ${exercise.name}`}
          >
            <Plus className="h-5 w-5" />
            <span>Performance</span>
          </button>

          {/* ACTION SECONDAIRE - Style discret */}
          <button
            onClick={() => onViewDetails(exercise.id)}
            className="px-4 py-3 bg-gray-100 hover:bg-gray-200 
                       text-gray-700 rounded-lg font-medium 
                       transition-colors duration-200 
                       flex items-center gap-2
                       focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
            aria-label={`Voir les détails de ${exercise.name}`}
          >
            <Eye className="h-4 w-4" />
            <span className="hidden sm:inline">Détails</span>
          </button>

          {/* ACTIONS TERTIAIRES - Menu contextuel (Click, pas hover) */}
          <div className="relative">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 
                         rounded-lg transition-colors duration-200
                         focus:outline-none focus:ring-2 focus:ring-gray-400 focus:ring-offset-2"
              aria-label="Plus d'actions"
              aria-expanded={isMenuOpen}
              aria-haspopup="true"
            >
              <MoreVertical className="h-4 w-4" />
            </button>

            {/* Menu dropdown avec affordances améliorées */}
            {isMenuOpen && (
              <div className="absolute right-0 top-full mt-2 w-48 
                              bg-white rounded-lg shadow-xl border border-gray-200 
                              py-1 z-50 animate-in slide-in-from-top-2 duration-200">
                <button
                  onClick={() => {
                    onEdit?.(exercise.id)
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left
                             text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Edit className="h-4 w-4" />
                  <span>Modifier exercice</span>
                </button>
                <button
                  onClick={() => {
                    console.log('Dupliquer', exercise.id)
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left
                             text-gray-700 hover:bg-gray-50 transition-colors duration-150"
                >
                  <Copy className="h-4 w-4" />
                  <span>Dupliquer</span>
                </button>
                <hr className="my-1" />
                <button
                  onClick={() => {
                    onDelete?.(exercise.id)
                    setIsMenuOpen(false)
                  }}
                  className="flex items-center space-x-3 px-4 py-2 text-sm w-full text-left
                             text-red-600 hover:bg-red-50 transition-colors duration-150"
                >
                  <Trash2 className="h-4 w-4" />
                  <span>Supprimer</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Composant de comparaison Avant/Après
function ComparisonSection() {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
      {/* AVANT - Design actuel */}
      <div>
        <h3 className="text-lg font-semibold text-red-600 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-red-100 text-red-600 rounded-full flex items-center justify-center text-sm">❌</span>
          AVANT - Design Actuel
        </h3>
        <div className="bg-white rounded-xl shadow-md border border-gray-100 overflow-hidden">
          <div className="relative h-48 w-full bg-gradient-to-br from-orange-100 to-orange-200">
            <div className="absolute inset-0 flex items-center justify-center">
              <Dumbbell className="h-16 w-16 text-orange-400" />
            </div>
          </div>
          <div className="p-6">
            <h4 className="text-xl font-bold text-gray-900 mb-2">Développé couché</h4>
            <p className="text-sm text-gray-600 mb-4">Pectoraux</p>
            
            {/* PROBLÈME : 5 actions visibles = surcharge cognitive */}
            <div className="flex space-x-2 mb-2">
              <button className="flex-1 bg-orange-500 text-white px-3 py-2 rounded-lg text-sm">
                <Eye className="h-4 w-4 inline mr-1" />
                Détails
              </button>
              <button className="flex-1 bg-green-500 text-white px-3 py-2 rounded-lg text-sm">
                <Plus className="h-4 w-4 inline mr-1" />
                Performance
              </button>
              <div className="relative group">
                <button className="p-2 text-gray-400 hover:text-gray-600">
                  <MoreVertical className="h-4 w-4" />
                </button>
                {/* Menu hover problématique */}
                <div className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border opacity-0 group-hover:opacity-100 transition-opacity">
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm w-full text-left hover:bg-gray-50">
                    <Edit className="h-4 w-4" />
                    <span>Modifier</span>
                  </button>
                  <button className="flex items-center space-x-2 px-4 py-2 text-sm w-full text-left text-red-600 hover:bg-red-50">
                    <Trash2 className="h-4 w-4" />
                    <span>Supprimer</span>
                  </button>
                </div>
              </div>
            </div>
            
            <div className="text-xs text-red-600 space-y-1">
              <p>❌ 5 actions visibles → Surcharge cognitive</p>
              <p>❌ Menu hover → Peu accessible mobile</p>
              <p>❌ Actions redondantes avec modal détails</p>
              <p>❌ Pas de hiérarchie visuelle claire</p>
            </div>
          </div>
        </div>
      </div>

      {/* APRÈS - Nouveau design */}
      <div>
        <h3 className="text-lg font-semibold text-green-600 mb-4 flex items-center gap-2">
          <span className="w-6 h-6 bg-green-100 text-green-600 rounded-full flex items-center justify-center text-sm">✅</span>
          APRÈS - Design 2025
        </h3>
        <ExerciseCard2025
          exercise={mockExercises[0]}
          onAddPerformance={(id) => console.log('Add performance', id)}
          onViewDetails={(id) => console.log('View details', id)}
          onEdit={(id) => console.log('Edit', id)}
          onDelete={(id) => console.log('Delete', id)}
        />
        <div className="mt-3 text-xs text-green-600 space-y-1">
          <p>✅ Action primaire évidente → 1 clic pour 90% des cas</p>
          <p>✅ Menu click → Accessible clavier + mobile</p>
          <p>✅ Progressive disclosure → Moins de charge cognitive</p>
          <p>✅ Hiérarchie visuelle claire → UX intuitive</p>
        </div>
      </div>
    </div>
  )
}

// Page principale de démonstration
export default function RefonteDesignDemo() {
  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold mb-4">🎨 Refonte Design System 2025</h1>
          <p className="text-xl text-orange-100 mb-2">
            Démonstration des nouveaux patterns UX/UI inspirés des meilleures fitness apps
          </p>
          <div className="flex flex-wrap gap-4 text-sm">
            <span className="bg-white/20 px-3 py-1 rounded-full">MyFitnessPal Patterns</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Nike Training Club UX</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Strava Design</span>
            <span className="bg-white/20 px-3 py-1 rounded-full">Material Design 3</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Section comparaison Avant/Après */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
            🔄 Comparaison Avant / Après
          </h2>
          <ComparisonSection />
        </section>

        {/* Section nouveaux composants */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            🧩 Nouveaux Composants 2025
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {mockExercises.map(exercise => (
              <ExerciseCard2025
                key={exercise.id}
                exercise={exercise}
                onAddPerformance={(id) => console.log('Add performance', id)}
                onViewDetails={(id) => console.log('View details', id)}
                onEdit={(id) => console.log('Edit', id)}
                onDelete={(id) => console.log('Delete', id)}
              />
            ))}
          </div>
        </section>

        {/* Section principes design */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            🎯 Principes de Design Appliqués
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                <Target className="h-6 w-6 text-orange-800" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Action Hierarchy</h3>
              <p className="text-gray-600 text-sm">
                1 action primaire évidente (90% des cas), actions secondaires discrètes, 
                tertiaires dans menu contextuel
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Progressive Disclosure</h3>
              <p className="text-gray-600 text-sm">
                Informations par niveaux de priorité, évite la surcharge cognitive, 
                révèle complexité graduellement
              </p>
            </div>

            <div className="bg-white p-6 rounded-xl shadow-md">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                <Calendar className="h-6 w-6 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Touch Friendly</h3>
              <p className="text-gray-600 text-sm">
                Targets min 44px, espacement optimisé, navigation clavier complète, 
                menu click (pas hover)
              </p>
            </div>
          </div>
        </section>

        {/* Métriques d'amélioration */}
        <section className="mb-16">
          <h2 className="text-3xl font-bold text-gray-900 mb-8">
            📊 Métriques d'Amélioration Cibles
          </h2>
          
          <div className="bg-white rounded-xl shadow-md overflow-hidden">
            <table className="w-full">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Métrique
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actuel
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Cible 2025
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amélioration
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Clics pour ajouter performance
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">2 clics</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">1 clic</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      -50%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Actions visibles par carte
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">5 actions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">2-3 actions</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      -40%
                    </span>
                  </td>
                </tr>
                <tr>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    Score accessibilité
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">78/100</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-semibold">95+/100</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                      +22%
                    </span>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Call to action */}
        <section className="text-center">
          <div className="bg-gradient-to-r from-orange-600 to-red-500 rounded-2xl p-8 text-white">
            <h2 className="text-2xl font-bold mb-4">🚀 Prêt pour l'implémentation ?</h2>
            <p className="text-lg mb-6 text-orange-100">
              Cette refonte transformera l'expérience utilisateur IronTrack selon les standards 2025
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <button className="bg-white text-orange-800 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors">
                📋 Voir le plan détaillé
              </button>
              <button className="bg-orange-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-800 transition-colors border border-orange-400">
                🛠️ Commencer l'implémentation
              </button>
            </div>
          </div>
        </section>
      </div>
    </div>
  )
}