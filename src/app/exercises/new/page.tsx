"use client"
import { useRouter } from 'next/navigation'
import { ExerciseWizard } from '@/components/exercises/ExerciseWizard'

export default function NewExercisePage() {
  const router = useRouter()
  
  const handleClose = () => {
    router.push('/exercises')
  }

  return <ExerciseWizard onClose={handleClose} />
} 