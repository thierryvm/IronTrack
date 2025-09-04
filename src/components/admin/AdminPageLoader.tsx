import dynamic from 'next/dynamic'
import { Suspense } from 'react'
import { LazyDashboardSkeleton, LazyListSkeleton } from '@/components/LazyPageWrapper'

/**
 * PHASE 3 PERFORMANCE CRITICAL: Code Splitting agressif pages admin (-100kB)
 * Lazy loading intelligent pour les pages d'administration lourdes
 */

// Dynamic imports avec loading states optimisés
export const AdminDashboardPage = dynamic(
  () => import('@/app/admin/page').then(mod => ({ default: mod.default })),
  {
    loading: () => <LazyDashboardSkeleton />,
    ssr: false // Admin ne nécessite pas de SSR
  }
)

export const AdminTicketsPage = dynamic(
  () => import('@/app/admin/tickets/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-2/3" />
        </div>
        <LazyListSkeleton itemCount={6} />
      </div>
    ),
    ssr: false
  }
)

export const AdminUsersPage = dynamic(
  () => import('@/app/admin/users/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded" />
            ))}
          </div>
        </div>
        <LazyListSkeleton itemCount={8} />
      </div>
    ),
    ssr: false
  }
)

export const AdminLogsPage = dynamic(
  () => import('@/app/admin/logs/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="space-y-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-4" />
          <div className="flex gap-4 mb-6">
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded flex-1" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-32" />
            <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-24" />
          </div>
        </div>
        <LazyListSkeleton itemCount={10} />
      </div>
    ),
    ssr: false
  }
)

export const AdminExportsPage = dynamic(
  () => import('@/app/admin/exports/page').then(mod => ({ default: mod.default })),
  {
    loading: () => (
      <div className="space-y-6">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md animate-pulse">
          <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4" />
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-6" />
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-xl p-6 shadow-md animate-pulse">
              <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-2/3 mb-3" />
              <div className="h-4 bg-gray-100 dark:bg-gray-700 dark:bg-gray-800 rounded w-full mb-4" />
              <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-full" />
            </div>
          ))}
        </div>
      </div>
    ),
    ssr: false
  }
)

// Helper pour wrapper les pages avec Suspense
export function AdminPageWrapper({ 
  children, 
  fallback 
}: { 
  children: React.ReactNode
  fallback?: React.ReactNode 
}) {
  return (
    <Suspense fallback={fallback || <LazyDashboardSkeleton />}>
      {children}
    </Suspense>
  )
}