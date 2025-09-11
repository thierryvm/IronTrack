'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavItem {
  name: string
  href: string
  icon: React.ComponentType<{ className?: string }>
}

interface ClientOnlyNavigationProps {
  items: NavItem[]
  className?: string
  itemClassName?: string
  activeClassName?: string
  inactiveClassName?: string
  isMobile?: boolean
}

export default function ClientOnlyNavigation({
  items,
  className = '',
  itemClassName = '',
  activeClassName = 'text-orange-600 dark:text-orange-400',
  inactiveClassName = 'text-gray-700 dark:text-gray-300 hover:text-gray-900 dark:hover:text-orange-400',
  isMobile = false
}: ClientOnlyNavigationProps) {
  const pathname = usePathname()

  return (
    <nav className={className}>
      {items.map((item) => (
        <Link
          key={item.name}
          href={item.href}
          className={`${itemClassName} ${
            pathname === item.href ? activeClassName : inactiveClassName
          }`}
        >
          <item.icon className={isMobile ? "w-6 h-6 mb-1 flex-shrink-0" : "w-4 h-4"} />
          <span className={isMobile ? "text-xs font-medium truncate" : ""}>{item.name}</span>
        </Link>
      ))}
    </nav>
  )
}