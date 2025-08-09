"use client"
import { useParams } from 'next/navigation'
import { PerformanceEditForm2025 } from '@/components/exercises/PerformanceEditForm2025'

export default function EditPerformancePage() {
  const params = useParams()
  const id = params.id as string
  const perfId = params.perfId as string

  return <PerformanceEditForm2025 exerciseId={id} performanceId={perfId} />
}