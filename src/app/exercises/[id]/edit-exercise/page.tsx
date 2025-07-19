"use client"
import { useParams } from 'next/navigation'
import { ExerciseEditForm } from '@/components/exercises/ExerciseEditForm'

export default function EditExercisePage() {
  const params = useParams()
  const id = params.id as string

  return <ExerciseEditForm exerciseId={id} />
}