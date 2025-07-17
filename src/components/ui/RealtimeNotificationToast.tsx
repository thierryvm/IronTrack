import { motion, AnimatePresence } from 'framer-motion'
import { X, Users, Check, UserX, Volume2, VolumeX } from 'lucide-react'
import { RealtimeNotification } from '@/hooks/useRealtimeNotifications'

interface NotificationToastProps {
  notifications: RealtimeNotification[]
  onRemove: (id: string) => void
  onMarkAsRead: (id: string) => void
  soundEnabled: boolean
  onToggleSound: () => void
}

export function RealtimeNotificationToast({
  notifications,
  onRemove,
  onMarkAsRead,
  soundEnabled,
  onToggleSound
}: NotificationToastProps) {
  const getIcon = (type: string) => {
    switch (type) {
      case 'partnership_request':
        return <Users className="h-5 w-5" />
      case 'partnership_accepted':
        return <Check className="h-5 w-5" />
      case 'partnership_declined':
        return <UserX className="h-5 w-5" />
      default:
        return <Users className="h-5 w-5" />
    }
  }

  const getColors = (type: string) => {
    switch (type) {
      case 'partnership_request':
        return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white border-l-blue-700 shadow-blue-100'
      case 'partnership_accepted':
        return 'bg-gradient-to-r from-green-500 to-green-600 text-white border-l-green-700 shadow-green-100'
      case 'partnership_declined':
        return 'bg-gradient-to-r from-red-500 to-red-600 text-white border-l-red-700 shadow-red-100'
      default:
        return 'bg-gradient-to-r from-gray-500 to-gray-600 text-white border-l-gray-700 shadow-gray-100'
    }
  }

  if (notifications.length === 0) return null

  return (
    <>
      {/* Contrôle du son */}
      <div className="fixed top-4 left-4 z-50">
        <motion.button
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onToggleSound}
          className="p-3 bg-white rounded-full shadow-lg hover:bg-gray-50 transition-colors border border-gray-200"
          title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-gray-600" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-600" />
          )}
        </motion.button>
      </div>

      {/* Notifications */}
      <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
        <AnimatePresence mode="popLayout">
          {notifications.map((notification) => (
            <motion.div
              key={notification.id}
              initial={{ opacity: 0, x: 400, scale: 0.8 }}
              animate={{ 
                opacity: 1, 
                x: 0, 
                scale: notification.animate ? [1, 1.02, 1] : 1
              }}
              exit={{ opacity: 0, x: 400, scale: 0.8 }}
              transition={{ 
                duration: 0.4,
                scale: { duration: 0.6, ease: "easeOut" },
                type: "spring",
                stiffness: 200,
                damping: 20
              }}
              className={`rounded-xl p-4 shadow-xl border-l-4 backdrop-blur-sm ${getColors(notification.type)} ${
                notification.read ? 'opacity-80' : ''
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <div className="flex-shrink-0 mt-0.5 bg-white/20 p-2 rounded-lg">
                    {getIcon(notification.type)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm leading-tight">{notification.title}</p>
                    <p className="text-sm opacity-95 mt-1 leading-relaxed">{notification.message}</p>
                    <p className="text-xs opacity-75 mt-2 font-medium">
                      {notification.timestamp.toLocaleTimeString('fr-FR', { 
                        hour: '2-digit', 
                        minute: '2-digit' 
                      })}
                    </p>
                  </div>
                </div>
                <div className="flex items-center space-x-1 ml-3">
                  {!notification.read && (
                    <motion.button
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                      title="Marquer comme lu"
                    >
                      <Check className="h-4 w-4" />
                    </motion.button>
                  )}
                  <motion.button
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(notification.id)}
                    className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white/10"
                    title="Fermer"
                  >
                    <X className="h-4 w-4" />
                  </motion.button>
                </div>
              </div>
              
              {/* Barre de progression pour l'auto-suppression */}
              <motion.div
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className="h-0.5 bg-white/30 rounded-full mt-3"
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </>
  )
}