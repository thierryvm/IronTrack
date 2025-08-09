'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  Download, 
  FileText, 
  Users, 
  MessageSquare, 
  CheckCircle,
  AlertCircle,
  Clock,
  Database
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { useSupport } from '@/hooks/useSupport'
import { createClient } from '@/utils/supabase/client'
import { SupportTicket } from '@/types/support'

interface ExportData {
  type: 'tickets' | 'users' | 'performance' | 'all'
  format: 'json' | 'csv' | 'excel'
  dateRange: {
    from: string
    to: string
  }
  filters: {
    status?: string[]
    priority?: string[]
    category?: string[]
  }
}

export default function AdminExportsPage() {
  const [exportData, setExportData] = useState<ExportData>({
    type: 'tickets',
    format: 'json',
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      to: new Date().toISOString().split('T')[0]
    },
    filters: {}
  })
  
  const [loading, setLoading] = useState(false)
  const [stats, setStats] = useState<{tickets: number; users: number; performance_logs: number; last_export: string} | null>(null)
  const [exportHistory, setExportHistory] = useState<Array<{id: number; type: string; format: string; count: number; created_at: string; filename: string}>>([])

  const { hasPermission, logAdminAction } = useAdminAuth()
  const { getAllTickets } = useSupport()
  const supabase = createClient()

  // Charger les statistiques
  useEffect(() => {
    const loadStatsEffect = async () => {
      try {
        const [ticketsResult, usersResult] = await Promise.all([
          supabase.from('support_tickets').select('*', { count: 'exact', head: true }),
          supabase.from('user_roles').select('*', { count: 'exact', head: true })
        ])

        setStats({
          tickets: ticketsResult.count || 0,
          users: usersResult.count || 0,
          performance_logs: 0, // À implémenter selon votre structure
          last_export: new Date().toISOString()
        })
      } catch (error) {
        console.error('Erreur chargement stats:', error)
      }
    }

    if (hasPermission('admin')) {
      loadStatsEffect()
    }
  }, [hasPermission, supabase])


  // Fonction d'export principale
  const handleExport = async () => {
    setLoading(true)
    try {
      let data: unknown[] = []
      let filename = ''

      switch (exportData.type) {
        case 'tickets':
          data = await exportTickets()
          filename = `tickets_${exportData.dateRange.from}_${exportData.dateRange.to}`
          break
        
        case 'users':
          data = await exportUsers()
          filename = `users_${new Date().toISOString().split('T')[0]}`
          break
        
        case 'performance':
          data = await exportPerformance()
          filename = `performance_${exportData.dateRange.from}_${exportData.dateRange.to}`
          break
        
        case 'all':
          const allData = await exportAll()
          data = [allData] // Transformer l'objet en array pour être compatible avec le type
          filename = `full_export_${new Date().toISOString().split('T')[0]}`
          break
      }

      // Traitement selon le format
      if (exportData.format === 'json') {
        downloadJSON(data, filename)
      } else if (exportData.format === 'csv') {
        // Pour CSV, on ne peut pas exporter l'export complet (trop complexe)
        // On exporte seulement les tickets si c'est "all"
        if (exportData.type === 'all') {
          const ticketsData = await exportTickets()
          downloadCSV(ticketsData, `tickets_${filename}`)
        } else {
          downloadCSV(data as Record<string, unknown>[], filename)
        }
      }

      await logAdminAction('export_data', exportData.type, `${exportData.type}_${exportData.format}`, { format: exportData.format, recordCount: data.length })

      // Ajouter à l'historique
      setExportHistory(prev => [{
        id: Date.now(),
        type: exportData.type,
        format: exportData.format,
        count: data.length,
        created_at: new Date().toISOString(),
        filename: `${filename}.${exportData.format}`
      }, ...prev.slice(0, 9)])

    } catch (error) {
      console.error('Erreur export:', error)
      alert('Erreur lors de l\'export des données')
    } finally {
      setLoading(false)
    }
  }

  // Export des tickets
  const exportTickets = async () => {
    const tickets = await getAllTickets()
    
    return tickets
      .filter(ticket => {
        const ticketDate = new Date(ticket.created_at)
        const fromDate = new Date(exportData.dateRange.from)
        const toDate = new Date(exportData.dateRange.to + 'T23:59:59')
        
        return ticketDate >= fromDate && ticketDate <= toDate
      })
      .map(ticket => ({
        id: ticket.id,
        title: ticket.title,
        description: ticket.description,
        category: ticket.category,
        priority: ticket.priority,
        status: ticket.status,
        user_email: ticket.user_email,
        created_at: ticket.created_at,
        updated_at: ticket.updated_at,
        attachments_count: (ticket as SupportTicket & {attachments?: unknown[]}).attachments?.length || 0,
        url: ticket.url || '',
        user_agent: ticket.user_agent || ''
      }))
  }

  // Export des utilisateurs
  const exportUsers = async () => {
    const { data: roles } = await supabase
      .from('user_roles')
      .select('*')
      .eq('is_active', true)

    return roles?.map(role => ({
      user_id: role.user_id,
      role: role.role,
      granted_at: role.granted_at,
      granted_by: role.granted_by,
      expires_at: role.expires_at,
      is_active: role.is_active
    })) || []
  }

  // Export des performances
  const exportPerformance = async () => {
    const fromDate = new Date(exportData.dateRange.from)
    const toDate = new Date(exportData.dateRange.to + 'T23:59:59')

    const { data } = await supabase
      .from('performance_logs')
      .select('*')
      .gte('created_at', fromDate.toISOString())
      .lte('created_at', toDate.toISOString())
      .order('created_at', { ascending: false })
      .limit(10000) // Limite pour éviter les exports trop volumineux

    return data || []
  }

  // Export complet
  const exportAll = async () => {
    const [tickets, users, performance] = await Promise.all([
      exportTickets(),
      exportUsers(),
      exportPerformance()
    ])

    return {
      export_info: {
        date: new Date().toISOString(),
        type: 'full_export',
        counts: {
          tickets: tickets.length,
          users: users.length,
          performance: performance.length
        }
      },
      tickets,
      users,
      performance
    }
  }

  // Téléchargement JSON
  const downloadJSON = (data: unknown, filename: string) => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.json`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Téléchargement CSV
  const downloadCSV = (data: Record<string, unknown>[], filename: string) => {
    if (data.length === 0) return

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map(row => 
        headers.map(header => {
          const value = row[header]
          // Échapper les guillemets et virgules
          if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
            return `"${value.replace(/"/g, '""')}"`
          }
          return value
        }).join(',')
      )
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${filename}.csv`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    URL.revokeObjectURL(url)
  }

  // Debug permissions supprimé pour la sécurité
  
  if (!hasPermission('admin') && !hasPermission('super_admin')) {
    return (
      <div className="text-center py-12">
        <AlertCircle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">Accès Refusé</h3>
        <p className="text-gray-500">Seuls les administrateurs peuvent exporter des données.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="h-6 w-6 text-blue-500" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Export de Données</h1>
            <p className="text-gray-600">Exportez les données de l'application pour analyse ou sauvegarde</p>
          </div>
        </div>

        {/* Statistiques rapides */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <div className="bg-orange-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <MessageSquare className="h-8 w-8 text-orange-800" />
                <div>
                  <div className="text-2xl font-bold text-orange-800">{stats.tickets}</div>
                  <div className="text-sm text-orange-700">Tickets de support</div>
                </div>
              </div>
            </div>
            <div className="bg-blue-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Users className="h-8 w-8 text-blue-500" />
                <div>
                  <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
                  <div className="text-sm text-blue-700">Utilisateurs avec rôles</div>
                </div>
              </div>
            </div>
            <div className="bg-green-50 rounded-lg p-4">
              <div className="flex items-center space-x-3">
                <Database className="h-8 w-8 text-green-500" />
                <div>
                  <div className="text-2xl font-bold text-green-600">{stats.performance_logs}</div>
                  <div className="text-sm text-green-700">Logs de performance</div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Configuration d'export */}
      <div className="bg-white rounded-xl shadow-md p-6">
        <h2 className="text-lg font-semibold text-gray-900 mb-6">Configuration de l'Export</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type de données */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Type de données</label>
            <div className="space-y-3">
              {[
                { value: 'tickets', label: 'Tickets de support', icon: MessageSquare },
                { value: 'users', label: 'Utilisateurs et rôles', icon: Users },
                { value: 'performance', label: 'Logs de performance', icon: Database },
                { value: 'all', label: 'Export complet', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <label key={value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportType"
                    value={value}
                    checked={exportData.type === value}
                    onChange={(e) => setExportData({ ...exportData, type: e.target.value as ExportData['type'] })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <Icon className="h-5 w-5 text-gray-400" />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-3">Format d'export</label>
            <div className="space-y-3">
              {[
                { value: 'json', label: 'JSON (structure complète)' },
                { value: 'csv', label: 'CSV (tableur)' }
              ].map(({ value, label }) => (
                <label key={value} className="flex items-center space-x-3 cursor-pointer">
                  <input
                    type="radio"
                    name="exportFormat"
                    value={value}
                    checked={exportData.format === value}
                    onChange={(e) => setExportData({ ...exportData, format: e.target.value as ExportData['format'] })}
                    className="w-4 h-4 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>

        {/* Plage de dates */}
        {['tickets', 'performance', 'all'].includes(exportData.type) && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 mb-3">Plage de dates</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-gray-500 mb-1">Du</label>
                <input
                  type="date"
                  value={exportData.dateRange.from}
                  onChange={(e) => setExportData({
                    ...exportData,
                    dateRange: { ...exportData.dateRange, from: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Au</label>
                <input
                  type="date"
                  value={exportData.dateRange.to}
                  onChange={(e) => setExportData({
                    ...exportData,
                    dateRange: { ...exportData.dateRange, to: e.target.value }
                  })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bouton d'export */}
        <div className="mt-8">
          <button
            onClick={handleExport}
            disabled={loading}
            className={`w-full md:w-auto inline-flex items-center px-6 py-3 rounded-lg font-medium transition-colors ${
              loading
                ? 'bg-gray-400 text-white cursor-not-allowed'
                : 'bg-blue-600 text-white hover:bg-blue-700'
            }`}
          >
            {loading ? (
              <>
                <Clock className="h-5 w-5 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-5 w-5 mr-2" />
                Lancer l'export
              </>
            )}
          </button>
        </div>
      </div>

      {/* Historique des exports */}
      {exportHistory.length > 0 && (
        <div className="bg-white rounded-xl shadow-md p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Historique des Exports</h2>
          <div className="space-y-3">
            {exportHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-green-500" />
                  <div>
                    <div className="text-sm font-medium text-gray-900">
                      {item.filename}
                    </div>
                    <div className="text-xs text-gray-500">
                      {item.count} enregistrement{item.count !== 1 ? 's' : ''} • 
                      {new Date(item.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <span className={`px-2 py-1 text-xs rounded-full ${
                    item.type === 'tickets' ? 'bg-orange-100 text-orange-700' :
                    item.type === 'users' ? 'bg-blue-100 text-blue-700' :
                    item.type === 'performance' ? 'bg-green-100 text-green-700' :
                    'bg-purple-100 text-purple-700'
                  }`}>
                    {item.type}
                  </span>
                  <span className="px-2 py-1 text-xs bg-gray-100 text-gray-700 rounded-full">
                    {item.format.toUpperCase()}
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}