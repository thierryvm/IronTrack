"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Dumbbell, Save, Pencil, Check, X, Trash2, Clock, Trophy } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'

const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers'
]
const difficulties = ['Débutant', 'Intermédiaire', 'Avancé']
const exerciseTypes = [
  { value: 'Musculation', label: 'Musculation', icon: Dumbbell, color: 'text-orange-500' },
  { value: 'Cardio', label: 'Cardio', icon: Clock, color: 'text-blue-500' }
]

type PerformanceLog = {
  id: number;
  weight: number;
  reps: number;
  performed_at: string;
};

// Table d’exercices standards par groupe musculaire (enrichie avec Cardio)
type ExerciseSuggestion = { label: string, values: Record<string, string | number> };
type StandardExercise = { name: string, label: string, type: string, equipment: string, difficulty: string, suggestions: ExerciseSuggestion[] };
const standardExercises: Record<string, StandardExercise[]> = {
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
    {
      name: 'Tapis de marche', label: 'Tapis de marche', type: 'Cardio', equipment: 'Tapis de marche', difficulty: 'Débutant',
      suggestions: [
        { label: '3 km en 30 min', values: { distance: '3', distanceUnit: 'km', minutes: '30', speed: '6', speedUnit: 'km/h', calories: '150' } },
        { label: '5 km en 45 min', values: { distance: '5', distanceUnit: 'km', minutes: '45', speed: '6.5', speedUnit: 'km/h', calories: '250' } },
      ]
    },
    {
      name: 'Course', label: 'Course', type: 'Cardio', equipment: 'Tapis de course', difficulty: 'Débutant',
      suggestions: [
        { label: '5 km en 30 min', values: { distance: '5', distanceUnit: 'km', minutes: '30', speed: '10', speedUnit: 'km/h', calories: '350' } },
        { label: '10 km en 1h', values: { distance: '10', distanceUnit: 'km', minutes: '60', speed: '10', speedUnit: 'km/h', calories: '700' } },
      ]
    },
    {
      name: 'Vélo', label: 'Vélo', type: 'Cardio', equipment: 'Vélo', difficulty: 'Débutant',
      suggestions: [
        { label: '10 km en 30 min', values: { distance: '10', distanceUnit: 'km', minutes: '30', speed: '20', speedUnit: 'km/h', calories: '250' } },
        { label: '20 km en 1h', values: { distance: '20', distanceUnit: 'km', minutes: '60', speed: '20', speedUnit: 'km/h', calories: '500' } },
      ]
    },
    {
      name: 'Rameur', label: 'Rameur', type: 'Cardio', equipment: 'Rameur', difficulty: 'Débutant',
      suggestions: [
        { label: '2000 m en 8 min', values: { distance: '2', distanceUnit: 'km', minutes: '8', speed: '15', speedUnit: 'km/h', calories: '150' } },
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

// Ajout d'une fonction utilitaire pour générer la phrase de performance selon le type et les champs
function getPerfLabel(perf: Record<string, unknown>, type: string, sets?: number): string {
  if (type === 'Cardio') {
    let phrase = '';
    if (perf.distance) phrase += String(perf.distance) + (perf.distance_unit ? String(perf.distance_unit) : ' km');
    if (perf.duration_minutes || perf.duration_seconds) {
      let d = '';
      if (perf.duration_minutes) d += String(perf.duration_minutes) + ' min';
      if (perf.duration_seconds) d += (d ? ' ' : '') + String(perf.duration_seconds) + ' sec';
      phrase += (phrase ? ' en ' : '') + d;
    }
    if (perf.speed) phrase += (phrase ? ' à ' : '') + String(perf.speed) + (perf.speed_unit ? String(perf.speed_unit) : ' km/h');
    if (perf.calories) phrase += (phrase ? ', ' : '') + String(perf.calories) + ' kcal';
    return phrase || 'Performance cardio';
  }
  // Muscu
  let phrase = '';
  if (perf.weight) phrase += String(perf.weight) + ' kg';
  if (perf.reps) phrase += (phrase ? ' x ' : '') + String(perf.reps) + ' reps';
  if (sets && sets > 1) phrase += (phrase ? ' x ' : '') + String(sets) + ' séries';
  return phrase || 'Performance muscu';
}

export default function EditExercisePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState(muscleGroups[0])
  const [exerciseType, setExerciseType] = useState('Musculation')
  const [equipmentId, setEquipmentId] = useState<number | null>(null)
  const [equipmentList, setEquipmentList] = useState<{id: number, name: string}[]>([])
  const [difficulty, setDifficulty] = useState(difficulties[0])
  const [sets, setSets] = useState(3)
  
  // Champs pour Musculation
  const [perfWeight, setPerfWeight] = useState('')
  const [perfReps, setPerfReps] = useState('')
  
  // Champs pour Cardio
  const [distance, setDistance] = useState('')
  const [distanceUnit, setDistanceUnit] = useState('km')
  const [speed, setSpeed] = useState('')
  const [speedUnit, setSpeedUnit] = useState('km/h')
  const [calories, setCalories] = useState('')
  
  // Champs communs
  const [minutes, setMinutes] = useState('')
  const [seconds, setSeconds] = useState('')
  
  const [perfLoading, setPerfLoading] = useState(false)
  const [perfSuccess, setPerfSuccess] = useState('')
  const [perfHistory, setPerfHistory] = useState<PerformanceLog[]>([])
  const [lastPerf, setLastPerf] = useState<PerformanceLog | null>(null)
  const [editPerfId, setEditPerfId] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editReps, setEditReps] = useState('')
  const [perfError, setPerfError] = useState('')

  // Ajout des états pour suggestions et valeurs dynamiques
  const [firstWeight, setFirstWeight] = useState('');
  const [firstReps, setFirstReps] = useState('');
  const [autoExerciseSuggestions, setAutoExerciseSuggestions] = useState<StandardExercise[]>([]);

  // Helpers dynamiques pour la validation du bouton Ajouter
  const canAddPerfCardio = () => {
    return !!(distance || minutes || seconds || speed || calories);
  };
  const canAddPerfMuscu = () => {
    return !!(perfWeight || perfReps);
  };

  useEffect(() => {
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('equipment').select('id, name')
      if (!error && data) setEquipmentList(data)
    }
    fetchEquipment()
  }, [])

  // 1. Sélection automatique du type d'exercice lors du chargement
  useEffect(() => {
    const fetchExercise = async () => {
      setLoading(true)
      const supabase = createClient()
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('id', id)
        .single()
      if (!error && data) {
        setName(data.name || '')
        setMuscle(data.muscle_group || muscleGroups[0])
        setExerciseType(data.exercise_type || 'Musculation') // <-- Sélectionne le bon type
        setEquipmentId(data.equipment_id || null)
        setDifficulty(data.difficulty || difficulties[0])
        setSets(data.sets || 3)
        setFirstWeight(data.weight?.toString() || '')
        setFirstReps(data.reps?.toString() || '')
        if (data.exercise_type === 'Cardio') {
          setDistance(data.distance?.toString() || '')
          setDistanceUnit(data.distance_unit || 'km')
          setSpeed(data.speed?.toString() || '')
          setSpeedUnit(data.speed_unit || 'km/h')
          setCalories(data.calories?.toString() || '')
        }
        setMinutes(data.duration_minutes?.toString() || '')
        setSeconds(data.duration_seconds?.toString() || '')
        // Suggestions contextuelles selon le type
        if (data.muscle_group && standardExercises[data.muscle_group]) {
          const filtered = standardExercises[data.muscle_group].filter(ex => ex.type === data.exercise_type)
          setAutoExerciseSuggestions(filtered.length ? filtered : standardExercises[data.muscle_group].filter(ex => ex.type === data.exercise_type))
        }
      }
      setLoading(false)
    }
    fetchExercise()
  }, [id])

  useEffect(() => {
    const fetchPerformance = async () => {
      const supabase = createClient()
      const { data, error } = await supabase
        .from('performance_logs')
        .select('id, weight, reps, performed_at')
        .eq('exercise_id', id)
        .order('performed_at', { ascending: false })
      if (!error && data) {
        setPerfHistory(data)
        setLastPerf(data[0] || null)
      }
    }
    if (id) fetchPerformance()
  }, [id, perfSuccess])

  // 1. Suggestions contextuelles selon type et équipement/groupe
  useEffect(() => {
    if (muscle && standardExercises[muscle]) {
      // Filtrer par type et équipement si possible
      const filtered = standardExercises[muscle].filter(ex =>
        ex.type === exerciseType &&
        (name.toLowerCase().includes(ex.name.toLowerCase()) || ex.equipment === equipmentList.find(eq => eq.id === equipmentId)?.name)
      );
      setAutoExerciseSuggestions(filtered.length ? filtered : standardExercises[muscle].filter(ex => ex.type === exerciseType));
    } else {
      setAutoExerciseSuggestions([]);
    }
  }, [muscle, exerciseType, name, equipmentId, equipmentList.length, equipmentList]);

  // 2. Suggestions dynamiques pour le cardio aussi
  // (déjà géré par le filtre ex.type === exerciseType dans le useEffect suggestions)

  // 3. Saisie de performance dynamique pour le cardio
  useEffect(() => {
    if (exerciseType === 'Cardio') {
      setPerfWeight('');
      setPerfReps('');
      setSets(1); // Cardio is typically 1 set
    }
  }, [exerciseType]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    
    // Préparer les données selon le type d'exercice
    const updateData: Record<string, unknown> = {
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
      updateData.distance = distance ? Number(distance) : null
      updateData.distance_unit = distanceUnit
      updateData.speed = speed ? Number(speed) : null
      updateData.speed_unit = speedUnit
      updateData.calories = calories ? Number(calories) : null
    }
    
    const { error } = await supabase
      .from('exercises')
      .update(updateData)
      .eq('id', id)
    setSaving(false)
    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message)
      return
    }
    router.push('/exercises')
  }

  const handleAddPerf = async () => {
    if (exerciseType === 'Musculation' && !canAddPerfMuscu()) return;
    if (exerciseType === 'Cardio' && !canAddPerfCardio()) return;
    setPerfLoading(true);
    setPerfSuccess('');
    const supabase = createClient();
    const { data: { user }, error: userError } = await supabase.auth.getUser();
    if (userError || !user) {
      alert("Utilisateur non connecté !");
      setPerfLoading(false);
      return;
    }
    const perfData: Record<string, unknown> = {
      user_id: user.id,
      exercise_id: id,
      performed_at: new Date().toISOString(),
    };
    if (exerciseType === 'Musculation') {
      perfData.weight = perfWeight ? Number(perfWeight) : 0;
      perfData.reps = perfReps ? Number(perfReps) : 0;
      perfData.sets = sets;
      perfData.duration_minutes = minutes ? Number(minutes) : null;
      perfData.duration_seconds = seconds ? Number(seconds) : null;
      // Cardio à null
      perfData.distance = null;
      perfData.distance_unit = null;
      perfData.speed = null;
      perfData.speed_unit = null;
      perfData.calories = null;
    } else if (exerciseType === 'Cardio') {
      perfData.distance = distance ? Number(distance) : null;
      perfData.distance_unit = distanceUnit;
      perfData.duration_minutes = minutes ? Number(minutes) : null;
      perfData.duration_seconds = seconds ? Number(seconds) : null;
      perfData.speed = speed ? Number(speed) : null;
      perfData.speed_unit = speedUnit;
      perfData.calories = calories ? Number(calories) : null;
      // Muscu à null/0
      perfData.weight = 0;
      perfData.reps = 0;
      perfData.sets = null;
    }
    // Envoi des données de performance
    const { error } = await supabase.from('performance_logs').insert(perfData);
    setPerfLoading(false);
    if (!error) {
      setPerfSuccess('Performance ajoutée !');
      setPerfWeight('');
      setPerfReps('');
      setDistance('');
      setSpeed('');
      setCalories('');
      setMinutes('');
      setSeconds('');
      // Rafraîchir l'historique
      const { data: updatedHistory, error: histError } = await supabase
        .from('performance_logs')
        .select('id, weight, reps, distance, distance_unit, duration_minutes, duration_seconds, speed, speed_unit, calories, performed_at')
        .eq('exercise_id', id)
        .order('performed_at', { ascending: false });
      if (!histError && updatedHistory) {
        setPerfHistory(updatedHistory);
        setLastPerf(updatedHistory[0] || null);
      }
    } else {
      alert("Erreur lors de l'ajout de la performance : " + error.message);
    }
  };

  const handleEditPerf = (perf: PerformanceLog) => {
    setEditPerfId(perf.id)
    setEditWeight(perf.weight.toString())
    setEditReps(perf.reps.toString())
    setPerfError('')
  }

  const handleCancelEdit = () => {
    setEditPerfId(null)
    setEditWeight('')
    setEditReps('')
    setPerfError('')
  }

  const handleSaveEditPerf = async () => {
    if (!editReps) {
      setPerfError('Reps requises')
      return
    }
    const supabase = createClient()
    const { error } = await supabase.from('performance_logs').update({
      weight: editWeight ? Number(editWeight) : 0,
      reps: Number(editReps)
    }).eq('id', editPerfId)
    if (!error) {
      setPerfSuccess('Performance modifiée !')
      setEditPerfId(null)
      setEditWeight('')
      setEditReps('')
      setTimeout(() => setPerfSuccess(''), 2000)
    } else {
      setPerfError("Erreur lors de la modification : " + error.message)
    }
  }

  const handleDeletePerf = async (id: number) => {
    if (!window.confirm('Supprimer cette performance ?')) return
    const supabase = createClient()
    const { error } = await supabase.from('performance_logs').delete().eq('id', id)
    if (!error) {
      setPerfSuccess('Performance supprimée !')
      setTimeout(() => setPerfSuccess(''), 2000)
    } else {
      setPerfError("Erreur lors de la suppression : " + error.message)
    }
  }

  if (loading) {
    return <div className="min-h-screen flex items-center justify-center text-gray-500">Chargement...</div>
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg space-y-6"
      >
        {/* Dans le formulaire, afficher le champ nom de l'exercice et le pré-remplir */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nom de l&apos;exercice</label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
          />
        </div>
        
        {/* Suggestions rapides */}
        {autoExerciseSuggestions.length > 0 && (
          <div className="mb-4">
            <div className="font-medium text-gray-700 mb-2">Suggestions rapides</div>
            <div className="flex flex-wrap gap-2">
              {autoExerciseSuggestions.map((ex) => (
                ex.suggestions.map((s, j) => {
                  // Construire un label explicite
                  let label = s.label;
                  if (!label.toLowerCase().includes(ex.name.toLowerCase())) {
                    label = `${s.label} de ${ex.name}`;
                    if (s.values.firstWeight) label += ` à ${s.values.firstWeight}kg`;
                  }
                  return (
                    <button
                      key={ex.name + '-' + j}
                      type="button"
                      className="bg-orange-100 hover:bg-orange-200 text-orange-700 px-3 py-1 rounded text-xs font-semibold border border-orange-200"
                      onClick={() => {
                        setName(ex.name);
                        setMuscle(muscle);
                        setExerciseType(ex.type);
                        setDifficulty(ex.difficulty);
                        setFirstReps(typeof s.values.firstReps === 'string' ? s.values.firstReps : '');
                        setFirstWeight(typeof s.values.firstWeight === 'string' ? s.values.firstWeight : '');
                        setSets(typeof s.values.sets === 'number' ? s.values.sets : 3);
                        setEquipmentId(equipmentList.find(eq => eq.name === ex.equipment)?.id || null);
                        setDistance(typeof s.values.distance === 'string' ? s.values.distance : '');
                        setDistanceUnit(typeof s.values.distanceUnit === 'string' ? s.values.distanceUnit : 'km');
                        setMinutes(typeof s.values.minutes === 'string' ? s.values.minutes : '');
                        setSpeed(typeof s.values.speed === 'string' ? s.values.speed : '');
                        setSpeedUnit(typeof s.values.speedUnit === 'string' ? s.values.speedUnit : 'km/h');
                        setCalories(typeof s.values.calories === 'string' ? s.values.calories : '');
                      }}
                    >
                      {label}
                    </button>
                  );
                })
              ))}
            </div>
          </div>
        )}
        {/* Champs dynamiques selon le type d'exercice */}
        <div>
          <label className="block text-gray-700 font-medium mb-2">Type d&apos;exercice</label>
          <div className="flex gap-4 mb-2">
            {exerciseTypes.map((type) => (
              <button
                key={type.value}
                type="button"
                className={`flex items-center gap-2 px-4 py-2 rounded-lg border font-semibold ${exerciseType === type.value ? type.color + ' bg-orange-50 border-orange-500' : 'bg-white border-gray-300 text-gray-700'}`}
                onClick={() => setExerciseType(type.value)}
              >
                <type.icon className="h-5 w-5" />
                {type.label}
              </button>
            ))}
          </div>
        </div>
        {/* Champs spécifiques Musculation */}
        {exerciseType === 'Musculation' && (
          <>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Poids (optionnel)</label>
              <input
                type="number"
                min="0"
                step="0.1"
                value={firstWeight}
                onChange={e => setFirstWeight(e.target.value)}
                placeholder="Poids (kg)"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Répétitions (optionnel)</label>
              <input
                type="number"
                min="0"
                step="1"
                value={firstReps}
                onChange={e => setFirstReps(e.target.value)}
                placeholder="Répétitions"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            <div>
              <label className="block text-gray-700 font-medium mb-2">Nombre de séries</label>
              <input
                type="number"
                min="1"
                step="1"
                value={sets}
                onChange={e => setSets(Number(e.target.value))}
                placeholder="Séries"
                className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
              />
            </div>
          </>
        )}
        {/* Champs spécifiques Cardio */}
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
          <label className="block text-gray-700 font-medium mb-2">Durée (optionnel)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min="0"
              step="1"
              value={minutes}
              onChange={e => setMinutes(e.target.value)}
              placeholder="Minutes"
              className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            />
            <input
              type="number"
              min="0"
              max="59"
              step="1"
              value={seconds}
              onChange={e => setSeconds(e.target.value)}
              placeholder="Secondes"
              className="w-1/2 border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            />
          </div>
        </div>
        
        {/* SECTION PERFORMANCES - Uniquement pour Musculation */}
        {exerciseType === 'Musculation' && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Performances
            </div>
            {lastPerf ? (
              <div className="mb-2 text-sm text-gray-700">
                Dernière performance : <span className="font-bold">{lastPerf.weight === 0 ? 'Poids du corps' : lastPerf.weight + ' kg'} x {lastPerf.reps} reps x {sets} séries</span> <span className="text-gray-400">({new Date(lastPerf.performed_at).toLocaleDateString()})</span>
              </div>
            ) : (
              <div className="mb-2 text-sm text-gray-500">Aucune performance enregistrée.</div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-2">
              <input
                type="number"
                min="0"
                step="0.5"
                value={perfWeight}
                onChange={e => setPerfWeight(e.target.value)}
                placeholder="Poids (kg)"
                className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                min="1"
                step="1"
                value={perfReps}
                onChange={e => setPerfReps(e.target.value)}
                placeholder="Répétitions"
                className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={handleAddPerf} disabled={!canAddPerfMuscu() || perfLoading} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Save className="h-4 w-4" />
                {perfLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
            {perfSuccess && <div className="text-green-600 text-sm mb-2">{perfSuccess}</div>}
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Historique :</div>
              <ul className="max-h-32 overflow-y-auto text-sm divide-y divide-gray-200">
                {perfHistory.length === 0 && <li className="text-gray-400">Aucune performance enregistrée.</li>}
                {perfHistory.map((perf) => (
                  <li key={perf.id} className="mb-1 flex items-center gap-2">
                    {editPerfId === perf.id ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={editWeight}
                          onChange={e => setEditWeight(e.target.value)}
                          className="w-20 border rounded px-2 py-1"
                        />
                        <span>kg x</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={editReps}
                          onChange={e => setEditReps(e.target.value)}
                          className="w-14 border rounded px-2 py-1"
                        />
                        <span>reps x {sets} séries</span>
                        <span className="text-gray-400 ml-2">{new Date(perf.performed_at).toLocaleDateString()}</span>
                        <button onClick={handleSaveEditPerf} className="text-green-600 ml-2" title="Valider"><Check className="h-4 w-4" /></button>
                        <button onClick={handleCancelEdit} className="text-gray-400 ml-1" title="Annuler"><X className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{getPerfLabel(perf, exerciseType, sets)}</span>
                        <span className="text-gray-400 ml-2">{new Date(perf.performed_at).toLocaleDateString()}</span>
                        <button onClick={() => handleEditPerf(perf)} className="text-yellow-500 ml-2" title="Modifier"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDeletePerf(perf.id)} className="text-red-500 ml-1" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {perfError && <div className="text-red-500 text-xs mt-1">{perfError}</div>}
            </div>
          </div>
        )}
        
        {/* SECTION PERFORMANCES - Pour Cardio */}
        {exerciseType === 'Cardio' && (
          <div className="mt-8 bg-gray-50 rounded-lg p-4">
            <div className="font-semibold text-orange-700 mb-2 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              Performances
            </div>
            <div className="flex flex-wrap gap-2 mb-2">
              <input
                type="number"
                min="0"
                step="0.1"
                value={distance}
                onChange={e => setDistance(e.target.value)}
                placeholder="Distance"
                className="w-1/4 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={distanceUnit}
                onChange={e => setDistanceUnit(e.target.value)}
                className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              >
                <option value="km">km</option>
                <option value="m">m</option>
                <option value="miles">miles</option>
              </select>
              <input
                type="number"
                min="0"
                step="1"
                value={minutes}
                onChange={e => setMinutes(e.target.value)}
                placeholder="Min"
                className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                min="0"
                max="59"
                step="1"
                value={seconds}
                onChange={e => setSeconds(e.target.value)}
                placeholder="Sec"
                className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                min="0"
                step="0.1"
                value={speed}
                onChange={e => setSpeed(e.target.value)}
                placeholder="Vitesse"
                className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <select
                value={speedUnit}
                onChange={e => setSpeedUnit(e.target.value)}
                className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              >
                <option value="km/h">km/h</option>
                <option value="m/s">m/s</option>
                <option value="mph">mph</option>
              </select>
              <input
                type="number"
                min="0"
                step="1"
                value={calories}
                onChange={e => setCalories(e.target.value)}
                placeholder="Calories"
                className="w-1/6 border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-orange-500"
              />
            </div>
            {lastPerf ? (
              <div className="mb-2 text-sm text-gray-700">
                Dernière performance : <span className="font-bold">{lastPerf.weight === 0 ? 'Poids du corps' : lastPerf.weight + ' kg'} x {lastPerf.reps} reps x {sets} séries</span> <span className="text-gray-400">({new Date(lastPerf.performed_at).toLocaleDateString()})</span>
              </div>
            ) : (
              <div className="mb-2 text-sm text-gray-500">Aucune performance enregistrée.</div>
            )}
            <div className="flex flex-col sm:flex-row gap-2 items-center mb-2">
              <input
                type="number"
                min="0"
                step="0.5"
                value={perfWeight}
                onChange={e => setPerfWeight(e.target.value)}
                placeholder="Poids (kg)"
                className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <input
                type="number"
                min="1"
                step="1"
                value={perfReps}
                onChange={e => setPerfReps(e.target.value)}
                placeholder="Répétitions"
                className="w-full sm:w-1/3 border border-gray-300 rounded-lg px-4 py-2 focus:ring-2 focus:ring-orange-500"
              />
              <button type="button" onClick={handleAddPerf} disabled={!canAddPerfCardio() || perfLoading} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                <Save className="h-4 w-4" />
                {perfLoading ? 'Ajout...' : 'Ajouter'}
              </button>
            </div>
            {perfSuccess && <div className="text-green-600 text-sm mb-2">{perfSuccess}</div>}
            <div className="mt-2">
              <div className="text-xs text-gray-500 mb-1">Historique :</div>
              <ul className="max-h-32 overflow-y-auto text-sm divide-y divide-gray-200">
                {perfHistory.length === 0 && <li className="text-gray-400">Aucune performance enregistrée.</li>}
                {perfHistory.map((perf) => (
                  <li key={perf.id} className="mb-1 flex items-center gap-2">
                    {editPerfId === perf.id ? (
                      <>
                        <input
                          type="number"
                          min="0"
                          step="0.5"
                          value={editWeight}
                          onChange={e => setEditWeight(e.target.value)}
                          className="w-20 border rounded px-2 py-1"
                        />
                        <span>kg x</span>
                        <input
                          type="number"
                          min="1"
                          step="1"
                          value={editReps}
                          onChange={e => setEditReps(e.target.value)}
                          className="w-14 border rounded px-2 py-1"
                        />
                        <span>reps x {sets} séries</span>
                        <span className="text-gray-400 ml-2">{new Date(perf.performed_at).toLocaleDateString()}</span>
                        <button onClick={handleSaveEditPerf} className="text-green-600 ml-2" title="Valider"><Check className="h-4 w-4" /></button>
                        <button onClick={handleCancelEdit} className="text-gray-400 ml-1" title="Annuler"><X className="h-4 w-4" /></button>
                      </>
                    ) : (
                      <>
                        <span className="font-semibold">{getPerfLabel(perf, exerciseType, sets)}</span>
                        <span className="text-gray-400 ml-2">{new Date(perf.performed_at).toLocaleDateString()}</span>
                        <button onClick={() => handleEditPerf(perf)} className="text-yellow-500 ml-2" title="Modifier"><Pencil className="h-4 w-4" /></button>
                        <button onClick={() => handleDeletePerf(perf.id)} className="text-red-500 ml-1" title="Supprimer"><Trash2 className="h-4 w-4" /></button>
                      </>
                    )}
                  </li>
                ))}
              </ul>
              {perfError && <div className="text-red-500 text-xs mt-1">{perfError}</div>}
            </div>
          </div>
        )}
        
        <div className="max-sm:sticky max-sm:bottom-0 max-sm:left-0 max-sm:w-full max-sm:bg-white max-sm:pt-2 max-sm:z-20 max-sm:shadow-[0_-2px_12px_0_rgba(0,0,0,0.07)] space-y-2">
          <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
            <Save className="h-5 w-5 mr-2" />
            <span>{saving ? 'Sauvegarde...' : 'Enregistrer'}</span>
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