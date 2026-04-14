'use client'

import type { HeaderNavItem } from './navigation-items'
import ClientOnlyNavigation from './ClientOnlyNavigation'

interface HeaderMobileBottomNavProps {
  isLoggedIn: boolean
  mainNav: HeaderNavItem[]
}

export default function HeaderMobileBottomNav({
  isLoggedIn,
  mainNav,
}: HeaderMobileBottomNavProps) {
  if (!isLoggedIn) {
    return null
  }

  return (
    <nav
      aria-label="Navigation mobile"
      className="safe-area-bottom fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/85 md:hidden"
    >
      <div className="mx-auto flex max-w-screen-sm items-center gap-1 overflow-x-auto px-2 pb-2 pt-2 [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden">
        <ClientOnlyNavigation
          items={mainNav}
          className="contents"
          itemClassName="group flex min-w-[68px] flex-1 snap-center flex-col items-center justify-center gap-1 rounded-2xl px-2 py-2.5 text-center transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/60"
          activeClassName="bg-muted text-foreground shadow-sm"
          inactiveClassName="text-safe-muted hover:bg-muted/60 hover:text-foreground"
          isMobile={true}
          ariaLabel="Navigation mobile bas de page"
        />
      </div>
    </nav>
  )
}
