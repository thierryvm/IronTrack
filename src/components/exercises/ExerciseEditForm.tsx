import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'

interface ExerciseEditFormProps {
  exerciseId: string
}

interface ExerciseData {
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment_id: number
  difficulty: 'Débutant' | 'Intermédiaire' | 'Avancé'
  description?: string
  sets?: number
  duration_minutes?: number
  duration_seconds?: number
  distance?: number
  distance_unit?: string
  speed?: number
  speed_unit?: string
  calories?: number
}

export const ExerciseEditForm: React.FC<ExerciseEditFormProps> = ({ exerciseId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [equipmentOptions, setEquipmentOptions] = useState<{id: number, name: string}[]>([])

  useEffect(() => {
    const fetchData = async () => {
      try {
        const supabase = createClient()
        
        // Récupérer l'exercice
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', exerciseId)
          .single()

        if (exerciseError) throw exerciseError

        // Récupérer les équipements
        const { data: equipmentData, error: equipmentError } = await supabase
          .from('equipment')
          .select('id, name')
          .order('name')

        if (equipmentError) throw equipmentError

        // Convertir en format ExerciseData
        const formattedExercise: ExerciseData = {
          name: exerciseData.name || '',
          exercise_type: exerciseData.exercise_type || 'Musculation',
          muscle_group: exerciseData.muscle_group || '',
          equipment_id: exerciseData.equipment_id || 1,
          difficulty: exerciseData.difficulty || 'Débutant',
          description: exerciseData.description || '',
          sets: exerciseData.sets || undefined,
          duration_minutes: exerciseData.duration_minutes || undefined,
          duration_seconds: exerciseData.duration_seconds || undefined,
          distance: exerciseData.distance || undefined,
          distance_unit: exerciseData.distance_unit || undefined,
          speed: exerciseData.speed || undefined,
          speed_unit: exerciseData.speed_unit || undefined,
          calories: exerciseData.calories || undefined
        }
        
        setExercise(formattedExercise)
        setEquipmentOptions(equipmentData || [])
      } catch (error) {
        console.error('Erreur:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [exerciseId])

  const handleSave = async () => {
    if (!exercise) return

    setSaving(true)
    try {
      const supabase = createClient()
      
      const { error } = await supabase
        .from('exercises')
        .update({
          name: exercise.name,
          exercise_type: exercise.exercise_type,
          muscle_group: exercise.muscle_group,
          equipment_id: exercise.equipment_id,
          difficulty: exercise.difficulty,
          description: exercise.description,
          sets: exercise.sets,
          duration_minutes: exercise.duration_minutes,
          duration_seconds: exercise.duration_seconds,
          distance: exercise.distance,
          distance_unit: exercise.distance_unit,
          speed: exercise.speed,
          speed_unit: exercise.speed_unit,
          calories: exercise.calories
        })
        .eq('id', exerciseId)

      if (error) throw error

      toast.success('Exercice modifié avec succès !')
      router.push(`/exercises/${exerciseId}`)
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/exercises/${exerciseId}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500"></div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">Exercice non trouvé</p>
          <button onClick={handleCancel} className="btn-primary">
            Retour
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="sticky top-0 z-10 bg-white border-b border-gray-200 px-4 py-3">
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-3">
            <button
              onClick={handleCancel}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
            >
              <ArrowLeft className="w-5 h-5 text-gray-500" />
            </button>
            <h1 className="text-lg font-semibold text-gray-900">
              Modifier l'exercice
            </h1>
          </div>
          <button
            onClick={handleCancel}
            className="p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
      </div>

      <div className="py-8 px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-2xl mx-auto bg-white rounded-xl shadow-lg p-6"
        >
          <div className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nom de l'exercice
              </label>
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => setExercise({...exercise, name: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Ex: Développé couché"
              />
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type d'exercice
              </label>
              <select
                value={exercise.exercise_type}
                onChange={(e) => setExercise({...exercise, exercise_type: e.target.value as 'Musculation' | 'Cardio'})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="Musculation">Musculation</option>
                <option value="Cardio">Cardio</option>
              </select>
            </div>

            {/* Groupe musculaire */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Groupe musculaire
              </label>
              <select
                value={exercise.muscle_group}
                onChange={(e) => setExercise({...exercise, muscle_group: e.target.value})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="Pectoraux">Pectoraux</option>
                <option value="Dos">Dos</option>
                <option value="Épaules">Épaules</option>
                <option value="Biceps">Biceps</option>
                <option value="Triceps">Triceps</option>
                <option value="Jambes">Jambes</option>
                <option value="Abdominaux">Abdominaux</option>
                <option value="Fessiers">Fessiers</option>
                <option value="Cardio">Cardio</option>
              </select>
            </div>

            {/* Équipement */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Équipement
              </label>
              <select
                value={exercise.equipment_id}
                onChange={(e) => setExercise({...exercise, equipment_id: Number(e.target.value)})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                {equipmentOptions.map(eq => (
                  <option key={eq.id} value={eq.id}>{eq.name}</option>
                ))}
              </select>
            </div>

            {/* Difficulté */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Difficulté
              </label>
              <select
                value={exercise.difficulty}
                onChange={(e) => setExercise({...exercise, difficulty: e.target.value as 'Débutant' | 'Intermédiaire' | 'Avancé'})}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
              >
                <option value="Débutant">Débutant</option>
                <option value="Intermédiaire">Intermédiaire</option>
                <option value="Avancé">Avancé</option>
              </select>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description (optionnel)
              </label>
              <textarea
                value={exercise.description || ''}
                onChange={(e) => setExercise({...exercise, description: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Description de l'exercice..."
              />
            </div>

            {/* Champs spécifiques selon le type */}
            {exercise.exercise_type === 'Musculation' && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Nombre de séries recommandées
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={exercise.sets || ''}
                  onChange={(e) => setExercise({...exercise, sets: Number(e.target.value)})}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                  placeholder="Ex: 3"
                />
              </div>
            )}

            {exercise.exercise_type === 'Cardio' && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance recommandée
                    </label>
                    <input
                      type="number"
                      step="0.1"
                      value={exercise.distance || ''}
                      onChange={(e) => setExercise({...exercise, distance: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 5"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Unité
                    </label>
                    <select
                      value={exercise.distance_unit || 'km'}
                      onChange={(e) => setExercise({...exercise, distance_unit: e.target.value})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                    >
                      <option value="km">km</option>
                      <option value="m">m</option>
                      <option value="miles">miles</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-4 mt-8">
            <button
              onClick={handleCancel}
              className="flex-1 bg-gray-200 text-gray-700 py-3 px-6 rounded-lg font-semibold hover:bg-gray-300 transition-colors"
            >
              Annuler
            </button>
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-500 text-white py-3 px-6 rounded-lg font-semibold hover:bg-orange-600 transition-colors flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
              <Save className="w-5 h-5" />
            </button>
          </div>
        </motion.div>
      </div>
    </div>
  )
}