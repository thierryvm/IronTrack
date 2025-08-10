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

  // Récupérer tous les tickets (admin seulement) - Utilise API route sécurisée
  const getAllTickets = useCallback(async (): Promise<SupportTicket[]> => {
    try {
      setLoading(true)
      setError(null)

      
      // Utiliser la nouvelle API route sécurisée
      const response = await fetch('/api/admin/tickets', {
        method: 'GET',
        credentials: 'include', // Important pour les cookies de session
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (response.ok) {
        const { tickets } = await response.json()
        
        if (tickets && tickets.length > 0) {
          console.log('[DEBUG] API tickets successful:', tickets.length, 'tickets')
          
          // Transformer les données API au format SupportTicket  
          const transformedTickets: SupportTicket[] = tickets.map((ticket: Record<string, unknown>) => ({
            ...ticket,
            // Les données de profil sont déjà intégrées par l'API
            profiles: ticket.user_email ? {
              email: ticket.user_email,
              full_name: ticket.user_full_name,
              avatar_url: ticket.user_avatar_url
            } : undefined
          }))
          
          return transformedTickets
        }
      }
      
      // Log admin sécurisé supprimé
      
      // SOLUTION 2: Fallback - Requêtes séparées (plus robuste)
      const { data: ticketsData, error: ticketsError } = await supabase
        .from('support_tickets')
        .select('*')
        .order('created_at', { ascending: false })

      if (ticketsError) {
        // Log admin sécurisé supprimé
        return []
      }

      if (!ticketsData || ticketsData.length === 0) {
        // Log admin sécurisé supprimé
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
          // Log admin sécurisé supprimé
        }
      }
      
      // SOLUTION 3: Données minimales sans profils (dernier recours)
      // Log admin sécurisé supprimé
      return ticketsData
      
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération des tickets'
      // Log admin sécurisé supprimé
      setError(errorMessage)
      return []
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Mettre à jour le statut d'un ticket - Via API sécurisée
  const updateTicketStatus = useCallback(async (ticketId: string, newStatus: string, adminNote?: string): Promise<boolean> => {
    try {
      setLoading(true)
      setError(null)

      const response = await fetch(`/api/admin/tickets/${ticketId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          status: newStatus,
          admin_note: adminNote 
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Erreur lors de la mise à jour')
      }

      return true
    } catch (err) {
      console.error('Erreur update ticket status:', err)
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la mise à jour du statut'
      setError(errorMessage)
      return false
    } finally {
      setLoading(false)
    }
  }, [])

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
          message,
          is_internal: isFromAdmin, // Correction: is_internal au lieu de is_from_admin
          is_solution: false,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
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

  // Récupérer un ticket spécifique avec toutes ses données
  const getTicketWithResponses = useCallback(async (ticketId: string): Promise<{
    ticket: SupportTicket | null,
    responses: TicketResponse[]
  }> => {
    try {
      setLoading(true)
      setError(null)

      console.log('[DEBUG] getTicketWithResponses - Récupération directe pour ticket:', ticketId)
      
      // Récupérer le ticket avec le profil utilisateur
      const { data: ticketData, error: ticketError } = await supabase
        .from('support_tickets')
        .select(`
          *,
          profiles!support_tickets_user_id_fkey (
            full_name,
            email,
            avatar_url
          )
        `)
        .eq('id', ticketId)
        .single()

      if (ticketError) {
        // Log admin sécurisé supprimé
        throw ticketError
      }

      if (!ticketData) {
        console.log('[DEBUG] Aucun ticket trouvé avec ID:', ticketId)
        return { ticket: null, responses: [] }
      }

      // Récupérer les réponses du ticket sans jointure 
      const { data: responsesData, error: responsesError } = await supabase
        .from('ticket_responses')
        .select('*')
        .eq('ticket_id', ticketId)
        .order('created_at', { ascending: true })

      if (responsesError) {
        // Log admin sécurisé supprimé
        // Continuer même si les réponses échouent
      }

      // Enrichir avec les données utilisateur si les réponses existent
      let enrichedResponses = []
      if (responsesData && responsesData.length > 0) {
        // Récupérer les profils des utilisateurs ayant répondu
        const userIds = [...new Set(responsesData.map(r => r.user_id))]
        const { data: userProfiles } = await supabase
          .from('profiles')
          .select('id, full_name, email, avatar_url')
          .in('id', userIds)

        // Créer un map pour les profils
        const profilesMap: Record<string, { id: string; full_name?: string; email?: string; avatar_url?: string }> = {}
        userProfiles?.forEach(profile => {
          profilesMap[profile.id] = profile
        })

        // Enrichir les réponses avec les données utilisateur
        enrichedResponses = responsesData.map(response => ({
          ...response,
          profiles: profilesMap[response.user_id],
          user_email: profilesMap[response.user_id]?.email || 'Email non disponible'
        }))
      }

      console.log('[DEBUG] Ticket récupéré avec succès:', {
        ticketId: ticketData.id,
        title: ticketData.title,
        responsesCount: enrichedResponses.length
      })

      return {
        ticket: ticketData as SupportTicket,
        responses: enrichedResponses as TicketResponse[]
      }

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la récupération du ticket'
      // Log admin sécurisé supprimé
      setError(errorMessage)
      return { ticket: null, responses: [] }
    } finally {
      setLoading(false)
    }
  }, [supabase])

  // Forcer le refresh du cache schema PostgREST (admin uniquement)
  const refreshSchemaCache = useCallback(async (): Promise<boolean> => {
    try {
      // Log admin sécurisé supprimé
      
      const { data, error } = await supabase
        .rpc('refresh_postgrest_schema_cache')

      if (error) {
        // Log admin sécurisé supprimé
        return false
      }

      console.log('[DEBUG] Schema cache refresh result:', data)
      return true
    } catch (err) {
      // Log admin sécurisé supprimé
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