"use client"
import { useParams } from 'next/navigation'

export default function EditExercisePageDebug() {
  const params = useParams()
  const id = params.id as string

  console.log('EditExercisePage - ID:', id)

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">🔧 Debug - Edit Exercise</h1>
      <p><strong>Exercise ID:</strong> {id}</p>
      <p><strong>Status:</strong> Page loaded successfully</p>
      <p><strong>Timestamp:</strong> {new Date().toLocaleString()}</p>
      
      <div className="mt-4 p-4 bg-green-100 rounded">
        <p>✅ La route fonctionne - le problème vient du composant ExerciseEditForm2025</p>
      </div>
    </div>
  )
}