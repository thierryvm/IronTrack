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
    action: '',
    target_type: '',
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
        ...(newFilters.action && { action: newFilters.action }),
        ...(newFilters.target_type && { target_type: newFilters.target_type }),
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
    if (action.includes('unauthorized') || action.includes('failed')) return <AlertTriangle className="h-4 w-4" />
    if (action.includes('access') || action.includes('view')) return <Eye className="h-4 w-4" />
    if (action.includes('success')) return <CheckCircle className="h-4 w-4" />
    return <Activity className="h-4 w-4" />
  }

  const totalPages = Math.ceil(totalLogs / LOGS_PER_PAGE)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-800 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-3 bg-purple-100 rounded-xl">
                <Activity className="h-8 w-8 text-purple-600" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Logs Système</h1>
                <p className="text-gray-600 dark:text-gray-700">
                  Monitoring des actions administratives
                </p>
              </div>
            </div>
            
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 bg-purple-500 hover:bg-purple-600 disabled:bg-purple-300 text-white px-4 py-2 rounded-lg transition-colors"
            >
              <RefreshCw className={`h-4 w-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span>Actualiser</span>
            </button>
          </div>
        </div>

        {/* Filtres optimisés */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Calendar className="h-4 w-4 inline mr-1" />
                Période
              </label>
              <select
                value={filters.date_range}
                onChange={(e) => handleFilterChange({ date_range: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="1h">Dernière heure</option>
                <option value="24h">24 dernières heures</option>
                <option value="7d">7 derniers jours</option>
                <option value="30d">30 derniers jours</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Filter className="h-4 w-4 inline mr-1" />
                Type d'action
              </label>
              <select
                value={filters.action}
                onChange={(e) => handleFilterChange({ action: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Toutes les actions</option>
                <option value="admin_access">Accès admin</option>
                <option value="view_admin_logs">Consultation logs</option>
                <option value="unauthorized_admin_access_attempt">Accès non autorisé</option>
                <option value="user_management">Gestion utilisateurs</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Shield className="h-4 w-4 inline mr-1" />
                Cible
              </label>
              <select
                value={filters.target_type}
                onChange={(e) => handleFilterChange({ target_type: e.target.value })}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              >
                <option value="">Tous les types</option>
                <option value="admin_panel">Interface admin</option>
                <option value="user_account">Comptes utilisateurs</option>
                <option value="admin_logs">Logs système</option>
                <option value="admin_api">APIs admin</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                <Search className="h-4 w-4 inline mr-1" />
                Recherche
              </label>
              <input
                type="text"
                value={filters.search}
                onChange={(e) => handleFilterChange({ search: e.target.value })}
                placeholder="Rechercher une action..."
                className="w-full border border-gray-300 dark:border-gray-600 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
            </div>
          </div>

          {/* Statistiques rapides */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-700">
              <span>
                <strong>{totalLogs.toLocaleString('fr-FR')}</strong> logs trouvés
                {totalLogs >= MAX_LOGS_TOTAL && (
                  <span className="text-orange-800 dark:text-orange-300 ml-2">
                    (limité à {MAX_LOGS_TOTAL.toLocaleString('fr-FR')} pour les performances)
                  </span>
                )}
              </span>
              <span>Page {currentPage} / {totalPages}</span>
            </div>
          </div>
        </div>

        {/* Liste des logs avec pagination */}
        <div className="bg-white dark:bg-gray-900 rounded-xl shadow-md overflow-hidden">
          {loading ? (
            <div className="p-8 text-center">
              <RefreshCw className="h-8 w-8 text-purple-500 animate-spin mx-auto mb-4" />
              <p className="text-gray-600 dark:text-gray-700">Chargement des logs...</p>
            </div>
          ) : logs.length === 0 ? (
            <div className="p-8 text-center">
              <Activity className="h-12 w-12 text-gray-700 mx-auto mb-4" />
              <p className="text-gray-600">Aucun log trouvé pour cette période.</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 dark:bg-gray-800">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Action
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Cible
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Admin
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Date
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-600 uppercase tracking-wider">
                      Détails
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-200">
                  {logs.map((log) => (
                    <motion.tr
                      key={log.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      className="hover:bg-gray-50 dark:bg-gray-800"
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
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-700">
                        {log.target_type.replace(/_/g, ' ')}
                        {log.target_id && (
                          <div className="text-xs text-gray-700 mt-1">
                            ID: {log.target_id.slice(0, 8)}...
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-700">
                        <span className="bg-gray-100 dark:bg-gray-800 px-2 py-1 rounded text-xs">
                          {log.admin_id.slice(0, 8)}...
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-700">
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(log.created_at).toLocaleString('fr-FR')}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600 dark:text-gray-700 max-w-xs">
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
            <div className="bg-gray-50 dark:bg-gray-800 px-6 py-4 border-t border-gray-200 dark:border-gray-600">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-600 dark:text-gray-700">
                  Affichage de {(currentPage - 1) * LOGS_PER_PAGE + 1} à {Math.min(currentPage * LOGS_PER_PAGE, totalLogs)} sur {totalLogs.toLocaleString('fr-FR')}
                </div>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage <= 1}
                    className="flex items-center px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <ChevronLeft className="h-4 w-4" />
                    Précédent
                  </button>
                  
                  <span className="text-sm text-gray-600 dark:text-gray-700 px-3">
                    {currentPage} / {totalPages}
                  </span>
                  
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage >= totalPages}
                    className="flex items-center px-3 py-2 text-sm bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Suivant
                    <ChevronRight className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}