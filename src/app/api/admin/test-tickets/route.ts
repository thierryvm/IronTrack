import { NextResponse } from 'next/server'
import { createRouteHandlerClient } from '@/utils/supabase/route-handler'

export async function GET() {
  try {
    console.log(`[API LOG] /api/admin/test-tickets/route.ts - GET appelé à`, new Date().toISOString());
    // Créer un client serveur avec permissions élevées
    const supabase = await createRouteHandlerClient()
    
    console.log('[API] Testing direct ticket access...')
    
    // Test 1: Accès direct aux tickets
    const { data: tickets, error: ticketsError } = await supabase
      .from('support_tickets')
      .select('*')
      .limit(10)
    
    console.log('[API] Tickets query result:', {
      error: ticketsError,
      count: tickets?.length || 0
    })
    
    // Test 2: Vérifier les politiques RLS
    const { data: rlsStatus, error: rlsError } = await supabase
      .rpc('pg_get_rls_status', { table_name: 'support_tickets' })
      .single()
    
    console.log('[API] RLS status:', rlsStatus, rlsError)
    
    // Test 3: Accès aux profils
    const { data: profiles, error: profilesError } = await supabase
      .from('profiles')
      .select('id, email, created_at')
      .limit(5)
    
    console.log('[API] Profiles query result:', {
      error: profilesError,
      count: profiles?.length || 0
    })
    
    return NextResponse.json({
      success: true,
      debug: {
        tickets: {
          error: ticketsError,
          count: tickets?.length || 0,
          sample: tickets?.[0] || null
        },
        profiles: {
          error: profilesError,
          count: profiles?.length || 0,
          sample: profiles?.[0] || null
        },
        rls: {
          status: rlsStatus,
          error: rlsError
        }
      }
    })
    
  } catch (error) {
    console.error('[API] Test error:', error)
    return NextResponse.json(
      { error: 'Test failed', details: error },
      { status: 500 }
    )
  }
}