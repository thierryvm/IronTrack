'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity,
  RefreshCw,
  Search,
  Filter,
  Clock,
  Shield,
  Eye,
  AlertTriangle,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Calendar
} from 'lucide-react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

interface AdminLog {
  id: string
  admin_id: string
  action: string
  target_type: string
  target_id?: string
  created_at: string
  details: Record<string, unknown>
}

interface Filters {
  action: string
  target_type: string
  date_range: string
  search: string
}

const LOGS_PER_PAGE = 50
const MAX_LOGS_TOTAL = 1000 // Limite absolue pour éviter la surcharge

export default function AdminLogsPage() {
  const [logs, setLogs] = useState<AdminLog[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalLogs, setTotalLogs] = useState(0)
  const [filters, setFilters] = useState<Filters>({
    action: 'all',
    target_type: 'all',
    date_range: '24h',
    search: ''
  })

  const { hasPermission } = useAdminAuth()

  // Optimisation : Charger les logs avec pagination et filtres
  const loadLogs = useCallback(async (page = 1, newFilters = filters) => {
    if (!hasPermission('moderator')) return

    try {
      setLoading(page === 1)
      setRefreshing(page !== 1)

      // Utiliser l'API route admin pour les logs
      const params = new URLSearchParams({
        page: page.toString(),
        limit: LOGS_PER_PAGE.toString(),
        date_range: newFilters.date_range,
        ...(newFilters.action && newFilters.action !== 'all' && { action: newFilters.action }),
        ...(newFilters.target_type && newFilters.target_type !== 'all' && { target_type: newFilters.target_type }),
        ...(newFilters.search && { search: newFilters.search })
      })

      const response = await fetch(`/api/admin/logs?${params}`, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json',
        },
      })

      if (!response.ok) {
        throw new Error(`Erreur API logs (${response.status}): ${response.statusText}`)
      }

      const { logs: apiLogs, meta } = await response.json()
      
      setLogs(apiLogs || [])
      setTotalLogs(Math.min(meta?.total || 0, MAX_LOGS_TOTAL))
      setCurrentPage(page)// Log de consultation (déjà fait par l'API)
      if (page === 1 && apiLogs?.length) {}

    } catch (error) {
      console.error('Erreur chargement logs admin:', error)
    } finally {
      setLoading(false)
      setRefreshing(false)
    }
  }, [hasPermission, filters])

  // Chargement initial avec useCallback stabilisé
  useEffect(() => {
    if (hasPermission('moderator')) {
      loadLogs(1, filters)
    }
  }, [hasPermission, filters, loadLogs])

  // Gestionnaires
  const handleRefresh = () => loadLogs(currentPage, filters)
  
  const handleFilterChange = (newFilters: Partial<Filters>) => {
    const updatedFilters = { ...filters, ...newFilters }
    setFilters(updatedFilters)
    loadLogs(1, updatedFilters)
  }

  const handlePageChange = (newPage: number) => {
    loadLogs(newPage, filters)
  }

  // Formatage des données
  const getActionColor = (action: string) => {
    if (action.includes('unauthorized') || action.includes('failed')) return 'text-red-600 bg-red-100'
    if (action.includes('success') || action.includes('access')) return 'text-green-600 bg-green-100'
    if (action.includes('warning')) return 'text-yellow-600 bg-yellow-100'
    return 'text-blue-600 bg-blue-100'
  }

  const getActionIcon = (action: string) => {
    if (action.includes('unauthorized') || action.includes('failed')) return <AlertTriangle className="h-6 w-6" />
    if (action.includes('access') || action.includes('view')) return <Eye className="h-6 w-6" />
    if (action.includes('success')) return <CheckCircle className="h-6 w-6" />
    return <Activity className="h-6 w-6" />
  }

  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Logs Système</h1>
                <p className="text-gray-600 dark:text-gray-300">
                  Monitoring des actions administratives
                </p>
              </div>
            </div>
            
            <Button
              onClick={handleRefresh}
              disabled={refreshing}
              className="bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white"
            >
              <RefreshCw className={`h-4 w-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Filtres optimisés */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <Label htmlFor="date-range-filter" className="text-sm font-medium mb-2 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                Période
              </Label>
              <Select
                value={filters.date_range}
                onValueChange={(value) => handleFilterChange({ date_range: value })}
              >
                <SelectTrigger id="date-range-filter" className="w-full">
                  <SelectValue placeholder="Sélectionner une période" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1h">Dernière heure</SelectItem>
                  <SelectItem value="24h">24 dernières heures</SelectItem>
                  <SelectItem value="7d">7 derniers jours</SelectItem>
                  <SelectItem value="30d">30 derniers jours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="action-filter" className="text-sm font-medium mb-2 flex items-center">
                <Filter className="h-4 w-4 mr-1" />
                Type d'action
              </Label>
              <Select
                value={filters.action}
                onValueChange={(value) => handleFilterChange({ action: value })}
              >
                <SelectTrigger id="action-filter" className="w-full">
                  <SelectValue placeholder="Toutes les actions" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Toutes les actions</SelectItem>
                  <SelectItem value="admin_access">Accès admin</SelectItem>
                  <SelectItem value="view_admin_logs">Consultation logs</SelectItem>
                  <SelectItem value="unauthorized_admin_access_attempt">Accès non autorisé</SelectItem>
                  <SelectItem value="user_management">Gestion utilisateurs</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="target-filter" className="text-sm font-medium mb-2 flex items-center">
                <Shield className="h-4 w-4 mr-1" />
                Cible
              </Label>
              <Select
                value={filters.target_type}
                onValueChange={(value) => handleFilterChange({ target_type: value })}
              >
                <SelectTrigger id="target-filter" className="w-full">
                  <SelectValue placeholder="Tous les types" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Tous les types</SelectItem>
                  <SelectItem value="admin_panel">Interface admin</SelectItem>
                  <SelectItem value="user_account">Comptes utilisateurs</SelectItem>
                  <SelectItem value="admin_logs">Logs système</SelectItem>
                  <SelectItem value="admin_api">APIs admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label htmlFor="search-filter" className="text-sm font-medium mb-2 flex items-center">
                <Search className="h-4 w-4 mr-1" />
                Recherche
              </Label>
              <Input
                id="search-filter"
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="Rechercher une action..."
                className="focus:ring-2 focus:ring-purple-500"
                aria-label="Rechercher dans les logs par action ou détails"
              />
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-300">
              <span>
                <strong>{totalLogs.toLocaleString('fr-FR')}</strong> logs trouvés
                {totalLogs >= MAX_LOGS_TOTAL && (
                  <span className="text-amber-600 dark:text-amber-400 ml-2">
                    (limité à {MAX_LOGS_TOTAL.toLocaleString('fr-FR')} pour les performances)
                  </span>
                )}
              </span>
              <span>Page {currentPage} / {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Liste des logs avec pagination */}
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-safe-primary animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-300">Chargement des logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-700 dark:text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 dark:text-safe-muted">Aucun log trouvé pour cette période.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-safe-muted uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-safe-muted uppercase tracking-wider">
                      Cible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-safe-muted uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-safe-muted uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 dark:text-safe-muted uppercase tracking-wider">
                      Détails
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  divide-y divide-gray-200">
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 dark:hover:bg-gray-800"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center space-x-2">
                          <div className={`p-2 rounded-lg ${getActionColor(log.action)}`}>
                            {getActionIcon(log.action)}
                          </div>
                          <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                            {log.action.replace(/_/g, ' ')}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {log.target_type.replace(/_/g, ' ')}
                        {log.target_id && (
                          <div className="text-xs text-gray-700 dark:text-gray-300 mt-1">
                            ID: {log.target_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <span className="bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded text-xs">
                          {log.admin_id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-5 w-5" />
                          <span>{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-300 max-w-xs">
                        {log.details && Object.keys(log.details).length > 0 && (
                          <details className="cursor-pointer">
                            <summary className="text-purple-600 hover:text-purple-700">
                              Voir détails
                            </summary>
                            <pre className="mt-2 text-xs bg-gray-50 dark:bg-gray-800 p-2 rounded overflow-x-auto">
                              {JSON.stringify(log.details, null, 2)}
                            </pre>
                          </details>
                        )}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-700">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-300">
                  Affichage de {(currentPage - 1) * LOGS_PER_PAGE + 1} à {Math.min(currentPage * LOGS_PER_PAGE, totalLogs)} sur {totalLogs.toLocaleString('fr-FR')}
                </div>
                <div className="flex items-center space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center"
                  >
                    <ChevronLeft className="h-4 w-4 mr-1" />
                    Précédent
                  </Button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-300 px-3">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <Button
                    variant="outline"
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}