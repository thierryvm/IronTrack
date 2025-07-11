"use client"
import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Dumbbell, Save, Clock, Target } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers'
]
const difficulties = ['Débutant', 'Intermédiaire', 'Avancé']
const exerciseTypes = [
  { value: 'Musculation', label: 'Musculation', icon: Dumbbell, color: 'text-orange-500' },
  { value: 'Cardio', label: 'Cardio', icon: Clock, color: 'text-blue-500' }
]

export default function NewExercisePage() {
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState(muscleGroups[0])
  const [exerciseType, setExerciseType] = useState('Musculation')
  const [equipmentId, setEquipmentId] = useState<number | null>(null)
  const [equipmentList, setEquipmentList] = useState<{id: number, name: string}[]>([])
  const [difficulty, setDifficulty] = useState(difficulties[0])
  const [loading, setLoading] = useState(false)
  const [newEquipment, setNewEquipment] = useState('')
  const [addingEquipment, setAddingEquipment] = useState(false)
  const [newEquipmentDescription, setNewEquipmentDescription] = useState('')
  
  // Champs pour Musculation
  const [firstWeight, setFirstWeight] = useState('')
  const [firstReps, setFirstReps] = useState('')
  const [sets, setSets] = useState(3)
  
  // Champs pour Cardio
  const [distance, setDistance] = useState('')
  const [distanceUnit, setDistanceUnit] = useState('km')
  const [speed, setSpeed] = useState('')
  const [speedUnit, setSpeedUnit] = useState('km/h')
  const [calories, setCalories] = useState('')
  
  // Champs communs
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  
  const router = useRouter()

  useEffect(() => {
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('equipment').select('id, name')
      if (!error && data) setEquipmentList(data)
    }
    fetchEquipment()
  }, [])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      alert("Utilisateur non connecté !")
      setLoading(false)
      return
    }
    
    // Préparer les données selon le type d'exercice
    const exerciseData: any = {
      user_id: user.id,
      name,
      muscle_group: muscle,
      exercise_type: exerciseType,
      equipment_id: equipmentId,
      difficulty,
      sets: exerciseType === 'Musculation' ? sets : null,
      duration_minutes: minutes ? Number(minutes) : null,
      duration_seconds: seconds ? Number(seconds) : null
    }
    
    // Ajouter les champs spécifiques au cardio
    if (exerciseType === 'Cardio') {
      exerciseData.distance = distance ? Number(distance) : null
      exerciseData.distance_unit = distanceUnit
      exerciseData.speed = speed ? Number(speed) : null
      exerciseData.speed_unit = speedUnit
      exerciseData.calories = calories ? Number(calories) : null
    }
    
    const { data: exerciseResult, error } = await supabase.from('exercises').insert(exerciseData).select('id').single()
    if (error || !exerciseResult) {
      setLoading(false)
      alert("Erreur lors de l'enregistrement : " + (error?.message || ''))
      return
    }
    
    // Ajouter la première performance si renseignée
    if (exerciseType === 'Musculation' && firstReps) {
      await supabase.from('performance_logs').insert({
        user_id: user.id,
        exercise_id: exerciseResult.id,
        reps: Number(firstReps),
        weight: firstWeight ? Number(firstWeight) : 0,
        performed_at: new Date().toISOString()
      })
    }
    
    setLoading(false)
    router.push('/exercises')
  }

  const handleAddEquipment = async () => {
    if (!newEquipment.trim()) return
    setAddingEquipment(true)
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      alert("Utilisateur non connecté !")
      setAddingEquipment(false)
      return
    }
    const description = newEquipmentDescription.trim() || `Équipement ajouté par l'utilisateur`
    const { data, error } = await supabase.from('equipment').insert({ name: newEquipment.trim(), description, user_id: user.id }).select('id, name, description').single()
    setAddingEquipment(false)
    if (!error && data) {
      setEquipmentList(prev => [...prev, data])
      setEquipmentId(data.id)
      setNewEquipment('')
      setNewEquipmentDescription('')
    } else {
      alert("Erreur lors de l'ajout de l'équipement : " + (error?.message || ''))
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-start justify-center p-4 overflow-auto max-h-screen">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg sm:max-w-3xl sm:w-[98%] lg:max-w-2xl mx-auto space-y-6 relative"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Dumbbell className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Nouvel exercice</h1>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nom de l&apos;exercice</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Type d&apos;exercice</label>
          <div className="grid grid-cols-2 gap-3">
            {exerciseTypes.map(type => {
              const Icon = type.icon
              return (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setExerciseType(type.value)}
                  className={`flex items-center justify-center space-x-2 p-4 rounded-lg border-2 transition-all ${
                    exerciseType === type.value
                      ? 'border-orange-500 bg-orange-50 text-orange-700'
                      : 'border-gray-300 bg-white text-gray-600 hover:border-gray-400'
                  }`}
                >
                  <Icon className={`h-5 w-5 ${type.color}`} />
                  <span className="font-medium">{type.label}</span>
                </button>
              )
            })}
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Groupe musculaire</label>
          <select value={muscle} onChange={e => setMuscle(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500">
            {muscleGroups.map(g => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Équipement</label>
          <select value={equipmentId ?? ''} onChange={e => setEquipmentId(Number(e.target.value))} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500">
            <option value="">Sélectionne un équipement</option>
            {equipmentList.map(eq => <option key={eq.id} value={eq.id}>{eq.name}</option>)}
          </select>
          <div className="flex mt-2 gap-2 w-full">
            <input
              type="text"
              value={newEquipment}
              onChange={e => setNewEquipment(e.target.value)}
              placeholder="Nouvel équipement"
              className="min-w-0 w-1/3 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="text"
              value={newEquipmentDescription}
              onChange={e => setNewEquipmentDescription(e.target.value)}
              placeholder="Description (optionnelle)"
              className="min-w-0 w-1/2 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
            />
            <button
              type="button"
              onClick={handleAddEquipment}
              disabled={addingEquipment || !newEquipment.trim()}
              className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg font-semibold disabled:opacity-50 w-[100px] whitespace-nowrap"
            >
              {addingEquipment ? 'Ajout…' : 'Ajouter'}
            </button>
          </div>
        </div>
        
        <div>
          <label className="block text-gray-700 font-medium mb-2">Difficulté</label>
          <select value={difficulty} onChange={e => setDifficulty(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500">
            {difficulties.map(d => <option key={d} value={d}>{d}</option>)}
          </select>
        </div>
        
        {/* Champs spécifiques à la Musculation */}
        {exerciseType === 'Musculation' && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Première performance (optionnel)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.5"
                  value={firstWeight}
                  onChange={e => setFirstWeight(e.target.value)}
                  placeholder="Poids (kg)"
                  className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                />
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={firstReps}
                  onChange={e => setFirstReps(e.target.value)}
                  placeholder="Répétitions"
                  className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                />
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre de séries</label>
              <input
                type="number"
                min="1"
                step="1"
                value={sets}
                onChange={e => setSets(Number(e.target.value))}
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </>
        )}
        
        {/* Champs spécifiques au Cardio */}
        {exerciseType === 'Cardio' && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Distance (optionnel)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={distance}
                  onChange={e => setDistance(e.target.value)}
                  placeholder="Distance"
                  className="w-2/3 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={distanceUnit}
                  onChange={e => setDistanceUnit(e.target.value)}
                  className="w-1/3 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="km">km</option>
                  <option value="m">m</option>
                  <option value="miles">miles</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Vitesse (optionnel)</label>
              <div className="flex gap-2">
                <input
                  type="number"
                  min="0"
                  step="0.1"
                  value={speed}
                  onChange={e => setSpeed(e.target.value)}
                  placeholder="Vitesse"
                  className="w-2/3 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                />
                <select
                  value={speedUnit}
                  onChange={e => setSpeedUnit(e.target.value)}
                  className="w-1/3 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
                >
                  <option value="km/h">km/h</option>
                  <option value="m/s">m/s</option>
                  <option value="mph">mph</option>
                </select>
              </div>
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Calories (optionnel)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="Calories"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </>
        )}
        
        {/* Champs communs */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Temps d&apos;exécution (optionnel)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="Minutes"
              className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="0"
              max="59"
              value={seconds}
              onChange={e => setSeconds(e.target.value)}
              placeholder="Secondes"
              className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        
        <div className="max-sm:sticky max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:bg-white max-sm:pt-2 max-sm:z-20 max-sm:shadow-[0_-2px_12px_0_rgba(0,0,0,0.07)] space-y-2">
          <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Save className="h-5 w-5 mr-2" />
            <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
          </button>
          <button
            type="button"
            onClick={() => router.push('/exercises')}
            className="w-full bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
          >
            <span>Annuler</span>
          </button>
        </div>
      </motion.form>
    </div>
  )
} 