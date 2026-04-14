'use client'

import React, { useEffect, useRef, useState } from 'react'
import { usePathname, useRouter } from 'next/navigation'

import { useAdminRole } from '@/hooks/useAdminRole'
import { createClient } from '@/utils/supabase/client'

import HeaderDesktop from './HeaderDesktop'
import HeaderMobile from './HeaderMobile'
import HeaderMobileBottomNav from './HeaderMobileBottomNav'
import { getMainNavigationItems, getSecondaryNavigationItems } from './navigation-items'

interface HeaderNotificationItem {
  id: string
  type: string
  message: string
  created_at: string
  href?: string
}

function buildUserInitials(email: string): string {
  return email
    .split('@')[0]
    .split('.')
    .map((part) => part.charAt(0).toUpperCase())
    .join('')
    .substring(0, 2)
}

export default function HeaderClient() {
  const pathname = usePathname()
  const router = useRouter()
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [userEmail, setUserEmail] = useState('')
  const [userInitials, setUserInitials] = useState('')
  const [userAvatar, setUserAvatar] = useState<string | null>(null)
  const { isAdmin, isModerator } = useAdminRole()
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false)
  const [notificationCount, setNotificationCount] = useState(0)
  const [notifications, setNotifications] = useState<HeaderNotificationItem[]>([])
  const [isNotificationOpen, setIsNotificationOpen] = useState(false)
  const lastAdminState = useRef<boolean | null>(null)

  const mainNav = getMainNavigationItems()
  const secondaryNav = getSecondaryNavigationItems({ isAdmin, isModerator })

  useEffect(() => {
    const supabase = createClient()

    const syncUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        setIsLoggedIn(false)
        setUserEmail('')
        setUserInitials('')
        setUserAvatar(null)
        return
      }

      setIsLoggedIn(true)
      setUserEmail(user.email || '')
      setUserInitials(buildUserInitials(user.email || ''))

      const { data: profile } = await supabase
        .from('profiles')
        .select('avatar_url')
        .eq('id', user.id)
        .single()

      setUserAvatar(profile?.avatar_url || null)
    }

    syncUser()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        const email = session.user.email || ''
        setIsLoggedIn(true)
        setUserEmail(email)
        setUserInitials(buildUserInitials(email))

        supabase
          .from('profiles')
          .select('avatar_url')
          .eq('id', session.user.id)
          .single()
          .then(({ data: profile }) => {
            setUserAvatar(profile?.avatar_url || null)
          })
      }

      if (event === 'SIGNED_OUT') {
        setIsLoggedIn(false)
        setUserEmail('')
        setUserInitials('')
        setUserAvatar(null)
      }
    })

    return () => subscription.unsubscribe()
  }, [])

  useEffect(() => {
    if (!isLoggedIn) return

    const currentAdminState = isAdmin || isModerator
    if (lastAdminState.current === true && currentAdminState === false) {
      return
    }
    lastAdminState.current = currentAdminState

    const loadNotifications = async () => {
      try {
        const supabase = createClient()
        const {
          data: { user },
          error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
          return
        }

        let tickets = null
        let error = null

        if (isAdmin || isModerator) {
          const result = await supabase
            .from('support_tickets')
            .select('*')
            .in('status', ['open', 'in_progress', 'waiting_user'])
            .limit(3)
            .order('created_at', { ascending: false })

          tickets = result.data
          error = result.error

        } else {
          const result = await supabase
            .from('support_tickets')
            .select('*')
            .eq('user_id', user.id)
            .in('status', ['open', 'in_progress', 'waiting_user'])
            .limit(3)
            .order('created_at', { ascending: false })

          tickets = result.data
          error = result.error
        }

        const { data: partnerRequests, error: partnerError } = await supabase
          .from('training_partners')
          .select('*')
          .eq('status', 'pending')
          .limit(3)

        if (error && error.code !== 'PGRST116') return
        if (partnerError && partnerError.code !== 'PGRST116') return

        const nextNotifications: HeaderNotificationItem[] = []

        if (tickets) {
          tickets.forEach((ticket) => {
            const seenAt = localStorage.getItem(`ticket_seen_${ticket.id}`)
            const updatedAt = ticket.updated_at || ticket.created_at || ''

            if (!seenAt || new Date(updatedAt) > new Date(seenAt)) {
              nextNotifications.push({
                id: `ticket-${ticket.id}`,
                type: 'support',
                message: `Ticket: ${ticket.title || ticket.description || 'Support ticket'}`,
                created_at: ticket.created_at || new Date().toISOString(),
                href: isAdmin || isModerator
                  ? `/admin/tickets/${ticket.id}`
                  : `/support/tickets/${ticket.id}`,
              })
            }
          })
        }

        if (partnerRequests) {
          partnerRequests.forEach((request) => {
            nextNotifications.push({
              id: `partner-${request.id}`,
              type: 'partner',
              message: `Invitation partenaire: ${request.partner_name || request.partner_email || 'Nouveau partenaire'}`,
              created_at: request.created_at || new Date().toISOString(),
              href: '/training-partners',
            })
          })
        }

        nextNotifications.sort(
          (first, second) =>
            new Date(second.created_at).getTime() - new Date(first.created_at).getTime()
        )

        setNotifications(nextNotifications)
        setNotificationCount(nextNotifications.length)
      } catch {
        return
      }
    }

    loadNotifications()
    window.addEventListener('ticket-seen', loadNotifications)

    return () => window.removeEventListener('ticket-seen', loadNotifications)
  }, [isLoggedIn, isAdmin, isModerator])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element

      if (isProfileDropdownOpen && !target.closest('[data-profile-dropdown]')) {
        setIsProfileDropdownOpen(false)
      }

      if (isNotificationOpen && !target.closest('[data-notification-dropdown]')) {
        setIsNotificationOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isNotificationOpen, isProfileDropdownOpen])

  const handleLogout = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    setIsLoggedIn(false)
    setIsNotificationOpen(false)
    setIsProfileDropdownOpen(false)
    router.push('/auth')
  }

  if (pathname?.startsWith('/auth')) {
    return null
  }

  return (
    <>
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:left-2 focus:top-2 focus:z-50 focus:rounded focus:bg-primary focus:px-4 focus:py-2 focus:text-white focus:shadow-lg focus:outline-none focus:ring-2 focus:ring-white"
      >
        Aller au contenu principal
      </a>

      <HeaderDesktop
        isLoggedIn={isLoggedIn}
        mainNav={mainNav}
        secondaryNav={secondaryNav}
        notificationCount={notificationCount}
        notifications={notifications}
        isNotificationOpen={isNotificationOpen}
        isProfileDropdownOpen={isProfileDropdownOpen}
        userAvatar={userAvatar}
        userEmail={userEmail}
        userInitials={userInitials}
        onLogout={handleLogout}
        onNotificationOpenChange={setIsNotificationOpen}
        onProfileOpenChange={setIsProfileDropdownOpen}
      />

      <HeaderMobile
        isLoggedIn={isLoggedIn}
        notificationCount={notificationCount}
        secondaryNav={secondaryNav}
        userAvatar={userAvatar}
        userEmail={userEmail}
        userInitials={userInitials}
        isProfileDropdownOpen={isProfileDropdownOpen}
        onLogout={handleLogout}
        onProfileOpenChange={setIsProfileDropdownOpen}
      />

      <HeaderMobileBottomNav isLoggedIn={isLoggedIn} mainNav={mainNav} />
    </>
  )
}
