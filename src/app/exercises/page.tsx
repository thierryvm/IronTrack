'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search } from 'lucide-react'
import dynamic from 'next/dynamic'
import { ExerciseCard2025 } from '@/components/exercises/ExerciseCard2025'

// Lazy loading des composants lourds - OPTIMISATION CRITIQUE
const ExerciseDetailsModal = dynamic(() => 
  import('@/components/exercises/ExerciseDetailsModal').then(mod => ({ default: mod.ExerciseDetailsModal })), 
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 h-64 rounded-lg">Chargement...</div>
  }
)


interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  exercise_type: 'Musculation' | 'Cardio'
  last_weight?: number
  last_reps?: number
  last_distance?: number
  last_duration?: number
  last_date?: string
  description?: string
  image_url?: string
  created_at?: string
}


const muscleGroups = [
  'Tous',
  'Pectoraux', 
  'Dos',
  'Épaules',
  'Biceps',
  'Triceps',
  'Jambes',
  'Abdominaux',
  'Fessiers'
]

const PAGE_SIZE = 10;

// OPTIMISATION CRITIQUE: Fonction pour charger toutes les performances en une seule requête
async function loadExercisesWithPerformances(page: number) {
  const supabase = createClient()
  
  const from = (page - 1) * PAGE_SIZE;
  const to = from + PAGE_SIZE - 1;
  
  // 1. Charger les exercices
  const { data: exercisesData, error: exercisesError, count } = await supabase
    .from('exercises')
    .select('*, image_url', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(from, to);

  if (exercisesError || !exercisesData) {
    return { exercises: [], totalCount: 0 };
  }

  // 2. Extraire les IDs des exercices
  const exerciseIds = exercisesData.map(ex => ex.id);
  
  // 3. OPTIMISATION: Une seule requête pour toutes les dernières performances
  const { data: performancesData } = await supabase
    .from('performance_logs')
    .select('exercise_id, weight, reps, distance, duration, performed_at')
    .in('exercise_id', exerciseIds)
    .order('performed_at', { ascending: false });

  // 4. Grouper les performances par exercise_id et prendre la plus récente
  const performanceMap = new Map<number, any>();
  if (performancesData) {
    performancesData.forEach(perf => {
      if (!performanceMap.has(perf.exercise_id)) {
        performanceMap.set(perf.exercise_id, perf);
      }
    });
  }

  // 5. Enrichir les exercices avec leurs performances
  const enrichedExercises = exercisesData.map(exercise => {
    const lastPerf = performanceMap.get(exercise.id);
    return {
      ...exercise,
      last_weight: lastPerf?.weight,
      last_reps: lastPerf?.reps,
      last_distance: lastPerf?.distance,
      last_duration: lastPerf?.duration,
      last_date: lastPerf?.performed_at
    };
  });

  return {
    exercises: enrichedExercises,
    totalCount: count || 0
  };
}

// Composant Loading optimisé
function ExerciseLoadingSkeleton() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="bg-white rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 rounded w-3/4"></div>
        </div>
      ))}
    </div>
  )
}

