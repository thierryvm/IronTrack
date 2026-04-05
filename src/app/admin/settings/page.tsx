'use client'

import { useState } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Settings,
  Shield,
  Database,
  Bell,
  Mail,
  Users,
  Activity,
  RotateCcw,
  AlertTriangle,
  CheckCircle,
  X,
  HeartPulse,
  Sliders,
} from 'lucide-react'
import { HealthDashboard } from '@/components/admin/HealthDashboard'

// --- Toast component ---
function Toast({ message, type, onClose }: { message: string; type: 'success' | 'error'; onClose: () => void }) {
  return (
    <div aria-live="polite" className={`fixed top-4 right-4 z-50 flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg border ${
      type === 'success'
        ? 'bg-card border-emerald-500/30 text-foreground'
        : 'bg-card border-red-500/30 text-foreground'
    }`}>
      <CheckCircle className={`h-5 w-5 shrink-0 ${type === 'success' ? 'text-emerald-500' : 'text-safe-error'}`} />
      <span className="text-sm font-medium">{message}</span>
      <button
        type="button"
        aria-label="Fermer la notification"
        onClick={onClose}
        className="ml-2 min-h-[32px] min-w-[32px] flex items-center justify-center"
      >
        <X className="h-4 w-4 text-muted-foreground hover:text-foreground" />
      </button>
    </div>
  )
}

// --- Reset confirmation modal ---
function ResetConfirmModal({ onConfirm, onCancel, isLoading }: {
  onConfirm: () => void
  onCancel: () => void
  isLoading: boolean
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl shadow-xl p-6 max-w-md w-full mx-4">
        <div className="flex items-center space-x-2 mb-4">
          <div className="p-2 bg-destructive/10 rounded-lg">
            <AlertTriangle className="h-6 w-6 text-destructive" />
          </div>
          <h3 className="text-lg font-semibold text-foreground">Confirmer la réinitialisation</h3>
        </div>
        <p className="text-muted-foreground text-sm mb-6">
          Cette action est <strong>irréversible</strong>. Toute la configuration personnalisée sera
          supprimée et remplacée par les valeurs par défaut.
        </p>
        <div className="flex space-x-2 justify-end">
          <Button variant="outline" onClick={onCancel}>Annuler</Button>
          <Button variant="destructive" onClick={onConfirm} disabled={isLoading}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Réinitialiser
          </Button>
        </div>
      </div>
    </div>
  )
}

