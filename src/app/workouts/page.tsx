"use client"
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, X, Filter, Clock, Calendar, CheckCircle, Target, Users, Activity, Waves, Zap, Flower, Smile, Dumbbell } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

// MIGRATION SHADCN/UI
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
// PERFORMANCE CRITICAL: Images optimisées WebP/AVIF
// import { OptimizedAvatar, OptimizedImage } from '@/components/PerformanceImageOptimizer'

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
  { name: 'Musculation', color: 'bg-orange-600', icon: Dumbbell },
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div className={`p-2 rounded-lg ${workoutType.color}`}>
              <Icon className="h-5 w-5 text-white" />
            </div>
            <span>{workout.name}</span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          <div className="flex items-center space-x-2">
            <Calendar className="h-6 w-6 text-gray-600 dark:text-safe-muted" />
            <span className="text-sm text-gray-600 dark:text-gray-300">
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
              <Clock className="h-6 w-6 text-gray-600 dark:text-safe-muted" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{workout.start_time}</span>
            </div>
          )}

          {workout.duration && (
            <div className="flex items-center space-x-2">
              <Target className="h-6 w-6 text-gray-600 dark:text-safe-muted" />
              <span className="text-sm text-gray-600 dark:text-gray-300">{workout.duration} minutes</span>
            </div>
          )}

          <div className="flex items-center space-x-2">
            <Badge variant={isCompleted ? "default" : "secondary"} className={isCompleted ? "bg-green-100 text-green-800 hover:bg-green-200" : "bg-blue-100 text-blue-800 hover:bg-blue-200"}>
              {isCompleted ? '✅ Réalisé' : '⏳ Planifié'}
            </Badge>
          </div>

          {workout.notes && (
            <Card>
              <CardContent className="pt-4">
                <p className="text-sm text-gray-700 dark:text-gray-300">{workout.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <div className="flex space-x-2 mt-6">
          {!isCompleted && (
            <Button
              onClick={() => {
                onStatusChange(workout.id, 'Réalisé')
                onClose()
              }}
              className="bg-orange-600 hover:bg-orange-700 text-white"
            >
              ✅ Marquer comme réalisé
            </Button>
          )}
          <Button asChild variant="secondary" size="sm" className="flex-1">
            <Link href={`/workouts/${workout.id}/edit`}>
              ✏️ Modifier
            </Link>
          </Button>
        </div>
      </DialogContent>
    </Dialog>
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
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800">
      <WorkoutModal 
        workout={selectedWorkout} 
        isOpen={!!selectedWorkout} 
        onClose={() => setSelectedWorkout(null)}
        onStatusChange={changeWorkoutStatus}
      />
      
      <div className="bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-3xl font-bold">Mes Séances</h1>
              <p className="text-white/90">Organise et suis tes entraînements</p>
            </div>
            <Button asChild variant="outline">
              <Link href="/workouts/new" className="flex items-center space-x-2">
                <Plus className="h-5 w-5" />
                <span>Nouvelle séance</span>
              </Link>
            </Button>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Filtres */}
        <Card className="mb-6">
          <CardContent className="pt-6">
            <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex items-center space-x-2">
              <Filter className="h-5 w-5 text-gray-600 dark:text-safe-muted" />
              <span className="font-medium text-gray-700 dark:text-gray-300">Filtres :</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {[
                { value: 'all', label: 'Toutes', icon: '📋' },
                { value: 'pending', label: 'À venir', icon: '⏳' },
                { value: 'completed', label: 'Terminées', icon: '✅' }
              ].map(filter => (
                <Button
                  key={filter.value}
                  onClick={() => setFilterStatus(filter.value)}
                  variant={filterStatus === filter.value ? "default" : "secondary"}
                  size="sm"
                  className={filterStatus === filter.value ? "bg-orange-600 hover:bg-orange-700 text-white" : "border-orange-200 text-orange-700 hover:bg-orange-50"}
                >
                  {filter.icon} {filter.label}
                </Button>
              ))}
            </div>
            </div>
          </CardContent>
        </Card>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
            <p className="mt-4 text-gray-600 dark:text-safe-muted">Chargement de tes séances...</p>
          </div>
        ) : (
          <>
            <div className="mb-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900 dark:text-gray-100">
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
                  >
                    <Card 
                      className={`cursor-pointer border-l-4 hover:shadow-lg transition-all min-h-[200px] flex flex-col ${
                        isCompleted ? 'border-l-green-500' : 'border-l-orange-600'
                      }`}
                      onClick={() => setSelectedWorkout(workout)}
                      data-shadcn-card="true"
                    >
                      <CardContent className="p-6 flex flex-col h-full">
                      {/* Section titre - fixe */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className={`p-2 rounded-lg ${workoutType.color}`}>
                            <Icon className="h-5 w-5 text-white" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-gray-900 dark:text-gray-100 text-lg">{workout.name}</h3>
                            <p className="text-sm text-gray-600 dark:text-safe-muted">{workoutType.name}</p>
                          </div>
                        </div>
                      </div>

                      {/* Section détails - variable avec hauteur minimum */}
                      <div className="flex-1 flex flex-col justify-center space-y-2 mb-4">
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <Calendar className="h-4 w-4" />
                          <span>{new Date(workout.scheduled_date).toLocaleDateString('fr-FR')}</span>
                        </div>
                        {workout.start_time && (
                          <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                            <Clock className="h-4 w-4" />
                            <span>{workout.start_time}</span>
                          </div>
                        )}
                        <div className="flex items-center space-x-2 text-sm text-gray-600 dark:text-gray-300">
                          <Target className="h-4 w-4" />
                          <span>{workout.duration ? `${workout.duration} min` : 'Durée libre'}</span>
                        </div>
                      </div>

                      {/* Section actions - fixe en bas */}
                      <div className="flex items-center justify-between mt-auto">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isCompleted ? 'bg-green-100 text-green-800' : 'bg-blue-100 text-blue-800'
                        }`}>
                          {isCompleted ? '✅ Réalisé' : '⏳ Planifié'}
                        </span>

                        <div className="flex space-x-1">
                          <Button
                            onClick={(e) => {
                              e.stopPropagation();
                              setSelectedWorkout(workout);
                            }}
                            variant="ghost"
                            size="sm"
                            className="p-2 h-auto w-auto hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            title="Voir détails"
                            aria-label="Voir les détails de la séance"
                          >
                            <Eye className="h-6 w-6" />
                          </Button>
                          <Button
                            asChild
                            variant="ghost"
                            size="sm"
                            className="p-2 h-auto w-auto hover:bg-orange-50 dark:hover:bg-orange-900/20"
                            title="Modifier"
                            aria-label="Modifier la séance"
                          >
                            <Link
                              href={`/workouts/${workout.id}/edit`}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Edit className="h-6 w-6" />
                            </Link>
                          </Button>
                        </div>
                      </div>

                      {!isCompleted && (
                        <Button
                          onClick={(e) => {
                            e.stopPropagation();
                            changeWorkoutStatus(workout.id, 'Réalisé');
                          }}
                          className="w-full mt-4 bg-orange-600 hover:bg-orange-700 text-white"
                          size="sm"
                        >
                          ✅ Marquer comme réalisé
                        </Button>
                      )}
                      </CardContent>
                    </Card>
                  </motion.div>
                );
              })}
            </div>

            {workouts.length === 0 && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">🏋️</div>
                <h3 className="text-xl font-semibold text-gray-900 dark:text-gray-100 mb-2">Aucune séance trouvée</h3>
                <p className="text-gray-600 dark:text-safe-muted mb-6">Commence par créer ta première séance d'entraînement !</p>
                <Button asChild className="bg-gradient-to-r from-orange-600 to-red-500 hover:from-orange-700 hover:to-red-600">
                  <Link href="/workouts/new">
                    <Plus className="h-5 w-5" />
                    <span>Créer une séance</span>
                  </Link>
                </Button>
              </div>
            )}

            {/* Pagination */}
            {totalCount > PAGE_SIZE && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={page === 1}
                  variant={page === 1 ? "outline" : "default"}
                  className={page === 1 ? "" : "bg-orange-600 hover:bg-orange-700 text-white"}
                  aria-label="Page précédente"
                >
                  Précédent
                </Button>
                <span className="font-semibold text-gray-900 dark:text-gray-100">
                  Page {page} / {Math.max(1, Math.ceil(totalCount / PAGE_SIZE))}
                </span>
                <Button
                  onClick={() => setPage((p) => p + 1)}
                  disabled={page >= Math.ceil(totalCount / PAGE_SIZE)}
                  variant={page >= Math.ceil(totalCount / PAGE_SIZE) ? "outline" : "default"}
                  className={page >= Math.ceil(totalCount / PAGE_SIZE) ? "" : "bg-orange-600 hover:bg-orange-700 text-white"}
                  aria-label="Page suivante"
                >
                  Suivant
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  )
} 