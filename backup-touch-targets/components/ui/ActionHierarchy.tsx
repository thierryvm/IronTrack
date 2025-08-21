'use client'

import { ReactNode } from 'react'
import { motion } from 'framer-motion'

export interface ActionConfig {
  type: 'primary' | 'secondary' | 'tertiary'
  label: string
  icon: ReactNode
  onClick: () => void
  variant?: 'success' | 'danger' | 'neutral' | 'warning'
  disabled?: boolean
  className?: string
  testId?: string
  ariaLabel?: string
}

interface ActionHierarchyProps {
  actions: ActionConfig[]
  layout?: 'horizontal' | 'vertical' | 'grid'
  className?: string
  animate?: boolean
}

export function ActionHierarchy({ 
  actions, 
  layout = 'horizontal',
  className = '',
  animate = true
}: ActionHierarchyProps) {
  
  // Séparer actions par type
  const primaryActions = actions.filter(action => action.type === 'primary')
  const secondaryActions = actions.filter(action => action.type === 'secondary')
  const tertiaryActions = actions.filter(action => action.type === 'tertiary')

  // Classes selon type d'action
  const getActionClasses = (action: ActionConfig): string => {
    const baseClasses = 'font-medium transition-all duration-200 flex items-center justify-center gap-2 focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed'
    
    switch (action.type) {
      case 'primary':
        return `${baseClasses} py-3 px-4 rounded-lg shadow-md hover:shadow-lg focus:ring-2 focus:ring-offset-2 ${getPrimaryVariantClasses(action.variant)}`
      
      case 'secondary':
        return `${baseClasses} py-2.5 px-4 rounded-lg focus:ring-2 focus:ring-offset-2 ${getSecondaryVariantClasses(action.variant)}`
      
      case 'tertiary':
        return `${baseClasses} py-2 px-3 rounded-md text-sm focus:ring-1 ${getTertiaryVariantClasses(action.variant)}`
      
      default:
        return baseClasses
    }
  }

  const getPrimaryVariantClasses = (variant?: string): string => {
    switch (variant) {
      case 'success':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white hover:from-green-600 hover:to-green-700 focus:ring-green-500'
      case 'danger':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500'
      case 'warning':
        return 'bg-gradient-to-r from-yellow-500 to-yellow-600 text-white hover:from-yellow-600 hover:to-yellow-700 focus:ring-yellow-500'
      case 'neutral':
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white hover:from-gray-600 hover:to-gray-700 focus:ring-gray-500'
      default:
        return 'bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 text-white hover:from-orange-600 hover:to-red-600 focus:ring-orange-500'
    }
  }

  const getSecondaryVariantClasses = (variant?: string): string => {
    switch (variant) {
      case 'success':
        return 'bg-green-100 text-green-700 hover:bg-green-200 focus:ring-green-400'
      case 'danger':
        return 'bg-red-100 text-red-700 hover:bg-red-200 focus:ring-red-400'
      case 'warning':
        return 'bg-yellow-100 text-yellow-700 hover:bg-yellow-200 focus:ring-yellow-400'
      case 'neutral':
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700 focus:ring-gray-400'
      default:
        return 'bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:bg-gray-700 focus:ring-gray-400'
    }
  }

  const getTertiaryVariantClasses = (variant?: string): string => {
    switch (variant) {
      case 'success':
        return 'text-green-600 hover:bg-green-50 focus:ring-green-300'
      case 'danger':
        return 'text-red-600 hover:bg-red-50 focus:ring-red-300'
      case 'warning':
        return 'text-yellow-600 hover:bg-yellow-50 focus:ring-yellow-300'
      case 'neutral':
        return 'text-gray-600 dark:text-gray-700 hover:bg-gray-50 dark:bg-gray-800 focus:ring-gray-300'
      default:
        return 'text-gray-600 dark:text-gray-700 hover:bg-gray-50 dark:bg-gray-800 focus:ring-gray-300'
    }
  }

  // Classes de layout
  const getLayoutClasses = (): string => {
    switch (layout) {
      case 'vertical':
        return 'flex flex-col space-y-2'
      case 'grid':
        return 'grid grid-cols-2 gap-2'
      default:
        return 'flex space-x-2'
    }
  }

  // Render d'une action
  const renderAction = (action: ActionConfig, index: number) => {
    const ButtonComponent = animate ? motion.button : 'button'
    const animationProps = animate ? {
      whileHover: { scale: action.type === 'primary' ? 1.02 : 1.01 },
      whileTap: { scale: 0.98 },
      transition: { duration: 0.15 }
    } : {}

    return (
      <ButtonComponent
        key={`${action.type}-${index}`}
        onClick={action.onClick}
        disabled={action.disabled}
        className={`${getActionClasses(action)} ${action.className || ''}`}
        aria-label={action.ariaLabel || action.label}
        data-testid={action.testId || `${action.type}-action-${index}`}
        {...animationProps}
      >
        <span className="flex-shrink-0">{action.icon}</span>
        <span className={action.type === 'tertiary' ? 'hidden sm:inline' : ''}>{action.label}</span>
      </ButtonComponent>
    )
  }

  return (
    <div className={`${getLayoutClasses()} ${className}`} data-testid="action-hierarchy">
      {/* Actions primaires - toujours en premier et flex-1 si horizontal */}
      {primaryActions.map((action, index) => (
        <div key={`primary-${index}`} className={layout === 'horizontal' ? 'flex-1' : ''}>
          {renderAction(action, index)}
        </div>
      ))}
      
      {/* Actions secondaires */}
      {secondaryActions.map((action, index) => renderAction(action, index))}
      
      {/* Actions tertiaires */}
      {tertiaryActions.map((action, index) => renderAction(action, index))}
    </div>
  )
}

// Hook utilitaire pour créer des configurations d'actions standardisées
export function useStandardActions() {
  const createAddPerformanceAction = (onClick: () => void): ActionConfig => ({
    type: 'primary',
    label: 'Performance',
    icon: <Plus className="h-5 w-5" />,
    onClick,
    variant: 'success',
    ariaLabel: 'Ajouter une nouvelle performance'
  })

  const createViewDetailsAction = (onClick: () => void): ActionConfig => ({
    type: 'secondary',
    label: 'Détails',
    icon: <Eye className="h-4 w-4" />,
    onClick,
    variant: 'neutral',
    ariaLabel: 'Voir les détails'
  })

  const createEditAction = (onClick: () => void): ActionConfig => ({
    type: 'tertiary',
    label: 'Modifier',
    icon: <Edit className="h-4 w-4" />,
    onClick,
    variant: 'neutral',
    ariaLabel: 'Modifier cet élément'
  })

  const createDeleteAction = (onClick: () => void): ActionConfig => ({
    type: 'tertiary',
    label: 'Supprimer',
    icon: <Trash2 className="h-4 w-4" />,
    onClick,
    variant: 'danger',
    ariaLabel: 'Supprimer cet élément'
  })

  const createDuplicateAction = (onClick: () => void): ActionConfig => ({
    type: 'tertiary',
    label: 'Dupliquer',
    icon: <Copy className="h-4 w-4" />,
    onClick,
    variant: 'neutral',
    ariaLabel: 'Dupliquer cet élément'
  })

  return {
    createAddPerformanceAction,
    createViewDetailsAction,
    createEditAction,
    createDeleteAction,
    createDuplicateAction
  }
}

// Import des icônes nécessaires
import { Plus, Eye, Edit, Trash2, Copy } from 'lucide-react'