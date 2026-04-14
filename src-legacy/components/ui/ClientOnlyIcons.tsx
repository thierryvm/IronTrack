'use client'

import { useEffect, useState} from'react'
import { 
 ChevronLeft, 
 ChevronRight, 
 Calendar as CalendarIcon,
 CheckCircle,
 Plus,
 Clock,
 Dumbbell,
 Target,
 Info,
 Activity,
 Waves,
 Zap,
 Flower,
 Smile,
 Menu,
 List,
 X
} from'lucide-react'

interface ClientOnlyIconProps {
 name: string
 className?: string
 size?: number
}

const iconMap = {
 ChevronLeft,
 ChevronRight,
 CalendarIcon,
 CheckCircle,
 Plus,
 Clock,
 Dumbbell,
 Target,
 Info,
 Activity,
 Waves,
 Zap,
 Flower,
 Smile,
 Menu,
 List,
 X,
 Users: () => (
 <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
 <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
 <circle cx="9" cy="7" r="4"/>
 <path d="m22 21-2-2"/>
 <path d="m16 8 2-2"/>
 <circle cx="18" cy="6" r="3"/>
 </svg>
 )
}

export function ClientOnlyIcon({ name, className ="", size = 24}: ClientOnlyIconProps) {
 const [mounted, setMounted] = useState(false)
 
 useEffect(() => {
 setMounted(true)
}, [])
 
 if (!mounted) {
 // Retourner un placeholder pendant SSR
 return (
 <div 
 className={className} 
 style={{ width: size, height: size}} 
 />
 )
}
 
 const IconComponent = iconMap[name as keyof typeof iconMap]
 
 if (!IconComponent) {
 return <div className={className} style={{ width: size, height: size}} />
}
 
 if (typeof IconComponent ==='function' && name ==='Users') {
 return <IconComponent />
}
 
 const LucideIcon = IconComponent as React.ComponentType<{ className?: string; size?: number}>
 return <LucideIcon className={className} size={size} />
}