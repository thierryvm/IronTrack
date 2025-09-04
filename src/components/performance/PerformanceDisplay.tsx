'use client'

import { ReactNode } from 'react'
import { Calendar, Timer, Zap, Activity, TrendingUp, Target } from 'lucide-react'

interface Performance {
  weight?: number
  reps?: number
  sets?: number
  distance?: number
  duration?: number
  stroke_rate?: number
  watts?: number
  heart_rate?: number
  incline?: number
  cadence?: number
  resistance?: number
  calories?: number
  speed?: number
  performed_at: string
  notes?: string
}

interface PerformanceDisplayProps {
  performance: Performance
  exerciseType: 'Musculation' | 'Cardio'
  exerciseName?: string
  variant?: 'inline' | 'card' | 'detailed' | 'compact'
  showDate?: boolean
  showIcon?: boolean
  maxMetrics?: number
  className?: string
  testId?: string
}

export function PerformanceDisplay({
  performance,
  exerciseType,
  exerciseName = '',
  variant = 'inline',
  showDate = true,
  showIcon = true,
  maxMetrics = 4,
  className = '',
  testId
}: PerformanceDisplayProps) {

  // Détection intelligente du type d'équipement cardio
  const getCardioEquipmentType = (): 'rowing' | 'running' | 'cycling' | 'generic' => {
    const name = exerciseName.toLowerCase()
    if (name.includes('rameur') || name.includes('rowing')) return 'rowing'
    if (name.includes('course') || name.includes('tapis') || name.includes('running')) return 'running'
    if (name.includes('vélo') || name.includes('bike') || name.includes('cycling')) return 'cycling'
    return 'generic'
  }

  // Format intelligent des performances selon type d'exercice
  const formatPerformanceMetrics = (): { text: string; icon: ReactNode; priority: number }[] => {
    const metrics: { text: string; icon: ReactNode; priority: number }[] = []

    if (exerciseType === 'Musculation') {
      // Musculation : poids × reps × sets
      if (performance.weight) {
        metrics.push({
          text: `${performance.weight}kg`,
          icon: <Target className="h-5 w-5" />,
          priority: 1
        })
      }
      if (performance.reps) {
        metrics.push({
          text: `${performance.reps} reps`,
          icon: <Activity className="h-5 w-5" />,
          priority: 2
        })
      }
      if (performance.sets) {
        metrics.push({
          text: `${performance.sets} sets`,
          icon: <TrendingUp className="h-5 w-5" />,
          priority: 3
        })
      }
    } else {
      // Cardio : format adaptatif selon équipement
      const equipmentType = getCardioEquipmentType()
      
      // Distance (priorité selon équipement)
      if (performance.distance) {
        let distanceText = ''
        if (equipmentType === 'rowing' && performance.distance >= 100) {
          distanceText = `${performance.distance}m`
        } else {
          distanceText = `${performance.distance}km`
        }
        metrics.push({
          text: distanceText,
          icon: <Target className="h-5 w-5" />,
          priority: 1
        })
      }

      // Durée
      if (performance.duration) {
        const minutes = Math.floor(performance.duration / 60)
        const seconds = performance.duration % 60
        metrics.push({
          text: `${minutes}:${seconds.toString().padStart(2, '0')}`,
          icon: <Timer className="h-5 w-5" />,
          priority: 2
        })
      }

      // Métriques spécialisées selon équipement
      switch (equipmentType) {
        case 'rowing':
          if (performance.stroke_rate) {
            metrics.push({
              text: `${performance.stroke_rate} SPM`,
              icon: <Activity className="h-5 w-5" />,
              priority: 3
            })
          }
          if (performance.watts) {
            metrics.push({
              text: `${performance.watts}W`,
              icon: <Zap className="h-5 w-5" />,
              priority: 4
            })
          }
          break

        case 'running':
          if (performance.speed) {
            metrics.push({
              text: `${performance.speed} km/h`,
              icon: <TrendingUp className="h-5 w-5" />,
              priority: 3
            })
          }
          if (performance.incline && performance.incline > 0) {
            metrics.push({
              text: `${performance.incline}%`,
              icon: <Activity className="h-5 w-5" />,
              priority: 4
            })
          }
          break

        case 'cycling':
          if (performance.cadence) {
            metrics.push({
              text: `${performance.cadence} RPM`,
              icon: <Activity className="h-5 w-5" />,
              priority: 3
            })
          }
          if (performance.resistance) {
            metrics.push({
              text: `Niv.${performance.resistance}`,
              icon: <Zap className="h-5 w-5" />,
              priority: 4
            })
          }
          break

        default:
          // Métriques génériques
          if (performance.speed) {
            metrics.push({
              text: `${performance.speed} km/h`,
              icon: <TrendingUp className="h-5 w-5" />,
              priority: 3
            })
          }
          if (performance.calories) {
            metrics.push({
              text: `${performance.calories} kcal`,
              icon: <Zap className="h-5 w-5" />,
              priority: 5
            })
          }
          break
      }

      // Rythme cardiaque (toujours pertinent)
      if (performance.heart_rate) {
        metrics.push({
          text: `${performance.heart_rate} BPM`,
          icon: <Activity className="h-5 w-5" />,
          priority: 6
        })
      }
    }

    // Trier par priorité et limiter au nombre max
    return metrics
      .sort((a, b) => a.priority - b.priority)
      .slice(0, maxMetrics)
  }

  // Format date lisible
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    const now = new Date()
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))

    if (diffInDays === 0) return 'Aujourd\'hui'
    if (diffInDays === 1) return 'Hier'
    if (diffInDays < 7) return `Il y a ${diffInDays} jours`
    return date.toLocaleDateString('fr-FR')
  }

  // Classes selon variante
  const getVariantClasses = (): string => {
    switch (variant) {
      case 'card':
        return 'bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-600'
      case 'detailed':
        return 'bg-white dark:bg-gray-900 rounded-lg p-6 border border-gray-200 dark:border-gray-600 shadow-sm'
      case 'compact':
        return 'text-sm'
      default:
        return ''
    }
  }

  const metrics = formatPerformanceMetrics()
  
  if (metrics.length === 0) {
    return (
      <div 
        className={`text-gray-600 dark:text-safe-muted italic ${getVariantClasses()} ${className}`}
        data-testid={testId}
      >
        Aucune métrique enregistrée
      </div>
    )
  }

  return (
    <div 
      className={`${getVariantClasses()} ${className}`}
      data-testid={testId}
    >
      {/* En-tête pour variantes card/detailed */}
      {(variant === 'card' || variant === 'detailed') && (
        <div className="flex items-center space-x-2 text-sm mb-2">
          {showIcon && <TrendingUp className="h-6 w-6 text-orange-800 dark:text-orange-300 flex-shrink-0" />}
          <span className="text-gray-600 dark:text-gray-300 font-medium">
            {exerciseType === 'Musculation' ? 'Performance musculation' : 'Performance cardio'}
          </span>
        </div>
      )}

      {/* Métriques principales */}
      <div className={`
        flex items-center 
        ${variant === 'detailed' ? 'flex-wrap gap-3' : 'space-x-2'}
        ${variant === 'compact' ? 'text-xs' : 'text-sm'}
      `}>
        {metrics.map((metric, index) => (
          <div key={index} className="flex items-center space-x-1 flex-shrink-0">
            {showIcon && variant !== 'compact' && (
              <span className="text-gray-700 dark:text-gray-300">{metric.icon}</span>
            )}
            <span className={`
              font-medium
              ${variant === 'detailed' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}
            `}>
              {metric.text}
            </span>
            {index < metrics.length - 1 && variant !== 'detailed' && (
              <span className="text-gray-700 dark:text-gray-300 mx-1">•</span>
            )}
          </div>
        ))}
      </div>

      {/* Date et notes pour variantes étendues */}
      {(variant === 'card' || variant === 'detailed') && (
        <div className="mt-3 space-y-2">
          {showDate && (
            <div className="flex items-center space-x-2 text-xs text-gray-600 dark:text-safe-muted">
              <Calendar className="h-5 w-5 flex-shrink-0" />
              <span>{formatDate(performance.performed_at)}</span>
            </div>
          )}
          
          {performance.notes && variant === 'detailed' && (
            <div className="mt-2 p-2 bg-gray-50 dark:bg-gray-800 rounded text-xs text-gray-600 dark:text-gray-300">
              <strong>Notes:</strong> {performance.notes}
            </div>
          )}
        </div>
      )}

      {/* Date inline pour variante standard */}
      {variant === 'inline' && showDate && (
        <div className="flex items-center space-x-1 text-xs text-gray-600 dark:text-safe-muted mt-1">
          <Calendar className="h-5 w-5 flex-shrink-0" />
          <span>{formatDate(performance.performed_at)}</span>
        </div>
      )}
    </div>
  )
}

