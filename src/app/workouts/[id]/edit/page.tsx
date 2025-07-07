"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Save, ArrowLeft } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function EditWorkoutPage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id

  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)

  // Charger les vraies données depuis Supabase
  useEffect(() => {
    const fetchWorkout = async () => {
      const supabase = createClient();
      const { data, error } = await supabase
        .from('workouts')
        .select('*')
        .eq('id', id)
        .single();
      if (data) {
        setName(data.name || '')
        setDate(data.scheduled_date ? data.scheduled_date : '')
        setNotes(data.notes || '')
      }
    };
    if (id) fetchWorkout();
  }, [id]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    const supabase = createClient();
    await supabase
      .from('workouts')
      .update({
        name,
        scheduled_date: date,
        notes
      })
      .eq('id', id);
    setLoading(false)
    router.push('/workouts')
  }

  const handleDelete = async () => {
    if (!confirm('Es-tu sûr de vouloir supprimer cette séance ?')) return;
    setLoading(true);
    const supabase = createClient();
    await supabase
      .from('workouts')
      .delete()
      .eq('id', id);
    setLoading(false);
    router.push('/workouts');
  }

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <motion.form
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        onSubmit={handleSubmit}
        className="bg-white rounded-xl shadow-lg p-8 w-full max-w-lg space-y-6"
      >
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-semibold mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>
        <div className="flex items-center space-x-3 mb-6">
          <Calendar className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Modifier la séance</h1>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nom de la séance</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Date</label>
          <input type="date" value={date} onChange={e => setDate(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
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
          onClick={handleDelete}
          disabled={loading}
          className="w-full mt-2 bg-red-500 hover:bg-red-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors"
        >
          <span>🗑️ Supprimer la séance</span>
        </button>
      </motion.form>
    </div>
  )
} 