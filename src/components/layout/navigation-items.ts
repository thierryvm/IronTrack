import type { ComponentType } from 'react'
import {
  Activity,
  Apple,
  BarChart3,
  Calendar,
  Dumbbell,
  FileText,
  HelpCircle,
  Shield,
  User,
  Users,
} from 'lucide-react'

export interface HeaderNavItem {
  name: string
  href: string
  icon: ComponentType<{ className?: string }>
  mobileLabel?: string
}

export function getMainNavigationItems(): HeaderNavItem[] {
  return [
    { name: 'Calendrier', href: '/calendar', icon: Calendar, mobileLabel: 'Agenda' },
    { name: 'Exercices', href: '/exercises', icon: Dumbbell, mobileLabel: 'Exos' },
    { name: 'Séances', href: '/workouts', icon: Activity, mobileLabel: 'Séances' },
    { name: 'Partenaires', href: '/training-partners', icon: Users, mobileLabel: 'Team' },
    { name: 'Nutrition', href: '/nutrition', icon: Apple, mobileLabel: 'Nutrition' },
    { name: 'Progression', href: '/progress', icon: BarChart3, mobileLabel: 'Stats' },
  ]
}

export function getSecondaryNavigationItems({
  isAdmin,
  isModerator,
}: {
  isAdmin: boolean
  isModerator: boolean
}): HeaderNavItem[] {
  return [
    { name: 'Profil', href: '/profile', icon: User },
    { name: 'Support', href: '/support', icon: HelpCircle },
    { name: 'FAQ', href: '/faq', icon: FileText },
    ...(isAdmin || isModerator ? [{ name: 'Admin', href: '/admin', icon: Shield }] : []),
  ]
}
