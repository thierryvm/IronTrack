// ============================================================================
// TYPES POUR SYSTÈME DE SUPPORT/FEEDBACK
// ============================================================================

export type SupportTicketCategory = 'bug' | 'feature' | 'help' | 'feedback' | 'account' | 'payment'
export type SupportTicketPriority = 'low' | 'medium' | 'high' | 'critical'
export type SupportTicketStatus = 'open' | 'in_progress' | 'waiting_user' | 'closed' | 'resolved'

export interface SupportTicket {
  id: string
  user_id?: string
  title: string
  description: string
  category: SupportTicketCategory
  priority: SupportTicketPriority
  status: SupportTicketStatus
  assigned_to?: string
  tags?: string[]
  user_agent?: string
  url?: string
  browser_info?: Record<string, unknown>
  created_at: string
  updated_at: string
  resolved_at?: string
  closed_at?: string
  upvotes: number
  downvotes: number
  attachments?: AttachmentData[]
  
  // Données jointes depuis les tables liées
  user_email?: string
  assigned_user_email?: string
  user_metadata?: {
    name?: string
    [key: string]: unknown
  }
  profiles?: {
    email: string
    full_name?: string
    avatar_url?: string
  }
}

export interface TicketResponse {
  id: string
  ticket_id: string
  user_id: string
  message: string
  is_internal: boolean
  is_solution: boolean
  attachments?: Record<string, unknown>
  created_at: string
  updated_at: string
  
  // Données jointes
  user_email?: string
}

export interface TicketVote {
  id: string
  ticket_id: string
  user_id: string
  vote_type: 'up' | 'down'
  created_at: string
}

export interface AttachmentData {
  name: string
  originalName: string
  type: string
  size: number
  url: string
}

export interface CreateTicketRequest {
  title: string
  description: string
  category: SupportTicketCategory
  priority?: SupportTicketPriority
  url?: string
  attachments?: AttachmentData[]
}

export interface CreateResponseRequest {
  ticket_id: string
  message: string
  is_internal?: boolean
  is_solution?: boolean
}