'use client'

import Link from 'next/link'
import { Bell } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Logo } from '@/components/shared/Logo'

import type { HeaderNavItem } from './navigation-items'
import HeaderProfileMenu from './HeaderProfileMenu'

interface HeaderMobileProps {
  isLoggedIn: boolean
  notificationCount: number
  secondaryNav: HeaderNavItem[]
  userAvatar: string | null
  userEmail: string
  userInitials: string
  isProfileDropdownOpen: boolean
  onLogout: () => void
  onProfileOpenChange: (open: boolean) => void
}

export default function HeaderMobile({
  isLoggedIn,
  notificationCount,
  secondaryNav,
  userAvatar,
  userEmail,
  userInitials,
  isProfileDropdownOpen,
  onLogout,
  onProfileOpenChange,
}: HeaderMobileProps) {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-card md:hidden">
      <div className="header-mobile-ios flex items-center justify-between px-4 py-2">
        <Link href="/" className="rounded-xl focus:outline-none focus:ring-2 focus:ring-primary">
          <Logo iconSize="sm" />
        </Link>

        <div className="flex items-center gap-2">
          {isLoggedIn ? (
            <>
              <Button
                asChild
                variant="ghost"
                size="icon"
                className="relative rounded-2xl text-safe-muted hover:bg-muted hover:text-foreground"
              >
                <Link
                  href="/notifications"
                  aria-label={`Notifications${notificationCount > 0 ? ` (${notificationCount} non lues)` : ''}`}
                >
                  <Bell className="h-5 w-5" aria-hidden="true" />
                  {notificationCount > 0 ? (
                    <span className="absolute -right-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
                      {notificationCount > 9 ? '9+' : notificationCount}
                    </span>
                  ) : null}
                </Link>
              </Button>

              <HeaderProfileMenu
                userAvatar={userAvatar}
                userEmail={userEmail}
                userInitials={userInitials}
                items={secondaryNav}
                isOpen={isProfileDropdownOpen}
                isMobile={true}
                onOpenChange={onProfileOpenChange}
                onLogout={onLogout}
              />
            </>
          ) : (
            <Button asChild variant="ghost" className="rounded-2xl text-sm font-medium text-primary">
              <Link href="/auth/login">Connexion</Link>
            </Button>
          )}
        </div>
      </div>
    </header>
  )
}
