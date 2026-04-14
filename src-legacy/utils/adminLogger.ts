// Utilitaire de logging admin avec throttling pour éviter le spam
import { createClient} from'@/utils/supabase/client'

interface LogEntry {
 action: string
 targetType?: string
 targetId?: string
 details?: Record<string, unknown>
}

class AdminLogger {
 private supabase = createClient()
 private logCache = new Map<string, number>()
 private readonly THROTTLE_TIME = 5 * 60 * 1000 // 5 minutes en millisecondes

 /**
 * Génère une clé unique pour le throttling
 */
 private generateCacheKey(adminId: string, entry: LogEntry): string {
 const { action, targetType, targetId} = entry
 return `${adminId}:${action}:${targetType ||''}:${targetId ||''}`
}

 /**
 * Vérifie si une action peut être loggée (throttling)
 */
 private canLog(adminId: string, entry: LogEntry): boolean {
 const key = this.generateCacheKey(adminId, entry)
 const now = Date.now()
 const lastLog = this.logCache.get(key)

 if (!lastLog || (now - lastLog) >= this.THROTTLE_TIME) {
 this.logCache.set(key, now)
 return true
}

 return false
}

 /**
 * Log une action admin avec throttling automatique
 */
 async logAction(
 adminId: string, 
 action: string, 
 targetType?: string, 
 targetId?: string, 
 details?: Record<string, unknown>
 ): Promise<boolean> {
 try {
 // En mode développement, juste logger en console
 if (process.env.NODE_ENV ==='development') {
 console.log('[ADMIN_LOG_DEV]', { adminId, action, targetType, targetId, details})
 return true
}

 const entry: LogEntry = { action, targetType, targetId, details}

 // Vérifier le throttling
 if (!this.canLog(adminId, entry)) {
 console.log('[ADMIN_LOG] Action throttled:', action)
 return false
}

 // Sauvegarder en base de données
 const { error} = await this.supabase
 .from('admin_logs')
 .insert({
 admin_id: adminId,
 action,
 target_type: targetType,
 target_id: targetId,
 details: details || {},
 created_at: new Date().toISOString()
})

 if (error) {
 console.error('[ADMIN_LOG] Save error:', error)
 return false
}

 console.log('[ADMIN_LOG] Action logged:', action)
 return true

} catch (error) {
 console.error('[ADMIN_LOG] Unexpected error:', error)
 return false
}
}

 /**
 * Nettoie le cache (utile pour les tests)
 */
 clearCache(): void {
 this.logCache.clear()
}
}

// Instance singleton
export const adminLogger = new AdminLogger()

// Helper function pour les hooks
export const useAdminLogger = () => {
 const logAction = async (
 adminId: string,
 action: string,
 targetType?: string,
 targetId?: string,
 details?: Record<string, unknown>
 ) => {
 return await adminLogger.logAction(adminId, action, targetType, targetId, details)
}

 return { logAction}
}