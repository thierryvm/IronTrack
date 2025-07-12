"use client"
import { useRouter, useParams } from 'next/navigation'
import { Dumbbell, ArrowLeft, Trophy } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

type Exercise = {
  id: number;
  name: string;
  muscle_group: string;
  equipment: string;
  difficulty: string;
  sets?: number | null;
  exercise_type?: string;
  distance?: number | null;
  distance_unit?: string | null;
  speed?: number | null;
  speed_unit?: string | null;
  calories?: number | null;
  duration_minutes?: number | null;
  duration_seconds?: number | null;
  reps?: number | null; // Pour compatibilité éventuelle
  weight?: number | null; // Pour compatibilité éventuelle
};
type PerformanceLog = {
  weight: number;
  reps: number;
  performed_at: string;
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

export default function ExerciseDetailPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [exercise, setExercise] = useState<Exercise | null>(null)
  const [lastPerf, setLastPerf] = useState<PerformanceLog | null>(null)
  const [perfHistory, setPerfHistory] = useState<PerformanceLog[]>([])
  useEffect(() => {
    const fetchExercise = async () => {
      const supabase = (await import('@/lib/supabase')).createClient()
      const { data, error } = await supabase
        .from('exercises')
        .select('id, name, muscle_group, equipment_id, difficulty, sets, exercise_type, distance, distance_unit, speed, speed_unit, calories, duration_minutes, duration_seconds')
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
        .select('weight, reps, distance, distance_unit, duration_minutes, duration_seconds, speed, speed_unit, calories, performed_at')
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
        {/* Résumé dynamique façon objectif */}
        {exercise && (
          <>
            <div className="mb-2 text-lg font-semibold text-gray-700">
              {(() => {
                // Phrase muscu
                if (exercise.exercise_type === 'Musculation' || !exercise.exercise_type) {
                  let phrase = '';
                  if (exercise.sets && exercise.sets > 1) phrase += `${exercise.sets} séries de `;
                  if (exercise.reps) phrase += `${exercise.reps} reps`;
                  if (exercise.weight) phrase += (phrase ? ' à ' : '') + `${exercise.weight} kg`;
                  // Durée
                  if (exercise.duration_minutes || exercise.duration_seconds) {
                    let d = '';
                    if (exercise.duration_minutes) d += `${exercise.duration_minutes} min`;
                    if (exercise.duration_seconds) d += (d ? ' ' : '') + `${exercise.duration_seconds} sec`;
                    phrase += (phrase ? ' en ' : '') + d;
                  }
                  return phrase || 'Exercice de musculation';
                }
                // Phrase cardio
                if (exercise.exercise_type === 'Cardio') {
                  let phrase = '';
                  if (exercise.distance) phrase += `${exercise.distance} ${exercise.distance_unit || 'km'}`;
                  if (exercise.duration_minutes || exercise.duration_seconds) {
                    let d = '';
                    if (exercise.duration_minutes) d += `${exercise.duration_minutes} min`;
                    if (exercise.duration_seconds) d += (d ? ' ' : '') + `${exercise.duration_seconds} sec`;
                    phrase += (phrase ? ' en ' : '') + d;
                  }
                  if (exercise.speed) phrase += (phrase ? ' à ' : '') + `${exercise.speed} ${exercise.speed_unit || 'km/h'}`;
                  if (exercise.calories) phrase += (phrase ? ', ' : '') + `${exercise.calories} kcal`;
                  return phrase || 'Exercice cardio';
                }
                return '';
              })()}
            </div>
            {/* Punchline motivante */}
            <div className="mb-2 text-sm italic text-orange-600">
              {(() => {
                if (!exercise) return null;
                // Punchlines par groupe musculaire ou type
                const muscuPunchlines: Record<string, string[]> = {
                  'Pectoraux': ["Fais gonfler le torse, c'est l'heure du show !", "Un développé couché de légende commence ici."],
                  'Dos': ["Un dos large, c'est la cape du super-héros !", "Chaque traction te rapproche du gorille intérieur."],
                  'Épaules': ["Des épaules en béton, pour porter le monde !"],
                  'Biceps': ["Plus gros que tes problèmes !"],
                  'Triceps': ["Pour des bras qui font peur aux t-shirts !"],
                  'Jambes': ["On ne saute jamais le leg day !", "Des jambes d'acier, c'est la base."],
                  'Abdominaux': ["Le six-pack ne se fait pas tout seul !"],
                  'Fessiers': ["Pour un booty qui claque !"],
                };
                const cardioPunchlines = [
                  "Le cardio, c'est la clé pour tenir la distance !",
                  "Plus vite, plus loin, plus fort !",
                  "Ton cœur te dira merci !"
                ];
                // Si muscu
                if (exercise.exercise_type === 'Musculation' || !exercise.exercise_type) {
                  const group = exercise.muscle_group || '';
                  const punchs = muscuPunchlines[group];
                  if (punchs) {
                    return punchs[Math.floor(Math.random() * punchs.length)];
                  }
                  return "Chaque rep te rapproche de la légende !";
                }
                // Si cardio
                if (exercise.exercise_type === 'Cardio') {
                  return cardioPunchlines[Math.floor(Math.random() * cardioPunchlines.length)];
                }
                return null;
              })()}
            </div>
          </>
        )}
        {/* Badges infos */}
        {exercise && (
          <div className="flex flex-wrap gap-2 mb-4">
            {exercise.muscle_group && (
              <span className="bg-orange-100 text-orange-700 px-2 py-1 rounded text-xs font-medium">{exercise.muscle_group}</span>
            )}
            {exercise.difficulty && (
              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">{exercise.difficulty}</span>
            )}
            {exercise.equipment && (
              <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-medium">{exercise.equipment}</span>
            )}
          </div>
        )}
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
            <span className="text-gray-800 text-base">Dernière performance : <span className="font-bold">{getPerfLabel(lastPerf, exercise?.exercise_type || 'Musculation', exercise?.sets ?? 1)}</span> <span className="text-gray-400">({new Date(lastPerf.performed_at).toLocaleDateString()})</span></span>
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
                  <span className="font-semibold">{getPerfLabel(perf, exercise?.exercise_type || 'Musculation', exercise?.sets ?? 1)}</span>
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