// Composant principal optimisé
export default function ExercisesPageOptimized() {
  const router = useRouter();
  
  // OPTIMISATION: Check auth uniquement au montage
  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
      }
    };
    checkAuth();
  }, [router]);

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null)
  

  // OPTIMISATION: Fonction de chargement avec une seule requête groupée
  const loadExercises = useCallback(async () => {
    setLoading(true)
    
    try {
      const { exercises: loadedExercises, totalCount: count } = await loadExercisesWithPerformances(page);
      setExercises(loadedExercises);
      setTotalCount(count);
    } catch (error) {
      console.error('Erreur chargement exercices:', error);
    } finally {
      setLoading(false);
    }
  }, [page]);

  // OPTIMISATION: Charger équipements en lazy
  useEffect(() => {
    loadExercises()
    
  }, [loadExercises]);

  // Fonction utilitaire pour normaliser (enlever accents et mettre en minuscule)
  function normalize(str: string) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

  // Fonctions de suppression
  const handleDeleteExercise = (exercise: Exercise) => {
    setExerciseToDelete(exercise);
    setShowDeleteModal(true);
  };

  const confirmDeleteExercise = async () => {
    if (!exerciseToDelete) return;
    
    const supabase = createClient();
    const { error } = await supabase
      .from('exercises')
      .delete()
      .eq('id', exerciseToDelete.id);
    
    if (!error) {
      setExercises(exercises.filter(ex => ex.id !== exerciseToDelete.id));
      setTotalCount(totalCount - 1);
    }
    
    setShowDeleteModal(false);
    setExerciseToDelete(null);
  };

  const cancelDeleteExercise = () => {
    setShowDeleteModal(false);
    setExerciseToDelete(null);
  };

  // OPTIMISATION: Filtrage avec useMemo si nécessaire
  const filteredExercises = exercises.filter(ex => {
    const search = normalize(searchTerm);
    const name = normalize(ex.name);
    const muscle = normalize(ex.muscle_group);
    const matchSearch = search === '' || name.includes(search) || muscle.includes(search);
    const matchGroup = selectedMuscleGroup === 'Tous' || ex.muscle_group === selectedMuscleGroup;
    return matchGroup && matchSearch;
  });

  // OPTIMISATION: Loading état avec skeleton au lieu de spinner simple
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold">Mes Exercices</h1>
            <p className="text-white/90">Gestion et suivi de vos exercices</p>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <ExerciseLoadingSkeleton />
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header optimisé - rendu immédiat */}
      <div className="bg-gradient-to-r from-orange-600 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-3xl font-bold max-sm:text-2xl">Mes Exercices</h1>
              <p className="text-white/90 max-sm:text-sm">Gestion et suivi de vos exercices ({totalCount} total)</p>
            </div>
            <div className="flex items-center space-x-3">
              <Link 
                href="/exercises/new"
                className="bg-white text-orange-800 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2 max-sm:px-3 max-sm:py-2 max-sm:text-sm"
              >
                <Plus className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                <span>Nouvel exercice</span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Contenu principal avec Suspense */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres - rendu immédiat */}
        <div className="mb-8 space-y-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 outline-none"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2">
              {muscleGroups.map(group => (
                <button
                  key={group}
                  onClick={() => setSelectedMuscleGroup(group)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    selectedMuscleGroup === group
                      ? 'bg-orange-500 text-white'
                      : 'bg-white text-gray-600 hover:bg-orange-50 border border-gray-200'
                  }`}
                >
                  {group}
                </button>
              ))}
            </div>
          </div>
        </div>


        {/* Liste d'exercices avec Suspense */}
        <Suspense fallback={<ExerciseLoadingSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise) => (
              // CARTES DESIGN 2025 - PERMANENT
              <ExerciseCard2025
                key={exercise.id}
                exercise={exercise}
                lastPerformance={exercise.last_weight || exercise.last_distance ? {
                  weight: exercise.last_weight,
                  reps: exercise.last_reps,
                  distance: exercise.last_distance,
                  duration: exercise.last_duration,
                  performed_at: exercise.last_date || new Date().toISOString()
                } : undefined}
                onAddPerformance={(exerciseId) => {
                  window.location.href = `/exercises/${exerciseId}/add-performance`
                }}
                onViewDetails={(exerciseId) => {
                  setSelectedExerciseId(exerciseId.toString())
                }}
                onDelete={(exerciseId) => {
                  const exerciseToDelete = filteredExercises.find(ex => ex.id === exerciseId)
                  if (exerciseToDelete) {
                    handleDeleteExercise(exerciseToDelete)
                  }
                }}
              />
            ))}
          </div>
        </Suspense>

        {/* Pagination */}
        {totalCount > PAGE_SIZE && (
          <div className="mt-8 flex justify-center space-x-2">
            <button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Précédent
            </button>
            <span className="px-4 py-2 text-gray-600">
              Page {page} sur {Math.ceil(totalCount / PAGE_SIZE)}
            </span>
            <button
              onClick={() => setPage(Math.min(Math.ceil(totalCount / PAGE_SIZE), page + 1))}
              disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
              className="px-4 py-2 border border-gray-300 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50"
            >
              Suivant
            </button>
          </div>
        )}
      </div>

      {/* Modal de détails exercice avec lazy loading */}
      {selectedExerciseId && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
        </div>}>
          <ExerciseDetailsModal
            exerciseId={selectedExerciseId}
            isOpen={!!selectedExerciseId}
            onClose={() => setSelectedExerciseId(null)}
          />
        </Suspense>
      )}

      {/* Modal de confirmation suppression */}
      {showDeleteModal && exerciseToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md mx-4">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Confirmer la suppression
            </h3>
            <p className="text-gray-600 mb-6">
              Êtes-vous sûr de vouloir supprimer l'exercice "{exerciseToDelete.name}" ? 
              Cette action est irréversible et supprimera aussi toutes les performances associées.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={confirmDeleteExercise}
                className="flex-1 bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 transition-colors"
              >
                Supprimer
              </button>
              <button
                onClick={cancelDeleteExercise}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}