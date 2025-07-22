import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  SupportTicket, 
  CreateTicketRequest, 
  CreateResponseRequest,
  TicketResponse 
} from '@/types/support'

export const useSupport = () => {
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  // Créer un nouveau ticket de support
  const createTicket = async (ticketData: CreateTicketRequest): Promise<SupportTicket | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Vous devez être connecté pour créer un ticket')
      }

      // Collecter les informations du navigateur
      const browser_info = {
        userAgent: navigator.userAgent,
        platform: navigator.platform,
        language: navigator.language,
        cookieEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine,
        screen: {
          width: screen.width,
          height: screen.height,
          colorDepth: screen.colorDepth
        },
        window: {
          innerWidth: window.innerWidth,
          innerHeight: window.innerHeight
        }
      }

      const { data, error } = await supabase
        .from('support_tickets')
        .insert({
          user_id: user.id,
          user_email: user.email, // Ajouter l'email directement
          title: ticketData.title,
          description: ticketData.description,
          category: ticketData.category,
          priority: ticketData.priority || 'medium',
          url: ticketData.url || window.location.href,
          user_agent: navigator.userAgent,
          browser_info,
          attachments: ticketData.attachments || []
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création du ticket'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les tickets de l'utilisateur connecté
  const getUserTickets = async (): Promise<SupportTicket[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return []

      const { data, error } = await supabase
        .from('support_tickets')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false })

      if (error) throw error

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des tickets'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Ajouter une réponse à un ticket
  const addResponse = async (responseData: CreateResponseRequest): Promise<TicketResponse | null> => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Vous devez être connecté pour répondre')
      }

      const { data, error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: responseData.ticket_id,
          user_id: user.id,
          message: responseData.message,
          is_internal: responseData.is_internal || false,
          is_solution: responseData.is_solution || false
        })
        .select()
        .single()

      if (error) throw error

      return data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la réponse'
      setError(errorMessage)
      return null
    } finally {
      setLoading(false)
    }
  }

  // Récupérer les réponses d'un ticket
  const getTicketResponses = async (ticketId: string): Promise<TicketResponse[]> => {
    try {
      setLoading(true)
      setError(null)

      const { data, error } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .eq('is_internal', false) // Seules les réponses publiques pour les utilisateurs
        .order('created_at', { ascending: true })

      if (error) throw error

      return data || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des réponses'
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }

  // Voter sur un ticket
  const voteTicket = async (ticketId: string, voteType: 'up' | 'down'): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Vous devez être connecté pour voter')
      }

      // Vérifier si l'utilisateur a déjà voté
      const { data: existingVote } = await supabase
        .from('ticket_votes')
        .select('id, vote_type')
        .eq('ticket_id', ticketId)
        .eq('user_id', user.id)
        .maybeSingle()

      if (existingVote) {
        if (existingVote.vote_type === voteType) {
          // Supprimer le vote si c'est le même
          await supabase
            .from('ticket_votes')
            .delete()
            .eq('id', existingVote.id)
        } else {
          // Changer le type de vote
          await supabase
            .from('ticket_votes')
            .update({ vote_type: voteType })
            .eq('id', existingVote.id)
        }
      } else {
        // Créer un nouveau vote
        await supabase
          .from('ticket_votes')
          .insert({
            ticket_id: ticketId,
            user_id: user.id,
            vote_type: voteType
          })
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors du vote'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  // Récupérer tous les tickets (admin seulement) - Mémoïsé pour éviter boucles infinies
  const getAllTickets = useCallback(async (): Promise<SupportTicket[]> => {
    try {
      setLoading(true)
      setError(null)

      // Version simple d'abord pour diagnostiquer
      const { data: simpleData, error: simpleError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (simpleError) {
        console.error('[DEBUG] getAllTickets simple error:', simpleError)
        console.error('[DEBUG] Supabase error details:', {
          code: simpleError.code,
          message: simpleError.message,
          details: simpleError.details
        })
        // Ne pas throw l'erreur pour voir ce qui se passe
        return []
      }
      
      console.log('[DEBUG] getAllTickets simple data:', simpleData?.length || 0, 'tickets')
      console.log('[DEBUG] Raw simple data:', simpleData)
      
      // Si on a des tickets, essayer d'enrichir avec les profils
      if (simpleData && simpleData.length > 0) {
        console.log('[DEBUG] Trying to enrich with profiles...')
        
        try {
          const { data: enrichedData, error: enrichError } = await supabase
            .from('support_tickets')
            .select(`
              *,
              profiles!support_tickets_user_id_fkey(
                email,
                full_name,
                avatar_url
              )
            `)
            .order('created_at', { ascending: false })

          if (enrichError) {
            console.warn('[DEBUG] Profile enrichment failed, using simple data:', enrichError)
            return simpleData
          }
          
          console.log('[DEBUG] Enriched data successful:', enrichedData?.length || 0)
          return enrichedData || simpleData
          
        } catch (enrichErr) {
          console.warn('[DEBUG] Profile enrichment exception, using simple data:', enrichErr)
          return simpleData
        }
      }
      
      return simpleData || []
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des tickets'
      console.error('[DEBUG] getAllTickets final error:', errorMessage)
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Mettre à jour le statut d'un ticket - Mémoïsé
  const updateTicketStatus = useCallback(async (ticketId: string, newStatus: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          status: newStatus,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) throw error
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Mettre à jour la priorité d'un ticket - Mémoïsé
  const updateTicketPriority = useCallback(async (ticketId: string, newPriority: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { error } = await supabase
        .from('support_tickets')
        .update({ 
          priority: newPriority,
          updated_at: new Date().toISOString()
        })
        .eq('id', ticketId)

      if (error) throw error
      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour de la priorité'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Ajouter une réponse admin à un ticket
  const addTicketResponse = async (ticketId: string, message: string, isFromAdmin: boolean = false): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        throw new Error('Utilisateur non authentifié')
      }

      const { error } = await supabase
        .from('ticket_responses')
        .insert({
          ticket_id: ticketId,
          user_id: user.id,
          responder_email: user.email,
          message,
          is_from_admin: isFromAdmin
        })

      if (error) throw error

      // Mettre à jour le statut du ticket
      if (isFromAdmin) {
        await updateTicketStatus(ticketId, 'waiting_user')
      } else {
        await updateTicketStatus(ticketId, 'in_progress')
      }

      return true
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de l\'ajout de la réponse'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }

  return {
    createTicket,
    getUserTickets,
    getAllTickets,
    addResponse,
    getTicketResponses,
    updateTicketStatus,
    updateTicketPriority,
    addTicketResponse,
    voteTicket,
    loading,
    error
  }
}