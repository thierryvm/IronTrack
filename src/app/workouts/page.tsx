"use client"
import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { Plus, Eye, Edit, X as LucideX } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'

interface Workout {
  id: string
  name: string
  scheduled_date: string
  notes: string | null
  status?: string
}

const PAGE_SIZE = 10;

export default function WorkoutsPage() {
  const router = useRouter();
  const [workouts, setWorkouts] = useState<Workout[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  const loadWorkouts = useCallback(async () => {
    setLoading(true);
    const supabase = createClient();
    // Récupérer le nombre total de séances pour la pagination
    const { count } = await supabase
      .from('workouts')
      .select('*', { count: 'exact', head: true });
    setTotalCount(count || 0);
    // Charger uniquement les séances de la page courante
    const from = (page - 1) * PAGE_SIZE;
    const to = from + PAGE_SIZE - 1;
    const { data, error } = await supabase
      .from('workouts')
      .select('*')
      .order('scheduled_date', { ascending: false })
      .range(from, to);
    if (!error && data) {
      setWorkouts(data);
    }
    setLoading(false);
  }, [page]);

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
                {totalCount} séance{totalCount > 1 ? 's' : ''} trouvée{totalCount > 1 ? 's' : ''}
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
                      {/* Badge statut */}
                      {workout.status === 'Réalisé' && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-green-500 text-white flex items-center">✅ Réalisé</span>
                      )}
                      {workout.status === 'Planifié' && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-blue-500 text-white flex items-center">⏳ Planifiée</span>
                      )}
                      {workout.status === 'Annulé' && (
                        <span className="ml-2 px-2 py-1 text-xs font-semibold rounded bg-red-500 text-white flex items-center">
                          <LucideX className="h-4 w-4 mr-1 text-white" /> Annulée
                        </span>
                      )}
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
                    {/* Bouton marquer comme réalisé uniquement si pas déjà réalisé ou annulé */}
                    {workout.status !== 'Réalisé' && workout.status !== 'Annulé' && (
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
        {/* Pagination déplacée ici, sous le bloc principal */}
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