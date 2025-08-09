'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { ArrowLeft, Save, X, Dumbbell, Target, Activity, Calendar, AlertCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { FormField2025 } from '@/components/ui/FormField2025'
import { Input2025 } from '@/components/ui/Input2025'
import { Button2025 } from '@/components/ui/Button2025'
import { Textarea2025 } from '@/components/ui/Textarea2025'

interface PerformanceEditForm2025Props {
  performanceId: string
  exerciseId: string
}

interface PerformanceData {
  exercise_name: string
  exercise_type: 'Musculation' | 'Cardio' | 'Fitness' | 'Étirement'
  performed_at: string
  
  // Musculation
  weight?: number
  reps?: number
  set_number?: number
  
  // Cardio général
  duration?: number // en secondes
  distance?: number
  distance_unit?: string
  speed?: number
  calories?: number
  
  // Cardio avancé
  stroke_rate?: number // SPM pour rameur
  watts?: number // watts pour rameur
  heart_rate?: number // BPM
  incline?: number // % pour tapis
  cadence?: number // RPM pour vélo
  resistance?: number // niveau pour vélo
  
  notes?: string
}

export const PerformanceEditForm2025: React.FC<PerformanceEditForm2025Props> = ({ 
  performanceId, 
  exerciseId 
}) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [performance, setPerformance] = useState<PerformanceData | null>(null)
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    const fetchPerformance = async () => {
      try {
        const supabase = createClient()
        
        // Récupérer la performance avec l'exercice associé
        const { data, error } = await supabase
          .from('performance_logs')
          .select(`
            *,
            exercises!inner(name, exercise_type)
          `)
          .eq('id', performanceId)
          .single()

        if (error) throw error

        // Formater les données
        const formattedPerformance: PerformanceData = {
          exercise_name: data.exercises.name,
          exercise_type: data.exercises.exercise_type,
          performed_at: data.performed_at,
          weight: data.weight,
          reps: data.reps,
          set_number: data.set_number,
          duration: data.duration,
          distance: data.distance,
          distance_unit: data.distance_unit,
          speed: data.speed,
          calories: data.calories,
          stroke_rate: data.stroke_rate,
          watts: data.watts,
          heart_rate: data.heart_rate,
          incline: data.incline,
          cadence: data.cadence,
          resistance: data.resistance,
          notes: data.notes
        }

        setPerformance(formattedPerformance)

      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        toast.error('Erreur lors du chargement de la performance')
        router.push(`/exercises`)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformance()
  }, [performanceId, exerciseId, router])

  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {}

    if (performance?.exercise_type === 'Musculation') {
      if (!performance.weight || performance.weight <= 0) {
        newErrors.weight = 'Le poids est requis et doit être supérieur à 0'
      }
      if (!performance.reps || performance.reps <= 0) {
        newErrors.reps = 'Le nombre de répétitions est requis'
      }
    } else if (performance?.exercise_type === 'Cardio') {
      if (!performance.duration || performance.duration <= 0) {
        newErrors.duration = 'La durée est requise'
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = async () => {
    if (!performance || !validateForm()) return

    setSaving(true)
    
    try {
      const supabase = createClient()

      // Préparer les données pour la mise à jour
      const updateData: any = {
        performed_at: performance.performed_at,
        notes: performance.notes?.trim() || null,
        updated_at: new Date().toISOString()
      }

      // Ajouter les champs selon le type d'exercice
      if (performance.exercise_type === 'Musculation') {
        updateData.weight = performance.weight
        updateData.reps = performance.reps
        updateData.set_number = performance.set_number
      } else if (performance.exercise_type === 'Cardio') {
        updateData.duration = performance.duration
        updateData.distance = performance.distance
        updateData.distance_unit = performance.distance_unit
        updateData.speed = performance.speed
        updateData.calories = performance.calories
        updateData.stroke_rate = performance.stroke_rate
        updateData.watts = performance.watts
        updateData.heart_rate = performance.heart_rate
        updateData.incline = performance.incline
        updateData.cadence = performance.cadence
        updateData.resistance = performance.resistance
      }

      // Mettre à jour la performance
      const { error } = await supabase
        .from('performance_logs')
        .update(updateData)
        .eq('id', performanceId)

      if (error) throw error

      toast.success('Performance mise à jour avec succès')
      router.push('/exercises')

    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      toast.error('Erreur lors de la sauvegarde')
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    router.push(`/exercises`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <motion.div
          animate={{ rotate: 360 }}
          transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
          className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full"
        />
      </div>
    )
  }

  if (!performance) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="mx-auto h-12 w-12 text-red-500 mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Performance introuvable</h2>
          <p className="text-gray-600 mb-4">La performance demandée n'existe pas ou a été supprimée.</p>
          <Button2025 onClick={() => router.push('/exercises')}>
            Retour aux exercices
          </Button2025>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white border-b border-gray-200 sticky top-0 z-10"
      >
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <Button2025
                variant="ghost"
                size="icon"
                onClick={handleCancel}
                className="text-gray-400 hover:text-gray-600"
              >
                <ArrowLeft className="h-5 w-5" />
              </Button2025>
              <div>
                <h1 className="text-xl font-semibold text-gray-900 flex items-center gap-2">
                  {performance.exercise_type === 'Musculation' ? (
                    <Dumbbell className="h-5 w-5 text-orange-800" />
                  ) : (
                    <Activity className="h-5 w-5 text-orange-800" />
                  )}
                  Modifier la performance
                </h1>
                <p className="text-sm text-gray-500">{performance.exercise_name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button2025
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                icon={<X className="h-4 w-4" />}
              >
                Annuler
              </Button2025>
              <Button2025
                onClick={handleSave}
                loading={saving}
                icon={<Save className="h-4 w-4" />}
              >
                Enregistrer
              </Button2025>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Content */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
          
          {/* Form Content */}
          <div className="p-6 space-y-6">
            
            {/* Date et temps */}
            <div className="border-b border-gray-200 pb-6">
              <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-orange-800" />
                Date de la performance
              </h3>
              
              <FormField2025 label="Date et heure">
                <Input2025
                  type="datetime-local"
                  value={performance.performed_at ? new Date(performance.performed_at).toISOString().slice(0, 16) : ''}
                  onChange={(e) => setPerformance({
                    ...performance, 
                    performed_at: new Date(e.target.value).toISOString()
                  })}
                />
              </FormField2025>
            </div>

            {/* Métriques selon le type */}
            <div className="space-y-6">
              <h3 className="text-lg font-medium text-gray-900 flex items-center gap-2">
                {performance.exercise_type === 'Musculation' ? (
                  <Dumbbell className="h-5 w-5 text-orange-800" />
                ) : (
                  <Target className="h-5 w-5 text-orange-800" />
                )}
                Métriques de performance
              </h3>

              {performance.exercise_type === 'Musculation' ? (
                // Formulaire Musculation
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <FormField2025
                    label="Poids (kg)"
                    required
                    error={errors.weight}
                  >
                    <Input2025
                      type="number"
                      min="0"
                      step="0.5"
                      value={performance.weight || ''}
                      onChange={(e) => setPerformance({
                        ...performance, 
                        weight: Number(e.target.value)
                      })}
                      placeholder="60"
                      isError={!!errors.weight}
                    />
                  </FormField2025>

                  <FormField2025
                    label="Répétitions"
                    required
                    error={errors.reps}
                  >
                    <Input2025
                      type="number"
                      min="1"
                      value={performance.reps || ''}
                      onChange={(e) => setPerformance({
                        ...performance, 
                        reps: Number(e.target.value)
                      })}
                      placeholder="10"
                      isError={!!errors.reps}
                    />
                  </FormField2025>

                  <FormField2025 label="Nombre de séries">
                    <Input2025
                      type="number"
                      min="1"
                      value={performance.set_number || ''}
                      onChange={(e) => setPerformance({
                        ...performance, 
                        set_number: Number(e.target.value)
                      })}
                      placeholder="3"
                    />
                  </FormField2025>
                </div>
              ) : (
                // Formulaire Cardio
                <div className="space-y-6">
                  {/* Métriques de base */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField2025
                      label="Durée (minutes)"
                      required
                      error={errors.duration}
                    >
                      <Input2025
                        type="number"
                        min="0"
                        step="0.1"
                        value={performance.duration ? Math.round(performance.duration / 60 * 10) / 10 : ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          duration: Math.round(Number(e.target.value) * 60)
                        })}
                        placeholder="30"
                        isError={!!errors.duration}
                      />
                    </FormField2025>

                    <FormField2025 label="Distance">
                      <div className="flex gap-2">
                        <Input2025
                          type="number"
                          min="0"
                          step="0.1"
                          value={performance.distance || ''}
                          onChange={(e) => setPerformance({
                            ...performance, 
                            distance: Number(e.target.value)
                          })}
                          placeholder="5"
                          className="flex-1"
                        />
                        <select
                          value={performance.distance_unit || 'km'}
                          onChange={(e) => setPerformance({
                            ...performance, 
                            distance_unit: e.target.value
                          })}
                          className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                        >
                          <option value="km">km</option>
                          <option value="m">m</option>
                          <option value="miles">miles</option>
                        </select>
                      </div>
                    </FormField2025>
                  </div>

                  {/* Métriques avancées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <FormField2025 label="Vitesse (km/h)">
                      <Input2025
                        type="number"
                        min="0"
                        step="0.1"
                        value={performance.speed || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          speed: Number(e.target.value)
                        })}
                        placeholder="12"
                      />
                    </FormField2025>

                    <FormField2025 label="Calories">
                      <Input2025
                        type="number"
                        min="0"
                        value={performance.calories || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          calories: Number(e.target.value)
                        })}
                        placeholder="300"
                      />
                    </FormField2025>

                    <FormField2025 label="Fréquence cardiaque (BPM)">
                      <Input2025
                        type="number"
                        min="60"
                        max="200"
                        value={performance.heart_rate || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          heart_rate: Number(e.target.value)
                        })}
                        placeholder="150"
                      />
                    </FormField2025>
                  </div>

                  {/* Métriques spécialisées */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <FormField2025 label="Cadence rameur (SPM)">
                      <Input2025
                        type="number"
                        min="16"
                        max="36"
                        value={performance.stroke_rate || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          stroke_rate: Number(e.target.value)
                        })}
                        placeholder="28"
                      />
                    </FormField2025>

                    <FormField2025 label="Puissance (watts)">
                      <Input2025
                        type="number"
                        min="50"
                        max="500"
                        value={performance.watts || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          watts: Number(e.target.value)
                        })}
                        placeholder="180"
                      />
                    </FormField2025>

                    <FormField2025 label="Inclinaison (%)">
                      <Input2025
                        type="number"
                        min="0"
                        max="15"
                        step="0.1"
                        value={performance.incline || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          incline: Number(e.target.value)
                        })}
                        placeholder="3"
                      />
                    </FormField2025>

                    <FormField2025 label="Cadence vélo (RPM)">
                      <Input2025
                        type="number"
                        min="50"
                        max="120"
                        value={performance.cadence || ''}
                        onChange={(e) => setPerformance({
                          ...performance, 
                          cadence: Number(e.target.value)
                        })}
                        placeholder="85"
                      />
                    </FormField2025>
                  </div>
                </div>
              )}

              {/* Notes */}
              <FormField2025 label="Notes">
                <Textarea2025
                  value={performance.notes || ''}
                  onChange={(e) => setPerformance({
                    ...performance, 
                    notes: e.target.value
                  })}
                  placeholder="Notes sur cette performance, ressenti, observations..."
                  autoResize
                  rows={3}
                />
              </FormField2025>
            </div>
          </div>

          {/* Footer Actions */}
          <div className="bg-gray-50 px-6 py-4 border-t border-gray-200">
            <div className="flex flex-col sm:flex-row gap-3 sm:justify-end">
              <Button2025
                variant="outline"
                onClick={handleCancel}
                disabled={saving}
                fullWidth
                className="sm:w-auto"
              >
                Annuler
              </Button2025>
              <Button2025
                onClick={handleSave}
                loading={saving}
                fullWidth
                className="sm:w-auto"
              >
                {saving ? 'Enregistrement...' : 'Enregistrer les modifications'}
              </Button2025>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}