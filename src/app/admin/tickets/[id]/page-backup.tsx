'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  MessageSquare, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  User,
  Send,
  UserCheck
} from 'lucide-react'

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  // Référence pour éviter les doubles appels
  const initialized = useRef(false)

  const [loading, setLoading] = useState(true)
  const [ticket, setTicket] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [error, setError] = useState<string>('')
  const [responseMessage, setResponseMessage] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)
  const [isInternalNote, setIsInternalNote] = useState(false)

  useEffect(() => {
    // Éviter les doubles appels avec useRef
    if (initialized.current) return
    initialized.current = true

    console.log('💚 [FINAL] Initialisation UNIQUE - Ticket ID:', ticketId)

    const loadTicketData = async () => {
      try {
        setLoading(true)
        setError('')
        
        console.log('💚 [FINAL] Import Supabase...')
        const { createClient } = await import('@/utils/supabase/client')
        const supabase = createClient()
        
        console.log('💚 [FINAL] Vérification auth...')
        const { data: { user }, error: userError } = await supabase.auth.getUser()
        
        if (userError || !user) {
          throw new Error('Non authentifié')
        }
        
        console.log('💚 [FINAL] User OK:', user.email)
        
        console.log('💚 [FINAL] Vérification rôles admin...')
        const { data: roleData, error: roleError } = await supabase
          .from('user_roles')
          .select('role, is_active, expires_at')
          .eq('user_id', user.id)
          .in('role', ['admin', 'super_admin', 'moderator'])
          .eq('is_active', true)
          .maybeSingle()

        if (roleError || !roleData) {
          throw new Error('Permissions admin insuffisantes')
        }
        
        console.log('💚 [FINAL] Admin role OK:', roleData.role)
        
        console.log('💚 [FINAL] Chargement ticket...')
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (ticketError || !ticketData) {
          throw new Error('Ticket non trouvé')
        }
        
        console.log('💚 [FINAL] Ticket chargé:', ticketData.title)
        setTicket(ticketData)
        
        console.log('💚 [FINAL] Chargement réponses...')
        const { data: responsesData, error: responsesError } = await supabase
          .from('ticket_responses')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        if (responsesError) {
          console.error('💚 [FINAL] Erreur réponses:', responsesError)
        }

        console.log('💚 [FINAL] Réponses chargées:', responsesData?.length || 0)
        
        // Enrichir avec les données utilisateur manuellement
        const enrichedResponses = []
        if (responsesData && responsesData.length > 0) {
          for (const response of responsesData) {
            // Récupérer les données utilisateur séparément
            const { data: userProfile } = await supabase
              .from('profiles')
              .select('email, full_name')
              .eq('id', response.user_id)
              .single()
            
            enrichedResponses.push({
              ...response,
              profiles: userProfile || { email: 'Utilisateur inconnu', full_name: null }
            })
          }
        }
        
        setResponses(enrichedResponses)
        
        console.log('💚 [FINAL] ✅ CHARGEMENT RÉUSSI COMPLET!')
        
      } catch (err) {
        console.error('💚 [FINAL] ❌ ERREUR:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadTicketData()
  }, [ticketId]) // ticketId comme seule dépendance

  // Fonction pour envoyer une réponse
  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !ticket) return

    setSendingResponse(true)
    
    try {
      console.log('💚 [FINAL] Envoi réponse...')
      
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
      
      console.log('💚 [FINAL] Réponse envoyée avec succès')
      setResponseMessage('')
      setIsInternalNote(false)
      
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
            .select('email, full_name')
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
      console.error('💚 [FINAL] Erreur envoi:', err)
      alert('Erreur lors de l\'envoi de la réponse')
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
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Erreur d'accès</h3>
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
        <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Retour aux tickets"
          >
            <ArrowLeft className="h-5 w-5 text-gray-600" />
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
              {ticket.priority?.toUpperCase()}
            </span>
          </div>
        </div>

        <div className={`flex items-center space-x-2 text-sm ${
          ticket.status === 'resolved' ? 'text-green-600' :
          ticket.status === 'in_progress' ? 'text-orange-600' :
          ticket.status === 'open' ? 'text-blue-600' :
          'text-gray-600'
        }`}>
          {ticket.status === 'resolved' ? <CheckCircle className="h-4 w-4" /> :
           ticket.status === 'in_progress' ? <Clock className="h-4 w-4" /> :
           <AlertTriangle className="h-4 w-4" />}
          <span className="font-medium">Statut: {ticket.status}</span>
        </div>
      </div>

      {/* Description du ticket */}
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
            <motion.div
              key={response.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-xl shadow-md p-6"
            >
              <div className="flex items-start space-x-3">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                  response.is_internal ? 'bg-orange-100' : 
                  response.user_id === ticket.user_id ? 'bg-blue-100' : 'bg-green-100'
                }`}>
                  {response.is_internal ? (
                    <UserCheck className="h-5 w-5 text-orange-600" />
                  ) : response.user_id === ticket.user_id ? (
                    <User className="h-5 w-5 text-blue-600" />
                  ) : (
                    <UserCheck className="h-5 w-5 text-green-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {response.profiles?.email || 'Support'}
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
            </motion.div>
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
                <Send className="h-4 w-4 mr-2" />
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