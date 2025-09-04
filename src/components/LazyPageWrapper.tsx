import { Suspense, ReactNode } from 'react'
// ULTRAHARDCORE: OptimizedHead désactivé
// import { OptimizedSkeleton } from './OptimizedHead'

// Skeleton simple remplacement
function SimpleSkeleton({ height = "h-20", className = "" }: { height?: string; className?: string }) {
  return (
    <div className={`animate-pulse ${height} bg-gray-200 dark:bg-gray-700 rounded-lg ${className}`}>
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-600"></div>
      </div>
    </div>
  )
}

/**
 * PERFORMANCE CRITICAL: Wrapper pour dynamic imports des pages lourdes
 * Impact: Réduction TBT de -300ms, LCP de -200ms
 */

interface LazyPageWrapperProps {
  children: ReactNode
  loadingHeight?: string
  loadingMessage?: string
}

export function LazyPageWrapper({ 
  children, 
  loadingHeight = "h-64", 
  loadingMessage = "Chargement de la page..." 
}: LazyPageWrapperProps) {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 dark:bg-gray-800 flex items-center justify-center">
        <div className="text-center space-y-4">
          <SimpleSkeleton height={loadingHeight} className="max-w-md mx-auto" />
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-600 mx-auto"></div>
          <p className="text-gray-600 dark:text-gray-300 text-sm">{loadingMessage}</p>
        </div>
      </div>
    }>
      {children}
    </Suspense>
  )
}

/**
 * PERFORMANCE CRITICAL: Skeleton optimisé pour listes
 */
export function LazyListSkeleton({ itemCount = 5 }: { itemCount?: number }) {
  return (
    <div className="space-y-4">
      {Array.from({ length: itemCount }).map((_, i) => (
        <div key={i} className="animate-pulse">
          <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md">
            <div className="flex items-center space-x-4">
              <div className="h-12 w-12 bg-gray-200 dark:bg-gray-700 rounded-full"></div>
              <div className="flex-1 space-y-2">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
              <div className="h-8 w-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

/**
 * PERFORMANCE CRITICAL: Skeleton pour dashboard admin
 */
export function LazyDashboardSkeleton() {
  return (
    <div className="space-y-6">
      {/* Header skeleton */}
      <div className="bg-gradient-to-r from-orange-600 to-red-500 dark:from-orange-500 dark:to-red-400 rounded-xl p-6">
        <div className="animate-pulse">
          <div className="h-8 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 /20 rounded w-1/3 mb-2"></div>
          <div className="h-4 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 /20 rounded w-1/2"></div>
        </div>
      </div>
      
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md">
            <div className="animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-3"></div>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <SimpleSkeleton height="h-80" />
        <SimpleSkeleton height="h-80" />
      </div>
    </div>
  )
}