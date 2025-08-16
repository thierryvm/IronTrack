'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Target, AlertCircle, CheckCircle } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { toast } from 'react-hot-toast'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'
import { SecureAttachment } from '@/utils/fileUpload'
import { mapDifficultyFromNumber, mapDifficultyToNumber, type DifficultyString } from '@/utils/difficultyMapping'
import { Button2025 } from '@/components/ui/Button2025'
import { validateExerciseClientSide, validateExerciseUpdateData, type ExerciseUpdateData } from '@/utils/exerciseValidation'

interface ExerciseEditForm2025Props {
  exerciseId: string
}

interface ExerciseData {
  name: string
  exercise_type: 'Musculation' | 'Cardio'
  muscle_group: string
  equipment_id: number
  difficulty: DifficultyString
  description?: string
  image_url?: string
  notes?: string // Notes from latest performance (read-only)
}


export const ExerciseEditForm2025Fixed: React.FC<ExerciseEditForm2025Props> = ({ exerciseId }) => {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [exercise, setExercise] = useState<ExerciseData | null>(null)
  const [exercisePhoto, setExercisePhoto] = useState<SecureAttachment | null>(null)
  
  // 🔧 FIX IMAGE BUG: Gestion robuste état image
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | null>(null)
  const [imageLoadError, setImageLoadError] = useState<string | null>(null)
  const [imageDebugInfo, setImageDebugInfo] = useState<Record<string, unknown>>({})

  // 🔧 FIX: useEffect avec gestion d'erreur robuste
  useEffect(() => {
    const fetchData = async () => {
      try {
        console.log('🔧 ExerciseEditForm2025Fixed - Starting fetchData for:', exerciseId)
        
        const supabase = createClient()
        
        // Récupérer l'exercice
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('exercises')
          .select('*')
          .eq('id', exerciseId)
          .single()

        if (exerciseError) {
          console.error('🔧 Erreur base de données:', exerciseError)
          if (exerciseError.code === 'PGRST116' || exerciseError.message?.includes('No rows')) {
            toast.error(`Exercice ${exerciseId} non trouvé`)
            router.push('/exercises')
            return
          }
          throw exerciseError
        }

        console.log('🔧 ExerciseData récupérée:', {
          id: exerciseData.id,
          name: exerciseData.name,
          image_url: exerciseData.image_url,
          hasImage: !!exerciseData.image_url
        })

        // Récupérer les notes de la dernière performance
        const { data: latestPerformanceData } = await supabase
          .from('performance_logs')
          .select('notes')
          .eq('exercise_id', exerciseId)
          .order('performed_at', { ascending: false })
          .limit(1)
        
        const latestPerformance = latestPerformanceData?.[0] || null


        // Format des données
        const formattedExercise: ExerciseData = {
          name: exerciseData.name || '',
          exercise_type: exerciseData.exercise_type || 'Musculation',
          muscle_group: exerciseData.muscle_group || '',
          equipment_id: exerciseData.equipment_id || 1,
          difficulty: typeof exerciseData.difficulty === 'number' 
            ? mapDifficultyFromNumber(exerciseData.difficulty)
            : (exerciseData.difficulty as DifficultyString) || 'Débutant',
          description: exerciseData.description || '',
          image_url: exerciseData.image_url,
          notes: latestPerformance?.notes || ''
        }

        setExercise(formattedExercise)
        
        // 🔧 FIX IMAGE BUG: Gestion robuste de l'image
        const imageUrl = exerciseData.image_url
        console.log('🔧 Processing image_url:', {
          rawValue: imageUrl,
          type: typeof imageUrl,
          length: imageUrl?.length,
          isValid: !!(imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0)
        })

        if (imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0) {
          // Validation de l'URL
          try {
            const url = new URL(imageUrl)
            console.log('🔧 Valid URL detected:', {
              protocol: url.protocol,
              hostname: url.hostname,
              pathname: url.pathname
            })
            
            // Test de l'accessibilité de l'image
            const testResponse = await fetch(imageUrl, { method: 'HEAD' })
            if (testResponse.ok) {
              setCurrentPhotoUrl(imageUrl)
              setImageLoadError(null)
              console.log('✅ Image accessible, URL définie:', imageUrl)
            } else {
              console.error('❌ Image non accessible:', testResponse.status)
              setImageLoadError(`Image non accessible (${testResponse.status})`)
              setCurrentPhotoUrl(null)
            }
          } catch (urlError) {
            console.error('❌ URL invalide:', urlError)
            setImageLoadError('URL invalide')
            setCurrentPhotoUrl(null)
          }
        } else {
          console.log('🔧 Aucune image ou URL invalide')
          setCurrentPhotoUrl(null)
          setImageLoadError(null)
        }

        // Debug info complet
        setImageDebugInfo({
          exerciseId,
          rawImageUrl: imageUrl,
          processedUrl: imageUrl,
          finalState: imageUrl && typeof imageUrl === 'string' && imageUrl.length > 0 ? imageUrl : null,
          timestamp: new Date().toISOString()
        })

      } catch (error) {
        console.error('🔧 Erreur lors du chargement:', error)
        toast.error('Erreur lors du chargement de l\'exercice')
        setImageLoadError('Erreur de chargement')
        router.push('/exercises')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [exerciseId, router])

  // 🔧 FIX: Handlers pour photos avec gestion d'erreur
  const handlePhotoUploaded = (attachment: SecureAttachment) => {
    console.log('🔧 Photo uploaded:', attachment)
    setExercisePhoto(attachment)
    if (attachment.url) {
      setCurrentPhotoUrl(attachment.url)
      setImageLoadError(null)
    }
  }

  const handlePhotoRemoved = () => {
    console.log('🔧 Photo removed')
    setExercisePhoto(null)
    setCurrentPhotoUrl(null)
    setImageLoadError(null)
  }

  // Sauvegarde de l'exercice (simplifiée pour test)
  const handleSave = async () => {
    toast.success('Version Fixed - Image debug terminé')
    router.push('/exercises')
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex flex-col items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-600"></div>
          <p className="mt-4 text-gray-600">Chargement de l'exercice...</p>
        </div>
      </div>
    )
  }

  if (!exercise) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Exercice non trouvé</h2>
          <button 
            onClick={() => router.push('/exercises')}
            className="text-orange-600 hover:text-orange-700"
          >
            Retour aux exercices
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header avec navigation */}
      <div className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 hover:text-gray-900 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Retour
            </button>
            <h1 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-600" />
              Modifier l'exercice
            </h1>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <form className="space-y-8">
          
          {/* 🔧 DEBUG INFO */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-lg font-medium text-blue-900 mb-3">🔧 Debug Image Info</h3>
            <div className="text-sm text-blue-800 space-y-1">
              <div><strong>Current Photo URL:</strong> {currentPhotoUrl || 'null'}</div>
              <div><strong>Has Image:</strong> {String(!!currentPhotoUrl)}</div>
              <div><strong>Image Error:</strong> {imageLoadError || 'none'}</div>
              <div><strong>Debug Info:</strong></div>
              <pre className="text-xs bg-blue-100 p-2 rounded overflow-auto">
                {JSON.stringify(imageDebugInfo, null, 2)}
              </pre>
            </div>
          </div>

          {/* Photo de l'exercice */}
          <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4 flex items-center gap-2">
              <Target className="h-5 w-5 text-orange-800" />
              Photo de l'exercice
            </h3>
            <ExercisePhotoUpload
              currentPhoto={currentPhotoUrl || undefined}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
              disabled={saving}
            />
            {imageLoadError && (
              <div className="mt-2 text-sm text-red-600 bg-red-50 p-2 rounded">
                ⚠️ {imageLoadError}
              </div>
            )}
          </div>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row gap-4 pt-6">
            <Button2025
              type="button"
              variant="secondary"
              onClick={() => router.back()}
              disabled={saving}
              className="flex-1 sm:flex-none"
            >
              Annuler
            </Button2025>
            <Button2025
              type="button"
              onClick={handleSave}
              disabled={saving}
              className="flex-1 bg-orange-600 hover:bg-orange-700 text-white"
            >
              {saving ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Sauvegarde...
                </div>
              ) : (
                <div className="flex items-center">
                  <CheckCircle className="h-4 w-4 mr-2" />
                  Sauvegarder
                </div>
              )}
            </Button2025>
          </div>
        </form>
      </div>
    </div>
  )
}