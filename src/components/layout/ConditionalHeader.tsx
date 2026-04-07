'use client'

import dynamic from 'next/dynamic'
import { usePathname } from 'next/navigation'

const Header = dynamic(() => import('./Header'), {
  ssr: false,
  loading: () => null,
})

const HEADERLESS_EXACT_PATHS = new Set(['/faq', '/pwa-guide', '/support'])

export function shouldHideAppHeader(pathname: string | null | undefined): boolean {
  if (!pathname) {
    return false
  }

  return (
    pathname.startsWith('/auth') ||
    pathname.startsWith('/admin') ||
    pathname.startsWith('/legal/') ||
    HEADERLESS_EXACT_PATHS.has(pathname)
  )
}

export default function ConditionalHeader() {
  const pathname = usePathname()

  if (shouldHideAppHeader(pathname)) {
    return null
  }

  return <Header />
}
