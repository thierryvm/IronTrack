'use client'

import { useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { ArrowLeft, Users, Apple, TrendingUp, Calendar, Loader2 } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { motion } from 'framer-motion'

interface Partnership {
  id: string
  requester_id: string
  partner_id: string
  status: string
  partner: {
    id: string
    pseudo: string | null
    full_name: string | null
    avatar_url: string | null
  }
}


export default function SharedDashboardPage() {
  const { user, isAuthenticated, isLoading } = useAuth()
  const router = useRouter()
  
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [error, setError] = useState<string | null>(null)

  const loadPartnerships = useCallback(async () => {
    if (!isAuthenticated || !user) return

    try {
      setError(null)

      const response = await fetch('/api/training-partners')
      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || 'Erreur lors du chargement')
      }

      // Filtrer seulement les partenaires acceptés
      const acceptedPartnerships = result.partnerships?.filter(
        (p: Partnership) => p.status === 'accepted'
      ) || []

      setPartnerships(acceptedPartnerships)
    } catch (err) {
      console.error('Erreur chargement partenaires:', err)
      setError(err instanceof Error ? err.message : 'Erreur inconnue')
    } finally {
    }
  }, [isAuthenticated, user])

  useEffect(() => {
    if (isAuthenticated && user) {
      loadPartnerships()
    }
  }, [isAuthenticated, user, loadPartnerships])

  const getPartnerDisplayName = (partner: Partnership['partner']) => {
    return partner.pseudo || partner.full_name || 'Partenaire'
  }

  const getPartnerId = (partnership: Partnership) => {
    return partnership.requester_id === user?.id 
      ? partnership.partner_id 
      : partnership.requester_id
  }

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-orange-600" />
      </div>
    )
  }

  if (!isAuthenticated) {
    router.push('/auth')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gradient-to-r from-purple-500 to-indigo-500 text-white rounded-xl p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.back()}
                className="p-2 bg-white/20 rounded-lg hover:bg-white/30 transition-colors"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 rounded-full p-3">
                  <Users className="h-6 w-6" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold">Dashboard Partage</h1>
                  <p className="text-purple-100">Accédez aux données partagées de vos partenaires</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-6 mb-6">
            <p className="text-red-700">{error}</p>
          </div>
        )}

        {partnerships.length === 0 ? (
          <div className="bg-white rounded-xl shadow-md p-8 text-center">
            <div className="bg-gray-100 rounded-full p-4 w-16 h-16 mx-auto mb-4">
              <Users className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Aucun partenaire accepté
            </h3>
            <p className="text-gray-600 mb-4">
              Invitez des partenaires pour commencer à partager vos données.
            </p>
            <button
              onClick={() => router.push('/training-partners')}
              className="bg-purple-600 text-white px-6 py-3 rounded-lg hover:bg-purple-700 transition-colors"
            >
              Gérer mes partenaires
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {partnerships.map((partnership) => {
              const partnerId = getPartnerId(partnership)
              const partnerName = getPartnerDisplayName(partnership.partner)

              return (
                <motion.div
                  key={partnership.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="bg-white rounded-xl shadow-md p-6 hover:shadow-lg transition-shadow"
                >
                  <div className="flex items-center space-x-3 mb-4">
                    <div className="w-12 h-12 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-full flex items-center justify-center text-white font-semibold">
                      {partnerName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900">{partnerName}</h3>
                      <p className="text-sm text-gray-500">Partenaire d&apos;entraînement</p>
                    </div>
                  </div>

                  <div className="space-y-3">
                    {/* Workouts */}
                    <button
                      onClick={() => router.push('/calendar')}
                      className="w-full flex items-center justify-between p-3 bg-orange-50 hover:bg-orange-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-orange-500 rounded-lg p-2">
                          <Calendar className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">Entraînements</span>
                      </div>
                      <span className="text-orange-600 text-sm">Voir dans calendrier</span>
                    </button>

                    {/* Nutrition */}
                    <button
                      onClick={() => router.push(`/shared/nutrition/${partnerId}`)}
                      className="w-full flex items-center justify-between p-3 bg-green-50 hover:bg-green-100 rounded-lg transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-green-500 rounded-lg p-2">
                          <Apple className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">Nutrition</span>
                      </div>
                      <span className="text-green-600 text-sm">Nouveau !</span>
                    </button>

                    {/* Progress */}
                    <button
                      onClick={() => router.push(`/shared/progress/${partnerId}`)}
                      className="w-full flex items-center justify-between p-3 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                      disabled
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-500 rounded-lg p-2">
                          <TrendingUp className="h-4 w-4 text-white" />
                        </div>
                        <span className="font-medium text-gray-900">Progrès</span>
                      </div>
                      <span className="text-blue-600 text-sm">Bientôt</span>
                    </button>
                  </div>

                  <div className="mt-4 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => router.push(`/training-partners/${partnership.id}/settings`)}
                      className="w-full text-sm text-gray-600 hover:text-gray-900 transition-colors"
                    >
                      Gérer les paramètres de partage
                    </button>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}

        {/* Aide */}
        <div className="mt-8 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-4">💡 Comment ça marche ?</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-blue-800">
            <div>
              <h4 className="font-medium mb-2">🏃‍♂️ Entraînements</h4>
              <p>Voir les séances partagées directement dans votre calendrier avec le préfixe 👥.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">🍎 Nutrition</h4>
              <p>Consulter le journal alimentaire détaillé de vos partenaires jour par jour.</p>
            </div>
            <div>
              <h4 className="font-medium mb-2">📈 Progrès</h4>
              <p>Suivre l&apos;évolution des performances et objectifs de vos partenaires (bientôt).</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}