import { useEffect, useRef, useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './useAuth'

export interface RealtimeNotification {
  id: string
  type: 'partnership_request' | 'partnership_accepted' | 'partnership_declined'
  title: string
  message: string
  data?: Record<string, unknown>
  timestamp: Date
  read: boolean
  animate?: boolean
}

export function useRealtimeNotifications() {
  const { user } = useAuth()
  const [notifications, setNotifications] = useState<RealtimeNotification[]>([])
  const [soundEnabled, setSoundEnabled] = useState(true)
  const [realtimeConnected, setRealtimeConnected] = useState(false)
  const [fallbackEnabled, setFallbackEnabled] = useState(false)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const audioRef = useRef<{ play: () => void } | null>(null)
  const lastCheckRef = useRef<number>(0)

  // Initialiser l'audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      let audioContext: AudioContext | null = null
      
      // Créer un son de notification simple avec Web Audio API
      const createNotificationSound = () => {
        try {
          if (!audioContext) {
            audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
          }
          
          // Reprendre le contexte si suspendu
          if (audioContext.state === 'suspended') {
            audioContext.resume()
          }
          
          const oscillator = audioContext.createOscillator()
          const gainNode = audioContext.createGain()
          
          oscillator.connect(gainNode)
          gainNode.connect(audioContext.destination)
          
          oscillator.frequency.value = 800
          oscillator.type = 'sine'
          
          gainNode.gain.setValueAtTime(0.1, audioContext.currentTime)
          gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3)
          
          oscillator.start(audioContext.currentTime)
          oscillator.stop(audioContext.currentTime + 0.3)
        } catch (error) {
          console.error('Erreur création audio:', error)
        }
      }
      
      audioRef.current = { play: createNotificationSound }
      
      // Cleanup
      return () => {
        if (audioContext) {
          audioContext.close()
        }
      }
    }
  }, [])

  // Fonction pour jouer le son
  const playNotificationSound = useCallback(() => {
    if (soundEnabled && audioRef.current) {
      try {
        audioRef.current.play()
      } catch (error) {
        console.error('Erreur son notification:', error)
      }
    }
  }, [soundEnabled])

  // Ajouter une notification
  const addNotification = useCallback((notification: Omit<RealtimeNotification, 'id' | 'timestamp' | 'read'>) => {
    const newNotification: RealtimeNotification = {
      ...notification,
      id: crypto.randomUUID(),
      timestamp: new Date(),
      read: false,
      animate: true
    }

    setNotifications(prev => {
      const updated = [newNotification, ...prev]
      // Garder seulement les 5 plus récentes
      return updated.slice(0, 5)
    })

    playNotificationSound()

    // Retirer l'animation après 500ms
    setTimeout(() => {
      setNotifications(prev => 
        prev.map(n => n.id === newNotification.id ? { ...n, animate: false } : n)
      )
    }, 500)

    // Auto-remove après 8 secondes
    setTimeout(() => {
      removeNotification(newNotification.id)
    }, 8000)

    return newNotification.id
  }, [playNotificationSound])

  // Supprimer une notification
  const removeNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id))
  }

  // Marquer comme lu
  const markAsRead = (id: string) => {
    setNotifications(prev => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    )
  }

  // Système de polling en fallback si realtime ne fonctionne pas
  const checkForNewNotifications = useCallback(async () => {
    if (!user || !fallbackEnabled) return

    try {
      const now = Date.now()
      const since = new Date(lastCheckRef.current || now - 60000) // Dernière minute
      
      // Vérifier nouvelles invitations reçues
      const { data: newInvitations } = await supabase
        .from('training_partners')
        .select('*, requester:profiles!requester_id(pseudo, full_name, email)')
        .eq('partner_id', user.id)
        .eq('status', 'pending')
        .gte('created_at', since.toISOString())
      
      if (newInvitations) {
        newInvitations.forEach(invitation => {
          const requesterData = invitation.requester as { pseudo?: string; full_name?: string; email?: string }
          const displayName = requesterData?.pseudo || requesterData?.full_name || requesterData?.email?.split('@')[0] || 'Un utilisateur'
          
          addNotification({
            type: 'partnership_request',
            title: 'Nouvelle demande de partenariat',
            message: `${displayName} souhaite devenir votre partenaire d'entraînement`,
            data: { partnershipId: invitation.id, requesterId: invitation.requester_id }
          })
        })
      }
      
      // Vérifier réponses à mes invitations
      const { data: updatedInvitations } = await supabase
        .from('training_partners')
        .select('*, partner:profiles!partner_id(pseudo, full_name, email)')
        .eq('requester_id', user.id)
        .in('status', ['accepted', 'declined'])
        .gte('updated_at', since.toISOString())
      
      if (updatedInvitations) {
        updatedInvitations.forEach(invitation => {
          const partnerData = invitation.partner as { pseudo?: string; full_name?: string; email?: string }
          const displayName = partnerData?.pseudo || partnerData?.full_name || partnerData?.email?.split('@')[0] || 'Un utilisateur'
          
          if (invitation.status === 'accepted') {
            addNotification({
              type: 'partnership_accepted',
              title: 'Partenariat accepté !',
              message: `${displayName} a accepté votre demande de partenariat`,
              data: { partnershipId: invitation.id, partnerId: invitation.partner_id }
            })
          } else if (invitation.status === 'declined') {
            addNotification({
              type: 'partnership_declined',
              title: 'Partenariat refusé',
              message: `${displayName} a refusé votre demande de partenariat`,
              data: { partnershipId: invitation.id, partnerId: invitation.partner_id }
            })
          }
        })
      }
      
      lastCheckRef.current = now
    } catch (error) {
      console.error('Erreur fallback notifications:', error)
    }
  }, [user, fallbackEnabled, addNotification, supabase])

  // Polling fallback
  useEffect(() => {
    if (!fallbackEnabled || !user) return
    
    console.log('🔄 Système de polling activé (fallback)')
    const interval = setInterval(checkForNewNotifications, 30000) // 30 secondes
    
    return () => clearInterval(interval)
  }, [fallbackEnabled, user, checkForNewNotifications])

  // Écouter les changements en temps réel avec fallback amélioré
  useEffect(() => {
    if (!user) return

    console.log('📡 Initialisation canal realtime pour les notifications')
    
    const channel = supabase.channel('training-partners-realtime')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'training_partners',
          filter: `partner_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('✅ Nouvelle demande de partenariat reçue (realtime):', payload)
          setRealtimeConnected(true)
          
          // Récupérer les informations du requester
          const { data: requesterData } = await supabase
            .from('profiles')
            .select('pseudo, full_name, email')
            .eq('id', payload.new.requester_id)
            .single()

          if (requesterData) {
            const displayName = requesterData.pseudo || requesterData.full_name || requesterData.email?.split('@')[0] || 'Un utilisateur'
            
            addNotification({
              type: 'partnership_request',
              title: 'Nouvelle demande de partenariat',
              message: `${displayName} souhaite devenir votre partenaire d'entraînement`,
              data: { partnershipId: payload.new.id, requesterId: payload.new.requester_id }
            })
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'training_partners',
          filter: `requester_id=eq.${user.id}`
        },
        async (payload) => {
          console.log('✅ Mise à jour du partenariat (realtime):', payload)
          setRealtimeConnected(true)
          
          if (payload.new.status === 'accepted' && payload.old.status === 'pending') {
            // Récupérer les informations du partner
            const { data: partnerData } = await supabase
              .from('profiles')
              .select('pseudo, full_name, email')
              .eq('id', payload.new.partner_id)
              .single()

            if (partnerData) {
              const displayName = partnerData.pseudo || partnerData.full_name || partnerData.email?.split('@')[0] || 'Un utilisateur'
              
              addNotification({
                type: 'partnership_accepted',
                title: 'Partenariat accepté !',
                message: `${displayName} a accepté votre demande de partenariat`,
                data: { partnershipId: payload.new.id, partnerId: payload.new.partner_id }
              })
            }
          } else if (payload.new.status === 'declined' && payload.old.status === 'pending') {
            // Récupérer les informations du partner
            const { data: partnerData } = await supabase
              .from('profiles')
              .select('pseudo, full_name, email')
              .eq('id', payload.new.partner_id)
              .single()

            if (partnerData) {
              const displayName = partnerData.pseudo || partnerData.full_name || partnerData.email?.split('@')[0] || 'Un utilisateur'
              
              addNotification({
                type: 'partnership_declined',
                title: 'Partenariat refusé',
                message: `${displayName} a refusé votre demande de partenariat`,
                data: { partnershipId: payload.new.id, partnerId: payload.new.partner_id }
              })
            }
          }
        }
      )
      .subscribe((status) => {
        console.log('📡 Statut canal realtime:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Canal realtime connecté avec succès')
          setRealtimeConnected(true)
          setFallbackEnabled(false) // Désactiver fallback
        } else if (status === 'CHANNEL_ERROR' || status === 'CLOSED') {
          // En développement, les déconnexions sont normales (Hot Reload)
          if (process.env.NODE_ENV === 'development') {
            console.debug('📡 Canal realtime fermé (normal en dev), fallback activé')
          } else {
            console.warn('⚠️ Erreur canal realtime, activation du fallback')
          }
          setRealtimeConnected(false)
          setFallbackEnabled(true) // Activer fallback
        } else if (status === 'TIMED_OUT') {
          console.warn('⏰ Timeout canal realtime, tentative de reconnexion')
          setRealtimeConnected(false)
          setFallbackEnabled(true)
        }
      })

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user, supabase, addNotification])

  // Nettoyage périodique des notifications lues
  useEffect(() => {
    const cleanupInterval = setInterval(() => {
      setNotifications(prev => 
        prev.filter(n => !n.read || (new Date().getTime() - n.timestamp.getTime()) < 30000)
      )
    }, 30000) // Nettoyer toutes les 30 secondes

    return () => clearInterval(cleanupInterval)
  }, [])

  return {
    notifications,
    addNotification,
    removeNotification,
    markAsRead,
    soundEnabled,
    setSoundEnabled,
    realtimeConnected,
    fallbackEnabled
  }
}