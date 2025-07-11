'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase'
import { Plus, Search, Dumbbell, Target, TrendingUp, Eye, Edit, Trash2 } from 'lucide-react'

interface Exercise {
  id: number
  name: string
  muscle_group: string
  equipment: string
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  last_weight?: number
  last_reps?: number
  last_date?: string
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
  }, []);

  const [exercises, setExercises] = useState<Exercise[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedMuscleGroup, setSelectedMuscleGroup] = useState('Tous')
  const [loading, setLoading] = useState(true)
  const [equipmentList, setEquipmentList] = useState<{id: number, name: string}[]>([])
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  useEffect(() => {
    loadExercises()
    // Charger la liste des équipements
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('equipment').select('id, name')
      if (!error && data) setEquipmentList(data)
    }
    fetchEquipment()
  }, [page])

  const loadExercises = async () => {
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
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('created_at', { ascending: false })
      .range(from, to);
    if (!error && data) {
      setExercises(data);
    }
    setLoading(false);
  }

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'Débutant': return 'bg-green-100 text-green-800'
      case 'Intermédiaire': return 'bg-yellow-100 text-yellow-800'
      case 'Avancé': return 'bg-red-100 text-red-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  // Fonction utilitaire pour normaliser (enlever accents et mettre en minuscule)
  function normalize(str: string) {
    return str.normalize('NFD').replace(/\p{Diacritic}/gu, '').toLowerCase();
  }

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
      {/* Header */}
      <div className="bg-gradient-to-r from-orange-500 to-red-500 dark:from-gray-900 dark:to-gray-800 text-white dark:text-gray-100 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-3xl font-bold">Exercices</h1>
              <p className="text-orange-100">Gère ta bibliothèque d&apos;exercices</p>
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
          <div className="flex flex-col md:flex-row gap-4">
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
            <div className="md:w-64">
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
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
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

        {/* Liste des exercices */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-gray-800 rounded-xl shadow-md overflow-hidden"
        >
          <div className="px-6 py-4 border-b border-gray-200">
            <h2 className="text-xl font-bold text-gray-900">
              {filteredExercises.length} exercice{filteredExercises.length > 1 ? 's' : ''} trouvé{filteredExercises.length > 1 ? 's' : ''}
            </h2>
          </div>

          <div className="divide-y divide-gray-200">
            {filteredExercises.map((exercise, index) => (
              <motion.div
                key={exercise.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="p-6 hover:bg-gray-50 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{exercise.name}</h3>
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${getDifficultyColor(exercise.difficulty)}`}>
                        {exercise.difficulty}
                      </span>
                    </div>
                    
                    <div className="flex items-center space-x-6 text-sm text-gray-600">
                      <span className="flex items-center space-x-1">
                        <Target className="h-4 w-4" />
                        <span>{exercise.muscle_group}</span>
                      </span>
                      {/* Affichage dynamique de l'équipement */}
                      {(() => {
                        const equipment = equipmentList.find(eq => String(eq.id) === String(exercise.equipment));
                        if (equipment) {
                          return (
                            <span className="inline-flex items-center">
                              {equipment.name}
                            </span>
                          );
                        }
                        return null;
                      })()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/exercises/${exercise.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/exercises/${exercise.id}/edit`}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    <button
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      title="Supprimer"
                    >
                      <Trash2 className="h-5 w-5" />
                    </button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {filteredExercises.length === 0 && (
            <div className="p-12 text-center">
              <Dumbbell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Aucun exercice trouvé</h3>
              <p className="text-gray-600 mb-6">
                {searchTerm || selectedMuscleGroup !== 'Tous' 
                  ? 'Essaie de modifier tes critères de recherche'
                  : 'Commence par ajouter ton premier exercice'
                }
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
        </motion.div>
        {/* Pagination */}
        <div className="flex justify-center items-center gap-4 mt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className={`px-4 py-2 rounded-lg font-semibold ${page === 1 ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            Précédent
          </button>
          <span className="font-semibold">Page {page} / {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}</span>
          <button
            onClick={() => setPage((p) => p + 1)}
            disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
            className={`px-4 py-2 rounded-lg font-semibold ${page >= Math.ceil(totalCount / PAGE_SIZE) ? 'bg-gray-200 text-gray-400 cursor-not-allowed' : 'bg-orange-500 text-white hover:bg-orange-600'}`}
          >
            Suivant
          </button>
        </div>
      </div>
    </div>
  )
} 