"use client"
import { useRouter, useParams } from 'next/navigation'
import { Dumbbell, ArrowLeft, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function ExerciseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [exercise, setExercise] = useState<any | null>(null)
  const [lastPerf, setLastPerf] = useState<any | null>(null)
  const [perfHistory, setPerfHistory] = useState<any[]>([])
  useEffect(() => {
    const fetchExercise = async () => {
      const supabase = (await import('@/lib/supabase')).createClient()
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group, equipment_id, difficulty, sets')
        .eq('id', id)
        .single()
      if (!error && data) {
        // Récupérer le nom de l'équipement
        let equipmentName = ''
        if (data.equipment_id) {
          const { data: eqData } = await supabase
            .from('equipment')
            .select('name')
            .eq('id', data.equipment_id)
            .single()
          equipmentName = eqData?.name || ''
        }
        setExercise({ ...data, equipment: equipmentName })
      }
    }
    if (id) fetchExercise()
  }, [id])

  useEffect(() => {
    const fetchPerfHistory = async () => {
      const supabase = (await import('@/lib/supabase')).createClient()
      const { data, error } = await supabase
        .from('performance_logs')
        .select('weight, reps, performed_at')
        .eq('exercise_id', id)
        .order('performed_at', { ascending: false })
      if (!error && data) {
        setPerfHistory(data)
        setLastPerf(data[0] || null)
      }
    }
    if (id) fetchPerfHistory()
  }, [id])

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg space-y-6"
      >
        <button
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-semibold mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>
        <div className="flex items-center space-x-3 mb-6">
          <Dumbbell className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{exercise ? exercise.name : 'Exercice'}</h1>
        </div>
        <div className="space-y-2">
          <div><span className="font-medium">Groupe musculaire :</span> {exercise ? exercise.muscle_group : ''}</div>
          <div><span className="font-medium">Équipement :</span> {exercise ? exercise.equipment : ''}</div>
          <div><span className="font-medium">Difficulté :</span> {exercise ? exercise.difficulty : ''}</div>
          <div><span className="font-medium">Nombre de séries :</span> {exercise && typeof exercise.sets !== 'undefined' ? exercise.sets : ''}</div>
        </div>
        {/* Dernière performance */}
        <div className="mt-6 bg-gray-50 rounded-lg p-4 flex items-center gap-3">
          <Trophy className="h-6 w-6 text-yellow-500" />
          {lastPerf ? (
            <span className="text-gray-800 text-base">Dernière performance : <span className="font-bold">{lastPerf.weight} kg x {lastPerf.reps} reps</span> <span className="text-gray-400">({new Date(lastPerf.performed_at).toLocaleDateString()})</span></span>
          ) : (
            <span className="text-gray-500 text-base">Aucune performance enregistrée.</span>
          )}
        </div>
        {/* Historique des performances */}
        <div className="mt-4 bg-gray-50 rounded-lg p-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-gray-800">Historique des performances</span>
          </div>
          {perfHistory.length === 0 ? (
            <div className="text-gray-500 text-sm">Aucune performance enregistrée.</div>
          ) : (
            <ul className="max-h-48 overflow-y-auto text-sm divide-y divide-gray-200">
              {perfHistory.map((perf, idx) => (
                <li key={idx} className="py-1 flex items-center justify-between">
                  <span className="font-semibold">{perf.weight} kg x {perf.reps} reps</span>
                  <span className="text-gray-400 ml-2">{new Date(perf.performed_at).toLocaleDateString()}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>
    </div>
  )
} 