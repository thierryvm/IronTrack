'use client'

import { useState, useEffect, useCallback, Suspense } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search } from 'lucide-react'

// MIGRATION SHADCN/UI EXERCICES
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import dynamic from 'next/dynamic'
import { ExerciseCard2025 } from '@/components/exercises/ExerciseCard2025'

// Lazy loading des composants lourds - OPTIMISATION CRITIQUE
const ExerciseDetailsModal = dynamic(() => 
  import('@/components/exercises/ExerciseDetailsModal').then(mod => ({ default: mod.ExerciseDetailsModal })), 
  { 
    ssr: false,
    loading: () => <div className="animate-pulse bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 h-64 rounded-lg">Chargement...</div>
  }
)

// Type pour les données de performance COMPLÈTES
interface PerformanceData {
  exercise_id: number
  weight?: number
  reps?: number  
  distance?: number
  duration?: number
  performed_at: string
  // Métriques cardio avancées
  speed?: number
  heart_rate?: number
  stroke_rate?: number
  watts?: number
  cadence?: number
  resistance?: number
  incline?: number
  calories?: number
}


interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  exercise_type: 'Musculation' | 'Cardio'
  description?: string
  image_url?: string
  created_at?: string
  // Performance complète au lieu de champs séparés
  lastPerformance?: PerformanceData
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
  
  // 3. OPTIMISATION: Une seule requête pour toutes les dernières performances COMPLÈTES
  const { data: performancesData } = await supabase
    .from('performance_logs')
    .select('exercise_id, weight, reps, distance, duration, performed_at, speed, heart_rate, stroke_rate, watts, cadence, resistance, incline, calories')
    .in('exercise_id', exerciseIds)
    .order('performed_at', { ascending: false });

  // 4. Grouper les performances par exercise_id et prendre la plus récente
  const performanceMap = new Map<number, PerformanceData>();
  if (performancesData) {
    performancesData.forEach(perf => {
      if (!performanceMap.has(perf.exercise_id)) {
        performanceMap.set(perf.exercise_id, perf);
      }
    });
  }

  // 5. Enrichir les exercices avec leurs performances COMPLÈTES
  const enrichedExercises = exercisesData.map(exercise => {
    const lastPerf = performanceMap.get(exercise.id);
    return {
      ...exercise,
      lastPerformance: lastPerf || undefined
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
        <div key={i} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-600 rounded-xl shadow-md p-6 animate-pulse">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded mb-2"></div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
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
  function normalize(str: string | null | undefined): string {
    if (!str) return '';
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
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
        <div className="bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white py-8">
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header optimisé - rendu immédiat */}
      <div className="bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 sm:gap-0">
            <div>
              <h1 className="text-3xl font-bold max-sm:text-2xl">Mes Exercices</h1>
              <p className="text-white/90 max-sm:text-sm">Gestion et suivi de vos exercices ({totalCount} total)</p>
            </div>
            <div className="flex items-center space-x-3">
              <Button asChild variant="outline">
                <Link href="/exercises/new" className="flex items-center space-x-2 max-sm:px-3 max-sm:py-2 max-sm:text-sm">
                  <Plus className="h-5 w-5 max-sm:h-4 max-sm:w-4" />
                  <span>Nouvel exercice</span>
                </Link>
              </Button>
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
              <Label htmlFor="exercise-search" className="sr-only">
                Rechercher un exercice
              </Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-6 w-6 text-gray-700 dark:text-gray-300" />
                <Input
                  id="exercise-search"
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 focus:ring-2 focus:ring-orange-500 focus:border-orange-500 dark:focus:border-orange-400"
                  aria-label="Rechercher un exercice par nom, groupe musculaire ou équipement"
                />
              </div>
            </div>
            <div className="flex flex-wrap gap-2" role="group" aria-label="Filtres par groupe musculaire">
              {muscleGroups.map(group => (
                <Button
                  key={group}
                  onClick={() => setSelectedMuscleGroup(group)}
                  variant={selectedMuscleGroup === group ? "default" : "secondary"}
                  size="sm"
                  className={selectedMuscleGroup === group ? "bg-orange-600 hover:bg-orange-700 text-white" : "border-orange-200 text-orange-700 hover:bg-orange-50"}
                  aria-pressed={selectedMuscleGroup === group}
                  aria-label={`Filtrer par ${group}${selectedMuscleGroup === group ? ' (actif)' : ''}`}
                >
                  {group}
                </Button>
              ))}
            </div>
          </div>
        </div>


        {/* Liste d'exercices avec Suspense */}
        <Suspense fallback={<ExerciseLoadingSkeleton />}>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredExercises.map((exercise, index) => (
              // CARTES DESIGN 2025 - PERMANENT
              <ExerciseCard2025
                key={exercise.id}
                exercise={exercise}
                priority={index < 3}
                lastPerformance={exercise.lastPerformance || undefined}
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
            <Button
              onClick={() => setPage(Math.max(1, page - 1))}
              disabled={page === 1}
              variant="outline"
            >
              Précédent
            </Button>
            <span className="px-4 py-2 text-gray-600 dark:text-gray-300">
              Page {page} sur {Math.ceil(totalCount / PAGE_SIZE)}
            </span>
            <Button
              onClick={() => setPage(Math.min(Math.ceil(totalCount / PAGE_SIZE), page + 1))}
              disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
              variant="outline"
            >
              Suivant
            </Button>
          </div>
        )}
      </div>

      {/* Modal de détails exercice avec lazy loading */}
      {selectedExerciseId && (
        <Suspense fallback={<div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 dark:border-orange-400"></div>
        </div>}>
          <ExerciseDetailsModal
            exerciseId={selectedExerciseId}
            isOpen={!!selectedExerciseId}
            onClose={() => setSelectedExerciseId(null)}
          />
        </Suspense>
      )}

      {/* Modal de confirmation suppression */}
      <Dialog open={showDeleteModal && !!exerciseToDelete} onOpenChange={cancelDeleteExercise}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Confirmer la suppression</DialogTitle>
            <DialogDescription>
              Êtes-vous sûr de vouloir supprimer l'exercice "{exerciseToDelete?.name}" ? 
              Cette action est irréversible et supprimera aussi toutes les performances associées.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter className="flex space-x-3">
            <Button
              onClick={confirmDeleteExercise}
              variant="destructive"
              className="flex-1"
            >
              Supprimer
            </Button>
            <Button
              onClick={cancelDeleteExercise}
              variant="secondary"
              className="flex-1"
            >
              Annuler
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}