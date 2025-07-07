"use client"
import { useRouter, useParams } from 'next/navigation'
import { Calendar, ArrowLeft } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase'

export default function WorkoutDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [workout, setWorkout] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchWorkout = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) setWorkout(data)
      setLoading(false)
    }
    if (id) fetchWorkout()
  }, [id])

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>
  }
  if (!workout) {
    return <div className="min-h-screen flex items-center justify-center text-red-500">Séance introuvable.</div>
  }

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
          <Calendar className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">{workout.name}</h1>
        </div>
        <div className="space-y-2">
          <div><span className="font-medium">Date :</span> {new Date(workout.scheduled_date).toLocaleDateString('fr-FR')}</div>
          <div><span className="font-medium">Notes :</span> {workout.notes}</div>
        </div>
      </motion.div>
    </div>
  )
} 