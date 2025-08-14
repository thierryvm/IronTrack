'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Dumbbell, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface ExerciseEditFormProps {
  exerciseId: string
}

interface ExerciseData {
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment_id: number
  difficulty: number
  description?: string
  image_url?: string
  notes?: string
}

interface Equipment {
  id: number
  name: string
}

interface MuscleGroup {
  id: number
  name: string
}

export function ExerciseEditForm({ exerciseId }: ExerciseEditFormProps) {
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [equipment, setEquipment] = useState<Equipment[]>([])
  const [muscleGroups, setMuscleGroups] = useState<MuscleGroup[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  
  const supabase = createClient()
  const router = useRouter()

  useEffect(() => {
    loadData()
  }, [exerciseId])

  const loadData = async () => {
    try {
      setLoading(true)
      
      // Charger les données en parallèle
      const [exerciseRes, equipmentRes, muscleGroupsRes] = await Promise.all([
        supabase.from('exercises').select('*').eq('id', exerciseId).single(),
        supabase.from('equipment').select('*').order('name'),
        supabase.from('muscle_groups').select('*').order('name')
      ])

      if (exerciseRes.error) throw exerciseRes.error
      if (equipmentRes.error) throw equipmentRes.error
      if (muscleGroupsRes.error) throw muscleGroupsRes.error

      setExercise(exerciseRes.data)
      setEquipment(equipmentRes.data || [])
      setMuscleGroups(muscleGroupsRes.data || [])
    } catch (error: unknown) {
      console.error('Erreur chargement:', error)
      setMessage('Erreur lors du chargement de l\'exercice')
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (!exercise) return

    try {
      setSaving(true)
      setMessage('')

      const { error } = await supabase
        .from('exercises')
        .update({
          name: exercise.name,
          exercise_type: exercise.exercise_type,
          muscle_group: exercise.muscle_group,
          equipment_id: exercise.equipment_id,
          difficulty: exercise.difficulty,
          description: exercise.description,
          notes: exercise.notes
        })
        .eq('id', exerciseId)

      if (error) throw error

      setMessage('✅ Exercice modifié avec succès !')
      setIsSuccess(true)
      
      setTimeout(() => {
        router.push('/exercises')
      }, 2000)
    } catch (error: unknown) {
      console.error('Erreur sauvegarde:', error)
      setMessage('❌ Erreur lors de la sauvegarde')
      setIsSuccess(false)
    } finally {
      setSaving(false)
    }
  }

  const handleInputChange = (field: keyof ExerciseData, value: string | number | boolean) => {
    if (!exercise) return
    setExercise({ ...exercise, [field]: value })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4"></div>
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-6"></div>
              <div className="space-y-4">
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
                <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
        <div className="max-w-4xl mx-auto">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
            <div className="text-center py-8">
              <AlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                Exercice non trouvé
              </h2>
              <p className="text-gray-600 dark:text-gray-400 mb-6">
                L'exercice avec l'ID {exerciseId} n'existe pas ou n'est plus accessible.
              </p>
              <Link 
                href="/exercises"
                className="inline-flex items-center px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Retour aux exercices
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-8">
      <div className="max-w-4xl mx-auto">
        {/* En-tête */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <Link 
              href="/exercises"
              className="flex items-center px-3 py-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
            >
              <ArrowLeft className="w-4 h-4 mr-2" />
              Retour
            </Link>
            <div className="flex items-center space-x-2">
              <Dumbbell className="w-6 h-6 text-orange-600" />
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Modifier l'exercice
              </h1>
            </div>
          </div>
        </div>

        {/* Formulaire */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-md p-6">
          {message && (
            <div className={`mb-6 p-4 rounded-lg ${
              isSuccess 
                ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800' 
                : 'bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'
            }`}>
              <div className="flex items-center">
                {isSuccess ? (
                  <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                ) : (
                  <AlertCircle className="w-5 h-5 text-red-600 mr-2" />
                )}
                <p className={`text-sm ${
                  isSuccess ? 'text-green-800 dark:text-green-200' : 'text-red-800 dark:text-white/80'
                }`}>
                  {message}
                </p>
              </div>
            </div>
          )}

          <form onSubmit={(e) => { e.preventDefault(); handleSave(); }} className="space-y-6">
            {/* Nom */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Nom de l'exercice *
              </label>
              <input
                type="text"
                value={exercise.name}
                onChange={(e) => handleInputChange('name', e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                required
              />
            </div>

            {/* Type et groupe musculaire */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Type d'exercice *
                </label>
                <select
                  value={exercise.exercise_type}
                  onChange={(e) => handleInputChange('exercise_type', e.target.value as 'Musculation' | 'Cardio')}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="Musculation">Musculation</option>
                  <option value="Cardio">Cardio</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Groupe musculaire *
                </label>
                <select
                  value={exercise.muscle_group}
                  onChange={(e) => handleInputChange('muscle_group', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {muscleGroups.map((group) => (
                    <option key={group.id} value={group.name}>
                      {group.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Équipement et difficulté */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Équipement *
                </label>
                <select
                  value={exercise.equipment_id}
                  onChange={(e) => handleInputChange('equipment_id', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value="">Sélectionner...</option>
                  {equipment.map((item) => (
                    <option key={item.id} value={item.id}>
                      {item.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Difficulté (1-5) *
                </label>
                <select
                  value={exercise.difficulty}
                  onChange={(e) => handleInputChange('difficulty', parseInt(e.target.value))}
                  className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  required
                >
                  <option value={1}>1 - Très facile</option>
                  <option value={2}>2 - Facile</option>
                  <option value={3}>3 - Moyen</option>
                  <option value={4}>4 - Difficile</option>
                  <option value={5}>5 - Très difficile</option>
                </select>
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Description
              </label>
              <textarea
                value={exercise.description || ''}
                onChange={(e) => handleInputChange('description', e.target.value)}
                rows={4}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Description de l'exercice..."
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Notes personnelles
              </label>
              <textarea
                value={exercise.notes || ''}
                onChange={(e) => handleInputChange('notes', e.target.value)}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                placeholder="Vos notes sur cet exercice..."
              />
            </div>

            {/* Boutons */}
            <div className="flex items-center justify-end space-x-4 pt-6">
              <Link
                href="/exercises"
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
              >
                Annuler
              </Link>
              <button
                type="submit"
                disabled={saving}
                className="inline-flex items-center px-6 py-3 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 transition-colors"
              >
                {saving ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin mr-2" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-4 h-4 mr-2" />
                    Sauvegarder
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  )
}