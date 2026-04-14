"use client"
import { useParams} from'next/navigation'
import { ExerciseEditForm2025} from'@/components/exercises/ExerciseEditForm2025'

export default function EditExercisePage() {
 const params = useParams()
 const id = params.id as string

 return <ExerciseEditForm2025 exerciseId={id} />
}