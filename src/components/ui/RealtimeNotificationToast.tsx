import { X, Users, Check, UserX, Volume2, VolumeX, Wifi, WifiOff } from 'lucide-react'
import { RealtimeNotification } from '@/hooks/useRealtimeNotifications'
import { MotionWrapper, MotionPresence } from '@/components/ui/MotionWrapper'

interface NotificationToastProps {
  notifications: RealtimeNotification[]
  onRemove: (id: string) => void
  onMarkAsRead: (id: string) => void
  soundEnabled: boolean
  onToggleSound: () => void
  realtimeConnected?: boolean
  fallbackEnabled?: boolean
}

export function RealtimeNotificationToast({
  notifications,
  onRemove,
  onMarkAsRead,
  soundEnabled,
  onToggleSound,
  realtimeConnected = false,
  fallbackEnabled = false
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

  return (
    <>
      {/* Contrôles - Toujours visibles */}
      <div className="fixed top-4 left-4 z-50 flex flex-col space-y-2">
        {/* Contrôle du son */}
        <MotionWrapper
          type="button"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          onClick={onToggleSound}
          className="p-3 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700  rounded-full shadow-lg hover:bg-gray-50 dark:bg-gray-800 transition-colors border border-gray-200 dark:border-gray-700"
          title={soundEnabled ? 'Désactiver les sons' : 'Activer les sons'}
        >
          {soundEnabled ? (
            <Volume2 className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          ) : (
            <VolumeX className="h-5 w-5 text-gray-600 dark:text-gray-300" />
          )}
        </MotionWrapper>

        {/* Indicateur de statut realtime */}
        <MotionWrapper
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className={`p-3 rounded-full shadow-lg border border-gray-200 dark:border-gray-600 ${
            realtimeConnected 
              ? 'bg-green-50 text-green-600' 
              : fallbackEnabled 
                ? 'bg-yellow-50 text-yellow-600' 
                : 'bg-red-50 text-red-600'
          }`}
          title={
            realtimeConnected 
              ? 'Notifications temps réel actives' 
              : fallbackEnabled 
                ? 'Mode polling actif (fallback)' 
                : 'Notifications temps réel déconnectées'
          }
        >
          {realtimeConnected ? (
            <Wifi className="h-5 w-5" />
          ) : (
            <WifiOff className="h-5 w-5" />
          )}
        </MotionWrapper>
      </div>

      {/* Notifications */}
      {notifications.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-3 max-w-md w-full">
          <MotionPresence mode="popLayout">
            {notifications.map((notification) => (
            <MotionWrapper
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
                  <div className="flex-shrink-0 mt-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 /20 p-2 rounded-lg">
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
                    <MotionWrapper
                      type="button"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                      onClick={() => onMarkAsRead(notification.id)}
                      className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white dark:bg-gray-900/10"
                      title="Marquer comme lu"
                    >
                      <Check className="h-6 w-6" />
                    </MotionWrapper>
                  )}
                  <MotionWrapper
                    type="button"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                    onClick={() => onRemove(notification.id)}
                    className="text-white/80 hover:text-white transition-colors p-1.5 rounded-lg hover:bg-white dark:bg-gray-900/10"
                    title="Fermer"
                  >
                    <X className="h-6 w-6" />
                  </MotionWrapper>
                </div>
              </div>
              
              {/* Barre de progression pour l'auto-suppression */}
              <MotionWrapper
                initial={{ width: "100%" }}
                animate={{ width: "0%" }}
                transition={{ duration: 8, ease: "linear" }}
                className="h-0.5 bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-700 /30 rounded-full mt-3"
              />
            </MotionWrapper>
          ))}
        </MotionPresence>
      </div>
      )}
    </>
  )
}