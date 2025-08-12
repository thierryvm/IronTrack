'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import { ArrowLeft, MessageCircle, Clock, User } from 'lucide-react'
import { createClient } from '@/utils/supabase/client'
import Link from 'next/link'

interface SimpleTicket {
  id: string
  title: string
  description: string
  category: string
  priority: string
  status: string
  created_at: string
}

interface SimpleResponse {
  id: string
  message: string
  created_at: string
  is_internal: boolean
}

export default function TicketDetailPageSimple() {
  const params = useParams()
  const ticketId = params.id as string
  
  const [ticket, setTicket] = useState<SimpleTicket | null>(null)
  const [responses, setResponses] = useState<SimpleResponse[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadTicket = async () => {
      try {
        const supabase = createClient()
        
        // Récupérer le ticket
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (ticketError || !ticketData) {
          throw new Error('Ticket introuvable')
        }

        setTicket(ticketData)

        // Récupérer les réponses
        const { data: responsesData, error: responsesError } = await supabase
          .from('ticket_responses')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        if (!responsesError && responsesData) {
          setResponses(responsesData)
        }

      } catch (err) {
        setError(err instanceof Error ? err.message : 'Erreur de chargement')
      } finally {
        setLoading(false)
      }
    }

    loadTicket()
  }, [ticketId])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (error || !ticket) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error || 'Ticket introuvable'}</p>
          <Link href="/support" className="text-orange-600 hover:text-orange-700">
            ← Retour au support
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* En-tête */}
        <div className="mb-6">
          <Link href="/support" className="inline-flex items-center text-orange-600 hover:text-orange-700 mb-4">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Retour au support
          </Link>
          
          <div className="bg-white rounded-lg shadow-sm p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-xl font-semibold text-gray-900 mb-2">
                  {ticket.title}
                </h1>
                <div className="flex items-center space-x-4 text-sm text-gray-500">
                  <span className="flex items-center">
                    <User className="h-4 w-4 mr-1" />
                    ID: {ticket.id.slice(0, 8)}...
                  </span>
                  <span className="flex items-center">
                    <Clock className="h-4 w-4 mr-1" />
                    {new Date(ticket.created_at).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
              
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                ticket.status === 'open' ? 'bg-blue-100 text-blue-800' :
                ticket.status === 'in_progress' ? 'bg-orange-100 text-orange-800' :
                'bg-green-100 text-green-800'
              }`}>
                {ticket.status}
              </span>
            </div>
            
            <div className="mt-4 pt-4 border-t border-gray-200">
              <p className="text-gray-700">{ticket.description}</p>
            </div>
          </div>
        </div>

        {/* Réponses */}
        <div className="bg-white rounded-lg shadow-sm p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4 flex items-center">
            <MessageCircle className="h-5 w-5 mr-2 text-orange-600" />
            Conversation ({responses.length} réponse{responses.length !== 1 ? 's' : ''})
          </h2>
          
          {responses.length === 0 ? (
            <p className="text-gray-500 text-center py-8">
              Aucune réponse pour le moment.
            </p>
          ) : (
            <div className="space-y-4">
              {responses.map((response) => (
                <div
                  key={response.id}
                  className={`p-4 rounded-lg ${
                    response.is_internal 
                      ? 'bg-orange-50 border-l-4 border-orange-400' 
                      : 'bg-gray-50 border-l-4 border-gray-400'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className={`text-sm font-medium ${
                      response.is_internal ? 'text-orange-800' : 'text-gray-600'
                    }`}>
                      {response.is_internal ? '👨‍💼 Équipe Support' : '👤 Vous'}
                    </span>
                    <span className="text-xs text-gray-500">
                      {new Date(response.created_at).toLocaleDateString('fr-FR')}
                    </span>
                  </div>
                  <p className="text-gray-700">{response.message}</p>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Message temporaire */}
        <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
          <p className="text-blue-700 text-sm">
            📝 <strong>Mode Debug :</strong> Page simplifiée pour tester l'affichage. 
            La fonction d'ajout de réponses sera réactivée une fois le problème résolu.
          </p>
        </div>
        
      </div>
    </div>
  )
}