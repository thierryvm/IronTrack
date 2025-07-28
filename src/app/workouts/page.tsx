"use client"
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import { Plus, Eye, Edit, X as LucideX, Filter, Clock, Calendar, CheckCircle, Target, Users, Activity, Waves, Zap, Flower, Smile, Dumbbell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Workout {
  id: string
  name: string
  scheduled_date: string
  notes: string | null
  status?: string
  type?: string
  duration?: number
  start_time?: string
  created_at?: string
}

interface WorkoutModalProps {
  workout: Workout | null
  isOpen: boolean
  onClose: () => void
  onStatusChange: (workoutId: string, newStatus: string) => void
}

const workoutTypes = [
  { name: 'Musculation', color: 'bg-orange-500', icon: Dumbbell },
  { name: 'Cardio', color: 'bg-blue-500', icon: Clock },
  { name: 'Étirement', color: 'bg-green-500', icon: Target },
  { name: 'Cours collectif', color: 'bg-purple-500', icon: Users },
  { name: 'Gainage', color: 'bg-yellow-500', icon: Activity },
  { name: 'Natation', color: 'bg-cyan-500', icon: Waves },
  { name: 'Crossfit', color: 'bg-red-500', icon: Zap },
  { name: 'Yoga', color: 'bg-pink-500', icon: Flower },
  { name: 'Pilates', color: 'bg-indigo-500', icon: Smile },
  { name: 'Repos', color: 'bg-gray-500', icon: CheckCircle }
]

function WorkoutModal({ workout, isOpen, onClose, onStatusChange }: WorkoutModalProps) {
  if (!workout) return null

  const workoutType = workoutTypes.find(t => t.name === workout.type) || workoutTypes[0]
  const Icon = workoutType.icon
  const isCompleted = workout.status === 'Réalisé' || workout.status === 'Terminé'

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50"
          onClick={onClose}
        >
          {/* Overlay avec effet de flou */}
          <div 
            className="absolute inset-0"
            style={{
              background: 'linear-gradient(135deg, rgba(0,0,0,0.75), rgba(20,20,30,0.6))',
              backdropFilter: 'blur(15px) brightness(0.7)',
              WebkitBackdropFilter: 'blur(15px) brightness(0.7)'
            }}
          />
          
          {/* Container centré pour la modal */}
          <div className="relative flex items-center justify-center min-h-full p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className={`p-2 rounded-lg ${workoutType.color}`}>
                  <Icon className="h-5 w-5 text-white" />
                </div>
                <h2 className="text-xl font-bold text-gray-900">{workout.name}</h2>
              </div>
              <button
                onClick={onClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <LucideX className="h-5 w-5 text-gray-500" />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Calendar className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-600">
                  {new Date(workout.scheduled_date).toLocaleDateString('fr-FR', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </span>
              </div>

              {workout.start_time && (
                <div className="flex items-center space-x-2">
                  <Clock className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{workout.start_time}</span>
                </div>
              )}

              {workout.duration && (
                <div className="flex items-center space-x-2">
                  <Target className="h-4 w-4 text-gray-500" />
                  <span className="text-sm text-gray-600">{workout.duration} minutes</span>
                </div>
              )}

              <div className="flex items-center space-x-2">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                }`}>
                  {isCompleted ? '✅ Réalisé' : '⏳ Planifié'}
                </span>
              </div>

              {workout.notes && (
                <div className="bg-gray-50 p-3 rounded-lg">
                  <p className="text-sm text-gray-700">{workout.notes}</p>
                </div>
              )}
            </div>

            <div className="flex space-x-2 mt-6">
              {!isCompleted && (
                <button
                  onClick={() => {
                    onStatusChange(workout.id, 'Réalisé')
                    onClose()
                  }}
                  className="flex-1 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors"
                >
                  ✅ Marquer comme réalisé
                </button>
              )}
              <Link
                href={`/workouts/${workout.id}/edit`}
                className="flex-1 bg-orange-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-orange-600 transition-colors text-center"
              >
                ✏️ Modifier
              </Link>
            </div>
          </motion.div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  )
}

const PAGE_SIZE = 10;

const getCorrectType = (workout: Workout): string => {
  const name = workout.name.toLowerCase();
  if (name.includes('cardio')) return 'Cardio';
  if (name.includes('étirement') || name.includes('etirement') || name.includes('stretch')) return 'Étirement';
  if (name.includes('cours') || name.includes('collectif') || name.includes('group')) return 'Cours collectif';
  if (name.includes('gainage') || name.includes('core') || name.includes('abs')) return 'Gainage';
  if (name.includes('natation') || name.includes('piscine') || name.includes('swim')) return 'Natation';
  if (name.includes('crossfit') || name.includes('cross fit') || name.includes('wod')) return 'Crossfit';
  if (name.includes('yoga')) return 'Yoga';
  if (name.includes('pilates')) return 'Pilates';
  if (name.includes('repos') || name.includes('rest')) return 'Repos';
  return workout.type || 'Musculation';
};

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [selectedWorkout, setSelectedWorkout] = useState<Workout | null>(null)
  const [filterStatus, setFilterStatus] = useState<string>('all')

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const query = supabase
      .from('workouts')
      .select('*', { count: 'exact' })
      .eq('user_id', user.id);

    // Ne pas appliquer de filtres ici - on filtrera côté client après auto-marquage

    // Récupérer toutes les séances pour pouvoir filtrer côté client
    const { data, error } = await query
      .order('scheduled_date', { ascending: false });

    if (!error && data) {
      // Auto-marquer les séances passées comme réalisées si elles sont encore "Planifié"
      const today = new Date().toISOString().split('T')[0];
      const processedWorkouts = data.map(workout => {
        if (workout.scheduled_date < today && workout.status === 'Planifié') {
          // Marquer automatiquement comme réalisé en arrière-plan
          supabase.from('workouts').update({ status: 'Réalisé' }).eq('id', workout.id);
          return { ...workout, status: 'Réalisé' };
        }
        return workout;
      });

      // Appliquer les filtres côté client après processing
      const filteredWorkouts = processedWorkouts.filter(workout => {
        const isCompleted = workout.status === 'Réalisé' || workout.status === 'Terminé';
        
        switch (filterStatus) {
          case 'completed':
            return isCompleted;
          case 'pending':
            return !isCompleted;
          default:
            return true; // 'all'
        }
      });

      // Appliquer la pagination côté client
      const from = (page - 1) * PAGE_SIZE;
      const to = from + PAGE_SIZE;
      const paginatedWorkouts = filteredWorkouts.slice(from, to);

      setWorkouts(paginatedWorkouts);
      setTotalCount(filteredWorkouts.length);
    }
    setLoading(false);
  }, [page, filterStatus]);

  useEffect(() => {
    const checkAuth = async () => {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        router.replace('/auth');
      }
    };
    checkAuth();
    loadWorkouts();
  }, [page, router, loadWorkouts]);

  // Fonction pour changer le statut d'une séance
  const changeWorkoutStatus = async (workoutId: string, newStatus: string) => {
    const supabase = createClient();
    await supabase
      .from('workouts')
      .update({ status: newStatus })
      .eq('id', workoutId);
    loadWorkouts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <WorkoutModal 
        workout={selectedWorkout} 
        isOpen={!!selectedWorkout} 
        onClose={() => setSelectedWorkout(null)}
        onStatusChange={changeWorkoutStatus}
      />
      
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mes Séances</h1>
              <p className="text-orange-100">Organise et suis tes entraînements</p>
            </div>
            <Link
              href="/workouts/new"
              className="bg-white text-orange-600 px-6 py-3 rounded-lg font-semibold hover:bg-orange-50 transition-colors flex items-center space-x-2"
            >
              <Plus className="h-5 w-5" />
              <span>Nouvelle séance</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-500" />
              <span className="font-medium text-gray-700">Filtres :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Toutes', icon: '📋' },
                { value: 'pending', label: 'À venir', icon: '⏳' },
                { value: 'completed', label: 'Terminées', icon: '✅' }
              ].map(filter => (
                <button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${ 
                    filterStatus === filter.value
                      ? 'bg-orange-500 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  {filter.icon} {filter.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
            <p className="mt-4 text-gray-500">Chargement de tes séances...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {totalCount} séance{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
              </h2>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {workouts.map((workout, index) => {
                const workoutType = workoutTypes.find(t => t.name === getCorrectType(workout)) || workoutTypes[0];
                const Icon = workoutType.icon;
                const isCompleted = workout.status === 'Réalisé' || workout.status === 'Terminé';
                // Simplifié - plus besoin de isPast

                return (
                  <motion.div
                    key={workout.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.05 }}
                    className={`bg-white rounded-xl shadow-md hover:shadow-lg transition-all cursor-pointer border-l-4 ${
                      isCompleted ? 'border-green-500' : 'border-orange-500'
                    }`}
                    onClick={() => setSelectedWorkout(workout)}
                  >
                    <div className="p-6">
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${workoutType.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 text-lg">{workout.name}</h3>
                            <p className="text-sm text-gray-500">{workoutType.name}</p>
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(workout.scheduled_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {workout.start_time && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="h-4 w-4" />
                            <span>{workout.start_time}</span>
                          </div>
                        )}
                        {workout.duration && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Target className="h-4 w-4" />
                            <span>{workout.duration} min</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCompleted ? '✅ Réalisé' : '⏳ Planifié'}
                        </span>

                        <div className="flex space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWorkout(workout);
                            }}
                            className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Voir détails"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <Link
                            href={`/workouts/${workout.id}/edit`}
                            onClick={(e) => e.stopPropagation()}
                            className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                            title="Modifier"
                          >
                            <Edit className="h-4 w-4" />
                          </Link>
                        </div>
                      </div>

                      {!isCompleted && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            changeWorkoutStatus(workout.id, 'Réalisé');
                          }}
                          className="w-full mt-4 bg-green-500 text-white py-2 px-4 rounded-lg font-semibold hover:bg-green-600 transition-colors text-sm"
                        >
                          ✅ Marquer comme réalisé
                        </button>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>

            {workouts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏋️</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Aucune séance trouvée</h3>
                <p className="text-gray-500 mb-6">Commence par créer ta première séance d'entraînement !</p>
                <Link
                  href="/workouts/new"
                  className="bg-orange-500 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-600 transition-colors inline-flex items-center space-x-2"
                >
                  <Plus className="h-5 w-5" />
                  <span>Créer une séance</span>
                </Link>
              </div>
            )}

            {/* Pagination */}
            {totalCount > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    page === 1 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Précédent
                </button>
                <span className="font-semibold">
                  Page {page} / {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                </span>
                <button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                  className={`px-4 py-2 rounded-lg font-semibold transition-colors ${
                    page >= Math.ceil(totalCount / PAGE_SIZE) 
                      ? 'bg-gray-200 text-gray-400 cursor-not-allowed' 
                      : 'bg-orange-500 text-white hover:bg-orange-600'
                  }`}
                >
                  Suivant
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 