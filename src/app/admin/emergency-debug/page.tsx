'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/utils/supabase/client'
import { User } from '@supabase/supabase-js'

/**
 * PAGE D'URGENCE - Debug auth admin sans hooks complexes
 * Route: /admin/emergency-debug
 */
export default function EmergencyDebugPage() {
  const [debugState, setDebugState] = useState({
    step: 'init',
    user: null as User | null,
    profile: null as Record<string, unknown> | null,
    userRoles: null as Array<Record<string, unknown>> | null,
    error: null as string | null,
    logs: [] as string[]
  })

  const addLog = (message: string) => {
    console.log(`[EMERGENCY_DEBUG] ${message}`)
    setDebugState(prev => ({
      ...prev,
      logs: [...prev.logs, `${new Date().toLocaleTimeString()} - ${message}`]
    }))
  }

  useEffect(() => {
    const emergencyCheck = async () => {
      const supabase = createClient()
      addLog('🚀 Démarrage diagnostic d\'urgence')

      try {
        // Étape 1: Auth de base
        addLog('📡 Vérification auth.getUser()...')
        const { data: { user }, error: authError } = await supabase.auth.getUser()
        
        if (authError) {
          addLog(`❌ Erreur auth: ${authError.message}`)
          setDebugState(prev => ({ ...prev, error: authError.message, step: 'auth_error' }))
          return
        }

        if (!user) {
          addLog('🚫 Pas d\'utilisateur connecté')
          setDebugState(prev => ({ ...prev, step: 'no_user' }))
          return
        }

        addLog(`✅ Utilisateur trouvé: ${user.email} (${user.id})`)
        setDebugState(prev => ({ ...prev, user, step: 'user_found' }))

        // Étape 2: Profile
        addLog('👤 Récupération profile...')
        const { data: profile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single()

        if (profileError) {
          addLog(`⚠️ Erreur profile: ${profileError.message}`)
        } else {
          addLog(`✅ Profile trouvé: role=${profile?.role || 'null'}`)
          setDebugState(prev => ({ ...prev, profile, step: 'profile_found' }))
        }

        // Étape 3: User roles
        addLog('🎭 Récupération user_roles...')
        const { data: userRoles, error: rolesError } = await supabase
          .from('user_roles')
          .select('*')
          .eq('user_id', user.id)

        if (rolesError) {
          addLog(`⚠️ Erreur user_roles: ${rolesError.message}`)
        } else {
          addLog(`✅ User roles trouvés: ${userRoles?.length || 0} entrées`)
          userRoles?.forEach((role, i) => {
            addLog(`   Role ${i+1}: ${role.role} (actif: ${role.is_active})`)
          })
          setDebugState(prev => ({ ...prev, userRoles, step: 'roles_found' }))
        }

        // Étape 4: Test fonction RPC admin
        addLog('🔧 Test fonction get_admin_dashboard_stats...')
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_admin_dashboard_stats')

        if (statsError) {
          addLog(`❌ Erreur RPC stats: ${statsError.message}`)
        } else {
          addLog(`✅ RPC stats OK: ${JSON.stringify(statsData)}`)
        }

        addLog('🎯 Diagnostic terminé avec succès')
        setDebugState(prev => ({ ...prev, step: 'complete' }))

      } catch (error) {
        const errorMsg = error instanceof Error ? error.message : 'Erreur inconnue'
        addLog(`💥 Erreur générale: ${errorMsg}`)
        setDebugState(prev => ({ ...prev, error: errorMsg, step: 'general_error' }))
      }
    }

    emergencyCheck()
  }, [])

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-red-100 border border-red-400 text-red-800 px-4 py-3 rounded-lg mb-6">
          <h1 className="text-xl font-bold">🚨 MODE DEBUG URGENCE - Admin Auth</h1>
          <p className="text-sm">Diagnostic complet sans hooks complexes</p>
        </div>

        {/* État actuel */}
        <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
          <h2 className="text-lg font-semibold mb-4">📊 État actuel</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <strong>Étape:</strong> <span className="font-mono">{debugState.step}</span>
            </div>
            <div>
              <strong>Utilisateur:</strong> <span className="font-mono">{debugState.user?.email || 'null'}</span>
            </div>
            <div>
              <strong>Profile role:</strong> <span className="font-mono">{(debugState.profile as Record<string, unknown>)?.role as string || 'null'}</span>
            </div>
            <div>
              <strong>User roles:</strong> <span className="font-mono">{debugState.userRoles?.length || 0} entrées</span>
            </div>
          </div>
          
          {debugState.error && (
            <div className="mt-4 bg-red-50 border border-red-200 text-red-800 px-3 py-2 rounded">
              <strong>Erreur:</strong> {debugState.error}
            </div>
          )}
        </div>

        {/* Détails utilisateur */}
        {debugState.user && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">👤 Détails utilisateur</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugState.user, null, 2)}
            </pre>
          </div>
        )}

        {/* Détails profile */}
        {debugState.profile && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">📋 Détails profile</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugState.profile, null, 2)}
            </pre>
          </div>
        )}

        {/* Détails user_roles */}
        {debugState.userRoles && (
          <div className="bg-white rounded-lg shadow-sm border p-6 mb-6">
            <h2 className="text-lg font-semibold mb-4">🎭 Détails user_roles</h2>
            <pre className="bg-gray-100 p-4 rounded text-sm overflow-auto">
              {JSON.stringify(debugState.userRoles, null, 2)}
            </pre>
          </div>
        )}

        {/* Logs en temps réel */}
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <h2 className="text-lg font-semibold mb-4">📜 Logs de diagnostic</h2>
          <div className="bg-black text-green-400 p-4 rounded font-mono text-sm max-h-96 overflow-auto">
            {debugState.logs.map((log, i) => (
              <div key={i}>{log}</div>
            ))}
            {debugState.logs.length === 0 && (
              <div className="text-gray-500">Attente des logs...</div>
            )}
          </div>
        </div>

        <div className="mt-6 text-center">
          <a 
            href="/admin"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Retour au dashboard admin
          </a>
        </div>
      </div>
    </div>
  )
}