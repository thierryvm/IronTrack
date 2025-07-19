"use client"
import { useRouter, useParams } from 'next/navigation'
import { Dumbbell, ArrowLeft, Trophy, Edit3, Plus, Trash2, Edit } from 'lucide-react'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'
import { ConfirmationModal } from '@/components/ui/ConfirmationModal'

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
  id: number;
  weight?: number;
  reps?: number;
  distance?: number;
  duration?: number;
  speed?: number;
  calories?: number;
  notes?: string;
  performed_at: string;
};

// Ajout d'une fonction utilitaire pour générer la phrase de performance selon le type et les champs
function getPerfLabel(perf: Record<string, unknown>, type: string, sets?: number): string {
  if (type === 'Cardio') {
    let phrase = '';
    if (perf.distance) phrase += String(perf.distance) + (perf.distance_unit ? String(perf.distance_unit) : ' km');
    
    // Gérer la durée (soit duration en secondes, soit duration_minutes/duration_seconds)
    let durationText = '';
    if (perf.duration) {
      const totalSeconds = Number(perf.duration);
      const minutes = Math.floor(totalSeconds / 60);
      const seconds = totalSeconds % 60;
      if (minutes > 0) durationText += minutes + ' min';
      if (seconds > 0) durationText += (durationText ? ' ' : '') + seconds + ' sec';
    } else if (perf.duration_minutes || perf.duration_seconds) {
      if (perf.duration_minutes) durationText += String(perf.duration_minutes) + ' min';
      if (perf.duration_seconds) durationText += (durationText ? ' ' : '') + String(perf.duration_seconds) + ' sec';
    }
    if (durationText) phrase += (phrase ? ' en ' : '') + durationText;
    
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
  const [deletingPerf, setDeletingPerf] = useState<number | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [perfToDelete, setPerfToDelete] = useState<PerformanceLog | null>(null)

  const handleDeleteClick = (perf: PerformanceLog) => {
    setPerfToDelete(perf)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!perfToDelete) return
    
    try {
      setDeletingPerf(perfToDelete.id)
      const supabase = (await import('@/utils/supabase/client')).createClient()
      
      const { error } = await supabase
        .from('performance_logs')
        .delete()
        .eq('id', perfToDelete.id)
      
      if (error) throw error
      
      // Mettre à jour la liste des performances
      const updatedHistory = perfHistory.filter(p => p.id !== perfToDelete.id)
      setPerfHistory(updatedHistory)
      setLastPerf(updatedHistory[0] || null)
      
      setShowDeleteModal(false)
      setPerfToDelete(null)
      
    } catch (error) {
      console.error('Erreur lors de la suppression:', error)
    } finally {
      setDeletingPerf(null)
    }
  }
  useEffect(() => {
    const fetchExercise = async () => {
      const supabase = (await import('@/utils/supabase/client')).createClient()
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
      const supabase = (await import('@/utils/supabase/client')).createClient()
      const { data, error } = await supabase
        .from('performance_logs')
        .select('id, weight, reps, distance, distance_unit, duration, duration_minutes, duration_seconds, speed, speed_unit, calories, notes, performed_at')
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
          onClick={() => {
            console.log('🔙 Bouton Retour cliqué')
            router.push('/exercises')
          }}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-semibold mb-4"
        >
          <ArrowLeft className="h-5 h-5" />
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
          <div><span className="font-medium">Type :</span> {exercise ? exercise.exercise_type : ''}</div>
          <div><span className="font-medium">Groupe musculaire :</span> {exercise ? exercise.muscle_group : ''}</div>
          <div><span className="font-medium">Équipement :</span> {exercise ? exercise.equipment : ''}</div>
          <div><span className="font-medium">Difficulté :</span> {exercise ? exercise.difficulty : ''}</div>
          {exercise?.exercise_type === 'Musculation' && exercise.sets && (
            <div><span className="font-medium">Nombre de séries :</span> {exercise.sets}</div>
          )}
          {exercise?.exercise_type === 'Cardio' && (
            <>
              {exercise.distance && (
                <div><span className="font-medium">Distance :</span> {exercise.distance} {exercise.distance_unit || 'km'}</div>
              )}
              {exercise.speed && (
                <div><span className="font-medium">Vitesse :</span> {exercise.speed} {exercise.speed_unit || 'km/h'}</div>
              )}
              {exercise.calories && (
                <div><span className="font-medium">Calories cibles :</span> {exercise.calories}</div>
              )}
              {(exercise.duration_minutes || exercise.duration_seconds) && (
                <div><span className="font-medium">Durée :</span> {exercise.duration_minutes || 0}:{(exercise.duration_seconds || 0).toString().padStart(2, '0')}</div>
              )}
            </>
          )}
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
        {/* Actions principales */}
        <div className="mt-6 flex gap-3">
          <button
            onClick={() => router.push(`/exercises/${id}/edit-exercise`)}
            className="flex-1 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Edit3 className="h-4 w-4" />
            Modifier l&apos;exercice
          </button>
          <button
            onClick={() => router.push(`/exercises/${id}/add-performance`)}
            className="flex-1 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-semibold transition-colors flex items-center justify-center gap-2"
          >
            <Plus className="h-4 w-4" />
            Nouvelle performance
          </button>
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
              {perfHistory.map((perf) => (
                <li key={perf.id} className="py-2 flex items-center justify-between group">
                  <div className="flex-1">
                    <div className="font-semibold">{getPerfLabel(perf, exercise?.exercise_type || 'Musculation', exercise?.sets ?? 1)}</div>
                    <div className="text-gray-400 text-xs">{new Date(perf.performed_at).toLocaleDateString()}</div>
                    {perf.notes && (
                      <div className="text-gray-600 text-xs italic mt-1">{perf.notes}</div>
                    )}
                  </div>
                  <div className="flex items-center gap-1 opacity-100 transition-opacity">
                    <button
                      onClick={() => router.push(`/exercises/${id}/edit-performance/${perf.id}`)}
                      className="p-1 text-blue-500 hover:text-blue-700 hover:bg-blue-50 rounded transition-colors"
                      title="Modifier cette performance"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => handleDeleteClick(perf)}
                      disabled={deletingPerf === perf.id}
                      className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 rounded transition-colors disabled:opacity-50"
                      title="Supprimer cette performance"
                    >
                      {deletingPerf === perf.id ? (
                        <div className="w-4 h-4 border-2 border-red-300 border-t-red-500 rounded-full animate-spin"></div>
                      ) : (
                        <Trash2 className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </motion.div>

      {/* Modal de confirmation de suppression */}
      <ConfirmationModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false)
          setPerfToDelete(null)
        }}
        onConfirm={confirmDelete}
        title="Supprimer cette performance ?"
        message={`Cette action supprimera définitivement la performance "${perfToDelete ? getPerfLabel(perfToDelete, exercise?.exercise_type || 'Musculation', exercise?.sets ?? 1) : ''}" du ${perfToDelete ? new Date(perfToDelete.performed_at).toLocaleDateString() : ''}.`}
        confirmText="Supprimer"
        cancelText="Annuler"
        type="danger"
        loading={!!deletingPerf}
      />
    </div>
  )
} 