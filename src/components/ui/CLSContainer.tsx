'use client'

import { ReactNode } from 'react'

interface CLSContainerProps {
  children: ReactNode
  className?: string
  minHeight?: string | number
  minWidth?: string | number
  skeleton?: ReactNode
  loading?: boolean
  /** Désactive les animations pour éviter les décalages */
  disableAnimations?: boolean
}

/**
 * Composant conteneur optimisé pour éviter les Cumulative Layout Shifts (CLS)
 * Utilise des dimensions fixes et des skeletons pour maintenir la mise en page
 */
export function CLSContainer({
  children,
  className = '',
  minHeight,
  minWidth,
  skeleton,
  loading = false,
  disableAnimations = false
}: CLSContainerProps) {
  const containerStyle: React.CSSProperties = {}
  
  if (minHeight) {
    containerStyle.minHeight = typeof minHeight === 'number' ? `${minHeight}px` : minHeight
  }
  
  if (minWidth) {
    containerStyle.minWidth = typeof minWidth === 'number' ? `${minWidth}px` : minWidth
  }

  const containerClasses = [
    className,
    disableAnimations ? '' : 'transition-all duration-200'
  ].filter(Boolean).join(' ')

  if (loading && skeleton) {
    return (
      <div className={containerClasses} style={containerStyle}>
        {skeleton}
      </div>
    )
  }

  return (
    <div className={containerClasses} style={containerStyle}>
      {children}
    </div>
  )
}

/**
 * Skeleton prédéfini pour les cartes de statistiques
 */
export function StatCardSkeleton() {
  return (
    <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 dark:bg-gray-900 p-3 sm:p-6 rounded-xl shadow-sm animate-pulse min-h-[120px]">
      <div className="flex items-center justify-between mb-2 sm:mb-4">
        <div className="w-8 h-8 sm:w-12 sm:h-12 bg-gray-200 dark:bg-gray-700 rounded-lg" />
        <div className="w-4 h-4 bg-gray-200 dark:bg-gray-700 rounded" />
      </div>
      <div className="h-3 sm:h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-1" />
      <div className="h-6 sm:h-8 bg-gray-300 rounded w-1/3 mb-1" />
      <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
    </div>
  )
}

/**
 * Skeleton prédéfini pour les listes d'éléments
 */
export function ListItemSkeleton({ count = 3 }: { count?: number }) {
  return (
    <div className="space-y-3">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg min-h-[60px] animate-pulse">
          <div className="flex-1">
            <div className="h-4 w-2/3 bg-gray-300 rounded mb-1" />
            <div className="h-3 w-1/3 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
          <div className="text-right">
            <div className="h-4 w-16 bg-orange-200 rounded mb-1" />
            <div className="h-3 w-12 bg-gray-200 dark:bg-gray-700 rounded" />
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * Skeleton prédéfini pour les actions rapides
 */
export function ActionCardSkeleton({ count = 4 }: { count?: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border-2 border-gray-100 dark:border-gray-700 rounded-xl min-h-[100px] animate-pulse">
          <div className="flex items-center mb-3">
            <div className="w-5 h-5 bg-gray-200 dark:bg-gray-700 rounded mr-2" />
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
          </div>
          <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full" />
        </div>
      ))}
    </div>
  )
}

/**
 * Hook pour des dimensions communes CLS-optimisées
 */
export const CLSdimensions = {
  statCard: { minHeight: '120px', minWidth: '180px' },
  actionCard: { minHeight: '100px' },
  listItem: { minHeight: '60px' },
  section: { minHeight: '180px' },
  adminDashboard: { minHeight: '300px' },
  heroSection: { minHeight: '160px' },
  motivationSection: { minHeight: '140px' }
} as const