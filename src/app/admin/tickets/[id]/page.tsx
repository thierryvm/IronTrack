'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

export default function AdminTicketPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)
  const [isInternalNote, setIsInternalNote] = useState(false)

  // Protection double chargement simple
  const mountedRef = useRef(false)

  // Charger les données du ticket une seule fois
  useEffect(() => {
    if (!ticketId || mountedRef.current) return
    mountedRef.current = true
    
    console.log('🔄 [ADMIN] Chargement ticket:', ticketId.slice(-8))

    const loadTicketData = async () => {
      try {
        setLoading(true)
        setError('')
        // Marquage déjà fait avant l'appel
        
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        
        // Auth check simple
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) throw new Error('Non authentifié')
        
        // Admin role check simple
        const { data: roleData } = await supabase
          .from('user_roles')
          .select('role')
          .eq('user_id', user.id)
          .in('role', ['admin', 'super_admin', 'moderator'])
          .eq('is_active', true)
          .maybeSingle()

        if (!roleData) throw new Error('Permissions admin insuffisantes')
        
        // Load ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (ticketError) throw new Error('Ticket non trouvé')
        setTicket(ticketData)
        
        // Load responses
        const { data: responsesData } = await supabase
          .from('ticket_responses')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        // Enrichir avec données utilisateur
        const enrichedResponses = []
        if (responsesData?.length) {
          for (const response of responsesData) {
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('email, full_name, pseudo')
              .eq('id', response.user_id)
              .single()
            
            enrichedResponses.push({
              ...response,
              profiles: userProfile || { email: 'Support', full_name: null }
            })
          }
        }
        
        setResponses(enrichedResponses)
        console.log('✅ [ADMIN] Chargement terminé -', enrichedResponses.length, 'réponses')
        
      } catch (err) {
        console.error('❌ [ADMIN] Erreur:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
        mountedRef.current = false // Reset en cas d'erreur pour retry
      } finally {
        setLoading(false)
      }
    }

    loadTicketData()
    
  }, [ticketId]) // Seule dépendance nécessaire

  // Fonction pour envoyer une réponse
  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !ticket) return

    setSendingResponse(true)
    
    try {
      console.log('📤 [ADMIN] Envoi réponse...')
      
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()
      
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) throw new Error('Non authentifié')

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticket.id,
          user_id: user.id,
          message: responseMessage,
          is_internal: isInternalNote,
          is_solution: false
        })

      if (error) throw error
      
      console.log('✅ [ADMIN] Réponse envoyée')
      setResponseMessage('')
      setIsInternalNote(false)
      
      // Mettre à jour le statut du ticket automatiquement
      const newStatus = isInternalNote ? ticket.status : 'in_progress'
      await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)
      
      setTicket((prev: any) => ({ ...prev, status: newStatus }))
      
      // Recharger les réponses (sans jointure problématique)
      const { data: newResponses } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      // Enrichir avec données utilisateur
      const enrichedNewResponses = []
      if (newResponses && newResponses.length > 0) {
        for (const response of newResponses) {
          const { data: userProfile } = await supabase
            .from('profiles')
            .select('email, full_name, pseudo')
            .eq('id', response.user_id)
            .single()
          
          enrichedNewResponses.push({
            ...response,
            profiles: userProfile || { email: 'Utilisateur inconnu', full_name: null }
          })
        }
      }
      
      setResponses(enrichedNewResponses)
      
    } catch (err) {
      console.error('❌ [ADMIN] Erreur envoi:', err)
      setError('Erreur lors de l\'envoi de la réponse')
    } finally {
      setSendingResponse(false)
    }
  }

  // États de chargement
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du ticket admin...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur de chargement</h3>
        <p className="text-gray-500 mb-4">{error}</p>
        <button
          onClick={() => router.push('/admin/tickets')}
          className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
        >
          Retour aux tickets
        </button>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Ticket non trouvé</h3>
        <p className="text-gray-500 mb-4">Ce ticket n'existe pas.</p>
        <button
          onClick={() => router.push('/admin/tickets')}
          className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
        >
          Retour aux tickets
        </button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-4 mb-4">
          <button
            onClick={() => router.push('/admin/tickets')}
            className="flex items-center px-3 py-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600 hover:text-gray-800"
            title="Retour aux tickets"
          >
            ← Retour aux tickets
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-gray-900">
              {ticket.title}
            </h1>
            <p className="text-gray-600 mt-1">
              {ticket.category} • Créé le {new Date(ticket.created_at).toLocaleDateString('fr-FR')} 
              • Par {ticket.user_email || 'Utilisateur'}
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.priority === 'critical' ? 'bg-red-100 text-red-700' :
              ticket.priority === 'high' ? 'bg-orange-100 text-orange-700' :
              ticket.priority === 'medium' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {ticket.priority === 'critical' ? '🚨 CRITIQUE' :
               ticket.priority === 'high' ? '🔥 ÉLEVÉE' :
               ticket.priority === 'medium' ? '📋 NORMALE' : '📝 FAIBLE'}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
              ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
              ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
              ticket.status === 'closed' ? 'bg-gray-100 text-gray-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {ticket.status === 'resolved' ? '✅ RÉSOLU' :
               ticket.status === 'in_progress' ? '🔄 EN COURS' :
               ticket.status === 'open' ? '🆕 OUVERT' :
               ticket.status === 'closed' ? '🔒 FERMÉ' : ticket.status}
            </span>
          </div>
        </div>
      </div>

      {/* Description */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Description</h3>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="text-gray-700 whitespace-pre-wrap">{ticket.description}</p>
        </div>
      </div>

      {/* Conversation */}
      {responses.length > 0 && (
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-900">Conversation ({responses.length})</h3>
          {responses.map((response) => (
            <div key={response.id} className="bg-white rounded-xl shadow-md p-6">
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  response.is_internal ? 'bg-orange-100' : 
                  response.user_id === ticket.user_id ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {response.is_internal ? '🔒' :
                   response.user_id === ticket.user_id ? '👤' : '🛠️'}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {(() => {
                        // Si c'est une réponse admin (différent du user_id du ticket)
                        if (response.user_id !== ticket.user_id) {
                          return 'Équipe Support'
                        }
                        // Si c'est l'utilisateur du ticket, afficher pseudo ou nom
                        const profile = response.profiles
                        return profile?.pseudo || profile?.full_name || profile?.email || 'Utilisateur'
                      })()}
                    </span>
                    {response.is_internal && (
                      <span className="px-2 py-0.5 bg-orange-100 text-orange-700 text-xs rounded-full">
                        Note interne
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(response.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-3">
                    <p className="text-sm text-gray-700 whitespace-pre-wrap">
                      {response.message}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Contrôles Admin */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Gestion du ticket</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Statut */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Statut
            </label>
            <select
              value={ticket?.status || 'open'}
              onChange={async (e) => {
                const newStatus = e.target.value
                try {
                  const { createClient } = await import('@/utils/supabase/client')
                  const supabase = createClient()
                  
                  const { error } = await supabase
                    .from('support_tickets')
                    .update({ status: newStatus })
                    .eq('id', ticketId)
                  
                  if (!error) {
                    setTicket((prev: any) => ({ ...prev, status: newStatus }))
                  }
                } catch (err) {
                  console.error('Erreur mise à jour statut:', err)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="open">Ouvert</option>
              <option value="in_progress">En cours</option>
              <option value="resolved">Résolu</option>
              <option value="closed">Fermé</option>
            </select>
          </div>
          
          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={ticket?.priority || 'medium'}
              onChange={async (e) => {
                const newPriority = e.target.value
                try {
                  const { createClient } = await import('@/utils/supabase/client')
                  const supabase = createClient()
                  
                  const { error } = await supabase
                    .from('support_tickets')
                    .update({ priority: newPriority })
                    .eq('id', ticketId)
                  
                  if (!error) {
                    setTicket((prev: any) => ({ ...prev, priority: newPriority }))
                  }
                } catch (err) {
                  console.error('Erreur mise à jour priorité:', err)
                }
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="low">Faible</option>
              <option value="medium">Normale</option>
              <option value="high">Élevée</option>
              <option value="critical">Critique</option>
            </select>
          </div>
        </div>
      </div>

      {/* Formulaire de réponse */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Répondre au ticket</h3>
        
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <label className="flex items-center space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isInternalNote}
                onChange={(e) => setIsInternalNote(e.target.checked)}
                className="w-4 h-4 text-orange-600 focus:ring-orange-500 rounded"
              />
              <span className="text-sm text-gray-700">Note interne (non visible par l'utilisateur)</span>
            </label>
          </div>

          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder={isInternalNote 
              ? "Rédigez une note interne pour l'équipe..."
              : "Rédigez votre réponse à l'utilisateur..."
            }
          />

          <div className="flex items-center justify-between">
            <div className="text-xs text-gray-500">
              {responseMessage.length} caractères
            </div>
            <button
              onClick={handleSendResponse}
              disabled={!responseMessage.trim() || sendingResponse}
              className={`flex items-center px-4 py-2 rounded-lg transition-colors ${
                !responseMessage.trim() || sendingResponse
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isInternalNote
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {sendingResponse ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <span className="mr-2">💬</span>
              )}
              {sendingResponse 
                ? 'Envoi...' 
                : isInternalNote 
                  ? 'Ajouter note interne'
                  : 'Envoyer réponse'
              }
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}