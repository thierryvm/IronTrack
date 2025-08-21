'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { OnboardingFlow } from './OnboardingFlow'
import { LoadingState } from './LoadingState'
import type { OnboardingData } from './OnboardingFlow'

interface OnboardingWrapperProps {
  onComplete: (data: OnboardingData) => void
}

export function OnboardingWrapper({ onComplete }: OnboardingWrapperProps) {
  const [existingData, setExistingData] = useState<Partial<OnboardingData>>({})
  const [loading, setLoading] = useState(true)
  const [isReturningUser, setIsReturningUser] = useState(false)

  useEffect(() => {
    loadExistingData()
  }, [])

  const loadExistingData = async () => {
    try {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (!user) return

      const { data, error } = await supabase
        .from('profiles')
        .select('goal, experience, frequency, availability')
        .eq('id', user.id)
        .single()

      if (error) {
        console.error('Erreur chargement profil:', error)
        return
      }

      // Vérifier si l'utilisateur a déjà des données
      const hasExistingData = data?.goal || data?.experience
      setIsReturningUser(hasExistingData)

      if (hasExistingData) {
        setExistingData({
          goal: data.goal,
          experience: data.experience,
          frequency: data.frequency,
          availability: data.availability
        })
      }
    } catch (error) {
      console.error('Erreur lors du chargement des données:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <LoadingState message="Chargement de votre profil..." />
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-4">
      {isReturningUser ? (
        <div className="w-full max-w-2xl">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 rounded-xl shadow-xl p-8 text-center mb-6">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-green-500 to-blue-600 rounded-full mb-4">
              <span className="text-2xl">👋</span>
            </div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-2">
              Bon retour sur IronTrack !
            </h2>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Vous avez déjà un profil configuré. Souhaitez-vous le mettre à jour ?
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-lg">
                <h3 className="font-semibold text-gray-800 dark:text-gray-200 mb-2">Profil actuel</h3>
                <div className="text-sm text-gray-600 dark:text-gray-300 space-y-1">
                  <p><strong>Objectif:</strong> {existingData.goal || 'Non défini'}</p>
                  <p><strong>Expérience:</strong> {existingData.experience || 'Non définie'}</p>
                  <p><strong>Fréquence:</strong> {existingData.frequency || 'Non définie'}</p>
                  <p><strong>Disponibilité:</strong> {existingData.availability ? `${existingData.availability}min` : 'Non définie'}</p>
                </div>
              </div>
              
              <div className="bg-blue-50 p-4 rounded-lg">
                <h3 className="font-semibold text-blue-800 mb-2">Mise à jour</h3>
                <p className="text-sm text-blue-700">
                  Complétez uniquement les champs manquants sans écraser vos données existantes.
                </p>
              </div>
            </div>

            <div className="flex gap-4 justify-center">
              <button
                onClick={() => window.location.href = '/'}
                className="px-6 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:bg-gray-800 transition-colors"
              >
                Garder mon profil actuel
              </button>
              <button
                onClick={() => setIsReturningUser(false)}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Compléter mon profil
              </button>
            </div>
          </div>
        </div>
      ) : (
        <OnboardingFlow onComplete={onComplete} initialData={existingData} />
      )}
    </div>
  )
}