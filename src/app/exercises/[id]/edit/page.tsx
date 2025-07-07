"use client"
import { useEffect, useState } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { motion } from 'framer-motion'
import { Dumbbell, Save, ArrowLeft, Trophy, Pencil, Check, X, Trash2 } from 'lucide-react'
import { createClient } from '@/lib/supabase'

const muscleGroups = [
  'Pectoraux', 'Dos', 'Épaules', 'Biceps', 'Triceps', 'Jambes', 'Abdominaux', 'Fessiers'
]
const difficulties = ['Débutant', 'Intermédiaire', 'Avancé']

export default function EditExercisePage() {
  const router = useRouter()
  const params = useParams()
  const id = params.id
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [name, setName] = useState('')
  const [muscle, setMuscle] = useState(muscleGroups[0])
  const [equipmentId, setEquipmentId] = useState<number | null>(null)
  const [equipmentList, setEquipmentList] = useState<{id: number, name: string}[]>([])
  const [difficulty, setDifficulty] = useState(difficulties[0])
  const [newEquipment, setNewEquipment] = useState('')
  const [newEquipmentDescription, setNewEquipmentDescription] = useState('')
  const [addingEquipment, setAddingEquipment] = useState(false)
  const [perfWeight, setPerfWeight] = useState('')
  const [perfReps, setPerfReps] = useState('')
  const [perfLoading, setPerfLoading] = useState(false)
  const [perfSuccess, setPerfSuccess] = useState('')
  const [perfHistory, setPerfHistory] = useState<any[]>([])
  const [lastPerf, setLastPerf] = useState<any | null>(null)
  const [editPerfId, setEditPerfId] = useState<number | null>(null)
  const [editWeight, setEditWeight] = useState('')
  const [editReps, setEditReps] = useState('')
  const [perfError, setPerfError] = useState('')
  const [sets, setSets] = useState(3)

  useEffect(() => {
    const fetchEquipment = async () => {
      const supabase = createClient()
      const { data, error } = await supabase.from('equipment').select('id, name')
      if (!error && data) setEquipmentList(data)
    }
    fetchEquipment()
  }, [])

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
        setEquipmentId(data.equipment_id || null)
        setDifficulty(data.difficulty || difficulties[0])
        setSets(data.sets || 3)
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    const supabase = createClient()
    const { error } = await supabase
      .from('exercises')
      .update({
        name,
        muscle_group: muscle,
        equipment_id: equipmentId,
        difficulty,
        sets
      })
      .eq('id', id)
    setSaving(false)
    if (error) {
      alert("Erreur lors de la sauvegarde : " + error.message)
      return
    }
    router.push('/exercises')
  }

  const handleAddEquipment = async () => {
    if (!newEquipment.trim()) return
    setAddingEquipment(true)
    const supabase = createClient()
    const description = newEquipmentDescription.trim() || `Équipement ajouté par l'utilisateur`
    const { data, error } = await supabase.from('equipment').insert({ name: newEquipment.trim(), description }).select('id, name, description').single()
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

  const handleAddPerf = async () => {
    if (!perfReps) return
    setPerfLoading(true)
    setPerfSuccess('')
    const supabase = createClient()
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    if (userError || !user) {
      alert("Utilisateur non connecté !")
      setPerfLoading(false)
      return
    }
    const { error } = await supabase.from('performance_logs').insert({
      user_id: user.id,
      exercise_id: id,
      reps: Number(perfReps),
      weight: perfWeight ? Number(perfWeight) : 0,
      performed_at: new Date().toISOString()
    })
    setPerfLoading(false)
    if (!error) {
      setPerfSuccess('Performance ajoutée !')
      setPerfWeight('')
      setPerfReps('')
      setTimeout(() => setPerfSuccess(''), 2000)
    } else {
      alert("Erreur lors de l'ajout de la performance : " + error.message)
    }
  }

  const handleEditPerf = (perf: any) => {
    setEditPerfId(perf.id)
    setEditWeight(perf.weight)
    setEditReps(perf.reps)
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
        <button
          type="button"
          onClick={() => router.back()}
          className="flex items-center space-x-2 text-orange-600 hover:text-orange-800 font-semibold mb-4"
        >
          <ArrowLeft className="h-5 w-5" />
          <span>Retour</span>
        </button>
        <div className="flex items-center space-x-3 mb-6">
          <Dumbbell className="h-8 w-8 text-orange-500" />
          <h1 className="text-2xl font-bold text-gray-900">Modifier l&apos;exercice</h1>
        </div>
        <div>
          <label className="block text-gray-700 font-medium mb-2">Nom de l&apos;exercice</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)} required className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:ring-2 focus:ring-orange-500" />
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
        {/* SECTION PERFORMANCES */}
        <div className="bg-gray-50 rounded-lg p-4 mb-4">
          <div className="flex items-center gap-2 mb-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            <span className="font-semibold text-gray-800">Performances</span>
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
            <button type="button" onClick={handleAddPerf} disabled={perfLoading} className="bg-orange-500 hover:bg-orange-600 text-white font-semibold px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
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
                      <span className="font-semibold">{perf.weight === 0 ? 'Poids du corps' : perf.weight + ' kg'} x {perf.reps} reps x {sets} séries</span>
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
        <button type="submit" disabled={saving} className="w-full bg-orange-500 hover:bg-orange-600 text-white font-semibold py-3 rounded-lg flex items-center justify-center space-x-2 transition-colors">
          <Save className="h-5 w-5 mr-2" />
          <span>{saving ? 'Enregistrement...' : 'Enregistrer'}</span>
        </button>
      </motion.form>
    </div>
  )
} 