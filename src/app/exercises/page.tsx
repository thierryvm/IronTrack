'use client'

import { useState, useEffect, useCallback } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { Plus, Search, Dumbbell, Target, TrendingUp, Eye, Edit, Trash2, Calendar, Trophy } from 'lucide-react'
import { ExerciseDetailsModal } from '@/components/exercises/ExerciseDetailsModal'

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

// Fonction pour formater les performances selon le type d'exercice
function formatLastPerformance(exercise: Exercise): string {
  if (exercise.exercise_type === 'Musculation') {
    if (exercise.last_weight && exercise.last_reps) {
      return `${exercise.last_weight}kg × ${exercise.last_reps} reps`;
    }
  } else if (exercise.exercise_type === 'Cardio') {
    const parts = [];
    if (exercise.last_distance) {
      parts.push(`${exercise.last_distance}km`);
    }
    if (exercise.last_duration) {
      const minutes = Math.floor(exercise.last_duration / 60);
      const seconds = exercise.last_duration % 60;
      parts.push(`${minutes}:${seconds.toString().padStart(2, '0')}`);
    }
    if (parts.length > 0) {
      return parts.join(' - ');
    }
  }
  return '';
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

export default function ExercisesPage() {
  const router = useRouter();
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
  const [equipmentList, setEquipmentList] = useState<{id: number, name: string}[]>([])
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [exerciseToDelete, setExerciseToDelete] = useState<Exercise | null>(null);
  const [selectedExerciseId, setSelectedExerciseId] = useState<string | null>(null);

  const loadExercises = useCallback(async () => {
    setLoading(true)
    const supabase = createClient()
    
    // Récupérer le nombre total d'exercices pour la pagination
    const { count } = await supabase
      .from('exercises')
      .select('*', { count: 'exact', head: true });
    setTotalCount(count || 0);
    
    // Charger uniquement les exercices de la page courante
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data: exercisesData, error } = await supabase
      .from('exercises')
      .select('*, image_url')
      .order('created_at', { ascending: false })
      .range(from, to);

    if (!error && exercisesData) {
      // Pour chaque exercice, récupérer la dernière performance
      const enrichedExercises = await Promise.all(
        exercisesData.map(async (exercise) => {
          const { data: lastPerf } = await supabase
            .from('performance_logs')
            .select('weight, reps, distance, duration, performed_at')
            .eq('exercise_id', exercise.id)
            .order('performed_at', { ascending: false })
            .limit(1);

          const lastPerfData = lastPerf?.[0];
          
          return {
            ...exercise,
            last_weight: lastPerfData?.weight,
            last_reps: lastPerfData?.reps,
            last_distance: lastPerfData?.distance,
            last_duration: lastPerfData?.duration,
            last_date: lastPerfData?.performed_at
          };
        })
      );
      
      setExercises(enrichedExercises);
    }
    setLoading(false);
  }, [page]);

  useEffect(() => {
    loadExercises()
    // Charger la liste des équipements
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('equipment').select('id, name')
      if (!error && data) setEquipmentList(data)
    }
    fetchEquipment()
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

  // Filtrage des exercices selon la recherche et le groupe musculaire
  const filteredExercises = exercises.filter(ex => {
    const search = normalize(searchTerm);
    const name = normalize(ex.name);
    const muscle = normalize(ex.muscle_group);
    const matchSearch = search === '' || name.includes(search) || muscle.includes(search);
    const matchGroup = selectedMuscleGroup === 'Tous' || ex.muscle_group === selectedMuscleGroup;
    return matchGroup && matchSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des exercices...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <ExerciseDetailsModal 
        exerciseId={selectedExerciseId || ''}
        isOpen={!!selectedExerciseId} 
        onClose={() => setSelectedExerciseId(null)}
      />
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-gray-900 dark:to-gray-800 text-white dark:text-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Exercices</h1>
              <p className="text-orange-100">Gère ta bibliothèque d'exercices</p>
            </div>
            <Link
              href="/exercises/new"
              className="bg-white dark:bg-gray-800 text-orange-600 dark:text-orange-300 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 dark:hover:bg-gray-700 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvel exercice</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres et recherche */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6 mb-8"
        >
          <div className="flex flex-col sm:flex-row gap-4">
            {/* Recherche */}
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-5 w-5" />
                <input
                  type="text"
                  placeholder="Rechercher un exercice..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-10 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
                {searchTerm && (
                  <button
                    type="button"
                    onClick={() => setSearchTerm('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-red-500 focus:outline-none"
                    aria-label="Effacer la recherche"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filtre par groupe musculaire */}
            <div className="sm:w-64">
              <select
                value={selectedMuscleGroup}
                onChange={(e) => setSelectedMuscleGroup(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              >
                {muscleGroups.map(group => (
                  <option key={group} value={group}>{group}</option>
                ))}
              </select>
            </div>
          </div>
        </motion.div>

        {/* Statistiques */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8"
        >
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Total exercices</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{totalCount}</p>
              </div>
              <div className="p-3 bg-blue-100 dark:bg-blue-900 rounded-full">
                <Dumbbell className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Groupes musculaires</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">{new Set(exercises.map(e => e.muscle_group)).size}</p>
              </div>
              <div className="p-3 bg-green-100 dark:bg-green-900 rounded-full">
                <Target className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-300">Exercices récents</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-gray-100">
                  {exercises.filter(e => e.last_date && new Date(e.last_date) > new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)).length}
                </p>
              </div>
              <div className="p-3 bg-orange-100 dark:bg-orange-900 rounded-full">
                <TrendingUp className="h-6 w-6 text-orange-500" />
              </div>
            </div>
          </div>
        </motion.div>

        {/* Grille des exercices */}
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-bold text-gray-900">
            {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''} trouvé{filteredExercises.length > 1 ? 's' : ''}
          </h2>
        </div>

        <div className="grid gap-3 grid-cols-1 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredExercises.map((exercise, index) => {
            const difficultyColors = {
              'Débutant': { bg: 'bg-green-500', border: 'border-green-500' },
              'Intermédiaire': { bg: 'bg-yellow-500', border: 'border-yellow-500' },
              'Avancé': { bg: 'bg-red-500', border: 'border-red-500' }
            }
            const difficultyColor = difficultyColors[exercise.difficulty] || { bg: 'bg-gray-500', border: 'border-gray-500' }
            const equipment = equipmentList.find(eq => String(eq.id) === String(exercise.equipment))

            return (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 ${difficultyColor.border} overflow-hidden`}
                onClick={() => setSelectedExerciseId(exercise.id.toString())}
              >
                {/* Image de l'exercice */}
                {exercise.image_url && (
                  <div className="relative h-32 sm:h-40 bg-gray-100">
                    <Image
                      src={exercise.image_url}
                      alt={`Photo de ${exercise.name}`}
                      fill
                      className="object-cover"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                    />
                    {/* Overlay avec difficulté */}
                    <div className="absolute top-2 right-2">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${difficultyColor.bg} text-white shadow-lg`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                  </div>
                )}
                <div className="p-4 sm:p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3 min-w-0 flex-1">
                      <div className={`p-2 rounded-lg ${difficultyColor.bg} flex-shrink-0`}>
                        <Dumbbell className="h-5 w-5 text-white" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <h3 className="font-semibold text-gray-900 text-base sm:text-lg truncate">{exercise.name}</h3>
                        <p className="text-sm text-gray-500 truncate">{exercise.muscle_group}</p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    {equipment && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Dumbbell className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{equipment.name}</span>
                      </div>
                    )}
                    {exercise.last_date && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Calendar className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">Dernière: {new Date(exercise.last_date).toLocaleDateString('fr-FR')}</span>
                      </div>
                    )}
                    {formatLastPerformance(exercise) && (
                      <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Trophy className="h-4 w-4 flex-shrink-0" />
                        <span className="truncate">{formatLastPerformance(exercise)}</span>
                      </div>
                    )}
                  </div>

                  <div className="flex items-center justify-between">
                    {/* Afficher difficulté uniquement si pas d'image */}
                    {!exercise.image_url && (
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${difficultyColor.bg} text-white`}>
                        {exercise.difficulty}
                      </span>
                    )}
                    {exercise.image_url && <div></div>}

                    <div className="flex space-x-1 flex-shrink-0">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedExerciseId(exercise.id.toString());
                        }}
                        className="p-1.5 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                        title="Voir détails"
                      >
                        <Eye className="h-4 w-4" />
                      </button>
                      <Link
                        href={`/exercises/${exercise.id}/add-performance`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                        title="Ajouter une performance"
                      >
                        <Plus className="h-4 w-4" />
                      </Link>
                      <Link
                        href={`/exercises/${exercise.id}/edit-exercise`}
                        onClick={(e) => e.stopPropagation()}
                        className="p-1.5 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                        title="Modifier"
                      >
                        <Edit className="h-4 w-4" />
                      </Link>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteExercise(exercise);
                        }}
                        className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        title="Supprimer"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>

        {filteredExercises.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">💪</div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucun exercice trouvé</h3>
            <p className="text-gray-500 mb-6">
              {searchTerm || selectedMuscleGroup !== 'Tous' 
                ? 'Essaie de modifier tes critères de recherche'
                : 'Commence par ajouter ton premier exercice !'}
            </p>
            {!searchTerm && selectedMuscleGroup === 'Tous' && (
              <Link
                href="/exercises/new"
                className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center space-x-2"
              >
                <Plus className="h-5 w-5" />
                <span>Ajouter un exercice</span>
              </Link>
            )}
          </div>
        )}
        {/* Pagination */}
        <div className="flex justify-center items-center gap-2 sm:gap-4 mt-6 px-4">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
              page === 1 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <span className="hidden sm:inline">Précédent</span>
            <span className="sm:hidden">←</span>
          </button>
          <span className="font-semibold text-sm sm:text-base px-2">
            Page {page} / {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
          </span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
            className={`px-3 sm:px-4 py-2 rounded-lg font-semibold text-sm sm:text-base transition-colors ${
              page >= Math.ceil(totalCount / PAGE_SIZE) 
                ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                : 'bg-orange-500 text-white hover:bg-orange-600'
            }`}
          >
            <span className="hidden sm:inline">Suivant</span>
            <span className="sm:hidden">→</span>
          </button>
        </div>

        {/* Modal de confirmation suppression */}
        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
            <div className="bg-white rounded-xl shadow-2xl p-8 max-w-md w-full">
              <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
                <Trash2 className="h-6 w-6 text-red-500" /> 
                Supprimer l'exercice ?
              </h2>
              <p className="mb-6">
                Tu es sûr de vouloir supprimer &quot;{exerciseToDelete?.name}&quot; ? 
                Cette action est irréversible et supprimera aussi toutes les performances associées.
              </p>
              <div className="flex justify-end gap-2">
                <button 
                  onClick={cancelDeleteExercise} 
                  className="px-4 py-2 rounded-lg bg-gray-200 text-gray-800 font-semibold"
                >
                  Annuler
                </button>
                <button 
                  onClick={confirmDeleteExercise} 
                  className="px-4 py-2 rounded-lg bg-red-500 text-white font-semibold"
                >
                  Supprimer
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
} 