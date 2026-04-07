'use client'

import Link from 'next/link'
import { ChevronDown, LogOut } from 'lucide-react'

import { Button } from '@/components/ui/button'

import type { HeaderNavItem } from './navigation-items'
import HeaderUserAvatar from './HeaderUserAvatar'

interface HeaderProfileMenuProps {
  userAvatar: string | null
  userEmail: string
  userInitials: string
  items: HeaderNavItem[]
  isOpen: boolean
  isMobile?: boolean
  onOpenChange: (open: boolean) => void
  onLogout: () => void
}

export default function HeaderProfileMenu({
  userAvatar,
  userEmail,
  userInitials,
  items,
  isOpen,
  isMobile = false,
  onOpenChange,
  onLogout,
}: HeaderProfileMenuProps) {
  if (isMobile) {
    return (
      <div className="relative" data-profile-dropdown>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          className="rounded-2xl"
          aria-label="Ouvrir menu profil"
          aria-expanded={isOpen}
          data-testid="header-profile-button"
          onClick={() => onOpenChange(!isOpen)}
        >
          <HeaderUserAvatar userAvatar={userAvatar} userInitials={userInitials} />
        </Button>

        {isOpen ? (
          <div
            className="fixed inset-0 z-[60] bg-black/50"
            data-testid="header-profile-mobile-modal"
            onClick={() => onOpenChange(false)}
          >
            <div
              className="absolute left-4 right-4 top-20 overflow-hidden rounded-3xl border border-border bg-card shadow-2xl"
              onClick={(event) => event.stopPropagation()}
            >
              <div className="border-b border-border bg-muted px-4 py-4">
                <div className="flex items-center gap-3">
                  <HeaderUserAvatar
                    userAvatar={userAvatar}
                    userInitials={userInitials}
                    size="lg"
                  />
                  <div className="min-w-0">
                    <h3 className="truncate text-base font-semibold text-foreground">
                      {userEmail}
                    </h3>
                    <p className="text-sm text-muted-foreground">Votre espace personnel</p>
                  </div>
                </div>
              </div>

              <div className="p-2">
                {items.map((item) => (
                  <Button
                    key={item.name}
                    asChild
                    variant="ghost"
                    className="h-12 w-full justify-start rounded-2xl px-4"
                  >
                    <Link href={item.href} onClick={() => onOpenChange(false)}>
                      <item.icon className="h-5 w-5" aria-hidden="true" />
                      <span>{item.name}</span>
                    </Link>
                  </Button>
                ))}

                <div className="my-2 border-t border-border" />

                <Button
                  type="button"
                  variant="ghost"
                  className="h-12 w-full justify-start rounded-2xl px-4 text-destructive hover:bg-destructive/10 hover:text-destructive"
                  onClick={() => {
                    onLogout()
                    onOpenChange(false)
                  }}
                >
                  <LogOut className="h-5 w-5" aria-hidden="true" />
                  <span>Se déconnecter</span>
                </Button>
              </div>
            </div>
          </div>
        ) : null}
      </div>
    )
  }

  return (
    <div className="relative" data-profile-dropdown>
      <Button
        type="button"
        variant="ghost"
        className="h-11 rounded-2xl px-2"
        aria-expanded={isOpen}
        data-testid="header-profile-button"
        onClick={() => onOpenChange(!isOpen)}
      >
        <HeaderUserAvatar userAvatar={userAvatar} userInitials={userInitials} />
        <ChevronDown className="h-4 w-4 text-muted-foreground" aria-hidden="true" />
      </Button>

      {isOpen ? (
        <div
          className="absolute right-0 top-14 z-50 w-72 overflow-hidden rounded-2xl border border-border bg-card shadow-xl"
          data-testid="header-profile-panel"
        >
          <div className="border-b border-border bg-muted px-4 py-3">
            <div className="flex items-center gap-3">
              <HeaderUserAvatar userAvatar={userAvatar} userInitials={userInitials} size="md" />
              <p className="min-w-0 truncate text-sm font-semibold text-foreground">{userEmail}</p>
            </div>
          </div>

          <div className="p-2">
            {items.map((item) => (
              <Button
                key={item.name}
                asChild
                variant="ghost"
                className="h-11 w-full justify-start rounded-xl px-3"
              >
                <Link href={item.href} onClick={() => onOpenChange(false)}>
                  <item.icon className="h-4 w-4" aria-hidden="true" />
                  <span>{item.name}</span>
                </Link>
              </Button>
            ))}

            <div className="my-2 border-t border-border" />

            <Button
              type="button"
              variant="ghost"
              className="h-11 w-full justify-start rounded-xl px-3 text-destructive hover:bg-destructive/10 hover:text-destructive"
              onClick={onLogout}
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              <span>Se déconnecter</span>
            </Button>
          </div>
        </div>
      ) : null}
    </div>
  )
}
