import { useState, useCallback } from 'react'
import { createClient } from '@/utils/supabase/client'
import { 
  SupportTicket, 
  CreateTicketRequest, 
  CreateResponseRequest,
  TicketResponse,
  SupportTicketCategory,
  SupportTicketPriority,
  SupportTicketStatus
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

  // Récupérer tous les tickets (admin seulement) - Solution RPC anti-cache
  const getAllTickets = useCallback(async (): Promise<SupportTicket[]> => {
    try {
      setLoading(true)
      setError(null)

      console.log('[DEBUG] getAllTickets - Utilisation de la fonction RPC')
      
      // SOLUTION 1: Utiliser la fonction RPC personnalisée (bypass cache PostgREST)
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_admin_tickets_with_users')

      if (!rpcError && rpcData && rpcData.length > 0) {
        console.log('[DEBUG] RPC tickets successful:', rpcData.length, 'tickets')
        
        // Transformer les données RPC au format SupportTicket
        const transformedTickets: SupportTicket[] = rpcData.map((ticket: Record<string, unknown>) => ({
          ...ticket,
          // Merger les données de profil dans l'objet profiles
          profiles: ticket.profiles_email ? {
            email: ticket.profiles_email,
            full_name: ticket.profiles_full_name,
            avatar_url: ticket.profiles_avatar_url
          } : undefined,
          // Fallback email depuis user_email si pas de profil
          user_email: ticket.user_email || ticket.profiles_email
        }))
        
        return transformedTickets
      }
      
      console.warn('[DEBUG] RPC failed, trying fallback:', rpcError?.message)
      
      // SOLUTION 2: Fallback - Requêtes séparées (plus robuste)
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (ticketsError) {
        console.error('[DEBUG] Fallback tickets error:', ticketsError)
        return []
      }

      if (!ticketsData || ticketsData.length === 0) {
        console.log('[DEBUG] Aucun ticket trouvé')
        return []
      }

      console.log('[DEBUG] Fallback - Récupération de', ticketsData.length, 'tickets')

      // Récupérer les profils utilisateur séparément
      const userIds = [...new Set(ticketsData.map(ticket => ticket.user_id).filter(Boolean))]
      
      if (userIds.length > 0) {
        const { data: profilesData, error: profilesError } = await supabase
          .from('profiles')
          .select('id, email, full_name, avatar_url')
          .in('id', userIds)

        if (!profilesError && profilesData) {
          console.log('[DEBUG] Fallback - Récupération de', profilesData.length, 'profils')
          
          // Créer un index des profils par user_id
          const profilesMap = new Map(profilesData.map(profile => [profile.id, profile]))
          
          // Joindre les données côté client
          const enrichedTickets: SupportTicket[] = ticketsData.map(ticket => ({
            ...ticket,
            profiles: ticket.user_id ? profilesMap.get(ticket.user_id) : undefined,
            user_email: ticket.user_email || profilesMap.get(ticket.user_id)?.email
          }))
          
          return enrichedTickets
        } else {
          console.warn('[DEBUG] Fallback profiles error:', profilesError?.message)
        }
      }
      
      // SOLUTION 3: Données minimales sans profils (dernier recours)
      console.log('[DEBUG] Retour des tickets sans données de profil')
      return ticketsData
      
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

  // Récupérer un ticket spécifique avec toutes ses données (RPC)
  const getTicketWithResponses = useCallback(async (ticketId: string): Promise<{
    ticket: SupportTicket | null,
    responses: TicketResponse[]
  }> => {
    try {
      setLoading(true)
      setError(null)

      console.log('[DEBUG] getTicketWithResponses - Utilisation RPC pour ticket:', ticketId)
      
      // Utiliser la fonction RPC optimisée
      const { data: rpcData, error: rpcError } = await supabase
        .rpc('get_ticket_with_responses', { ticket_uuid: ticketId })

      if (rpcError) {
        console.error('[DEBUG] RPC getTicketWithResponses error:', rpcError)
        
        // Fallback : requêtes séparées
        console.log('[DEBUG] Fallback to separate queries...')
        
        const { data: ticketData, error: ticketError } = await supabase
          .from('support_tickets')
          .select('*')
          .eq('id', ticketId)
          .single()

        if (ticketError) {
          throw ticketError
        }

        const { data: responsesData } = await supabase
          .from('ticket_responses')
          .select('*')
          .eq('ticket_id', ticketId)
          .order('created_at', { ascending: true })

        return {
          ticket: ticketData,
          responses: responsesData || []
        }
      }

      if (!rpcData || rpcData.length === 0) {
        return { ticket: null, responses: [] }
      }

      const ticketResult = rpcData[0]
      
      // Transformer les données RPC au format attendu
      const ticket: SupportTicket = {
        id: ticketResult.ticket_id,
        title: ticketResult.ticket_title,
        description: ticketResult.ticket_description,
        category: ticketResult.ticket_category as SupportTicketCategory,
        priority: ticketResult.ticket_priority as SupportTicketPriority,
        status: ticketResult.ticket_status as SupportTicketStatus,
        user_id: ticketResult.ticket_user_id,
        created_at: ticketResult.ticket_created_at,
        updated_at: ticketResult.ticket_updated_at,
        url: ticketResult.ticket_url,
        user_email: ticketResult.ticket_user_email,
        attachments: ticketResult.ticket_attachments,
        upvotes: 0,
        downvotes: 0,
        profiles: ticketResult.ticket_user_full_name ? {
          email: ticketResult.ticket_user_email || '',
          full_name: ticketResult.ticket_user_full_name,
          avatar_url: ticketResult.ticket_user_avatar_url
        } : undefined
      }

      const responses: TicketResponse[] = ticketResult.responses_data 
        ? ticketResult.responses_data.map((resp: Record<string, unknown>) => ({
            id: resp.id,
            ticket_id: ticketId,
            user_id: resp.user_id,
            message: resp.message,
            is_internal: resp.is_internal,
            is_solution: resp.is_solution,
            attachments: resp.attachments || {},
            created_at: resp.created_at,
            updated_at: resp.updated_at,
            user_email: resp.responder_email
          }))
        : []

      console.log('[DEBUG] RPC ticket data transformed successfully')
      return { ticket, responses }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du ticket'
      console.error('[DEBUG] getTicketWithResponses final error:', errorMessage)
      setError(errorMessage)
      return { ticket: null, responses: [] }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Forcer le refresh du cache schema PostgREST (admin uniquement)
  const refreshSchemaCache = useCallback(async (): Promise<boolean> => {
    try {
      console.log('[DEBUG] Refreshing PostgREST schema cache...')
      
      const { data, error } = await supabase
        .rpc('refresh_postgrest_schema_cache')

      if (error) {
        console.error('[DEBUG] Schema cache refresh error:', error)
        return false
      }

      console.log('[DEBUG] Schema cache refresh result:', data)
      return true
    } catch (err) {
      console.error('[DEBUG] Schema cache refresh exception:', err)
      return false
    }
  }, [supabase])

  return {
    createTicket,
    getUserTickets,
    getAllTickets,
    getTicketWithResponses,
    addResponse,
    getTicketResponses,
    updateTicketStatus,
    updateTicketPriority,
    addTicketResponse,
    voteTicket,
    refreshSchemaCache,
    loading,
    error
  }
}