// --- Configuration tab content ---
function ConfigTab({ isLoading, onAction, onReset, canReset }: {
  isLoading: boolean
  onAction: (label?: string) => void
  onReset: () => void
  canReset: boolean
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Configuration Système */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Configuration Système
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Mode Maintenance</p>
                <p className="text-sm text-muted-foreground">Activer le mode maintenance pour les mises à jour</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAction()} disabled={isLoading}>
                <Activity className="h-4 w-4 mr-2" />
                Désactivé
              </Button>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Cache Base de Données</p>
                <p className="text-sm text-muted-foreground">Vider le cache pour forcer le rechargement</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAction()} disabled={isLoading}>
                <RotateCcw className="h-4 w-4 mr-2" />
                Vider
              </Button>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Sauvegardes Auto</p>
                <p className="text-sm text-muted-foreground">Sauvegarde automatique quotidienne</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-emerald-500">Activé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Notifications */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Notifications Admin
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Alertes Sécurité</p>
                <p className="text-sm text-muted-foreground">Notifications pour activités suspectes</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-emerald-500">Activé</span>
              </div>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Nouveaux Tickets</p>
                <p className="text-sm text-muted-foreground">Email pour chaque nouveau ticket support</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAction()} disabled={isLoading}>
                <Mail className="h-4 w-4 mr-2" />
                Configurer
              </Button>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Rapports Hebdo</p>
                <p className="text-sm text-muted-foreground">Rapport d&apos;activité chaque lundi</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-emerald-500">Activé</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Gestion Utilisateurs */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              Gestion Utilisateurs
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Inscription Ouverte</p>
                <p className="text-sm text-muted-foreground">Permettre les nouvelles inscriptions</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-emerald-500">Activé</span>
              </div>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Validation Email</p>
                <p className="text-sm text-muted-foreground">Exiger la validation d&apos;email pour nouveaux comptes</p>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-5 w-5 text-emerald-500" />
                <span className="text-sm text-emerald-500">Requis</span>
              </div>
            </div>
            <hr className="border-border" />
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-foreground">Limite Sessions</p>
                <p className="text-sm text-muted-foreground">Nombre max de sessions simultanées par utilisateur</p>
              </div>
              <Button variant="outline" size="sm" onClick={() => onAction()} disabled={isLoading}>
                5 sessions
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions Globales */}
      <Card>
        <CardHeader>
          <CardTitle>Actions Administrateur</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-4">
            <Button onClick={() => onAction('Export configuration')} disabled={isLoading}>
              Exporter Configuration
            </Button>
            <Button variant="outline" onClick={() => onAction('Sauvegarde')} disabled={isLoading}>
              Sauvegarder Maintenant
            </Button>
            <Button variant="outline" onClick={() => onAction('Téléchargement des logs')} disabled={isLoading}>
              Télécharger Logs
            </Button>
            {canReset && (
              <Button variant="destructive" onClick={onReset} disabled={isLoading}>
                <AlertTriangle className="h-4 w-4 mr-2" />
                Reset Configuration
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Security tab content ---
function SecurityTab({ isLoading, onAction }: { isLoading: boolean; onAction: (label?: string) => void }) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5" />
            Sécurité Avancée
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Audit Trail</p>
              <p className="text-sm text-muted-foreground">Journal complet des actions admin</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-emerald-500">Actif</span>
            </div>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Authentification 2FA</p>
              <p className="text-sm text-muted-foreground">Exiger 2FA pour tous les admin</p>
            </div>
            <Button variant="outline" size="sm" onClick={() => onAction()} disabled={isLoading}>
              <AlertTriangle className="h-4 w-4 mr-2" />
              Configurer
            </Button>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Détection Intrusion</p>
              <p className="text-sm text-muted-foreground">Surveillance des connexions suspectes</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-emerald-500">Actif</span>
            </div>
          </div>
          <hr className="border-border" />
          <div className="flex items-center justify-between">
            <div>
              <p className="font-medium text-foreground">Rate Limiting</p>
              <p className="text-sm text-muted-foreground">200 req/min API — 100 req/min pages</p>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-emerald-500" />
              <span className="text-sm text-emerald-500">Actif</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// --- Page tabs ---
type Tab = 'health' | 'config' | 'security'

const TABS: { id: Tab; label: string; icon: React.ElementType }[] = [
  { id: 'health', label: 'Santé Système', icon: HeartPulse },
  { id: 'config', label: 'Configuration', icon: Sliders },
  { id: 'security', label: 'Sécurité', icon: Shield },
]

// --- Main page ---
export default function AdminSettingsPage() {
  const { user, hasPermission } = useAdminAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showResetConfirm, setShowResetConfirm] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('health')

  const showToast = (message: string, type: 'success' | 'error' = 'success') => {
    setToast({ message, type })
    setTimeout(() => setToast(null), 3500)
  }

  const handleConfigAction = async (label?: string) => {
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
    if (label) showToast(`${label} effectué avec succès`)
  }

  const handleResetConfig = async () => {
    setShowResetConfirm(false)
    setIsLoading(true)
    await new Promise(resolve => setTimeout(resolve, 1200))
    setIsLoading(false)
    showToast('Configuration réinitialisée avec succès')
  }

  if (!hasPermission('super_admin')) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Card>
          <CardContent className="flex flex-col items-center justify-center py-12">
            <Shield className="h-12 w-12 text-muted-foreground mb-4" />
            <h2 className="text-xl font-semibold mb-2">Accès Refusé</h2>
            <p className="text-muted-foreground text-center">
              Vous n&apos;avez pas les permissions nécessaires pour accéder aux paramètres administrateur.
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              Rôle actuel : {user?.role ?? 'non défini'}
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Modals & toasts */}
      {toast && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast(null)} />
      )}
      {showResetConfirm && (
        <ResetConfirmModal
          onConfirm={handleResetConfig}
          onCancel={() => setShowResetConfirm(false)}
          isLoading={isLoading}
        />
      )}

      {/* Page header */}
      <div className="bg-gradient-to-r from-primary/10 to-transparent border-b border-border">
        <div className="container mx-auto px-4 py-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-card rounded-xl border border-border">
                <Settings className="h-6 w-6 text-foreground" />
              </div>
              <div>
                <h1 className="text-2xl font-bold text-foreground">Paramètres Admin</h1>
                <p className="text-sm text-muted-foreground">Configuration et supervision du système IronTrack</p>
              </div>
            </div>
            <Badge variant="secondary" className="text-sm">
              {user?.role ?? 'N/A'}
            </Badge>
          </div>

          {/* Tab pills */}
          <div className="flex gap-1 p-1 bg-muted rounded-xl w-fit mt-6">
            {TABS.map(tab => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  type="button"
                  aria-pressed={activeTab === tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors min-h-[44px] ${
                    activeTab === tab.id
                      ? 'bg-card text-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground'
                  }`}
                >
                  <Icon className="h-4 w-4" />
                  {tab.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* Tab content */}
      <div className="container mx-auto px-4 py-8">
        {activeTab === 'health' && <HealthDashboard />}
        {activeTab === 'config' && (
          <ConfigTab
            isLoading={isLoading}
            onAction={handleConfigAction}
            onReset={() => setShowResetConfirm(true)}
            canReset={hasPermission('super_admin')}
          />
        )}
        {activeTab === 'security' && (
          <SecurityTab isLoading={isLoading} onAction={handleConfigAction} />
        )}
      </div>
    </div>
  )
}
