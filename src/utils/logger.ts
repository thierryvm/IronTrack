/**
 * Système de logging centralisé et sécurisé
 * Remplace les console.log dispersés par un système unifié
 */

type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  data?: Record<string, unknown>
  timestamp: Date
  source?: string
}

class Logger {
  private isDevelopment = process.env.NODE_ENV === 'development'
  private isClient = typeof window !== 'undefined'

  /**
   * Log sécurisé - filtre automatiquement les données sensibles
   */
  private sanitizeData(data: Record<string, unknown> | undefined): Record<string, unknown> | undefined {
    if (!data) return data
    
    const sensitive = ['password', 'token', 'secret', 'key', 'email', 'id']
    const sanitized = { ...data }
    
    Object.keys(sanitized).forEach(key => {
      if (sensitive.some(s => key.toLowerCase().includes(s))) {
        sanitized[key] = '[REDACTED]'
      }
    })
    
    return sanitized
  }

  debug(message: string, data?: Record<string, unknown>, source?: string) {
    if (!this.isDevelopment) return
    this.log('debug', message, data, source)
  }

  info(message: string, data?: Record<string, unknown>, source?: string) {
    this.log('info', message, data, source)
  }

  warn(message: string, data?: Record<string, unknown>, source?: string) {
    this.log('warn', message, data, source)
  }

  error(message: string, data?: Record<string, unknown>, source?: string) {
    this.log('error', message, data, source)
  }

  private log(level: LogLevel, message: string, data?: Record<string, unknown>, source?: string) {
    const entry: LogEntry = {
      level,
      message,
      data: this.sanitizeData(data),
      timestamp: new Date(),
      source
    }

    // En développement : console classique
    if (this.isDevelopment) {
      const prefix = `[${level.toUpperCase()}]${source ? ` [${source}]` : ''}`
      console[level === 'debug' ? 'log' : level](prefix, message, data ? entry.data : '')
      return
    }

    // En production : monitoring uniquement pour erreurs/warnings critiques
    if (level === 'error' || level === 'warn') {
      // Ici on pourrait intégrer Sentry/DataDog
      if (this.isClient && (window as unknown as { gtag?: unknown }).gtag) {
        (window as unknown as { gtag: (a: string, b: string, c: Record<string, unknown>) => void }).gtag('event', 'exception', {
          description: message,
          fatal: level === 'error'
        })
      }
    }
  }

  /**
   * Performance timer
   */
  time(label: string) {
    if (this.isDevelopment) {
      console.time(label)
    }
  }

  timeEnd(label: string) {
    if (this.isDevelopment) {
      console.timeEnd(label)
    }
  }
}

// Instance singleton
export const logger = new Logger()

// Helpers spécialisés
export const logAdmin = (action: string, data?: Record<string, unknown>) => 
  logger.info(`ADMIN: ${action}`, data, 'ADMIN')

export const logSecurity = (event: string, data?: Record<string, unknown>) => 
  logger.warn(`SECURITY: ${event}`, data, 'SECURITY')

export const logPerformance = (metric: string, value: number, unit = 'ms') => 
  logger.debug(`PERF: ${metric} = ${value}${unit}`, undefined, 'PERFORMANCE')

export const logAPI = (endpoint: string, method: string, status: number) => 
  logger.info(`API: ${method} ${endpoint} → ${status}`, undefined, 'API')