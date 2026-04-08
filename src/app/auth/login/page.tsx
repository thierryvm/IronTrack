'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/auth')
  }, [router])

  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-6">
      <div className="rounded-3xl border border-border bg-card px-6 py-6 text-center shadow-lg">
        <div
          aria-hidden="true"
          className="mx-auto mb-4 h-8 w-8 animate-spin rounded-full border-2 border-border border-t-foreground"
        />
        <p className="text-sm font-medium text-foreground">Redirection vers la connexion…</p>
      </div>
    </div>
  )
}
