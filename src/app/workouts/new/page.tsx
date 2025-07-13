"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Save, AlertTriangle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Mascot from '@/components/ui/Mascot'

export default function NewWorkoutPage() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const [duration, setDuration] = useState<number | ''>('')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)
  const [mascotMsg, setMascotMsg] = useState<string | null>(null)
  const [mascotType, setMascotType] = useState<'motivation' | 'success' | 'warning' | 'info'>('motivation')
  const [showMascot, setShowMascot] = useState(false)
  const [startTime, setStartTime] = useState('');
  const [type, setType] = useState<'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates'>('Musculation');
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg(null)
    if (!name.trim()) {
      setErrorMsg("Pas de nom, pas de muscles ! Donne un nom à ta séance.")
      setMascotMsg("Thierry, même Rocky n'a jamais oublié de nommer ses séances !")
      setMascotType('warning')
      setShowMascot(true)
      return
    }
    if (!date) {
      setErrorMsg("Sans date, ta séance va se perdre dans l'espace-temps...")
      setMascotMsg("Thierry, même Marty McFly note ses dates d'entraînement !")
      setMascotType('warning')
      setShowMascot(true)
      return
    }
    // Vérification de la durée seulement si ce n'est pas un jour de repos
    if (type !== 'Repos' && Number(duration) <= 0) {
      setErrorMsg("La durée doit être supérieure à 0 min. Même Hulk ne fait pas des séances de 0 minute !")
      setMascotMsg("Thierry, Hulk casse tout, mais il fait au moins 1 minute !")
      setMascotType('warning')
      setShowMascot(true)
      return
    }
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')
      // Données de base pour l'insertion
      const insertData = {
        user_id: user.id,
        name,
        scheduled_date: date,
        start_time: startTime || null,
        notes: notes || null,
        duration: (type === 'Repos' || duration === '') ? null : Number(duration)
      };

      const { data: newWorkout, error } = await supabase
        .from('workouts')
        .insert(insertData)
        .select()
        .single();

      if (error) throw error;

      // Mettre à jour le type si la colonne existe et ce n'est pas Musculation
      if (newWorkout && type !== 'Musculation') {
        const { error: updateError } = await supabase
          .from('workouts')
          .update({ type: type })
          .eq('id', newWorkout.id);
        
        // Ignorer l'erreur de type si la colonne n'existe pas encore
        if (updateError && !updateError.message.includes('column "type" does not exist')) {
          console.warn('Erreur mise à jour type:', updateError);
        }
      }
      setToast('Séance créée avec succès ! Redirection vers le calendrier...')
      setMascotMsg("Bravo Thierry ! Tu viens de muscler ton futur. 🏆")
      setMascotType('success')
      setShowMascot(true)
      setTimeout(() => {
        setToast(null)
        router.push('/calendar')
      }, 2000)
    } catch (err: unknown) {
      console.error('Erreur détaillée:', err);
      if (err instanceof Error) {
        setErrorMsg(`Erreur lors de l'enregistrement : ${err.message}`)
        setMascotMsg(`Oups Thierry ! Problème technique : ${err.message}`)
      } else {
        setErrorMsg("Erreur lors de l'enregistrement inconnue")
        setMascotMsg("Oups Thierry ! Problème technique mystérieux...")
      }
      setMascotType('warning')
      setShowMascot(true)
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      {toast && (
        <div className="fixed top-6 left-1/2 transform -translate-x-1/2 bg-green-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 font-semibold">
          {toast}
        </div>
      )}
      {errorMsg && (
        <motion.div
          initial={{ x: -10 }}
          animate={{ x: [0, -10, 10, -10, 10, 0] }}
          transition={{ duration: 0.5 }}
          className="flex items-center justify-center bg-red-200 text-red-800 px-4 py-3 rounded-lg mb-4 text-lg font-bold shadow-lg border-2 border-red-400"
          style={{ zIndex: 10 }}
        >
          <AlertTriangle className="mr-2 h-6 w-6 text-red-600 animate-bounce" />
          {errorMsg}
        </motion.div>
      )}
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg space-y-6"
      >
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Nouvelle séance</h1>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nom de la séance</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Type de séance</label>
          <select 
            value={type} 
            onChange={e => {
              const newType = e.target.value as 'Musculation' | 'Cardio' | 'Étirement' | 'Repos' | 'Cours collectif' | 'Gainage' | 'Natation' | 'Crossfit' | 'Yoga' | 'Pilates';
              setType(newType);
              if (newType === 'Repos') {
                setDuration('');
              }
            }} 
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
          >
            <option value="Musculation">💪 Musculation</option>
            <option value="Cardio">❤️ Cardio</option>
            <option value="Étirement">🧘 Étirement</option>
            <option value="Cours collectif">👥 Cours collectif</option>
            <option value="Gainage">🎯 Gainage</option>
            <option value="Natation">🏊 Natation</option>
            <option value="Crossfit">⚡ Crossfit</option>
            <option value="Yoga">🕉️ Yoga</option>
            <option value="Pilates">🤸 Pilates</option>
            <option value="Repos">😴 Jour de repos</option>
          </select>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Heure prévue</label>
          <input
            type="time"
            value={startTime}
            onChange={e => setStartTime(e.target.value)}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            placeholder="Ex: 18:00"
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">
            Durée (minutes) {type === 'Repos' && <span className="text-sm text-gray-500">(optionnel pour les jours de repos)</span>}
          </label>
          <input
            type="number"
            min={0}
            value={duration}
            onChange={e => setDuration(e.target.value === '' ? '' : Math.max(0, Number(e.target.value)))}
            className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500"
            placeholder={type === 'Repos' ? 'Durée libre pour les jours de repos' : 'Ex: 30'}
            disabled={type === 'Repos'}
          />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Notes</label>
          <textarea value={notes} onChange={e => setNotes(e.target.value)} className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" rows={3} />
        </div>
        <button type="submit" disabled={loading} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <Save className="h-5 w-5 mr-2" />
          <span>{loading ? 'Enregistrement...' : 'Enregistrer'}</span>
        </button>
        <button
          type="button"
          onClick={() => router.back()}
          className="w-full mt-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          Annuler
        </button>
      </motion.form>
      <Mascot message={mascotMsg || undefined} type={mascotType} show={showMascot} onClose={() => setShowMascot(false)} />
    </div>
  )
} 