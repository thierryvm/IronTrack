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
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'

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
        <AlertCircle className="h-12 w-12 text-safe-error mx-auto mb-4" />
        <h3 className="text-lg font-medium text-gray-900 dark:text-gray-100 mb-2">Accès Refusé</h3>
        <p className="text-gray-600 dark:text-safe-muted">Seuls les administrateurs peuvent exporter des données.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl shadow-md p-6">
        <div className="flex items-center space-x-3 mb-4">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Download className="h-6 w-6 text-safe-info" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Export de Données</h1>
            <p className="text-gray-600 dark:text-gray-300">Exportez les données de l'application pour analyse ou sauvegarde</p>
          </div>
        </div>

        {/* Statistiques rapides */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
            <Card className="bg-card border-border">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <MessageSquare className="h-8 w-8 text-muted-foreground" />
                  <div>
                    <div className="text-2xl font-bold text-foreground">{stats.tickets}</div>
                    <div className="text-sm text-muted-foreground">Tickets de support</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-blue-50 border-blue-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Users className="h-8 w-8 text-safe-info" />
                  <div>
                    <div className="text-2xl font-bold text-blue-600">{stats.users}</div>
                    <div className="text-sm text-blue-700">Utilisateurs avec rôles</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardContent className="p-4">
                <div className="flex items-center space-x-3">
                  <Database className="h-8 w-8 text-safe-success" />
                  <div>
                    <div className="text-2xl font-bold text-green-600">{stats.performance_logs}</div>
                    <div className="text-sm text-green-700">Logs de performance</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* Configuration d'export */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration de l'Export</CardTitle>
        </CardHeader>
        <CardContent>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Type de données */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Type de données</label>
            <RadioGroup
              value={exportData.type}
              onValueChange={(value) => setExportData({ ...exportData, type: value as ExportData['type'] })}
              className="space-y-3"
            >
              {[
                { value: 'tickets', label: 'Tickets de support', icon: MessageSquare },
                { value: 'users', label: 'Utilisateurs et rôles', icon: Users },
                { value: 'performance', label: 'Logs de performance', icon: Database },
                { value: 'all', label: 'Export complet', icon: FileText }
              ].map(({ value, label, icon: Icon }) => (
                <div key={value} className="flex items-center space-x-3">
                  <RadioGroupItem value={value} id={`type-${value}`} />
                  <Label htmlFor={`type-${value}`} className="flex items-center space-x-2 cursor-pointer">
                    <Icon className="h-4 w-4" />
                    <span className="text-sm">{label}</span>
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>

          {/* Format */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Format d'export</label>
            <RadioGroup
              value={exportData.format}
              onValueChange={(value) => setExportData({ ...exportData, format: value as ExportData['format'] })}
              className="space-y-3"
            >
              {[
                { value: 'json', label: 'JSON (structure complète)' },
                { value: 'csv', label: 'CSV (tableur)' }
              ].map(({ value, label }) => (
                <div key={value} className="flex items-center space-x-3">
                  <RadioGroupItem value={value} id={`format-${value}`} />
                  <Label htmlFor={`format-${value}`} className="text-sm cursor-pointer">
                    {label}
                  </Label>
                </div>
              ))}
            </RadioGroup>
          </div>
        </div>

        {/* Plage de dates */}
        {['tickets', 'performance', 'all'].includes(exportData.type) && (
          <div className="mt-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Plage de dates</label>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="date-from" className="text-xs mb-1">Du</Label>
                <Input
                  id="date-from"
                  type="date"
                  value={exportData.dateRange.from}
                  onChange={(e) => setExportData({
                    ...exportData,
                    dateRange: { ...exportData.dateRange, from: e.target.value }
                  })}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <Label htmlFor="date-to" className="text-xs mb-1">Au</Label>
                <Input
                  id="date-to"
                  type="date"
                  value={exportData.dateRange.to}
                  onChange={(e) => setExportData({
                    ...exportData,
                    dateRange: { ...exportData.dateRange, to: e.target.value }
                  })}
                  className="focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {/* Bouton d'export */}
        <div className="mt-8">
          <Button
            onClick={handleExport}
            disabled={loading}
            className="w-full md:w-auto bg-blue-600 hover:bg-blue-700"
          >
            {loading ? (
              <>
                <Clock className="h-4 w-4 mr-2 animate-spin" />
                Export en cours...
              </>
            ) : (
              <>
                <Download className="h-4 w-4 mr-2" />
                Lancer l'export
              </>
            )}
          </Button>
        </div>
        </CardContent>
      </Card>

      {/* Historique des exports */}
      {exportHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Historique des Exports</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
            {exportHistory.map((item) => (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <CheckCircle className="h-5 w-5 text-safe-success" />
                  <div>
                    <div className="text-sm font-medium text-gray-900 dark:text-gray-100">
                      {item.filename}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-safe-muted">
                      {item.count} enregistrement{item.count !== 1 ? 's' : ''} • 
                      {new Date(item.created_at).toLocaleString('fr-FR')}
                    </div>
                  </div>
                </div>
                <div className="flex items-center space-x-2">
                  <Badge variant={
                    item.type === 'tickets' ? 'destructive' :
                    item.type === 'users' ? 'default' :
                    item.type === 'performance' ? 'secondary' :
                    'outline'
                  }>
                    {item.type}
                  </Badge>
                  <Badge variant="outline">
                    {item.format.toUpperCase()}
                  </Badge>
                </div>
              </motion.div>
            ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}