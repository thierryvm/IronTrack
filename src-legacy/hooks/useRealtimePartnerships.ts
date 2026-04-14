import { useEffect, useRef, useState} from'react'
import { createClient} from'@/utils/supabase/client'
import { useAuth} from'./useAuth'

export function useRealtimePartnerships() {
 const { user} = useAuth()
 const [refreshTrigger, setRefreshTrigger] = useState(0)
 const supabaseRef = useRef(createClient())
 const channelRef = useRef<ReturnType<typeof supabaseRef.current.channel> | null>(null)

 // Fonction pour déclencher un rafraîchissement
 const triggerRefresh = () => {
 setRefreshTrigger(prev => prev + 1)
}

 // Écouter les changements en temps réel
 useEffect(() => {
 if (!user) return

 const supabase = supabaseRef.current
 const channel = supabase.channel('partnerships-updates')
 .on(
'postgres_changes',
 {
 event:'*',
 schema:'public',
 table:'training_partners',
 filter: `or(requester_id.eq.${user.id},partner_id.eq.${user.id})`
},
 (_payload) => {
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
}, [user])

 return {
 refreshTrigger,
 triggerRefresh
}
}