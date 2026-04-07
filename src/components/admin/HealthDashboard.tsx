'use client'

import { useState, useEffect, useCallback } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  RefreshCw, CheckCircle2, AlertTriangle, XCircle,
  Package, Shield, Cpu, Clock,
  ArrowUpCircle, ChevronRight
} from 'lucide-react'

// Types
type Status = 'ok' | 'warning' | 'critical'
type OverallStatus = 'healthy' | 'warning' | 'critical'

interface Dep {
  name: string
  current: string
  latest: string
  status: Status
  category: string
  label: string
  action?: string
}

interface SecurityCheck {
  name: string
  status: Status
  message: string
}

interface RuntimeCheck {
  name: string
  status: Status
  message: string
  latency?: number
}

interface CategoryScore {
  score: number
  critical: number
  warnings: number
  latency?: number
}

interface HealthData {
  score: number
  status: OverallStatus
  categories: {
    dependencies: CategoryScore
    security: CategoryScore
    runtime: CategoryScore
  }
  dependencies: Dep[]
  securityChecks: SecurityCheck[]
  runtimeChecks: RuntimeCheck[]
  checkedAt: string
}

// --- Sub-components ---

function StatusIcon({ status, size = 'sm' }: { status: Status; size?: 'sm' | 'md' }) {
  const sz = size === 'md' ? 'h-5 w-5' : 'h-4 w-4'
  if (status === 'ok') return <CheckCircle2 className={`${sz} text-safe-success`} />
  if (status === 'warning') return <AlertTriangle className={`${sz} text-safe-warning`} />
  return <XCircle className={`${sz} text-safe-error`} />
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'ok') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
      OK
    </span>
  )
  if (status === 'warning') return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
      Attention
    </span>
  )
  return (
    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-red-500/10 text-safe-error border border-red-500/20">
      <span className="w-1.5 h-1.5 rounded-full bg-red-500" />
      Critique
    </span>
  )
}

function ScoreRing({ score, status }: { score: number; status: OverallStatus }) {
  const radius = 68
  const circumference = 2 * Math.PI * radius
  const strokeDashoffset = circumference - (score / 100) * circumference
  const color = status === 'healthy' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'
  const label = status === 'healthy' ? 'Excellent' : status === 'warning' ? 'Attention' : 'Critique'

  return (
    <div className="flex flex-col items-center gap-3">
      <svg width="176" height="176" viewBox="0 0 176 176">
        <circle cx="88" cy="88" r={radius} stroke="rgba(255,255,255,0.08)" strokeWidth="12" fill="none" />
        <circle
          cx="88" cy="88" r={radius}
          stroke={color}
          strokeWidth="12"
          fill="none"
          strokeLinecap="round"
          strokeDasharray={circumference}
          strokeDashoffset={strokeDashoffset}
          transform="rotate(-90 88 88)"
          style={{ transition: 'stroke-dashoffset 1.2s cubic-bezier(0.4, 0, 0.2, 1)' }}
        />
        <text x="88" y="80" textAnchor="middle" fill="white" fontSize="36" fontWeight="700" fontFamily="inherit">
          {score}
        </text>
        <text x="88" y="100" textAnchor="middle" fill="rgba(255,255,255,0.45)" fontSize="13" fontFamily="inherit">
          / 100
        </text>
      </svg>
      <span
        className="text-sm font-semibold px-3 py-1 rounded-full border"
        style={{
          color,
          borderColor: `${color}40`,
          backgroundColor: `${color}15`,
        }}
      >
        {label}
      </span>
    </div>
  )
}

function CategoryMiniCard({ title, score, icon: Icon, critical, warnings }: {
  title: string
  score: number
  icon: React.ElementType
  critical: number
  warnings: number
}) {
  const status: Status = critical > 0 ? 'critical' : warnings > 0 ? 'warning' : 'ok'
  const color = status === 'ok' ? '#10b981' : status === 'warning' ? '#f59e0b' : '#ef4444'

  return (
    <div className="flex flex-col items-center gap-2 px-6 py-4 rounded-xl border bg-white/5 border-white/10 min-w-[120px]">
      <Icon className="h-5 w-5 text-white/60" />
      <span className="text-xs text-white/50 font-medium">{title}</span>
      <span className="text-2xl font-bold" style={{ color }}>{score}</span>
      <div className="flex gap-1">
        {critical > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/20 text-safe-error">{critical} critique{critical > 1 ? 's' : ''}</span>
        )}
        {warnings > 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400">{warnings} avert.</span>
        )}
        {critical === 0 && warnings === 0 && (
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-400">Sain</span>
        )}
      </div>
    </div>
  )
}

