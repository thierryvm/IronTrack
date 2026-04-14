'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'

interface HeaderNotificationItem {
  id: string
  type: string
  message: string
  created_at: string
  href?: string
}

interface HeaderNotificationsProps {
  notificationCount: number
  notifications: HeaderNotificationItem[]
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function formatNotificationDate(date: string): string {
  return new Date(date).toLocaleDateString('fr-FR')
}

export default function HeaderNotifications({
  notificationCount,
  notifications,
  isOpen,
  onOpenChange,
}: HeaderNotificationsProps) {
  return (
    <div className="relative" data-notification-dropdown>
      <Button
        type="button"
        variant="ghost"
        size="icon"
        className="relative rounded-2xl text-muted-foreground hover:bg-muted hover:text-foreground"
        aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} nouvelles)` : ''}`}
        aria-expanded={isOpen}
        data-testid="header-notifications-button"
        onClick={() => onOpenChange(!isOpen)}
      >
        <Bell className="h-5 w-5" aria-hidden="true" />
        {notificationCount > 0 ? (
          <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {notificationCount > 9 ? '9+' : notificationCount}
          </span>
        ) : null}
      </Button>

      {isOpen ? (
        <div
          className="absolute right-0 top-14 z-50 w-80 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          data-testid="header-notifications-panel"
        >
          <div className="border-b border-border px-4 py-3">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <Bell className="h-4 w-4" aria-hidden="true" />
              Notifications
            </h3>
          </div>

          <div className="max-h-64 overflow-y-auto">
            {notifications.length > 0 ? (
              notifications.map((notification) => (
                <div key={notification.id} className="border-b border-border last:border-b-0">
                  {notification.href ? (
                    <Link
                      href={notification.href}
                      className="block px-4 py-3 transition-colors hover:bg-muted"
                      onClick={() => onOpenChange(false)}
                    >
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </Link>
                  ) : (
                    <div className="px-4 py-3">
                      <p className="text-sm text-foreground">{notification.message}</p>
                      <p className="mt-1 text-xs text-muted-foreground">
                        {formatNotificationDate(notification.created_at)}
                      </p>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <div className="px-4 py-6 text-center text-sm text-muted-foreground">
                Aucune notification
              </div>
            )}
          </div>

          <div className="border-t border-border p-2">
            <Button asChild variant="ghost" className="w-full justify-center rounded-xl">
              <Link href="/notifications" onClick={() => onOpenChange(false)}>
                Voir mes notifications
              </Link>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
