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

// MIGRATION SHADCN/UI PARTENAIRES - 100% COMPLET
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Card, CardContent, CardTitle } from '@/components/ui/card'

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
  const { user, isAuthenticated, isLoading } = useAuth()
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
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
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
      const { data: { session }, error: sessionError } = await supabase.auth.getSession()
      
      if (sessionError) {
        console.error('Erreur récupération session:', sessionError)
        showNotification('Erreur de session. Reconnectez-vous.', 'error')
        return
      }
      
      if (!session || !session.access_token) {
        console.error('Pas de session active pour la recherche')
        showNotification('Session expirée. Reconnectez-vous.', 'error')
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
      } else if (response.status === 401) {
        showNotification('Session expirée. Reconnectez-vous.', 'error')
        setSearchResults([])
      } else if (response.status === 400) {
        const error = await response.json()
        showNotification(error.error || 'Requête invalide', 'error')
        setSearchResults([])
      } else {
        const error = await response.json()
        showNotification(error.error || `Aucun utilisateur trouvé pour "${searchQuery}"`, 'info')
        setSearchResults([])
      }
    } catch (error) {
      console.error('Erreur recherche utilisateurs:', error)
      showNotification('Erreur lors de la recherche', 'error')
      setSearchResults([])
    } finally {
      setSearchLoading(false)
    }
  }

  // Recherche automatique avec débounce sécurisé (1.5s délai)
  useEffect(() => {
    // Nettoyer le timeout précédent
    if (searchTimeoutRef.current) {
      clearTimeout(searchTimeoutRef.current)
    }

    // Si query vide, nettoyer les résultats
    if (searchQuery.length === 0) {
      setSearchResults([])
      return
    }

    // Si query trop courte, ne pas chercher
    if (searchQuery.length < 2) {
      return
    }

    // Déclencher la recherche après 1.5s de pause (anti-spam)
    searchTimeoutRef.current = setTimeout(() => {
      if (searchQuery.length >= 2 && isAuthenticated && user) {
        searchUsers()
      }
    }, 1500) // 1.5 secondes pour éviter le spam

    // Cleanup
    return () => {
      if (searchTimeoutRef.current) {
        clearTimeout(searchTimeoutRef.current)
      }
    }
  }, [searchQuery, isAuthenticated, user])

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
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
      </div>
    )
  }

  // Affichage de chargement pendant la vérification auth
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
            <p className="mt-2 text-muted-foreground">Vérification...</p>
          </div>
        </div>
      </div>
    )
  }

  // Affichage si non connecté
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background py-8">
        <div className="max-w-4xl mx-auto px-4">
          <Card className="text-center max-w-md mx-auto">
            <CardContent className="p-8">
              <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
              <CardTitle className="text-2xl mb-4">Training Partners</CardTitle>
              <p className="text-muted-foreground mb-6">
                Connectez-vous pour partager vos entraînements avec vos partenaires !
              </p>
              <Button
                onClick={() => router.push('/auth')}
                className="bg-blue-600 hover:bg-blue-700 text-white"
              >
                Se connecter
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background py-8">
      {/* Notifications en temps réel */}
      <RealtimeNotificationToast
        notifications={notifications}
        onRemove={removeNotification}
        onMarkAsRead={markAsRead}
      />

      {/* Notification Alert - ShadCN UI + fond flou */}
      {notification && (
        <div className="fixed top-4 right-4 z-50 animate-in slide-in-from-top-2 max-w-md">
          <Alert
            className={`shadow-lg backdrop-blur-sm border-2 ${
              notification.type === 'success' ? 'bg-green-50/90 border-green-200 text-green-800' :
              notification.type === 'error' ? 'bg-red-50/90 border-red-200 text-red-800' :
              notification.type === 'warning' ? 'bg-yellow-50/90 border-yellow-200 text-yellow-800' :
              'bg-blue-50/90 border-blue-200 text-blue-800'
            }`}
          >
            <div className="flex items-start justify-between">
              <AlertDescription className="flex-1">
                <p className="font-medium">{notification.message}</p>
                {notification.suggestion && (
                  <p className="text-sm mt-1 opacity-80">{notification.suggestion}</p>
                )}
              </AlertDescription>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setNotification(null)}
                className="ml-2 h-6 w-6 p-0 text-current hover:bg-current/10"
                aria-label="Fermer la notification"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </Alert>
        </div>
      )}

      <div className="max-w-4xl mx-auto px-4">
        {/* Welcome Message */}
        {showWelcome && (
          <div className="bg-gradient-to-r from-blue-500 to-purple-500 rounded-xl shadow-md p-6 mb-6 text-white">
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-4">
                <div className="p-3 bg-white/20 dark:bg-card/50 border border-white/30 dark:border-border rounded-xl backdrop-blur-sm">
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
                      <UserPlus className="h-6 w-6" />
                      <span>Invitez vos amis</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <MessageCircle className="h-6 w-6" />
                      <span>Partagez vos séances</span>
                    </div>
                    <div className="flex items-center space-x-2 text-sm">
                      <Settings className="h-6 w-6" />
                      <span>Contrôlez vos données</span>
                    </div>
                  </div>
                  <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4">
                    <a 
                      href="/support" 
                      className="flex-1 sm:flex-none bg-card border border-border text-blue-600 dark:text-safe-info px-6 py-3 rounded-lg font-medium hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-colors text-sm text-center min-w-[120px]"
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
        <div className="bg-card border border-border rounded-xl shadow-md p-4 sm:p-6 mb-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div className="flex items-center space-x-3 sm:space-x-4">
              <div className="p-2 sm:p-3 bg-orange-100 rounded-xl flex-shrink-0">
                <Users className="h-6 w-6 sm:h-8 sm:w-8 text-foreground" />
              </div>
              <div className="min-w-0 flex-1">
                <h1 className="text-lg sm:text-2xl font-bold text-foreground">Training Partners</h1>
                <p className="text-sm sm:text-base text-muted-foreground truncate">Partagez vos entraînements avec vos partenaires</p>
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

        {/* Tabs ShadCN UI */}
        <Card>
          <CardContent>
            <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as 'partners' | 'invitations' | 'search')} className="w-full">
              <TabsList className="grid w-full grid-cols-3 mb-6">
                <TabsTrigger value="partners" className="flex items-center space-x-2">
                  <Users className="h-4 w-4" />
                  <span>Mes Partenaires</span>
                  {acceptedPartnerships.length > 0 && (
                    <span className="ml-1 bg-orange-100 dark:bg-orange-900/30 text-foreground py-0.5 px-1.5 rounded-full text-xs">
                      {acceptedPartnerships.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="invitations" className="flex items-center space-x-2">
                  <Clock className="h-4 w-4" />
                  <span>Invitations</span>
                  {pendingInvitations.length > 0 && (
                    <span className="ml-1 bg-orange-100 dark:bg-orange-900/30 text-foreground py-0.5 px-1.5 rounded-full text-xs">
                      {pendingInvitations.length}
                    </span>
                  )}
                </TabsTrigger>
                <TabsTrigger value="search" className="flex items-center space-x-2">
                  <Search className="h-4 w-4" />
                  <span>Rechercher</span>
                </TabsTrigger>
              </TabsList>
            <TabsContent value="partners">
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Partenaires Actifs ({acceptedPartnerships.length})
                </h2>
                {acceptedPartnerships.length === 0 ? (
                  <div className="text-center py-8">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <p className="text-muted-foreground mb-4">Aucun partenaire pour le moment</p>
                    <Button
                      onClick={() => setActiveTab('search')}
                      className="bg-blue-600 hover:bg-blue-700 text-white"
                    >
                      Rechercher des partenaires
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {acceptedPartnerships.map((partnership) => {
                      const partner = partnership.requester_id === user?.id 
                        ? partnership.partner 
                        : partnership.requester
                      return (
                        <Card key={partnership.id} className="p-4">
                          <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            <OptimizedAvatar
                              src={partner.avatar_url}
                              alt={`Avatar de ${getDisplayName(partner)}`}
                              size="md"
                              className="border-2 border-blue-200 dark:border-orange-600"
                              priority={false}
                            />
                            <div>
                              <p className="font-medium text-foreground">{getDisplayName(partner)}</p>
                              <p className="text-sm text-gray-600 dark:text-safe-muted">
                                Partenaires depuis {new Date(partnership.created_at).toLocaleDateString()}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button
                              onClick={() => router.push(`/training-partners/${partnership.id}/settings`)}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-foreground hover:text-foreground dark:hover:text-foreground"
                              title="Paramètres de partage"
                            >
                              <Settings className="h-5 w-5" />
                            </Button>
                            <Button
                              onClick={() => handlePartnership(partnership.id, 'remove')}
                              variant="ghost"
                              size="sm"
                              className="p-2 text-safe-error hover:text-red-600"
                              title="Supprimer le partenariat"
                            >
                              <Trash2 className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                        </Card>
                      )
                    })}
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value="invitations">
              <div>
                {/* Invitations reçues */}
                <div className="mb-8">
                  <h2 className="text-lg font-semibold mb-4">
                    Invitations Reçues ({pendingInvitations.length})
                  </h2>
                  {pendingInvitations.length === 0 ? (
                    <p className="text-gray-600 dark:text-safe-muted py-4">Aucune invitation en attente</p>
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
                                <p className="font-medium text-foreground">
                                  {getDisplayName(invitation.requester)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-safe-muted">
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
                              <Button
                                onClick={() => handlePartnership(invitation.id, 'accept')}
                                className="bg-orange-600 hover:bg-orange-700 text-white min-h-[44px]"
                                aria-label={`Accepter l'invitation de ${getDisplayName(invitation.requester)}`}
                              >
                                <Check className="h-4 w-4 mr-1" />
                                <span>Accepter</span>
                              </Button>
                              <Button
                                onClick={() => handlePartnership(invitation.id, 'decline')}
                                variant="destructive"
                                className="min-h-[44px]"
                                aria-label={`Refuser l'invitation de ${getDisplayName(invitation.requester)}`}
                              >
                                <X className="h-4 w-4 mr-1" />
                                <span>Refuser</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Invitations envoyées */}
                <div>
                  <h2 className="text-lg font-semibold mb-4">
                    Invitations Envoyées ({sentInvitations.length})
                  </h2>
                  {sentInvitations.length === 0 ? (
                    <p className="text-gray-600 dark:text-safe-muted py-4">Aucune invitation envoyée</p>
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
                                <p className="font-medium text-foreground">
                                  {getDisplayName(invitation.partner)}
                                </p>
                                <p className="text-sm text-gray-600 dark:text-safe-muted flex items-center space-x-1">
                                  <Clock className="h-6 w-6" />
                                  <span>En attente depuis le {new Date(invitation.created_at).toLocaleDateString()}</span>
                                </p>
                              </div>
                            </div>
                            <Button
                              onClick={() => handlePartnership(invitation.id, 'cancel')}
                              variant="ghost"
                              size="sm"
                              className="text-safe-error hover:text-red-700 hover:bg-red-50 min-h-[44px] min-w-[44px]"
                              aria-label={`Annuler l'invitation envoyée à ${getDisplayName(invitation.partner)}`}
                            >
                              <X className="h-5 w-5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="search">
              <div>
                <h2 className="text-lg font-semibold mb-4">
                  Rechercher des Partenaires
                </h2>
                
                <div className="mb-6">
                  <div className="space-y-2">
                    <Label htmlFor="partner-search" className="text-sm font-medium">
                      Rechercher des partenaires d'entraînement
                    </Label>
                    <div className="relative">
                      <Input
                        id="partner-search"
                        type="text"
                        placeholder="Email complet (ex: nom@domaine.com) ou pseudo exact (ex: Math)"
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
                        className="w-full pl-10 pr-4 py-3 focus:ring-2 focus:ring-blue-500"
                        aria-describedby="search-help"
                        aria-label="Rechercher des partenaires par email ou pseudo"
                      />
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-safe-muted" />
                    </div>
                  </div>
                  <Alert id="search-help" className="mt-2 bg-blue-50/80 border-blue-200">
                    <Info className="h-5 w-5 text-safe-info" />
                    <AlertDescription className="text-blue-700">
                      <p className="font-medium mb-1">Recherche sécurisée :</p>
                      <ul className="list-disc list-inside space-y-1 text-xs">
                        <li>Email complet : exemple@domain.com</li>
                        <li>Pseudo exact (insensible à la casse) : MonPseudo123</li>
                        <li>Limite : 3 recherches par minute</li>
                      </ul>
                    </AlertDescription>
                  </Alert>
                </div>

                {searchLoading && (
                  <div className="text-center py-4">
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600 mx-auto"></div>
                  </div>
                )}

                {searchResults.length > 0 && (
                  <div className="space-y-4">
                    {searchResults.map((user) => (
                      <div key={user.id} className="flex items-center justify-between p-4 bg-background rounded-lg">
                        <div className="flex items-center space-x-4">
                          <OptimizedAvatar
                            src={user.avatar_url}
                            alt={`Avatar de ${user.displayName}`}
                            size="md"
                            className="border-2 border-border"
                            priority={false}
                          />
                          <div>
                            <p className="font-medium text-foreground">{user.displayName}</p>
                            <p className="text-sm text-gray-600 dark:text-safe-muted">{user.email}</p>
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
                            <Button
                              onClick={() => sendInvitation(user.id)}
                              className="bg-orange-600 hover:bg-orange-700 text-white min-h-[44px]"
                              aria-label={`Envoyer une invitation à ${user.displayName}`}
                            >
                              <UserPlus className="h-4 w-4 mr-2" />
                              <span>Inviter</span>
                            </Button>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {searchQuery.length >= 2 && !searchLoading && searchResults.length === 0 && (
                  <p className="text-gray-600 dark:text-safe-muted text-center py-8">
                    Aucun utilisateur trouvé pour &ldquo;{searchQuery}&rdquo;
                  </p>
                )}
              </div>
            </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}