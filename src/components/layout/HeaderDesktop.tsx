'use client'

import Link from 'next/link'
import { LogIn } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'

import type { HeaderNavItem } from './navigation-items'
import ClientOnlyNavigation from './ClientOnlyNavigation'
import HeaderNotifications from './HeaderNotifications'
import HeaderProfileMenu from './HeaderProfileMenu'

interface HeaderDesktopProps {
  isLoggedIn: boolean
  mainNav: HeaderNavItem[]
  secondaryNav: HeaderNavItem[]
  notificationCount: number
  notifications: Array<{ id: string; type: string; message: string; created_at: string; href?: string }>
  isNotificationOpen: boolean
  isProfileDropdownOpen: boolean
  userAvatar: string | null
  userEmail: string
  userInitials: string
  onLogout: () => void
  onNotificationOpenChange: (open: boolean) => void
  onProfileOpenChange: (open: boolean) => void
}

export default function HeaderDesktop({
  isLoggedIn,
  mainNav,
  secondaryNav,
  notificationCount,
  notifications,
  isNotificationOpen,
  isProfileDropdownOpen,
  userAvatar,
  userEmail,
  userInitials,
  onLogout,
  onNotificationOpenChange,
  onProfileOpenChange,
}: HeaderDesktopProps) {
  return (
    <header className="sticky top-0 z-50 hidden border-b border-border bg-card md:block">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          <Link
            href="/"
            className="rounded-xl transition-transform hover:scale-[1.02] focus:outline-none focus:ring-2 focus:ring-primary"
          >
            <Logo iconSize="md" />
          </Link>

          <ClientOnlyNavigation
            items={mainNav}
            className="flex space-x-6"
            itemClassName="flex items-center gap-1 text-sm font-medium transition-colors"
            activeClassName="text-primary"
            inactiveClassName="text-muted-foreground hover:text-foreground"
          />

          <div className="flex items-center gap-3">
            {isLoggedIn ? (
              <>
                <HeaderNotifications
                  notificationCount={notificationCount}
                  notifications={notifications}
                  isOpen={isNotificationOpen}
                  onOpenChange={onNotificationOpenChange}
                />
                <HeaderProfileMenu
                  userAvatar={userAvatar}
                  userEmail={userEmail}
                  userInitials={userInitials}
                  items={secondaryNav}
                  isOpen={isProfileDropdownOpen}
                  onOpenChange={onProfileOpenChange}
                  onLogout={onLogout}
                />
              </>
            ) : (
              <Button asChild variant="ghost" className="rounded-2xl">
                <Link href="/auth/login">
                  <LogIn className="h-4 w-4" aria-hidden="true" />
                  <span>Connexion</span>
                </Link>
              </Button>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
