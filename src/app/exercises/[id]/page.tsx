'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'

export default function ExerciseLegacyDetailPage() {
  const router = useRouter()

  useEffect(() => {
    router.replace('/exercises')
  }, [router])

  return null
}
