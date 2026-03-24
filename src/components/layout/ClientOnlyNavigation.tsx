'use client'

import React from'react'
import Link from'next/link'
import { usePathname} from'next/navigation'

interface NavItem {
 name: string
 href: string
 icon: React.ComponentType<{ className?: string}>
}

interface ClientOnlyNavigationProps {
 items: NavItem[]
 className?: string
 itemClassName?: string
 activeClassName?: string
 inactiveClassName?: string
 isMobile?: boolean
 ariaLabel?: string
}

export default function ClientOnlyNavigation({
 items,
 className ='',
 itemClassName ='',
 activeClassName ='text-primary',
 inactiveClassName ='text-gray-700 hover:text-foreground dark:text-orange-400',
 isMobile = false,
 ariaLabel ='Navigation principale',
}: ClientOnlyNavigationProps) {
 const pathname = usePathname()

 return (
 <nav aria-label={ariaLabel} className={className}>
 {items.map((item) => {
 const isActive = pathname === item.href
 return (
 <Link
 key={item.name}
 href={item.href}
 aria-current={isActive ?'page' : undefined}
 aria-label={item.name}
 className={`${itemClassName} ${isActive ? activeClassName : inactiveClassName}`}
 >
 <item.icon
 className={isMobile ?"w-6 h-6 mb-1 flex-shrink-0" :"w-4 h-4"}
 aria-hidden="true"
 />
 <span className={isMobile ?"text-xs font-medium truncate" :""}>{item.name}</span>
 </Link>
 )
})}
 </nav>
 )
}