function DepRow({ dep }: { dep: Dep }) {
  const [expanded, setExpanded] = useState(false)
  const borderColor = dep.status === 'ok' ? 'border-emerald-500/40' : dep.status === 'warning' ? 'border-amber-500/40' : 'border-red-500/60'

  return (
    <div className={`border-l-2 ${borderColor} bg-card rounded-r-lg mb-1 overflow-hidden`}>
      <div
        className="flex items-center gap-3 px-4 py-3 cursor-pointer hover:bg-muted/50 transition-colors"
        onClick={() => dep.action && setExpanded(!expanded)}
      >
        <StatusIcon status={dep.status} />
        <div className="flex-1 min-w-0">
          <span className="text-sm font-medium text-foreground">{dep.label}</span>
          <span className="text-xs text-muted-foreground ml-2 font-mono">{dep.name}</span>
        </div>
        <div className="flex items-center gap-3 flex-shrink-0">
          <span className="text-xs font-mono text-muted-foreground">{dep.current}</span>
          {dep.status !== 'ok' && (
            <span className="text-xs font-mono text-muted-foreground">→ {dep.latest}</span>
          )}
          <StatusBadge status={dep.status} />
          {dep.action && (
            <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded ? 'rotate-90' : ''}`} />
          )}
        </div>
      </div>
      {expanded && dep.action && (
        <div className="px-4 pb-3 text-xs text-muted-foreground bg-muted/30 flex items-start gap-2">
          <ArrowUpCircle className="h-3.5 w-3.5 text-amber-500 mt-0.5 flex-shrink-0" />
          {dep.action}
        </div>
      )}
    </div>
  )
}

function HealthSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="h-64 bg-slate-800 rounded-2xl" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[1, 2, 3].map(i => <div key={i} className="h-32 bg-muted rounded-xl" />)}
      </div>
      <div className="h-96 bg-muted rounded-xl" />
    </div>
  )
}

// --- Main component ---
export function HealthDashboard() {
  const [data, setData] = useState<HealthData | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [filter, setFilter] = useState<'all' | Status>('all')
  const [activeTab, setActiveTab] = useState<'dependencies' | 'security' | 'runtime'>('dependencies')

  const fetchHealth = useCallback(async () => {
    setLoading(true)
    setError(null)
    try {
      const res = await window.fetch('/api/admin/health', { credentials: 'include' })
      if (!res.ok) throw new Error(`HTTP ${res.status}`)
      const json = await res.json()
      setData(json)
    } catch (e) {
      setError('Impossible de charger les données de santé')
      console.error(e)
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => { fetchHealth() }, [fetchHealth])

  if (loading) return <HealthSkeleton />
  if (error) return (
    <Card>
      <CardContent className="flex flex-col items-center justify-center py-12 gap-4">
        <XCircle className="h-10 w-10 text-destructive" />
        <p className="text-sm text-muted-foreground">{error}</p>
        <Button variant="outline" size="sm" onClick={fetchHealth}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Réessayer
        </Button>
      </CardContent>
    </Card>
  )
  if (!data) return null

  const filteredDeps = filter === 'all' ? data.dependencies : data.dependencies.filter(d => d.status === filter)
  const criticalDeps = data.dependencies.filter(d => d.status === 'critical')
  const warningDeps = data.dependencies.filter(d => d.status === 'warning')

  return (
    <div className="space-y-6">
      {/* Hero section */}
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-slate-950" />
        <div
          className="absolute inset-0 opacity-50"
          style={{
            background: 'radial-gradient(circle at top right, #f97316, transparent 40%), radial-gradient(circle at bottom left, #4f46e5, transparent 45%)'
          }}
        />
        <div
          className="absolute inset-0"
          style={{ backgroundImage: 'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize: '32px 32px', opacity: 0.02 }}
        />

        <div className="relative z-10 p-8">
          <div className="flex flex-col lg:flex-row items-center gap-8">
            <ScoreRing score={data.score} status={data.status} />

            <div className="flex-1 space-y-6 text-center lg:text-left">
              <div>
                <h2 className="text-2xl font-bold text-white">Santé du Système</h2>
                <p className="text-white/50 text-sm mt-1">
                  Dernière vérification : {new Date(data.checkedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </p>
              </div>

              <div className="flex flex-wrap justify-center lg:justify-start gap-3">
                <CategoryMiniCard
                  title="Dépendances"
                  score={data.categories.dependencies.score}
                  icon={Package}
                  critical={data.categories.dependencies.critical}
                  warnings={data.categories.dependencies.warnings}
                />
                <CategoryMiniCard
                  title="Sécurité"
                  score={data.categories.security.score}
                  icon={Shield}
                  critical={data.categories.security.critical}
                  warnings={data.categories.security.warnings}
                />
                <CategoryMiniCard
                  title="Runtime"
                  score={data.categories.runtime.score}
                  icon={Cpu}
                  critical={0}
                  warnings={data.categories.runtime.score < 100 ? 1 : 0}
                />
              </div>
            </div>

            <div className="flex-shrink-0">
              <Button
                variant="outline"
                size="sm"
                onClick={fetchHealth}
                className="border-white/20 text-white/70 hover:bg-white/10 hover:text-white bg-transparent"
              >
                <RefreshCw className="h-4 w-4 mr-2" />
                Rafraîchir
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Critical alerts banner */}
      {criticalDeps.length > 0 && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/5 p-4">
          <div className="flex items-start gap-3">
            <XCircle className="h-5 w-5 text-safe-error flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-semibold text-safe-error">
                {criticalDeps.length} problème{criticalDeps.length > 1 ? 's' : ''} critique{criticalDeps.length > 1 ? 's' : ''} détecté{criticalDeps.length > 1 ? 's' : ''}
              </p>
              <p className="mt-0.5 text-xs text-safe-error">
                {criticalDeps.map(d => d.label).join(', ')} — action immédiate recommandée
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit">
        {(['dependencies', 'security', 'runtime'] as const).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
              activeTab === tab
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            {tab === 'dependencies' ? 'Dépendances' : tab === 'security' ? 'Sécurité' : 'Runtime'}
          </button>
        ))}
      </div>

      {/* Dependencies tab */}
      {activeTab === 'dependencies' && (
        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <CardTitle className="flex items-center gap-2">
                <Package className="h-5 w-5" />
                Dépendances ({data.dependencies.length})
              </CardTitle>
              <div className="flex gap-2 flex-wrap">
                {(['all', 'ok', 'warning', 'critical'] as const).map(f => (
                  <button
                    key={f}
                    onClick={() => setFilter(f)}
                    className={`px-3 py-1 rounded-full text-xs font-medium border transition-colors min-h-[32px] ${
                      filter === f
                        ? f === 'critical' ? 'bg-red-500/20 text-safe-error border-red-500/30'
                          : f === 'warning' ? 'bg-amber-500/20 text-safe-warning border-amber-500/30'
                          : f === 'ok' ? 'bg-emerald-500/20 text-safe-success border-emerald-500/30'
                          : 'bg-muted text-foreground border-border'
                        : 'bg-transparent text-muted-foreground border-border hover:text-foreground'
                    }`}
                  >
                    {f === 'all' ? `Tous (${data.dependencies.length})`
                      : f === 'critical' ? `Critique (${data.dependencies.filter(d => d.status === 'critical').length})`
                      : f === 'warning' ? `Attention (${warningDeps.length})`
                      : `OK (${data.dependencies.filter(d => d.status === 'ok').length})`}
                  </button>
                ))}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {filteredDeps.map(dep => <DepRow key={dep.name} dep={dep} />)}
              {filteredDeps.length === 0 && (
                <p className="text-sm text-muted-foreground text-center py-8">Aucune dépendance dans ce filtre</p>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Security tab */}
      {activeTab === 'security' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Contrôles de Sécurité
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.securityChecks.map(check => {
                const borderColor = check.status === 'ok' ? 'border-emerald-500/40' : check.status === 'warning' ? 'border-amber-500/40' : 'border-red-500/60'
                return (
                  <div key={check.name} className={`flex items-center gap-3 px-4 py-3 border-l-2 ${borderColor} bg-card rounded-r-lg`}>
                    <StatusIcon status={check.status as Status} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{check.name}</span>
                      <p className="text-xs text-muted-foreground">{check.message}</p>
                    </div>
                    <StatusBadge status={check.status as Status} />
                  </div>
                )
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Runtime tab */}
      {activeTab === 'runtime' && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Cpu className="h-5 w-5" />
              Checks Runtime
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {data.runtimeChecks.map(check => {
                const borderColor = check.status === 'ok' ? 'border-emerald-500/40' : check.status === 'warning' ? 'border-amber-500/40' : 'border-red-500/60'
                return (
                  <div key={check.name} className={`flex items-center gap-3 px-4 py-3 border-l-2 ${borderColor} bg-card rounded-r-lg`}>
                    <StatusIcon status={check.status as Status} />
                    <div className="flex-1">
                      <span className="text-sm font-medium text-foreground">{check.name}</span>
                      <p className="text-xs text-muted-foreground">{check.message}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      {check.latency !== undefined && check.latency > 0 && (
                        <span className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Clock className="h-3.5 w-3.5" />
                          {check.latency}ms
                        </span>
                      )}
                      <StatusBadge status={check.status as Status} />
                    </div>
                  </div>
                )
              })}
            </div>

            <div className="mt-6 pt-4 border-t border-border">
              <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">Informations Système</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                {[
                  { label: 'Application', value: 'v1.0.0' },
                  { label: 'Framework', value: 'Next.js 15.5.12' },
                  { label: 'Base de données', value: 'PostgreSQL 15' },
                  { label: 'Environnement', value: 'Production' },
                ].map(item => (
                  <div key={item.label} className="bg-muted rounded-lg p-3">
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="text-sm font-semibold text-foreground mt-0.5">{item.value}</p>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
