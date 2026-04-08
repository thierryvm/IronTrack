'use client'

import React from'react'
import Link from'next/link'
import { usePathname} from'next/navigation'
import type { HeaderNavItem } from './navigation-items'

interface ClientOnlyNavigationProps {
 items: HeaderNavItem[]
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
 inactiveClassName ='text-muted-foreground hover:text-foreground',
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
 className={`${itemClassName} ${isActive ? activeClassName : inactiveClassName}`}
 >
 <item.icon
 className={isMobile ?"w-5 h-5 flex-shrink-0" :"w-4 h-4"}
 aria-hidden="true"
 />
 {isMobile ? (
 <span className="max-w-full truncate text-[11px] font-medium leading-none">
 {item.mobileLabel ?? item.name}
 </span>
 ) : (
 <span>{item.name}</span>
 )}
 </Link>
 )
})}
 </nav>
 )
}