// Hook utilitaire pour formater rapidement une performance
export function usePerformanceFormatter() {
  const formatQuick = (
    performance: Performance, 
    exerciseType: 'Musculation' | 'Cardio',
    exerciseName?: string
  ): string => {
    if (exerciseType === 'Musculation') {
      const parts = []
      if (performance.weight) parts.push(`${performance.weight}kg`)
      if (performance.reps) parts.push(`${performance.reps} reps`)
      if (performance.sets) parts.push(`${performance.sets} sets`)
      return parts.join(' × ') || 'Performance musculation'
    } else {
      const parts = []
      const isRowing = exerciseName?.toLowerCase().includes('rameur')
      
      if (performance.distance) {
        parts.push(isRowing && performance.distance >= 100 
          ? `${performance.distance}m` 
          : `${performance.distance}km`)
      }
      
      if (performance.duration) {
        const minutes = Math.floor(performance.duration / 60)
        const seconds = performance.duration % 60
        parts.push(`${minutes}:${seconds.toString().padStart(2, '0')}`)
      }
      
      if (performance.stroke_rate) parts.push(`${performance.stroke_rate} SPM`)
      if (performance.watts) parts.push(`${performance.watts}W`)
      
      return parts.slice(0, 4).join(' • ') || 'Performance cardio'
    }
  }

  return { formatQuick }
}