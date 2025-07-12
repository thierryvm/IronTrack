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

// Table d’exercices standards par groupe musculaire
const standardExercises: Record<string, Array<{name: string, label: string, type: string, equipment: string, difficulty: string, suggestions: Array<{label: string, values: Record<string, any>}>}>> = {
  'Pectoraux': [
    {
      name: 'Développé couché', label: 'Développé couché', type: 'Musculation', equipment: 'Barre + banc', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '8 reps à 40kg (débutant)', values: { firstReps: '8', firstWeight: '40', sets: 3 } },
        { label: '10 reps à 60kg (intermédiaire)', values: { firstReps: '10', firstWeight: '60', sets: 4 } },
        { label: '12 reps à 80kg (avancé)', values: { firstReps: '12', firstWeight: '80', sets: 4 } },
      ]
    },
    {
      name: 'Pompes', label: 'Pompes', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps (débutant)', values: { firstReps: '15', sets: 3 } },
        { label: '30 reps (intermédiaire)', values: { firstReps: '30', sets: 4 } },
        { label: '50 reps (IronBuddy)', values: { firstReps: '50', sets: 5 } },
      ]
    },
    {
      name: 'Développé incliné', label: 'Développé incliné', type: 'Musculation', equipment: 'Barre + banc', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 30kg', values: { firstReps: '10', firstWeight: '30', sets: 3 } },
      ]
    },
  ],
  'Dos': [
    {
      name: 'Tractions', label: 'Tractions', type: 'Musculation', equipment: 'Barre de traction', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '5 reps (débutant)', values: { firstReps: '5', sets: 3 } },
        { label: '10 reps (intermédiaire)', values: { firstReps: '10', sets: 4 } },
        { label: '10 reps lestées (avancé)', values: { firstReps: '10', firstWeight: '10', sets: 4 } },
      ]
    },
    {
      name: 'Rowing barre', label: 'Rowing barre', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 40kg', values: { firstReps: '10', firstWeight: '40', sets: 3 } },
        { label: '12 reps à 60kg', values: { firstReps: '12', firstWeight: '60', sets: 4 } },
      ]
    },
    {
      name: 'Tirage horizontal', label: 'Tirage horizontal', type: 'Musculation', equipment: 'Machine', difficulty: 'Débutant',
      suggestions: [
        { label: '12 reps à 30kg', values: { firstReps: '12', firstWeight: '30', sets: 3 } },
      ]
    },
  ],
  'Jambes': [
    {
      name: 'Squat', label: 'Squat', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 40kg (débutant)', values: { firstReps: '10', firstWeight: '40', sets: 3 } },
        { label: '12 reps à 80kg (intermédiaire)', values: { firstReps: '12', firstWeight: '80', sets: 4 } },
        { label: '10 reps à 120kg (avancé)', values: { firstReps: '10', firstWeight: '120', sets: 4 } },
      ]
    },
    {
      name: 'Presse à jambes', label: 'Presse à jambes', type: 'Musculation', equipment: 'Machine', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps à 60kg', values: { firstReps: '15', firstWeight: '60', sets: 3 } },
      ]
    },
    {
      name: 'Fentes', label: 'Fentes', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '10 reps/jambe', values: { firstReps: '10', sets: 3 } },
      ]
    },
  ],
  'Épaules': [
    {
      name: 'Développé militaire', label: 'Développé militaire', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '10 reps à 20kg', values: { firstReps: '10', firstWeight: '20', sets: 3 } },
        { label: '12 reps à 40kg', values: { firstReps: '12', firstWeight: '40', sets: 4 } },
      ]
    },
    {
      name: 'Élévations latérales', label: 'Élévations latérales', type: 'Musculation', equipment: 'Haltères', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps à 6kg', values: { firstReps: '15', firstWeight: '6', sets: 3 } },
      ]
    },
  ],
  'Biceps': [
    {
      name: 'Curl haltère', label: 'Curl haltère', type: 'Musculation', equipment: 'Haltères', difficulty: 'Débutant',
      suggestions: [
        { label: '12 reps à 8kg', values: { firstReps: '12', firstWeight: '8', sets: 3 } },
        { label: '10 reps à 12kg', values: { firstReps: '10', firstWeight: '12', sets: 4 } },
      ]
    },
  ],
  'Triceps': [
    {
      name: 'Dips', label: 'Dips', type: 'Musculation', equipment: 'Barre de traction', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '8 reps (débutant)', values: { firstReps: '8', sets: 3 } },
        { label: '12 reps lestées', values: { firstReps: '12', firstWeight: '10', sets: 4 } },
      ]
    },
    {
      name: 'Extensions poulie', label: 'Extensions poulie', type: 'Musculation', equipment: 'Machine', difficulty: 'Débutant',
      suggestions: [
        { label: '15 reps à 20kg', values: { firstReps: '15', firstWeight: '20', sets: 3 } },
      ]
    },
  ],
  'Abdominaux': [
    {
      name: 'Crunchs', label: 'Crunchs', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '20 reps', values: { firstReps: '20', sets: 3 } },
      ]
    },
    {
      name: 'Gainage', label: 'Gainage', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '3x30s', values: { firstReps: '30', sets: 3 } },
      ]
    },
  ],
  'Fessiers': [
    {
      name: 'Hip Thrust', label: 'Hip Thrust', type: 'Musculation', equipment: 'Barre libre', difficulty: 'Intermédiaire',
      suggestions: [
        { label: '12 reps à 40kg', values: { firstReps: '12', firstWeight: '40', sets: 3 } },
        { label: '15 reps à 70kg', values: { firstReps: '15', firstWeight: '70', sets: 4 } },
      ]
    },
    {
      name: 'Glute kickback', label: 'Glute kickback', type: 'Musculation', equipment: 'Poids du corps', difficulty: 'Débutant',
      suggestions: [
        { label: '20 reps/jambe', values: { firstReps: '20', sets: 3 } },
      ]
    },
  ],
};

