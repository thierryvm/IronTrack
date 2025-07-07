"use client"
import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { Calendar, Save } from 'lucide-react'
import { createClient } from '@/lib/supabase'

export default function NewWorkoutPage() {
  const [name, setName] = useState('')
  const [date, setDate] = useState('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(false)
  const [toast, setToast] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Utilisateur non connecté')
      const { error } = await supabase.from('workouts').insert({
        user_id: user.id,
        name,
        scheduled_date: date,
        notes
      })
      if (error) throw error
      setToast('Séance créée avec succès ! Redirection vers le calendrier...')
      setTimeout(() => {
        setToast(null)
        router.push('/calendar')
      }, 2000)
    } catch (err: any) {
      alert("Erreur lors de l'enregistrement : " + (err.message || err))
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
      </motion.form>
    </div>
  )
} 