'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  ArrowLeft,
  MessageCircle,
  Clock,
  CheckCircle,
  AlertTriangle,
  Mail,
  Calendar,
  User,
  Tag,
  Send,
  Shield
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import { useSupport } from '@/hooks/useSupport'
// import RateLimitInfo from '@/components/support/RateLimitInfo'
import Link from 'next/link'

interface TicketDetail {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  updated_at: string
  user_email?: string  // Optionnel comme dans SupportTicket
  user_id?: string     // Optionnel comme dans SupportTicket
}

interface TicketResponse {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_internal: boolean
  is_solution: boolean
  created_at: string
  updated_at: string
}

export default function TicketDetailPage() {
  const params = useParams()
  // const router = useRouter() // Non utilisé actuellement
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<TicketDetail | null>(null)
  const [responses, setResponses] = useState<TicketResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [userResponse, setUserResponse] = useState('')
  const [submitting, setSubmitting] = useState(false)
  // const [currentUser, setCurrentUser] = useState<any>(null) // Non utilisé
  
  // 🚀 Activation de la communication bidirectionnelle
  const { addTicketResponse, getTicketWithResponses } = useSupport()

  useEffect(() => {
    const fetchTicketDetails = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('Utilisateur non connecté')
          return
        }

        // User authentifié - continuons

        // Récupérer les détails du ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .eq('user_id', user.id) // SÉCURITÉ: Seulement les tickets de l'utilisateur
          .single()

        if (ticketError) {
          if (ticketError.code === 'PGRST116') {
            setError('Ticket non trouvé ou accès non autorisé')
          } else {
            throw ticketError
          }
          return
        }

        setTicket(ticketData)

        // 🚀 UTILISER LA MÊME LOGIQUE QUE L'ADMIN pour récupérer les réponses
        try {
          const { responses: responsesData } = await getTicketWithResponses(ticketId)
          setResponses(responsesData || [])
        } catch (responseError) {
          console.error('[DEBUG] Erreur récupération réponses:', responseError)
          // Fallback vers la méthode directe mais on log pour debug
          const { data: responsesData, error: responsesError } = await supabase
            .from('ticket_responses')
            .select('*')
            .eq('ticket_id', ticketId)
            .order('created_at', { ascending: true })
          
          if (responsesError) {
            console.warn('Erreur chargement réponses (fallback):', responsesError)
          } else {
            setResponses(responsesData || [])
          }
        }

      } catch (err) {
        console.error('Erreur lors de la récupération du ticket:', err instanceof Error ? err.message : String(err))
        setError('Impossible de charger les détails du ticket')
      } finally {
        setLoading(false)
      }
    }

    if (ticketId) {
      fetchTicketDetails()
    }
  }, [ticketId])

  const handleSubmitResponse = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!userResponse.trim() || submitting) return

    setSubmitting(true)
    setError(null)
    
    try {
      // 🚀 ACTIVÉ: Communication bidirectionnelle sécurisée
      const success = await addTicketResponse(ticketId, userResponse.trim(), false, false)
      
      if (success) {
        // Recharger la conversation complète
        const { ticket: updatedTicket, responses: updatedResponses } = await getTicketWithResponses(ticketId)
        
        if (updatedTicket) {
          setTicket(updatedTicket)
          setResponses(updatedResponses)
          setUserResponse('')
          
          // ✅ Message de succès temporaire
          const successMessage = document.createElement('div')
          successMessage.className = 'fixed top-4 right-4 bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded-lg shadow-lg z-50'
          successMessage.innerHTML = '✓ Réponse envoyée ! L\'équipe sera notifiée.'
          document.body.appendChild(successMessage)
          setTimeout(() => successMessage.remove(), 3000)
        }
      } else {
        throw new Error('Échec envoi réponse')
      }

    } catch (err) {
      console.error('Erreur envoi réponse:', err)
      setError('Erreur lors de l\'envoi de votre réponse. Veuillez réessayer.')
    } finally {
      setSubmitting(false)
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'pending':
        return <Clock className="h-5 w-5 text-yellow-500" />
      case 'open':
        return <Clock className="h-5 w-5 text-blue-500" />
      case 'in_progress':
        return <AlertTriangle className="h-5 w-5 text-orange-800" />
      case 'resolved':
        return <CheckCircle className="h-5 w-5 text-green-500" />
      case 'closed':
        return <CheckCircle className="h-5 w-5 text-gray-500" />
      default:
        return <MessageCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'pending': return 'En attente'
      case 'open': return 'Ouvert'
      case 'in_progress': return 'En cours'
      case 'resolved': return 'Résolu'
      case 'closed': return 'Fermé'
      default: return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300'
      case 'open': return 'bg-blue-100 text-blue-800 border-blue-300'
      case 'in_progress': return 'bg-orange-100 text-orange-800 border-orange-300'
      case 'resolved': return 'bg-green-100 text-green-800 border-green-300'
      case 'closed': return 'bg-gray-100 text-gray-800 border-gray-300'
      default: return 'bg-gray-100 text-gray-800 border-gray-300'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'text-red-600'
      case 'medium': return 'text-orange-800'
      case 'low': return 'text-green-600'
      default: return 'text-gray-600'
    }
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-surface-darkAlt">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-200 rounded w-1/3 mb-6"></div>
            <div className="bg-white dark:bg-surface-dark rounded-lg p-8">
              <div className="h-6 bg-gray-200 rounded w-3/4 mb-4"></div>
              <div className="space-y-3">
                {[...Array(3)].map((_, i) => (
                  <div key={i} className="h-4 bg-gray-200 rounded w-full"></div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-surface-darkAlt">
        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="bg-white dark:bg-surface-dark rounded-lg p-8 text-center">
            <AlertTriangle className="h-16 w-16 text-red-500 mx-auto mb-4" />
            <h1 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
              {error || 'Ticket introuvable'}
            </h1>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              Le ticket demandé n'existe pas ou vous n'avez pas l'autorisation de le voir.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center gap-2 bg-orange-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-orange-700 transition-colors"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au profil
            </Link>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-surface-dark dark:to-surface-darkAlt">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Link 
            href="/profile"
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-800 transition-colors"
            aria-label="Retour au profil"
          >
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Détail du ticket</h1>
            <p className="text-gray-600 dark:text-gray-300">
              Ticket #{ticket.id.slice(-8)}
            </p>
          </div>
        </div>

        {/* Détail du ticket */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6"
        >
          <div className="flex items-start justify-between mb-4">
            <div className="flex-1">
              <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                {ticket.title}
              </h2>
              <p className="text-gray-600 dark:text-gray-300 leading-relaxed">
                {ticket.description}
              </p>
            </div>
            <div className="flex items-center gap-2 ml-4">
              {getStatusIcon(ticket.status)}
              <span className={`px-3 py-1 rounded-full text-sm font-medium border ${getStatusColor(ticket.status)}`}>
                {getStatusLabel(ticket.status)}
              </span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2">
              <Tag className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Catégorie:</span>
              <span className="font-medium capitalize">{ticket.category}</span>
            </div>
            <div className="flex items-center gap-2">
              <AlertTriangle className={`h-4 w-4 ${getPriorityColor(ticket.priority)}`} />
              <span className="text-gray-600 dark:text-gray-400">Priorité:</span>
              <span className={`font-medium capitalize ${getPriorityColor(ticket.priority)}`}>
                {ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
              </span>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-400" />
              <span className="text-gray-600 dark:text-gray-400">Créé:</span>
              <span className="font-medium">{formatDate(ticket.created_at)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Mail className="h-4 w-4 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Réponses:</span>
              <span className="font-medium">{responses.length}</span>
            </div>
          </div>
        </motion.div>

        {/* Conversation */}
        {responses.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6 mb-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <MessageCircle className="h-5 w-5 text-blue-500" />
              Conversation ({responses.length} réponse{responses.length > 1 ? 's' : ''})
            </h3>
            
            <div className="space-y-4">
              {responses.map((response, index) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg border transition-all duration-200 ${
                    response.user_id === ticket?.user_id
                      ? 'bg-orange-50 dark:bg-orange-900/10 border-orange-200 dark:border-orange-800 ml-0 mr-8'
                      : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800 ml-8 mr-0'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                      response.user_id === ticket?.user_id
                        ? 'bg-orange-100 dark:bg-orange-800'
                        : 'bg-blue-100 dark:bg-blue-800'
                    }`}>
                      {response.user_id === ticket?.user_id ? (
                        <User className="h-4 w-4 text-orange-700 dark:text-orange-300" />
                      ) : (
                        <Shield className="h-4 w-4 text-blue-700 dark:text-blue-300" />
                      )}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className={`font-medium text-sm ${
                          response.user_id === ticket?.user_id
                            ? 'text-orange-900 dark:text-orange-100'
                            : 'text-blue-900 dark:text-blue-100'
                        }`}>
                          {response.user_id === ticket?.user_id 
                            ? 'Vous'
                            : 'Équipe Support'
                          }
                        </span>
                        {response.is_internal && (
                          <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 text-xs rounded-full">
                            Note interne
                          </span>
                        )}
                      </div>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        {formatDate(response.created_at)}
                      </span>
                    </div>
                  </div>
                  <div className={`rounded-lg p-3 ${
                    response.user_id === ticket?.user_id
                      ? 'bg-white dark:bg-gray-800'
                      : 'bg-white dark:bg-gray-800'
                  }`}>
                    <p className="text-gray-800 dark:text-gray-200 leading-relaxed whitespace-pre-wrap">
                      {response.message}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {/* Formulaire de réponse - seulement si ticket ouvert */}
        {(ticket.status === 'pending' || ticket.status === 'open' || ticket.status === 'in_progress' || ticket.status === 'waiting_user') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-white dark:bg-surface-dark rounded-lg border border-gray-200 dark:border-gray-800 p-6"
          >
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
              <Send className="h-5 w-5 text-orange-600" />
              Ajouter une réponse
            </h3>
            
            
            <form onSubmit={handleSubmitResponse} className="space-y-4">
              <div>
                <label htmlFor="response" className="sr-only">
                  Votre réponse
                </label>
                <textarea
                  id="response"
                  rows={4}
                  value={userResponse}
                  onChange={(e) => setUserResponse(e.target.value)}
                  placeholder="Tapez votre réponse ici..."
                  className="w-full p-3 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent dark:bg-gray-800 dark:text-white resize-none"
                  disabled={submitting}
                />
              </div>
              
              <div className="flex justify-end">
                <button
                  type="submit"
                  disabled={!userResponse.trim() || submitting}
                  className="inline-flex items-center gap-2 bg-orange-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {submitting ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <Send className="h-4 w-4" />
                  )}
                  {submitting ? 'Envoi...' : 'Envoyer la réponse'}
                </button>
              </div>
            </form>
          </motion.div>
        )}

        {/* Message si ticket fermé/résolu */}
        {(ticket.status === 'resolved' || ticket.status === 'closed') && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-green-50 dark:bg-green-900/10 border border-green-200 dark:border-green-800 rounded-lg p-6 text-center"
          >
            <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
            <h3 className="text-lg font-medium text-green-800 dark:text-green-300 mb-2">
              Ticket {ticket.status === 'resolved' ? 'résolu' : 'fermé'}
            </h3>
            <p className="text-green-700 dark:text-green-400">
              Ce ticket a été {ticket.status === 'resolved' ? 'résolu' : 'fermé'}. 
              Si vous avez encore des questions, n'hésitez pas à créer un nouveau ticket.
            </p>
          </motion.div>
        )}
      </div>
    </div>
  )
}