// Ajout de la fonction de suggestions dynamiques
function getExerciseSuggestions(type: string, muscle: string, name: string): Array<{label: string, values: Record<string, any>}> {
  // Table de correspondance nom -> groupe musculaire
  const muscleMap: Record<string, string> = {
    'pompe': 'Pectoraux',
    'traction': 'Dos',
    'squat': 'Jambes',
    'course': 'Jambes',
    'vélo': 'Jambes',
    'rameur': 'Dos',
    'abdo': 'Abdominaux',
    'fente': 'Jambes',
    'dips': 'Triceps',
    'développé': 'Pectoraux',
    'rowing': 'Dos',
    'soulevé': 'Jambes',
    'curl': 'Biceps',
    'presse': 'Jambes',
    'hip thrust': 'Fessiers',
    'gainage': 'Abdominaux',
  };
  // Table de correspondance nom -> équipement
  const equipmentMap: Record<string, string> = {
    'pompe': 'Poids du corps',
    'traction': 'Barre de traction',
    'squat': 'Barre libre',
    'course': 'Poids du corps',
    'vélo': 'Machine',
    'rameur': 'Machine',
    'abdo': 'Poids du corps',
    'fente': 'Poids du corps',
    'dips': 'Barre de traction',
    'développé': 'Barre + banc',
    'rowing': 'Barre libre',
    'soulevé': 'Barre libre',
    'curl': 'Haltères',
    'presse': 'Machine',
    'hip thrust': 'Barre libre',
    'gainage': 'Poids du corps',
  };
  // Table de correspondance nom -> difficulté
  const difficultyMap: Record<string, string> = {
    'pompe': 'Débutant',
    'traction': 'Intermédiaire',
    'squat': 'Intermédiaire',
    'course': 'Débutant',
    'vélo': 'Débutant',
    'rameur': 'Débutant',
    'abdo': 'Débutant',
    'fente': 'Débutant',
    'dips': 'Intermédiaire',
    'développé': 'Intermédiaire',
    'rowing': 'Intermédiaire',
    'soulevé': 'Avancé',
    'curl': 'Débutant',
    'presse': 'Débutant',
    'hip thrust': 'Intermédiaire',
    'gainage': 'Débutant',
  };
  // Table de correspondance nom -> suggestion label
  const labelMap: Record<string, string> = {
    'pompe': 'Pompes',
    'traction': 'Tractions',
    'squat': 'Squat',
    'course': 'Course',
    'vélo': 'Vélo',
    'rameur': 'Rameur',
    'abdo': 'Abdos',
    'fente': 'Fentes',
    'dips': 'Dips',
    'développé': 'Développé couché',
    'rowing': 'Rowing',
    'soulevé': 'Soulevé de terre',
    'curl': 'Curl',
    'presse': 'Presse',
    'hip thrust': 'Hip Thrust',
    'gainage': 'Gainage',
  };
  // Utilitaire pour trouver la clé correspondante
  function findKey(n: string) {
    return Object.keys(muscleMap).find(k => n.includes(k));
  }
  const n = name.toLowerCase();
  const key = findKey(n) || '';
  // Suggestions muscu
  if (type === 'Musculation') {
    if (key === 'pompe') {
      return [
        { label: '20 pompes', values: { name: 'Pompes', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '20', firstWeight: '', sets: 3 } },
        { label: '50 pompes', values: { name: 'Pompes', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '50', firstWeight: '', sets: 4 } },
        { label: '100 pompes (IronBuddy)', values: { name: 'Pompes', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '100', firstWeight: '', sets: 5 } },
      ];
    }
    if (key === 'traction') {
      return [
        { label: '10 tractions', values: { name: 'Tractions', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '10', firstWeight: '', sets: 3 } },
        { label: '20 tractions lestées', values: { name: 'Tractions', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '20', firstWeight: '10', sets: 4 } },
      ];
    }
    if (key === 'squat') {
      return [
        { label: '20 squats à 60kg', values: { name: 'Squat', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '20', firstWeight: '60', sets: 3 } },
        { label: '10 squats à 100kg', values: { name: 'Squat', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], firstReps: '10', firstWeight: '100', sets: 4 } },
      ];
    }
    // Suggestions génériques muscu
    return [
      { label: '10 reps à 50kg', values: { name: 'Développé couché', muscle: 'Pectoraux', equipment: 'Barre + banc', difficulty: 'Intermédiaire', firstReps: '10', firstWeight: '50', sets: 3 } },
      { label: '20 reps au poids du corps', values: { name: 'Pompes', muscle: 'Pectoraux', equipment: 'Poids du corps', difficulty: 'Débutant', firstReps: '20', firstWeight: '', sets: 3 } },
      { label: '100 reps (challenge)', values: { name: 'Pompes', muscle: 'Pectoraux', equipment: 'Poids du corps', difficulty: 'Débutant', firstReps: '100', firstWeight: '', sets: 5 } },
    ];
  }
  // Suggestions cardio
  if (type === 'Cardio') {
    if (key === 'course') {
      return [
        { label: '5 km en 30 min', values: { name: 'Course', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '5', distanceUnit: 'km', minutes: '30', speed: '10', speedUnit: 'km/h', calories: '350' } },
        { label: '10 km en 1h', values: { name: 'Course', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '10', distanceUnit: 'km', minutes: '60', speed: '10', speedUnit: 'km/h', calories: '700' } },
      ];
    }
    if (key === 'vélo') {
      return [
        { label: '20 km en 1h', values: { name: 'Vélo', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '20', distanceUnit: 'km', minutes: '60', speed: '20', speedUnit: 'km/h', calories: '500' } },
        { label: '10 km en 30 min', values: { name: 'Vélo', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '10', distanceUnit: 'km', minutes: '30', speed: '20', speedUnit: 'km/h', calories: '250' } },
      ];
    }
    if (key === 'rameur') {
      return [
        { label: '2000 m en 8 min', values: { name: 'Rameur', muscle: muscleMap[key], equipment: equipmentMap[key], difficulty: difficultyMap[key], distance: '2', distanceUnit: 'km', minutes: '8', speed: '15', speedUnit: 'km/h', calories: '150' } },
      ];
    }
    // Suggestions génériques cardio
    return [
      { label: '30 min à 10 km/h', values: { name: 'Course', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', minutes: '30', speed: '10', speedUnit: 'km/h', calories: '300' } },
      { label: '5 km en 25 min', values: { name: 'Course', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', distance: '5', distanceUnit: 'km', minutes: '25', speed: '12', speedUnit: 'km/h', calories: '350' } },
      { label: '300 calories', values: { name: 'Course', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', calories: '300', minutes: '30' } },
    ];
  }
  // Suggestions fun
  return [
    { label: '10 burpees en chantant la Marseillaise', values: { name: 'Burpees', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant', firstReps: '10', sets: 1 } },
    { label: 'Séance déguisé (optionnel)', values: { name: 'Cardio déguisé', muscle: 'Jambes', equipment: 'Poids du corps', difficulty: 'Débutant' } },
  ];
}

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
  
  // Ajout d’un état pour le nom de l’exercice (pour suggestions dynamiques)
  const [suggestionName, setSuggestionName] = useState('');
  
  // Ajout d’un état pour l’exercice suggéré
  const [autoExerciseSuggestions, setAutoExerciseSuggestions] = useState<Array<{name: string, label: string, type: string, equipment: string, difficulty: string, suggestions: Array<{label: string, values: Record<string, any>}>}>>([]);
  
  const router = useRouter()

  useEffect(() => {
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('equipment').select('id, name')
      if (!error && data) setEquipmentList(data)
    }
    fetchEquipment()
  }, [])

  // Quand le groupe musculaire change, on propose automatiquement des exercices adaptés
  useEffect(() => {
    if (muscle && standardExercises[muscle]) {
      setAutoExerciseSuggestions(standardExercises[muscle]);
    } else {
      setAutoExerciseSuggestions([]);
    }
  }, [muscle]);

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
    const exerciseData: Record<string, any> = {
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
          <input type="text" value={name} onChange={e => { setName(e.target.value); setSuggestionName(e.target.value); }} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
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
        
        {/* Suggestions automatiques d’exercices par groupe musculaire */}
        {autoExerciseSuggestions.length > 0 && (
          <div className="mb-4">
            <label className="block text-gray-700 font-medium mb-2">Exercices recommandés pour {muscle}</label>
            <div className="flex flex-col gap-2">
              {autoExerciseSuggestions.map((ex, idx) => (
                <div key={idx} className="bg-orange-50 rounded-lg p-3">
                  <div className="font-semibold text-orange-700 mb-1">{ex.label}</div>
                  <div className="flex flex-wrap gap-2 mb-1">
                    {ex.suggestions.map((s, i) => (
                      <button
                        key={i}
                        type="button"
                        className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
                        onClick={() => {
                          setName(ex.name);
                          setSuggestionName(ex.name);
                          setMuscle(muscle);
                          // Sélectionner l'équipement si possible
                          if (ex.equipment) {
                            const eq = equipmentList.find(e => e.name.toLowerCase() === ex.equipment.toLowerCase());
                            setEquipmentId(eq ? eq.id : null);
                          }
                          setDifficulty(ex.difficulty);
                          setFirstReps(s.values.firstReps || '');
                          setFirstWeight(s.values.firstWeight || '');
                          setSets(s.values.sets || 3);
                        }}
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Suggestions dynamiques */}
        {(() => {
          const suggestions = getExerciseSuggestions(exerciseType, muscle, suggestionName || name);
          if (!suggestions.length) return null;
          return (
            <div className="mb-4">
              <label className="block text-gray-700 font-medium mb-2">Suggestions rapides</label>
              <div className="flex flex-wrap gap-2">
                {suggestions.map((s, i) => (
                  <button
                    key={i}
                    type="button"
                    className="px-3 py-1 rounded-lg bg-orange-100 text-orange-700 text-sm hover:bg-orange-200"
                    onClick={() => {
                      // Pré-remplir tous les champs nécessaires selon la suggestion
                      setName(s.values.name || '');
                      setSuggestionName(s.values.name || '');
                      setMuscle(s.values.muscle || muscleGroups[0]);
                      // Sélectionner l'équipement si possible
                      if (s.values.equipment) {
                        const eq = equipmentList.find(e => e.name.toLowerCase() === s.values.equipment.toLowerCase());
                        setEquipmentId(eq ? eq.id : null);
                      }
                      setDifficulty(s.values.difficulty || difficulties[0]);
                      if (exerciseType === 'Musculation') {
                        setFirstReps(s.values.firstReps || '');
                        setFirstWeight(s.values.firstWeight || '');
                        setSets(s.values.sets || 3);
                      } else if (exerciseType === 'Cardio') {
                        setDistance(s.values.distance || '');
                        setDistanceUnit(s.values.distanceUnit || 'km');
                        setMinutes(s.values.minutes || '');
                        setSpeed(s.values.speed || '');
                        setSpeedUnit(s.values.speedUnit || 'km/h');
                        setCalories(s.values.calories || '');
                      }
                    }}
                  >
                    {s.label}
                  </button>
                ))}
              </div>
            </div>
          );
        })()}

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