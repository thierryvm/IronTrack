import { useEffect, useRef, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { useAuth } from './useAuth'

export function useRealtimePartnerships() {
  const { user } = useAuth()
  const [refreshTrigger, setRefreshTrigger] = useState(0)
  const supabase = createClient()
  const channelRef = useRef<ReturnType<typeof supabase.channel> | null>(null)

  // Fonction pour déclencher un rafraîchissement
  const triggerRefresh = () => {
    setRefreshTrigger(prev => prev + 1)
  }

  // Écouter les changements en temps réel
  useEffect(() => {
    if (!user) return

    const channel = supabase.channel('partnerships-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'training_partners',
          filter: `or(requester_id.eq.${user.id},partner_id.eq.${user.id})`
        },
        (_payload) => {
          // Déclencher le rafraîchissement après un petit délai pour éviter les doublons
          setTimeout(() => {
            triggerRefresh()
          }, 500)
        }
      )
      .subscribe()

    channelRef.current = channel

    return () => {
      if (channelRef.current) {
        supabase.removeChannel(channelRef.current)
      }
    }
  }, [user, supabase])

  return {
    refreshTrigger,
    triggerRefresh
  }
}