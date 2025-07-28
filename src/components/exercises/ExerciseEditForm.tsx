import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { SecureAttachment } from '@/utils/fileUpload'

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
  image_url?: string
  // Métriques musculation
  weight?: number
  reps?: number
  sets?: number
  rest_time?: number
  // Métriques cardio
  duration_minutes?: number
  duration_seconds?: number
  distance?: number
  distance_unit?: string
  speed?: number
  speed_unit?: string
  calories?: number
  notes?: string // Notes from latest performance
}

export const ExerciseEditForm: React.FC<ExerciseEditFormProps> = ({ exerciseId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [equipmentOptions, setEquipmentOptions] = useState<{id: number, name: string}[]>([])
  const [exercisePhoto, setExercisePhoto] = useState<SecureAttachment | null>(null)
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined)

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

        // Récupérer les notes de la dernière performance
        const { data: latestPerformance } = await supabase
          .from('performance_logs')
          .select('notes')
          .eq('exercise_id', exerciseId)
          .order('performed_at', { ascending: false })
          .limit(1)
          .single()

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
          image_url: exerciseData.image_url || undefined,
          sets: exerciseData.sets || undefined,
          duration_minutes: exerciseData.duration_minutes || undefined,
          duration_seconds: exerciseData.duration_seconds || undefined,
          distance: exerciseData.distance || undefined,
          distance_unit: exerciseData.distance_unit || undefined,
          speed: exerciseData.speed || undefined,
          speed_unit: exerciseData.speed_unit || undefined,
          calories: exerciseData.calories || undefined,
          notes: latestPerformance?.notes || '' // Notes from latest performance
        }
        
        setExercise(formattedExercise)
        setEquipmentOptions(equipmentData || [])
        setCurrentPhotoUrl(formattedExercise.image_url)
      } catch (error) {
        console.error('Erreur:', error)
        toast.error('Erreur lors du chargement')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [exerciseId])

  const handlePhotoUploaded = (attachment: SecureAttachment) => {
    setExercisePhoto(attachment)
    setCurrentPhotoUrl(attachment.url)
    if (exercise) {
      setExercise(prev => prev ? { ...prev, image_url: attachment.url } : null)
    }
  }

  const handlePhotoRemoved = () => {
    setExercisePhoto(null)
    setCurrentPhotoUrl(undefined)
    if (exercise) {
      setExercise(prev => prev ? { ...prev, image_url: undefined } : null)
    }
  }

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
          image_url: exercise.image_url || null,
          // Métriques musculation
          weight: exercise.weight || null,
          reps: exercise.reps || null,
          sets: exercise.sets || null,
          rest_time: exercise.rest_time || null,
          // Métriques cardio
          duration_minutes: exercise.duration_minutes || null,
          duration_seconds: exercise.duration_seconds || null,
          distance: exercise.distance || null,
          distance_unit: exercise.distance_unit || null,
          speed: exercise.speed || null,
          speed_unit: exercise.speed_unit || null,
          calories: exercise.calories || null
        })
        .eq('id', exerciseId)

      if (error) throw error

      toast.success('Exercice modifié avec succès !')
      router.push('/exercises')
    } catch (error) {
      console.error('Erreur:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push('/exercises')
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

            {/* Photo de l'exercice */}
            <div>
              <ExercisePhotoUpload
                onPhotoUploaded={handlePhotoUploaded}
                onPhotoRemoved={handlePhotoRemoved}
                currentPhoto={currentPhotoUrl}
                disabled={saving}
              />
            </div>

            {/* Notes */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Notes (de la dernière performance)
              </label>
              <textarea
                value={exercise.notes || ''}
                onChange={(e) => setExercise({...exercise, notes: e.target.value})}
                rows={3}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                placeholder="Notes ajoutées lors de la création..."
                readOnly
              />
              <p className="text-sm text-gray-500 mt-1">
                Ces notes proviennent de votre dernière performance. Pour les modifier, utilisez le formulaire de modification de performance.
              </p>
            </div>

            {/* Champs spécifiques selon le type */}
            {exercise.exercise_type === 'Musculation' && (
              <div className="space-y-4">
                <h4 className="text-lg font-medium text-gray-900 border-b pb-2">Valeurs recommandées par défaut</h4>
                
                {/* Métriques de base musculation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Poids recommandé (kg)
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="0.5"
                      value={exercise.weight || ''}
                      onChange={(e) => setExercise({...exercise, weight: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 20"
                    />
                    <p className="text-xs text-gray-500 mt-1">Poids de départ suggéré</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Répétitions recommandées
                    </label>
                    <input
                      type="number"
                      min="1"
                      max="50"
                      value={exercise.reps || ''}
                      onChange={(e) => setExercise({...exercise, reps: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 10"
                    />
                    <p className="text-xs text-gray-500 mt-1">Nombre de répétitions par série</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
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
                    <p className="text-xs text-gray-500 mt-1">Nombre de séries à effectuer</p>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Temps de repos recommandé (min)
                    </label>
                    <input
                      type="number"
                      min="0.5"
                      max="10"
                      step="0.5"
                      value={exercise.rest_time || ''}
                      onChange={(e) => setExercise({...exercise, rest_time: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="Ex: 2"
                    />
                    <p className="text-xs text-gray-500 mt-1">Repos entre les séries</p>
                  </div>
                </div>

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note :</strong> Ces valeurs sont des recommandations par défaut pour cet exercice. 
                    Les utilisateurs pourront ajuster selon leur niveau lors de chaque séance.
                  </p>
                </div>
              </div>
            )}

            {exercise.exercise_type === 'Cardio' && (
              <div className="space-y-4">
                {/* Métriques de base pour tous les cardio */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Distance recommandée {exercise.name.toLowerCase().includes('rameur') ? '(mètres)' : '(km)'}
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="number"
                        step={exercise.name.toLowerCase().includes('rameur') ? "50" : "0.1"}
                        value={exercise.distance || ''}
                        onChange={(e) => setExercise({...exercise, distance: Number(e.target.value)})}
                        className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                        placeholder={exercise.name.toLowerCase().includes('rameur') ? "2000" : "5.0"}
                      />
                      <select
                        value={exercise.distance_unit || (exercise.name.toLowerCase().includes('rameur') ? 'meters' : 'km')}
                        onChange={(e) => setExercise({...exercise, distance_unit: e.target.value})}
                        className="w-20 sm:w-24 px-2 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 text-sm"
                      >
                        <option value="km">km</option>
                        <option value="meters">m</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Durée recommandée (min)
                    </label>
                    <input
                      type="number"
                      min="1"
                      value={exercise.duration_minutes || ''}
                      onChange={(e) => setExercise({...exercise, duration_minutes: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="30"
                    />
                  </div>
                </div>

                {/* Métriques spécifiques selon l'équipement */}
                {exercise.name.toLowerCase().includes('rameur') && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Métriques spécifiques rameur</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cadence recommandée (SPM)
                        </label>
                        <input
                          type="number"
                          min="16"
                          max="36"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="24"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Valeur suggérée: 20-28 SPM</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Puissance recommandée (W)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="500"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="150"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Valeur suggérée: 100-200W</p>
                      </div>
                    </div>
                  </div>
                )}

                {(exercise.name.toLowerCase().includes('course') || exercise.name.toLowerCase().includes('tapis')) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Métriques spécifiques course</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Vitesse recommandée (km/h)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          value={exercise.speed || ''}
                          onChange={(e) => setExercise({...exercise, speed: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="10.0"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Inclinaison recommandée (%)
                        </label>
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          max="15"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="2.0"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Valeur suggérée: 1-5%</p>
                      </div>
                    </div>
                  </div>
                )}

                {exercise.name.toLowerCase().includes('vélo') && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Métriques spécifiques vélo</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Cadence recommandée (RPM)
                        </label>
                        <input
                          type="number"
                          min="50"
                          max="120"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="80"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Valeur suggérée: 70-90 RPM</p>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Résistance recommandée
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="20"
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="8"
                          disabled
                        />
                        <p className="text-xs text-gray-500 mt-1">Valeur suggérée: 5-12</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Calories recommandées
                    </label>
                    <input
                      type="number"
                      min="0"
                      value={exercise.calories || ''}
                      onChange={(e) => setExercise({...exercise, calories: Number(e.target.value)})}
                      className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                      placeholder="300"
                    />
                  </div>
                </div>

                {/* Section répétitions/séries pour certains cardio */}
                {(exercise.name.toLowerCase().includes('burpees') || 
                  exercise.name.toLowerCase().includes('jumping') ||
                  exercise.name.toLowerCase().includes('squat') ||
                  exercise.name.toLowerCase().includes('pompe') ||
                  exercise.name.toLowerCase().includes('hiit') ||
                  exercise.name.toLowerCase().includes('tabata')) && (
                  <div className="border-t pt-4">
                    <h4 className="text-sm font-medium text-gray-700 mb-3">Exercice avec répétitions</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                          Répétitions recommandées
                        </label>
                        <input
                          type="number"
                          min="1"
                          max="100"
                          value={exercise.reps || ''}
                          onChange={(e) => setExercise({...exercise, reps: Number(e.target.value)})}
                          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500"
                          placeholder="20"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nombre de répétitions par série</p>
                      </div>
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
                          placeholder="3"
                        />
                        <p className="text-xs text-gray-500 mt-1">Nombre de séries à effectuer</p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
                  <p className="text-sm text-blue-700">
                    <strong>Note :</strong> Ces valeurs sont des recommandations par défaut. 
                    Les utilisateurs pourront saisir leurs propres métriques lors de chaque performance.
                  </p>
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