'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Save, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { safeJSONStringify } from '@/utils/json'
import { createClient } from '@/utils/supabase/client'

interface Profile {
  id: string
  pseudo: string | null
  full_name: string | null
  email: string
  avatar_url: string | null
}

interface Partnership {
  id: string
  requester_id: string
  partner_id: string
  status: 'pending' | 'accepted' | 'declined' | 'blocked'
  message: string | null
  created_at: string
  requester: Profile
  partner: Profile
}

interface SharingSettings {
  share_workouts: boolean
  share_nutrition: boolean
  share_progress: boolean
}

export default function PartnerSettingsPage({ params }: { params: Promise<{ id: string }> }) {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  const [resolvedParams, setResolvedParams] = useState<{ id: string } | null>(null)
  const [partnership, setPartnership] = useState<Partnership | null>(null)
  const [settings, setSettings] = useState<SharingSettings>({
    share_workouts: false,
    share_nutrition: false,
    share_progress: false
  })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
  } | null>(null)

  // Résoudre les paramètres
  useEffect(() => {
    params.then(setResolvedParams)
  }, [params])

  // Rediriger si non authentifié (attendre la fin du chargement)
  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth')
    }
  }, [isLoading, isAuthenticated, router])

  // Charger les données
  useEffect(() => {
    if (!resolvedParams?.id || !user) return

    const loadData = async () => {
      try {
        setLoading(true)

        // Récupérer le token d'authentification
        const supabase = createClient()
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session?.access_token) {
          throw new Error('Token d\'authentification manquant')
        }

        // Charger tous les partenariats de l'utilisateur
        const partnershipResponse = await fetch('/api/training-partners', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
        if (!partnershipResponse.ok) {
          throw new Error('Impossible de charger les partenariats')
        }
        const partnershipData = await partnershipResponse.json()
        
        // Trouver le partenariat spécifique
        const specificPartnership = partnershipData.partnerships.find(
          (p: Partnership) => p.id === resolvedParams.id
        )
        
        if (!specificPartnership) {
          throw new Error('Partenariat non trouvé')
        }
        
        setPartnership(specificPartnership)

        // Charger les paramètres de partage
        const settingsResponse = await fetch('/api/training-partners/sharing', {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`,
          },
        })
        if (settingsResponse.ok) {
          const settingsData = await settingsResponse.json()
          
          // Trouver les paramètres pour ce partenaire
          const partnerSettings = settingsData.settings.find(
            (s: SharingSettings & { partner_id: string }) => s.partner_id === (
              specificPartnership.requester_id === user.id 
                ? specificPartnership.partner_id 
                : specificPartnership.requester_id
            )
          )
          
          if (partnerSettings) {
            setSettings({
              share_workouts: partnerSettings.share_workouts,
              share_nutrition: partnerSettings.share_nutrition,
              share_progress: partnerSettings.share_progress
            })
          }
        }
      } catch (error) {
        console.error('Erreur lors du chargement:', error)
        setNotification({
          message: 'Impossible de charger les paramètres',
          type: 'error'
        })
      } finally {
        setLoading(false)
      }
    }

    loadData()
  }, [resolvedParams, user])

  const handleSettingChange = (setting: keyof SharingSettings, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      [setting]: value
    }))
  }

  const handleSave = async () => {
    if (!partnership || !user) return

    try {
      setSaving(true)
      
      // Récupérer le token d'authentification
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session?.access_token) {
        throw new Error('Token d\'authentification manquant')
      }
      
      const partnerId = partnership.requester_id === user.id 
        ? partnership.partner_id 
        : partnership.requester_id

      const response = await fetch('/api/training-partners/sharing', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`,
        },
        body: safeJSONStringify({
          partnerId,
          shareWorkouts: settings.share_workouts,
          shareNutrition: settings.share_nutrition,
          shareProgress: settings.share_progress
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la sauvegarde')
      }

      setNotification({
        message: 'Paramètres sauvegardés avec succès',
        type: 'success'
      })
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error)
      setNotification({
        message: 'Erreur lors de la sauvegarde',
        type: 'error'
      })
    } finally {
      setSaving(false)
    }
  }

  if (!isAuthenticated || isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
      </div>
    )
  }

  if (!partnership) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Partenariat non trouvé</h2>
          <button
            onClick={() => router.push('/training-partners')}
            className="text-indigo-600 hover:text-indigo-800"
          >
            Retour aux partenaires
          </button>
        </div>
      </div>
    )
  }

  const partner = partnership.requester_id === user?.id 
    ? partnership.partner 
    : partnership.requester

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/training-partners')}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:text-gray-200 mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Retour aux partenaires
          </button>
          
          <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">
            Paramètres de partage
          </h1>
          <p className="text-gray-600 dark:text-gray-300">
            Gérez ce que vous partagez avec{' '}
            <span className="font-semibold">
              {partner.pseudo || partner.full_name || partner.email}
            </span>
          </p>
        </div>

        {/* Notification */}
        {notification && (
          <div className={`mb-6 p-4 rounded-lg ${
            notification.type === 'success' ? 'bg-green-50 text-green-800' :
            notification.type === 'error' ? 'bg-red-50 text-red-800' :
            notification.type === 'warning' ? 'bg-yellow-50 text-yellow-800' :
            'bg-blue-50 text-blue-800'
          }`}>
            {notification.message}
          </div>
        )}

        {/* Settings Form */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-6">
            Données partagées
          </h2>

          <div className="space-y-6">
            {/* Workouts */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Entraînements
                </h3>
                <p className="text-sm text-gray-600 dark:text-safe-muted">
                  Partager vos séances d'entraînement et exercices
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.share_workouts}
                  onChange={(e) => handleSettingChange('share_workouts', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Nutrition */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Nutrition
                </h3>
                <p className="text-sm text-gray-600 dark:text-safe-muted">
                  Partager vos données nutritionnelles et repas
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.share_nutrition}
                  onChange={(e) => handleSettingChange('share_nutrition', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>

            {/* Progress */}
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-medium text-gray-900 dark:text-gray-100">
                  Progrès
                </h3>
                <p className="text-sm text-gray-600 dark:text-safe-muted">
                  Partager vos statistiques et évolution
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  className="sr-only peer"
                  checked={settings.share_progress}
                  onChange={(e) => handleSettingChange('share_progress', e.target.checked)}
                />
                <div className="w-11 h-6 bg-gray-200 dark:bg-gray-700 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white dark:border-gray-700 after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white dark:bg-gray-900 after:border-gray-300 dark:border-gray-600 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
              </label>
            </div>
          </div>

          {/* Save Button */}
          <div className="mt-8 flex justify-end">
            <button
              onClick={handleSave}
              disabled={saving}
              className="flex items-center gap-2 bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Save className="w-4 h-4" />
              )}
              {saving ? 'Sauvegarde...' : 'Sauvegarder'}
            </button>
          </div>
        </div>

        {/* Privacy Note */}
        <div className="mt-6 p-4 bg-blue-50 rounded-lg">
          <h3 className="text-sm font-medium text-blue-900 mb-2">
            Note sur la confidentialité
          </h3>
          <p className="text-sm text-blue-800">
            Ces paramètres contrôlent uniquement ce que vous partagez avec ce partenaire spécifique. 
            Vous pouvez modifier ces paramètres à tout moment.
          </p>
        </div>
      </div>
    </div>
  )
}