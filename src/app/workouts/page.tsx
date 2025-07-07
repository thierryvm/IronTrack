"use client"
import { useEffect, useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit } from 'lucide-react'
import { createClient } from '@/lib/supabase'

interface Workout {
  id: string
  name: string
  scheduled_date: string
  notes: string | null
  status?: string
}

export default function WorkoutsPage() {
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    loadWorkouts()
  }, [])

  const loadWorkouts = async () => {
    setLoading(true)
    const supabase = createClient()
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('scheduled_date', { ascending: false })
    if (!error && data) {
      setWorkouts(data)
    }
    setLoading(false)
  }

  // Fonction pour marquer une séance comme réalisée
  const markAsDone = async (workoutId: string) => {
    const supabase = createClient();
    await supabase
      .from('workouts')
      .update({ status: 'Réalisé' })
      .eq('id', workoutId);
    loadWorkouts();
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold">Séances</h1>
            <p className="text-orange-100">Retrouve toutes tes séances de musculation</p>
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
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {loading ? (
          <div className="text-center text-gray-500">Chargement...</div>
        ) : (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white rounded-xl shadow-md overflow-hidden"
          >
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">
                {workouts.length} séance{workouts.length > 1 ? 's' : ''} trouvée{workouts.length > 1 ? 's' : ''}
              </h2>
            </div>
            <div className="divide-y divide-gray-200">
              {workouts.map((workout, index) => (
                <motion.div
                  key={workout.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="p-6 hover:bg-gray-50 transition-colors flex items-center justify-between"
                >
                  <div>
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">{workout.name}</h3>
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                        {new Date(workout.scheduled_date).toLocaleDateString('fr-FR')}
                      </span>
                    </div>
                    <div className="text-sm text-gray-600">{workout.notes}</div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Link
                      href={`/workouts/${workout.id}`}
                      className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                      title="Voir détails"
                    >
                      <Eye className="h-5 w-5" />
                    </Link>
                    <Link
                      href={`/workouts/${workout.id}/edit`}
                      className="p-2 text-gray-400 hover:text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                      title="Modifier"
                    >
                      <Edit className="h-5 w-5" />
                    </Link>
                    {workout.status !== 'Réalisé' && (
                      <button
                        onClick={() => markAsDone(workout.id)}
                        className="p-2 text-white bg-green-500 hover:bg-green-600 rounded-lg font-semibold text-xs transition-colors"
                        title="Marquer comme réalisé"
                      >
                        ✅ Réalisé
                      </button>
                    )}
                  </div>
                </motion.div>
              ))}
              {workouts.length === 0 && (
                <div className="p-12 text-center text-gray-500">Aucune séance trouvée.</div>
              )}
            </div>
          </motion.div>
        )}
      </div>
    </div>
  )
} 