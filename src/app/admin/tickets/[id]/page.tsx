'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'

// Types pour les tickets admin
interface AdminTicket {
  id: string
  title: string
  category: string
  priority: 'low' | 'medium' | 'high' | 'critical'
  status: 'open' | 'in_progress' | 'resolved' | 'closed'
  created_at: string
  user_id: string
  user_email?: string
  description?: string
}

interface TicketResponse {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_internal: boolean
  created_at: string
  profiles?: {
    email: string
    full_name?: string
    pseudo?: string
  }
}

export default function AdminTicketPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<AdminTicket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)
  const [isInternalNote, setIsInternalNote] = useState(false)
  const [adminUsers, setAdminUsers] = useState<Set<string>>(new Set())
  const [pendingChanges, setPendingChanges] = useState<{status?: string, priority?: string}>({})
  const [savingChanges, setSavingChanges] = useState(false)

  // Protection double chargement simple
  const mountedRef = useRef(false)

  // Fonctions utilitaires pour l'affichage français
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open': return '🆕 OUVERT'
      case 'in_progress': return '🔄 EN COURS'
      case 'waiting_user': return '⏳ EN ATTENTE'
      case 'resolved': return '✅ RÉSOLU'
      case 'closed': return '🔒 FERMÉ'
      default: return status?.toUpperCase() || 'INCONNU'
    }
  }

  const getPriorityLabel = (priority: string) => {
    switch (priority) {
      case 'low': return '📝 FAIBLE'
      case 'medium': return '📋 NORMALE'
      case 'high': return '🔥 ÉLEVÉE'
      case 'critical': return '🚨 CRITIQUE'
      default: return priority?.toUpperCase() || 'NORMALE'
    }
  }

  // Charger les données du ticket une seule fois
  useEffect(() => {
    if (!ticketId || mountedRef.current) return
    mountedRef.current = true
    

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
        
        // Charger liste des utilisateurs admin pour affichage
        const { data: adminUsersList } = await supabase
          .from('user_roles')
          .select('user_id')
          .in('role', ['admin', 'super_admin', 'moderator'])
          .eq('is_active', true)
        
        if (adminUsersList) {
          const adminUserIds = new Set(adminUsersList.map(u => u.user_id))
          setAdminUsers(adminUserIds)
        }
        
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
        .select()

      if (error) {
        console.error('❌ [ADMIN] Erreur insert réponse:', error)
        throw error
      }
      
      setResponseMessage('')
      setIsInternalNote(false)
      
      // Mettre à jour le statut du ticket automatiquement
      const newStatus = isInternalNote ? ticket.status : 'in_progress'
      
      const { error: statusError } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)
      
      if (statusError) {
        console.error('❌ [ADMIN] Erreur update statut:', statusError)
      } else {
        setTicket((prev: AdminTicket | null) => prev ? { ...prev, status: newStatus } : null)
      }
      
      // Recharger les réponses (sans jointure problématique)
      const { data: newResponses, error: responsesError } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })
      
      if (responsesError) {
        console.error('❌ [ADMIN] Erreur rechargement réponses:', responsesError)
      }

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

  // Fonction pour sauvegarder les modifications de statut/priorité
  const handleSaveTicketChanges = async () => {
    if (Object.keys(pendingChanges).length === 0) return

    setSavingChanges(true)
    try {
      const { createClient } = await import('@/utils/supabase/client')
      const supabase = createClient()


      const { error } = await supabase
        .from('support_tickets')
        .update(pendingChanges)
        .eq('id', ticketId)
        .select()
      
      if (error) {
        console.error('❌ Erreur sauvegarde:', error)
        setError('Erreur lors de la sauvegarde des modifications')
      } else {
        setTicket((prev: AdminTicket | null) => prev ? { 
          ...prev, 
          ...pendingChanges,
          priority: (pendingChanges.priority as AdminTicket['priority']) || prev.priority,
          status: (pendingChanges.status as AdminTicket['status']) || prev.status
        } : null)
        setPendingChanges({})
        setError('')
      }
    } catch (err) {
      console.error('💥 Erreur sauvegarde:', err)
      setError('Erreur lors de la sauvegarde')
    } finally {
      setSavingChanges(false)
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
              {getPriorityLabel(ticket.priority)}
            </span>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
              ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
              ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
              ticket.status === 'closed' ? 'bg-gray-100 text-gray-700' :
              ticket.status === 'waiting_user' ? 'bg-yellow-100 text-yellow-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {getStatusLabel(ticket.status)}
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
                        // Si c'est une note interne ou un admin qui répond
                        if (response.is_internal || adminUsers.has(response.user_id)) {
                          return 'Équipe Support'
                        }
                        
                        // Si c'est l'utilisateur original du ticket
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
              value={pendingChanges.status ?? ticket?.status ?? 'open'}
              onChange={(e) => {
                const selectedStatus = e.target.value
                setPendingChanges(prev => ({ ...prev, status: selectedStatus }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="open">🆕 Ouvert</option>
              <option value="in_progress">🔄 En cours</option>
              <option value="waiting_user">⏳ En attente utilisateur</option>
              <option value="resolved">✅ Résolu</option>
              <option value="closed">🔒 Fermé</option>
            </select>
          </div>
          
          {/* Priorité */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Priorité
            </label>
            <select
              value={pendingChanges.priority ?? ticket?.priority ?? 'medium'}
              onChange={(e) => {
                const newPriority = e.target.value
                setPendingChanges(prev => ({ ...prev, priority: newPriority }))
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
            >
              <option value="low">📝 Faible</option>
              <option value="medium">📋 Normale</option>
              <option value="high">🔥 Élevée</option>
              <option value="critical">🚨 Critique</option>
            </select>
          </div>
        </div>
        
        {/* Bouton de sauvegarde et indicateurs */}
        {Object.keys(pendingChanges).length > 0 && (
          <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-700 rounded-lg">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-2 h-2 bg-yellow-500 rounded-full animate-pulse"></div>
                <span className="text-sm text-yellow-700 dark:text-yellow-300">
                  Modifications non sauvegardées
                  {pendingChanges.status && ` • Statut: ${pendingChanges.status}`}
                  {pendingChanges.priority && ` • Priorité: ${pendingChanges.priority}`}
                </span>
              </div>
              
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => setPendingChanges({})}
                  className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Annuler
                </button>
                <button
                  onClick={handleSaveTicketChanges}
                  disabled={savingChanges}
                  className={`flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    savingChanges
                      ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                      : 'bg-green-600 text-white hover:bg-green-700'
                  }`}
                >
                  {savingChanges ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Sauvegarde...
                    </>
                  ) : (
                    <>
                      💾 Enregistrer les modifications
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
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