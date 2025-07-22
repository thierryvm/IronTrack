'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  MessageSquare, 
  User,
  Clock,
  AlertCircle,
  CheckCircle,
  Reply,
  Archive
} from 'lucide-react'
import { useAdminAuthComplete as useAdminAuth } from '@/hooks/useAdminAuthComplete'
import { createClient } from '@/utils/supabase/client'

interface SupportTicket {
  id: string
  title: string
  description: string
  category: string
  status: string
  priority: string
  created_at: string
  updated_at: string
  user_id: string
  url?: string
}

interface TicketResponse {
  id: string
  ticket_id: string
  user_id: string  // Correspond à la vraie colonne
  message: string  // Correspond à la vraie colonne
  created_at: string
  is_internal: boolean
  is_solution: boolean
  attachments: unknown
  updated_at: string
}

export default function AdminTicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<SupportTicket | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [responding, setResponding] = useState(false)
  const [responseText, setResponseText] = useState('')
  const [isInternal, setIsInternal] = useState(false)

  const { user, hasPermission, logAdminAction, loading: authLoading } = useAdminAuth()
  const supabase = createClient()

  // Charger le ticket et les réponses
  useEffect(() => {
    const loadTicketDetails = async () => {
      console.log('[DEBUG] loadTicketDetails - authLoading:', authLoading, 'hasPermission:', hasPermission('moderator'))
      
      // Attendre que l'auth soit chargée
      if (authLoading) {
        console.log('[DEBUG] Auth still loading, skipping...')
        return
      }
      if (!hasPermission('moderator')) {
        console.log('[DEBUG] No moderator permission, skipping...')
        return
      }

      console.log('[DEBUG] Starting to load ticket details...')
      try {
        setLoading(true)

        // Charger le ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (ticketError) {
          console.error('Erreur chargement ticket:', ticketError)
          return
        }

        setTicket(ticketData)

        // Charger les réponses
        const { data: responsesData, error: responsesError } = await supabase
          .from('ticket_responses')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        if (responsesError) {
          console.error('Erreur chargement réponses:', responsesError)
        } else {
          setResponses(responsesData || [])
        }

        // Log de consultation
        await logAdminAction('view_ticket_detail', 'support_ticket', ticketId)

      } catch (error) {
        console.error('Erreur:', error)
      } finally {
        setLoading(false)
      }
    }

    loadTicketDetails()
  }, [ticketId, hasPermission, logAdminAction, supabase, authLoading])

  // Répondre au ticket
  const handleResponse = async () => {
    if (!responseText.trim() || !hasPermission('moderator')) return

    try {
      setResponding(true)

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          user_id: user?.id, // Admin qui répond
          message: responseText.trim(),
          is_internal: isInternal
        })

      if (error) {
        console.error('Erreur ajout réponse:', error)
        return
      }

      // Mettre à jour le statut du ticket si nécessaire
      if (!isInternal && ticket?.status === 'open') {
        await supabase
          .from('support_tickets')
          .update({ status: 'in_progress' })
          .eq('id', ticketId)
      }

      // Recharger les réponses
      const { data: newResponses } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      setResponses(newResponses || [])
      setResponseText('')
      setIsInternal(false)

      await logAdminAction('respond_to_ticket', 'support_ticket', ticketId, {
        is_internal: isInternal,
        message_length: responseText.trim().length
      })

    } catch (error) {
      console.error('Erreur réponse:', error)
    } finally {
      setResponding(false)
    }
  }

  // Changer le statut du ticket
  const changeTicketStatus = async (newStatus: string) => {
    if (!hasPermission('moderator') || !ticket) return

    try {
      const { error } = await supabase
        .from('support_tickets')
        .update({ status: newStatus })
        .eq('id', ticketId)

      if (error) {
        console.error('Erreur changement statut:', error)
        return
      }

      setTicket({ ...ticket, status: newStatus })
      
      await logAdminAction('change_ticket_status', 'support_ticket', ticketId, {
        old_status: ticket.status,
        new_status: newStatus
      })

    } catch (error) {
      console.error('Erreur:', error)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-4 w-4 text-blue-500" />
      case 'in_progress':
        return <AlertCircle className="h-4 w-4 text-orange-500" />
      case 'resolved':
      case 'closed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      default:
        return <Clock className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusLabel = (status: string) => {
    const labels = {
      'open': 'Ouvert',
      'in_progress': 'En cours',
      'waiting_user': 'En attente utilisateur',
      'resolved': 'Résolu',
      'closed': 'Fermé'
    }
    return labels[status as keyof typeof labels] || status
  }

  const getCategoryEmoji = (category: string) => {
    const emojis = {
      'bug': '🐛',
      'feature': '💡',
      'help': '❓',
      'feedback': '💬',
      'account': '👤',
      'payment': '💳'
    }
    return emojis[category as keyof typeof emojis] || '📝'
  }

  if (!hasPermission('moderator')) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-12 w-12 text-red-500 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Accès refusé</h1>
          <p className="text-gray-600">Permissions de modérateur requises.</p>
        </div>
      </div>
    )
  }

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600">Chargement du ticket...</p>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <MessageSquare className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h1 className="text-xl font-semibold text-gray-900 mb-2">Ticket introuvable</h1>
          <p className="text-gray-600">Ce ticket n&apos;existe pas ou a été supprimé.</p>
          <button
            onClick={() => router.push('/admin/tickets')}
            className="mt-4 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg"
          >
            Retour aux tickets
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-6">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header avec navigation */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/admin/tickets')}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <ArrowLeft className="h-5 w-5 text-gray-600" />
              </button>
              <div className="flex items-center space-x-3">
                <div className="p-3 bg-orange-100 rounded-xl">
                  <MessageSquare className="h-8 w-8 text-orange-500" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-gray-900">Ticket #{ticket.id.slice(0, 8)}...</h1>
                  <div className="flex items-center space-x-4 mt-1">
                    <span className="text-sm text-gray-600">
                      {getCategoryEmoji(ticket.category)} {ticket.category}
                    </span>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(ticket.status)}
                      <span className="text-sm font-medium">{getStatusLabel(ticket.status)}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions rapides */}
            <div className="flex items-center space-x-2">
              {ticket.status !== 'resolved' && (
                <button
                  onClick={() => changeTicketStatus('resolved')}
                  className="flex items-center space-x-2 bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <CheckCircle className="h-4 w-4" />
                  <span>Résoudre</span>
                </button>
              )}
              {ticket.status !== 'closed' && (
                <button
                  onClick={() => changeTicketStatus('closed')}
                  className="flex items-center space-x-2 bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg text-sm"
                >
                  <Archive className="h-4 w-4" />
                  <span>Fermer</span>
                </button>
              )}
            </div>
          </div>

          {/* Détails du ticket */}
          <div className="border-t pt-6">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">{ticket.title}</h2>
            <div className="prose max-w-none text-gray-700 mb-6">
              {ticket.description.split('\\n').map((line, index) => (
                <p key={index} className="mb-2">{line}</p>
              ))}
            </div>

            {/* Métadonnées */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div>
                <span className="text-gray-500">Créé le :</span>
                <div className="font-medium">{new Date(ticket.created_at).toLocaleString('fr-FR')}</div>
              </div>
              <div>
                <span className="text-gray-500">Priorité :</span>
                <div className="font-medium capitalize">{ticket.priority}</div>
              </div>
              <div>
                <span className="text-gray-500">URL :</span>
                <div className="font-medium text-blue-600 truncate">
                  {ticket.url ? (
                    <a href={ticket.url} target="_blank" rel="noopener noreferrer" className="hover:underline">
                      {ticket.url}
                    </a>
                  ) : (
                    'Non renseignée'
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Réponses */}
        <div className="bg-white rounded-xl shadow-md p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Réponses ({responses.length})
          </h3>

          <div className="space-y-4">
            {responses.length === 0 ? (
              <p className="text-gray-500 text-center py-8">Aucune réponse pour le moment</p>
            ) : (
              responses.map((response) => (
                <motion.div
                  key={response.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className={`p-4 rounded-lg border-l-4 ${
                    response.is_internal 
                      ? 'bg-yellow-50 border-yellow-400' 
                      : 'bg-blue-50 border-blue-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-2">
                      <User className="h-4 w-4 text-gray-500" />
                      <span className="text-sm font-medium text-gray-900">
                        Admin {response.user_id.slice(0, 8)}...
                      </span>
                      {response.is_internal && (
                        <span className="bg-yellow-200 text-yellow-800 text-xs px-2 py-1 rounded-full">
                          Interne
                        </span>
                      )}
                    </div>
                    <span className="text-xs text-gray-500">
                      {new Date(response.created_at).toLocaleString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{response.message}</p>
                </motion.div>
              ))
            )}
          </div>
        </div>

        {/* Formulaire de réponse */}
        <div className="bg-white rounded-xl shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <Reply className="h-5 w-5 mr-2" />
            Répondre au ticket
          </h3>

          <div className="space-y-4">
            <textarea
              value={responseText}
              onChange={(e) => setResponseText(e.target.value)}
              placeholder="Tapez votre réponse..."
              rows={4}
              className="w-full border border-gray-300 rounded-lg px-4 py-3 focus:outline-none focus:ring-2 focus:ring-orange-500 focus:border-transparent resize-none"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-gray-300 text-orange-500 focus:ring-orange-500"
                />
                <span className="text-sm text-gray-700">Note interne (non visible par l&apos;utilisateur)</span>
              </label>

              <button
                onClick={handleResponse}
                disabled={responding || !responseText.trim()}
                className="flex items-center space-x-2 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white px-6 py-2 rounded-lg"
              >
                {responding ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    <span>Envoi...</span>
                  </>
                ) : (
                  <>
                    <Reply className="h-4 w-4" />
                    <span>Envoyer la réponse</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}