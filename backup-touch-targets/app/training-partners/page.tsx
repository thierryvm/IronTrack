'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { Users, UserPlus, Search, Check, X, Clock, Trash2, Settings, MessageCircle, Info } from 'lucide-react'
import { useAuth } from '@/hooks/useAuth'
import { safeJSONStringify } from '@/utils/json'
import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import { useRealtimeNotifications } from '@/hooks/useRealtimeNotifications'
import { useRealtimePartnerships } from '@/hooks/useRealtimePartnerships'
import { RealtimeNotificationToast } from '@/components/ui/RealtimeNotificationToast'
// PERFORMANCE CRITICAL: Images optimisées WebP/AVIF pour avatars
import { OptimizedAvatar } from '@/components/PerformanceImageOptimizer'

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

interface SearchUser extends Profile {
  partnershipStatus: string | null
  displayName: string
}

export default function TrainingPartnersPage() {
  const { user, isAuthenticated } = useAuth()
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'partners' | 'invitations' | 'search'>('partners')
  const [partnerships, setPartnerships] = useState<Partnership[]>([])
  const [searchResults, setSearchResults] = useState<SearchUser[]>([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [searchLoading, setSearchLoading] = useState(false)
  const [notification, setNotification] = useState<{
    message: string
    type: 'success' | 'error' | 'warning' | 'info'
    suggestion?: string
  } | null>(null)
  const loadingTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Hooks pour les notifications temps réel
  const {
    notifications,
    removeNotification,
    markAsRead,
    soundEnabled,
    setSoundEnabled,
    realtimeConnected,
    fallbackEnabled
  } = useRealtimeNotifications()

  // Hook pour la mise à jour automatique
  const { refreshTrigger } = useRealtimePartnerships()
  const lastAuthStateRef = useRef<{ isAuthenticated: boolean; userId: string | null }>({
    isAuthenticated: false,
    userId: null
  })
  const [showWelcome, setShowWelcome] = useState(() => {
    if (typeof window !== 'undefined') {
      return !localStorage.getItem('training-partners-welcome-seen')
    }
    return false
  })

  const loadPartnerships = useCallback(async () => {
    if (!isAuthenticated || !user) return
    
    setLoading(true)
    try {
      // Récupérer le token d'authentification pour l'API
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('Pas de session active')
        return
      }

      const response = await fetch('/api/training-partners', {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setPartnerships(data.partnerships || [])
      } else {
        console.error('Erreur API:', response.status, response.statusText)
      }
    } catch (error) {
      console.error('Erreur chargement partenaires:', error)
    } finally {
      setLoading(false)
    }
  }, [isAuthenticated, user])

  // Rafraîchir les données quand refreshTrigger change
  useEffect(() => {
    if (refreshTrigger > 0 && isAuthenticated && user) {
      console.log('🔄 Rafraîchissement automatique des partenaires')
      loadPartnerships()
    }
  }, [refreshTrigger, isAuthenticated, user, loadPartnerships])

  useEffect(() => {
    const currentUserId = user?.id || null
    const authStateChanged = 
      lastAuthStateRef.current.isAuthenticated !== isAuthenticated ||
      lastAuthStateRef.current.userId !== currentUserId

    if (authStateChanged && isAuthenticated && user) {
      lastAuthStateRef.current = {
        isAuthenticated,
        userId: currentUserId
      }

      // Débouncer le chargement pour éviter les appels multiples
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }

      loadingTimeoutRef.current = setTimeout(() => {
        loadPartnerships()
      }, 200)
    }

    return () => {
      if (loadingTimeoutRef.current) {
        clearTimeout(loadingTimeoutRef.current)
      }
    }
  }, [isAuthenticated, user, loadPartnerships])

  // Chargement initial unique
  useEffect(() => {
    if (isAuthenticated && user && partnerships.length === 0) {
      loadPartnerships()
    }
  }, [isAuthenticated, user, partnerships.length, loadPartnerships])

  const searchUsers = async () => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    setSearchLoading(true)
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        console.error('Pas de session active pour la recherche')
        return
      }

      const response = await fetch(`/api/training-partners/search?q=${encodeURIComponent(searchQuery)}`, {
        headers: {
          'Authorization': `Bearer ${session.access_token}`,
          'Content-Type': 'application/json'
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        setSearchResults(data.users || [])
      } else if (response.status === 409) {
        // Gérer les doublons de pseudo
        const error = await response.json()
        showNotification(error.error, 'warning', error.suggestion)
        setSearchResults([])
      } else if (response.status === 429) {
        showNotification('Trop de recherches. Attendez 1 minute.', 'warning')
        setSearchResults([])
      } else {
        const error = await response.json()
        showNotification(error.error, 'error')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error)
    } finally {
      setSearchLoading(false)
    }
  }

  const sendInvitation = async (partnerId: string, message?: string) => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        showNotification('Session expirée, veuillez vous reconnecter', 'error')
        return
      }

      const response = await fetch('/api/training-partners', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: safeJSONStringify({
          action: 'invite',
          partnerId,
          message
        })
      })

      if (response.ok) {
        await loadPartnerships()
        await searchUsers() // Refresh search results
        showNotification('Invitation envoyée !', 'success')
      } else {
        const error = await response.json()
        showNotification(error.error || 'Erreur lors de l\'envoi de l\'invitation', 'error')
      }
    } catch (error) {
      console.error('Erreur envoi invitation:', error)
      showNotification('Erreur lors de l\'envoi de l\'invitation', 'error')
    }
  }

  const handlePartnership = async (partnershipId: string, action: string) => {
    try {
      const supabase = createClient()
      const { data: { session } } = await supabase.auth.getSession()
      
      if (!session) {
        showNotification('Session expirée, veuillez vous reconnecter', 'error')
        return
      }

      const response = await fetch(`/api/training-partners/${partnershipId}`, {
        method: 'PATCH',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${session.access_token}`
        },
        body: safeJSONStringify({ action })
      })

      if (response.ok) {
        const actionMessages: Record<string, string> = {
          accept: 'Invitation acceptée !',
          decline: 'Invitation refusée',
          cancel: 'Invitation annulée',
          remove: 'Partenariat supprimé',
          block: 'Utilisateur bloqué'
        }
        
        // Rafraîchissement amélioré pour l'acceptation
        if (action === 'accept') {
          showNotification(actionMessages[action] || 'Action effectuée', 'success', 'Mise à jour des données...')
          
          // Attendre un peu pour permettre la création des partner_sharing_settings
          await new Promise(resolve => setTimeout(resolve, 800))
          
          // Rafraîchissement avec tentatives multiples
          let attempts = 0
          const maxAttempts = 3
          
          const refreshWithRetry = async () => {
            attempts++
            await loadPartnerships()
            
            // Vérifier si le partenariat apparaît bien comme accepté
            const updatedPartnerships = await new Promise<Partnership[]>(resolve => {
              // Simuler un délai pour permettre au state de se mettre à jour
              setTimeout(() => {
                resolve(partnerships)
              }, 200)
            })
            
            const isAccepted = updatedPartnerships.some(p => p.id === partnershipId && p.status === 'accepted')
            
            if (!isAccepted && attempts < maxAttempts) {
              console.log(`Tentative ${attempts}/${maxAttempts} - Nouveau rafraîchissement...`)
              setTimeout(refreshWithRetry, 800)
            } else if (isAccepted) {
              showNotification('Partenariat activé avec succès !', 'success', 'Vous pouvez maintenant configurer vos paramètres de partage.')
            }
          }
          
          await refreshWithRetry()
        } else {
          await loadPartnerships()
          showNotification(actionMessages[action] || 'Action effectuée', 'success')
        }
      } else {
        const error = await response.json()
        showNotification(error.error || 'Erreur lors de l\'action', 'error')
      }
    } catch (error) {
      console.error('Erreur action partenariat:', error)
      showNotification('Erreur lors de l\'action', 'error')
    }
  }

  const getDisplayName = (profile: Profile) => {
    return profile.pseudo || profile.full_name || profile.email?.split('@')[0] || 'Utilisateur'
  }

  const closeWelcome = () => {
    setShowWelcome(false)
    localStorage.setItem('training-partners-welcome-seen', 'true')
  }

  const showNotification = (message: string, type: 'success' | 'error' | 'warning' | 'info', suggestion?: string) => {
    setNotification({ message, type, suggestion })
    setTimeout(() => setNotification(null), 5000)
  }

  const acceptedPartnerships = partnerships.filter(p => p.status === 'accepted')
  const pendingInvitations = partnerships.filter(p => 
    p.status === 'pending' && p.partner_id === user?.id
  )
  const sentInvitations = partnerships.filter(p => 
    p.status === 'pending' && p.requester_id === user?.id
  )

  // Affichage du loading
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Affichage si non connecté
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-8 text-center">
            <Users className="h-16 w-16 text-gray-700 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100 mb-4">Training Partners</h1>
            <p className="text-gray-600 dark:text-gray-700 mb-6">
              Connectez-vous pour partager vos entraînements avec vos partenaires !
            </p>
            <button
              onClick={() => router.push('/auth')}
              className="bg-orange-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-orange-700 transition-colors"
            >
              Se connecter
            </button>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 py-8">
      {/* Notifications en temps réel */}
      <RealtimeNotificationToast
        notifications={notifications}
        onRemove={removeNotification}
        onMarkAsRead={markAsRead}
        soundEnabled={soundEnabled}
        onToggleSound={() => setSoundEnabled(!soundEnabled)}
        realtimeConnected={realtimeConnected}
        fallbackEnabled={fallbackEnabled}
      />

      {/* Notification Toast */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2">
          <div className={`rounded-lg p-4 shadow-lg max-w-md ${
            notification.type === 'success' ? 'bg-green-500 text-white' :
            notification.type === 'error' ? 'bg-red-500 text-white' :
            notification.type === 'warning' ? 'bg-yellow-500 text-white' :
            'bg-blue-500 text-white'
          }`}>
            <div className="flex items-start justify-between">
              <div>
                <p className="font-medium">{notification.message}</p>
                {notification.suggestion && (
                  <p className="text-sm mt-1 opacity-90">{notification.suggestion}</p>
                )}
              </div>
              <button
                onClick={() => setNotification(null)}
                className="ml-4 text-white hover:text-gray-200 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        {/* Welcome Message */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white dark:bg-gray-900/20 rounded-xl">
                  <Users className="h-8 w-8 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold mb-2">🎉 Bienvenue dans Training Partners !</h2>
                  <p className="text-white/90 mb-4">
                    Nouveauté ! Connectez-vous avec vos amis pour partager vos séances d'entraînement 
                    et vous motiver mutuellement. Plus besoin de partage public, tout est privé et sécurisé.
                  </p>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center space-x-2 text-sm">
                      <UserPlus className="h-4 w-4" />
                      <span>Invitez vos amis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MessageCircle className="h-4 w-4" />
                      <span>Partagez vos séances</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Settings className="h-4 w-4" />
                      <span>Contrôlez vos données</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <a 
                      href="/support" 
                      className="flex-1 sm:flex-none bg-white dark:bg-gray-900 text-blue-600 px-6 py-3 rounded-lg font-medium hover:bg-blue-50 transition-colors text-sm text-center min-w-[120px]"
                    >
                      Guide complet
                    </a>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="flex-1 sm:flex-none bg-blue-600 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-700 transition-colors text-sm min-w-[120px]"
                    >
                      Commencer
                    </button>
                  </div>
                </div>
              </div>
              <button
                onClick={closeWelcome}
                className="text-white/80 hover:text-white transition-colors p-1"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}

        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-xl flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-orange-800 dark:text-orange-300" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-gray-900 dark:text-gray-100">Training Partners</h1>
                <p className="text-sm sm:text-base text-gray-600 dark:text-gray-700 truncate">Partagez vos entraînements avec vos partenaires</p>
              </div>
            </div>
            
            {acceptedPartnerships.length > 0 && (
              <button
                onClick={() => router.push('/shared/dashboard')}
                className="bg-gradient-to-r from-green-500 to-emerald-500 text-white px-4 sm:px-6 py-2.5 sm:py-3 rounded-lg font-semibold hover:from-green-600 hover:to-emerald-600 transition-all shadow-md flex items-center justify-center space-x-2 text-sm sm:text-base flex-shrink-0"
              >
                <span>🍎</span>
                <span className="hidden sm:inline">Voir données partagées</span>
                <span className="sm:hidden">Données partagées</span>
              </button>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md mb-6">
          <div className="border-b border-gray-200 dark:border-gray-600">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'partners', label: 'Mes Partenaires', count: acceptedPartnerships.length },
                { id: 'invitations', label: 'Invitations', count: pendingInvitations.length },
                { id: 'search', label: 'Rechercher' }
              ].map((tab: { id: string; label: string; count?: number }) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'partners' | 'invitations' | 'search')}
                  className={`py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-orange-600 text-orange-800 dark:text-orange-300'
                      : 'border-transparent text-gray-600 hover:text-gray-700 dark:text-gray-300'
                  }`}
                >
                  {tab.label}
                  {tab.count !== undefined && tab.count > 0 && (
                    <span className="ml-2 bg-orange-100 text-orange-800 dark:text-orange-300 py-0.5 px-2 rounded-full text-xs">
                      {tab.count}
                    </span>
                  )}
                </button>
              ))}
            </nav>
          </div>

          <div className="p-6">
            {/* Onglet Partenaires */}
            {activeTab === 'partners' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Partenaires Actifs ({acceptedPartnerships.length})
                </h2>
                {acceptedPartnerships.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-gray-700 mx-auto mb-4" />
                    <p className="text-gray-600 mb-4">Aucun partenaire pour le moment</p>
                    <button
                      onClick={() => setActiveTab('search')}
                      className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors"
                    >
                      Rechercher des partenaires
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedPartnerships.map((partnership) => {
                      const partner = partnership.requester_id === user?.id 
                        ? partnership.partner 
                        : partnership.requester
                      return (
                        <div key={partnership.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div className="flex items-center space-x-4">
                            <OptimizedAvatar
                              src={partner.avatar_url}
                              alt={`Avatar de ${getDisplayName(partner)}`}
                              size="md"
                              className="border-2 border-orange-200 dark:border-orange-800"
                              priority={false}
                            />
                            <div>
                              <p className="font-medium text-gray-900 dark:text-gray-100">{getDisplayName(partner)}</p>
                              <p className="text-sm text-gray-600">
                                Partenaires depuis {new Date(partnership.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => router.push(`/training-partners/${partnership.id}/settings`)}
                              className="p-2 text-gray-700 hover:text-gray-600 dark:text-gray-700 transition-colors"
                              title="Paramètres de partage"
                            >
                              <Settings className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => handlePartnership(partnership.id, 'remove')}
                              className="p-2 text-red-400 hover:text-red-600 transition-colors"
                              title="Supprimer le partenariat"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </div>
            )}

            {/* Onglet Invitations */}
            {activeTab === 'invitations' && (
              <div>
                {/* Invitations reçues */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Invitations Reçues ({pendingInvitations.length})
                  </h2>
                  {pendingInvitations.length === 0 ? (
                    <p className="text-gray-600 py-4">Aucune invitation en attente</p>
                  ) : (
                    <div className="space-y-4">
                      {pendingInvitations.map((invitation) => (
                        <div key={invitation.id} className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <OptimizedAvatar
                                src={invitation.requester.avatar_url}
                                alt={`Avatar de ${getDisplayName(invitation.requester)}`}
                                size="md"
                                className="border-2 border-blue-200"
                                priority={false}
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {getDisplayName(invitation.requester)}
                                </p>
                                <p className="text-sm text-gray-600">
                                  Invitation envoyée le {new Date(invitation.created_at).toLocaleDateString()}
                                </p>
                                {invitation.message && (
                                  <p className="text-sm text-blue-700 mt-1 italic">
                                    &ldquo;{invitation.message}&rdquo;
                                  </p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <button
                                onClick={() => handlePartnership(invitation.id, 'accept')}
                                className="bg-green-500 text-white px-3 py-1 rounded-md hover:bg-green-600 transition-colors flex items-center space-x-1"
                              >
                                <Check className="h-4 w-4" />
                                <span>Accepter</span>
                              </button>
                              <button
                                onClick={() => handlePartnership(invitation.id, 'decline')}
                                className="bg-red-500 text-white px-3 py-1 rounded-md hover:bg-red-500 transition-colors flex items-center space-x-1"
                              >
                                <X className="h-4 w-4" />
                                <span>Refuser</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invitations envoyées */}
                <div>
                  <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                    Invitations Envoyées ({sentInvitations.length})
                  </h2>
                  {sentInvitations.length === 0 ? (
                    <p className="text-gray-600 py-4">Aucune invitation envoyée</p>
                  ) : (
                    <div className="space-y-4">
                      {sentInvitations.map((invitation) => (
                        <div key={invitation.id} className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-4">
                              <OptimizedAvatar
                                src={invitation.partner.avatar_url}
                                alt={`Avatar de ${getDisplayName(invitation.partner)}`}
                                size="md"
                                className="border-2 border-yellow-200"
                                priority={false}
                              />
                              <div>
                                <p className="font-medium text-gray-900 dark:text-gray-100">
                                  {getDisplayName(invitation.partner)}
                                </p>
                                <p className="text-sm text-gray-600 flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>En attente depuis le {new Date(invitation.created_at).toLocaleDateString()}</span>
                                </p>
                              </div>
                            </div>
                            <button
                              onClick={() => handlePartnership(invitation.id, 'cancel')}
                              className="text-red-500 hover:text-red-700 transition-colors"
                              title="Annuler l'invitation"
                            >
                              <X className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* Onglet Recherche */}
            {activeTab === 'search' && (
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100 mb-4">
                  Rechercher des Partenaires
                </h2>
                
                <div className="mb-6">
                  <div className="relative">
                    <input
                      type="text"
                      placeholder="Email complet ou pseudo exact uniquement"
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value)
                        // Vider les résultats quand on tape
                        if (e.target.value.length < 2) {
                          setSearchResults([])
                        }
                      }}
                      onKeyDown={(e) => {
                        // Chercher seulement quand on appuie sur Entrée
                        if (e.key === 'Enter' && searchQuery.length >= 2) {
                          searchUsers()
                        }
                      }}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                    />
                    <Search className="absolute left-3 top-3 h-5 w-5 text-gray-700" />
                  </div>
                  <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-start space-x-2">
                      <Info className="h-5 w-5 text-blue-500 mt-0.5 flex-shrink-0" />
                      <div className="text-sm text-blue-700">
                        <p className="font-medium mb-1">Recherche sécurisée :</p>
                        <ul className="list-disc list-inside space-y-1 text-xs">
                          <li>Email complet : exemple@domain.com</li>
                          <li>Pseudo exact (insensible à la casse) : MonPseudo123</li>
                          <li>Limite : 3 recherches par minute</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>

                {searchLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-800 rounded-lg">
                        <div className="flex items-center space-x-4">
                          <OptimizedAvatar
                            src={user.avatar_url}
                            alt={`Avatar de ${user.displayName}`}
                            size="md"
                            className="border-2 border-gray-300 dark:border-gray-600"
                            priority={false}
                          />
                          <div>
                            <p className="font-medium text-gray-900 dark:text-gray-100">{user.displayName}</p>
                            <p className="text-sm text-gray-600">{user.email}</p>
                            {user.pseudo && user.pseudo !== user.displayName && (
                              <p className="text-xs text-blue-600">Pseudo: {user.pseudo}</p>
                            )}
                            {user.full_name && user.full_name !== user.displayName && (
                              <p className="text-xs text-green-600">Nom: {user.full_name}</p>
                            )}
                          </div>
                        </div>
                        <div>
                          {user.partnershipStatus === 'accepted' && (
                            <span className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
                              Partenaire
                            </span>
                          )}
                          {user.partnershipStatus === 'pending' && (
                            <span className="bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-sm">
                              Invitation envoyée
                            </span>
                          )}
                          {user.partnershipStatus === 'blocked' && (
                            <span className="bg-red-100 text-red-800 px-3 py-1 rounded-full text-sm">
                              Bloqué
                            </span>
                          )}
                          {!user.partnershipStatus && (
                            <button
                              onClick={() => sendInvitation(user.id)}
                              className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors flex items-center space-x-2"
                            >
                              <UserPlus className="h-4 w-4" />
                              <span>Inviter</span>
                            </button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <p className="text-gray-600 text-center py-8">
                    Aucun utilisateur trouvé pour &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}