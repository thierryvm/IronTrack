"use client"
import { useParams } from 'next/navigation'
import { PerformanceEditForm } from '@/components/exercises/PerformanceEditForm'

export default function EditPerformancePage() {
  const params = useParams()
  const id = params.id as string
  const perfId = params.perfId as string

  return <PerformanceEditForm exerciseId={id} performanceId={perfId} />
}