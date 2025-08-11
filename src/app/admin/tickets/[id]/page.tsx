'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useSupport } from '@/hooks/useSupport'

export default function AdminTicketPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  // Authentification admin avec hook stable
  const { user, loading: authLoading, error: authError, isAuthenticated } = useAdminAuth()
  const { getTicketWithResponses, addTicketResponse, updateTicketStatus } = useSupport()
  
  const [ticket, setTicket] = useState<any>(null)
  const [responses, setResponses] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [responseMessage, setResponseMessage] = useState('')
  const [sendingResponse, setSendingResponse] = useState(false)
  const [isInternalNote, setIsInternalNote] = useState(false)

  // Charger les données du ticket une seule fois
  useEffect(() => {
    if (!isAuthenticated || !user || authLoading) return

    const loadTicketData = async () => {
      try {
        setLoading(true)
        setError('')
        
        console.log('🔧 [ADMIN_TICKET] Chargement ticket:', ticketId)
        const result = await getTicketWithResponses(ticketId)
        
        if (!result.ticket) {
          setError('Ticket non trouvé')
          return
        }
        
        setTicket(result.ticket)
        setResponses(result.responses)
        console.log('🔧 [ADMIN_TICKET] Chargement réussi:', result.ticket.title)
        
      } catch (err) {
        console.error('🔧 [ADMIN_TICKET] Erreur:', err)
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadTicketData()
  }, [isAuthenticated, user, authLoading, ticketId, getTicketWithResponses])

  // Fonction pour envoyer une réponse
  const handleSendResponse = async () => {
    if (!responseMessage.trim() || !ticket) return

    setSendingResponse(true)
    
    try {
      const success = await addTicketResponse(ticket.id, responseMessage, isInternalNote)
      
      if (success) {
        setResponseMessage('')
        setIsInternalNote(false)
        
        // Recharger les données
        const result = await getTicketWithResponses(ticketId)
        if (result.ticket) {
          setTicket(result.ticket)
          setResponses(result.responses)
        }
      }
      
    } catch (err) {
      console.error('Erreur envoi réponse:', err)
    } finally {
      setSendingResponse(false)
    }
  }

  // États d'authentification
  if (authLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Vérification des permissions admin...</p>
        </div>
      </div>
    )
  }

  if (authError || !isAuthenticated) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès non autorisé</h3>
        <p className="text-gray-500 mb-4">{authError || 'Permissions administrateur requises'}</p>
        <button
          onClick={() => router.push('/admin')}
          className="px-4 py-2 bg-orange-700 text-white rounded-lg hover:bg-orange-800 transition-colors"
        >
          Retour admin
        </button>
      </div>
    )
  }

  // États de chargement des données
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du ticket...</p>
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
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Retour aux tickets"
          >
            ← Retour
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
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              ticket.status === 'resolved' ? 'bg-green-100 text-green-700' :
              ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-700' :
              ticket.status === 'open' ? 'bg-blue-100 text-blue-700' :
              'bg-gray-100 text-gray-700'
            }`}>
              {ticket.status?.toUpperCase()}
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
                  👤
                </div>
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <span className="text-sm font-medium text-gray-900">
                      {response.profiles?.email || response.user_email || 'Support'}
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
              <span className="text-sm text-gray-700">Note interne</span>
            </label>
          </div>

          <textarea
            value={responseMessage}
            onChange={(e) => setResponseMessage(e.target.value)}
            rows={6}
            className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            placeholder={isInternalNote 
              ? "Note interne pour l'équipe..."
              : "Réponse à l'utilisateur..."
            }
          />

          <div className="flex justify-end">
            <button
              onClick={handleSendResponse}
              disabled={!responseMessage.trim() || sendingResponse}
              className={`px-6 py-2 rounded-lg transition-colors ${
                !responseMessage.trim() || sendingResponse
                  ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                  : isInternalNote
                    ? 'bg-orange-600 text-white hover:bg-orange-700'
                    : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
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