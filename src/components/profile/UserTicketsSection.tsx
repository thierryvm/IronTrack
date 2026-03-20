'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  MessageCircle, 
  Clock, 
  CheckCircle, 
  AlertTriangle, 
  Plus, 
  Mail,
  ExternalLink,
  Calendar,
  Tag
} from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface UserTicket {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
  updated_at: string
  user_email: string
  response_count: number
}

interface UserTicketsSectionProps {
  className?: string
}

export const UserTicketsSection: React.FC<UserTicketsSectionProps> = ({ 
  className = '' 
}) => {
  const [tickets, setTickets] = useState<UserTicket[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserTickets = async () => {
      try {
        const supabase = createClient()
        const { data: { user } } = await supabase.auth.getUser()
        
        if (!user) {
          setError('Utilisateur non connecté')
          return
        }

        // Requête pour récupérer les tickets de l'utilisateur avec le nombre de réponses
        const { data, error: fetchError } = await supabase
          .from('support_tickets')
          .select(`
            id,
            title,
            description,
            category,
            priority,
            status,
            created_at,
            updated_at,
            user_email,
            ticket_responses(count)
          `)
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (fetchError) {
          throw fetchError
        }

        // Formater les données pour inclure le nombre de réponses
        const formattedTickets: UserTicket[] = (data || []).map(ticket => ({
          id: ticket.id,
          title: ticket.title,
          description: ticket.description,
          category: ticket.category,
          priority: ticket.priority,
          status: ticket.status,
          created_at: ticket.created_at,
          updated_at: ticket.updated_at,
          user_email: ticket.user_email,
          response_count: ticket.ticket_responses?.[0]?.count || 0
        }))

        setTickets(formattedTickets)
      } catch (err) {
        console.error('Erreur lors de la récupération des tickets:', err)
        setError('Impossible de charger vos tickets de support')
      } finally {
        setLoading(false)
      }
    }

    fetchUserTickets()
  }, [])

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Clock className="h-6 w-6 text-safe-info" />
      case 'in_progress':
        return <AlertTriangle className="h-6 w-6 text-orange-800 dark:text-orange-300" />
      case 'resolved':
        return <CheckCircle className="h-6 w-6 text-safe-success" />
      case 'closed':
        return <CheckCircle className="h-6 w-6 text-gray-600 dark:text-safe-muted" />
      default:
        return <MessageCircle className="h-6 w-6 text-gray-700 dark:text-gray-300" />
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'Ouvert'
      case 'in_progress':
        return 'En cours'
      case 'resolved':
        return 'Résolu'
      case 'closed':
        return 'Fermé'
      default:
        return status
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'open':
        return 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-300 border-blue-300 dark:border-blue-700'
      case 'in_progress':
        return 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-300 border-orange-300 dark:border-orange-700'
      case 'resolved':
        return 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-300 border-green-300 dark:border-green-700'
      case 'closed':
        return 'bg-muted text-muted-foreground border-border'
      default:
        return 'bg-muted text-muted-foreground border-border'
    }
  }

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high':
        return 'text-red-600'
      case 'medium':
        return 'text-orange-800 dark:text-orange-300'
      case 'low':
        return 'text-green-600'
      default:
        return 'text-muted-foreground'
    }
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className={`bg-card rounded-xl shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-6 w-6 text-orange-800 dark:text-orange-300" />
          <h3 className="text-lg font-bold text-foreground">Mes tickets de support</h3>
        </div>
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600"></div>
          <span className="ml-3 text-muted-foreground">Chargement de vos tickets...</span>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className={`bg-card rounded-xl shadow-md p-6 ${className}`}>
        <div className="flex items-center gap-3 mb-4">
          <MessageCircle className="h-6 w-6 text-orange-800 dark:text-orange-300" />
          <h3 className="text-lg font-bold text-foreground">Mes tickets de support</h3>
        </div>
        <div className="text-center py-8">
          <AlertTriangle className="h-12 w-12 text-safe-error mx-auto mb-3" />
          <p className="text-red-600 font-medium mb-2">Erreur de chargement</p>
          <p className="text-muted-foreground text-sm">{error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className={`bg-card rounded-xl shadow-md p-6 ${className}`}>
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <MessageCircle className="h-6 w-6 text-orange-800 dark:text-orange-300" />
          <h3 className="text-lg font-bold text-foreground">Mes tickets de support</h3>
        </div>
        <Link
          href="/support/contact"
          className="inline-flex items-center gap-2 bg-orange-600 dark:bg-orange-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors text-sm min-h-[44px] touch-manipulation"
        >
          <Plus className="h-6 w-6" />
          Nouveau ticket
        </Link>
      </div>

      {/* Liste des tickets */}
      {tickets.length === 0 ? (
        <div className="text-center py-8">
          <MessageCircle className="h-12 w-12 text-gray-700 dark:text-gray-300 mx-auto mb-3" />
          <p className="text-muted-foreground font-medium mb-2">Aucun ticket de support</p>
          <p className="text-gray-600 dark:text-safe-muted text-sm mb-4">
            Vous n&apos;avez pas encore créé de ticket de support. 
            Notre équipe est là pour vous aider !
          </p>
          <Link
            href="/support/contact"
            className="inline-flex items-center gap-2 bg-orange-600 dark:bg-orange-500 text-white px-4 py-3 rounded-lg font-medium hover:bg-orange-700 transition-colors min-h-[44px] touch-manipulation"
          >
            <Plus className="h-6 w-6" />
            Créer mon premier ticket
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          <AnimatePresence>
            {tickets.map((ticket, index) => (
              <motion.div
                key={ticket.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="border border-border rounded-lg p-4 sm:p-6 hover:shadow-md transition-shadow touch-manipulation"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-foreground truncate">
                      {ticket.title}
                    </h4>
                    <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                      {ticket.description}
                    </p>
                  </div>
                  <div className="flex items-center gap-2 ml-4">
                    {getStatusIcon(ticket.status)}
                    <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(ticket.status)}`}>
                      {getStatusLabel(ticket.status)}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-600 dark:text-safe-muted">
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Tag className="h-5 w-5" />
                      <span className="capitalize">{ticket.category}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <AlertTriangle className={`h-5 w-5 ${getPriorityColor(ticket.priority)}`} />
                      <span className={`capitalize ${getPriorityColor(ticket.priority)}`}>
                        {ticket.priority === 'high' ? 'Haute' : ticket.priority === 'medium' ? 'Moyenne' : 'Basse'}
                      </span>
                    </div>
                    {ticket.response_count > 0 && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-5 w-5 text-safe-info" />
                        <span className="text-blue-600">
                          {ticket.response_count} réponse{ticket.response_count > 1 ? 's' : ''}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="flex items-center gap-1">
                    <Calendar className="h-5 w-5" />
                    <span>{formatDate(ticket.created_at)}</span>
                  </div>
                </div>

                {/* Action pour voir les détails */}
                <div className="mt-3 pt-3 border-t border-border">
                  <Link 
                    href={`/support/tickets/${ticket.id}`}
                    className="text-orange-800 dark:text-orange-300 hover:text-orange-700 text-sm font-medium flex items-center gap-2 py-2 px-1 min-h-[44px] touch-manipulation w-full justify-start hover:bg-orange-50 dark:bg-orange-900/20 rounded transition-colors"
                  >
                    <ExternalLink className="h-6 w-6" />
                    Voir les détails et réponses
                  </Link>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {/* Footer avec lien vers support */}
          <div className="mt-6 pt-4 border-t border-border text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Besoin d&apos;aide supplémentaire ? Consultez notre documentation ou contactez l&apos;équipe.
            </p>
            <div className="flex justify-center gap-4">
              <Link
                href="/support"
                className="text-orange-800 dark:text-orange-300 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
              >
                <MessageCircle className="h-6 w-6" />
                Centre de support
              </Link>
              <Link
                href="/faq"
                className="text-orange-800 dark:text-orange-300 hover:text-orange-700 text-sm font-medium flex items-center gap-1"
              >
                <MessageCircle className="h-6 w-6" />
                FAQ
              </Link>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}