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
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)
  const audioRef = useRef<{ play: () => void } | null>(null)

  // Initialiser l'audio
  useEffect(() => {
    if (typeof window !== 'undefined') {
      // Créer un son de notification simple avec Web Audio API
      const createNotificationSound = () => {
        const audioContext = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)()
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
      }
      
      audioRef.current = { play: createNotificationSound }
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

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user) return

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
          console.log('🔔 Nouvelle demande de partenariat reçue:', payload)
          
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
          console.log('🔄 Mise à jour du partenariat:', payload)
          
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
      .subscribe()

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
    setSoundEnabled
  }
}