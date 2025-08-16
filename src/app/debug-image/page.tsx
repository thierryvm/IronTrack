'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { ExercisePhotoUpload } from '@/components/exercises/ExercisePhotoUpload'

// 🔍 TEST COMPONENT ISOLÉ
function TestExercisePhotoUpload({ currentPhoto }: { currentPhoto?: string }) {
  console.log('🔍 TEST ISOLATED - currentPhoto:', {
    currentPhoto,
    hasCurrentPhoto: !!currentPhoto,
    conditionResult: currentPhoto ? 'SHOULD SHOW IMAGE' : 'SHOULD SHOW UPLOAD ZONE'
  })

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-2">
        <h4 className="text-sm font-medium text-gray-900">
          🔍 TEST - Photo de l'exercice
        </h4>
      </div>

      {/* EXACTEMENT LA MÊME CONDITION QUE ExercisePhotoUpload */}
      {currentPhoto ? (
        <div className="relative group">
          <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg overflow-hidden bg-gray-100">
            <Image
              src={currentPhoto}
              alt="Photo de l'exercice TEST"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover"
              onLoad={() => console.log('✅ TEST IMAGE LOADED successfully')}
              onError={(e) => console.error('❌ TEST IMAGE ERROR:', e)}
            />
            
            <div className="absolute top-2 left-2 bg-green-500 text-white px-2 py-1 rounded text-xs">
              ✅ CONDITION TRUE
            </div>
          </div>
        </div>
      ) : (
        <div className="relative w-full h-48 sm:h-56 md:h-64 rounded-lg border-2 border-dashed border-gray-300 bg-red-50">
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className="bg-red-500 text-white px-3 py-1 rounded text-sm mb-2">
                ❌ CONDITION FALSE
              </div>
              <p className="text-gray-500">currentPhoto is: {String(currentPhoto)}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Debug Info */}
      <div className="bg-blue-50 p-3 rounded text-xs">
        <strong>Debug:</strong><br/>
        currentPhoto = {JSON.stringify(currentPhoto)}<br/>
        !!currentPhoto = {String(!!currentPhoto)}<br/>
        typeof currentPhoto = {typeof currentPhoto}<br/>
        length = {currentPhoto?.length || 'N/A'}
      </div>
    </div>
  )
}

// 🔍 PAGE DEBUG ISOLÉE - Reproduire bug image
export default function DebugImagePage() {
  const [currentPhotoUrl, setCurrentPhotoUrl] = useState<string | undefined>(undefined)
  const [debugInfo, setDebugInfo] = useState<any>({})

  // Simuler exactement ce que fait ExerciseEditForm2025
  useEffect(() => {
    const simulateExerciseLoad = () => {
      // Données EXACTES de l'exercice 266
      const exerciseData = {
        id: 266,
        name: "Rameur endurance",
        image_url: "https://taspdceblvmpvdjixyit.supabase.co/storage/v1/object/public/exercise-images/069d73e4-8384-4141-91ea-32bfecafb496/11a386d9-7dbf-4432-bc10-cd75267da8ab.jpg"
      }

      // EXACTEMENT le même flow que ExerciseEditForm2025
      setCurrentPhotoUrl(exerciseData.image_url)
      
      // Debug info complet
      setDebugInfo({
        rawImageUrl: exerciseData.image_url,
        currentPhotoUrlState: exerciseData.image_url,
        hasImage: !!exerciseData.image_url,
        imageLength: exerciseData.image_url?.length,
        timestamp: new Date().toISOString()
      })

      console.log('🔍 DEBUG ISOLATED TEST - Image URL:', {
        exerciseId: 266,
        rawImageUrl: exerciseData.image_url,
        currentPhotoUrlState: exerciseData.image_url,
        willShowImage: !!exerciseData.image_url
      })
    }

    // Simuler le délai de chargement
    setTimeout(simulateExerciseLoad, 100)
  }, [])

  const handlePhotoUploaded = (attachment: any) => {
    console.log('🔍 Photo uploaded:', attachment)
  }

  const handlePhotoRemoved = () => {
    console.log('🔍 Photo removed')
    setCurrentPhotoUrl(undefined)
  }

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">🔍 DEBUG IMAGE BUG</h1>
        
        {/* Debug Info */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-8">
          <h2 className="text-lg font-semibold text-blue-900 mb-3">Debug Information</h2>
          <pre className="text-sm text-blue-800 whitespace-pre-wrap">
            {JSON.stringify(debugInfo, null, 2)}
          </pre>
        </div>

        {/* Test 1: Next.js Image Direct */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 1: Next.js Image Direct</h2>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                URL: {currentPhotoUrl || 'Non définie'}
              </label>
              {currentPhotoUrl && (
                <div className="relative w-full h-48 rounded-lg overflow-hidden bg-gray-100">
                  <Image
                    src={currentPhotoUrl}
                    alt="Test Next.js Image"
                    fill
                    sizes="(max-width: 768px) 100vw, 50vw"
                    className="object-cover"
                    onLoad={() => console.log('✅ Next.js Image loaded successfully')}
                    onError={(e) => console.error('❌ Next.js Image error:', e)}
                  />
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Test 2: Test Component Isolé */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 2: Test Component Isolé (même logique)</h2>
          <TestExercisePhotoUpload currentPhoto={currentPhotoUrl} />
        </div>

        {/* Test 3: ExercisePhotoUpload Component */}
        <div className="bg-white rounded-lg shadow p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Test 3: ExercisePhotoUpload Component (original)</h2>
          <div className="space-y-4">
            <div className="bg-yellow-50 border border-yellow-200 rounded p-3">
              <p className="text-sm text-yellow-800">
                <strong>Props passées:</strong><br/>
                currentPhoto: {currentPhotoUrl || 'undefined'}<br/>
                hasCurrentPhoto: {String(!!currentPhotoUrl)}
              </p>
            </div>
            
            <ExercisePhotoUpload
              currentPhoto={currentPhotoUrl}
              onPhotoUploaded={handlePhotoUploaded}
              onPhotoRemoved={handlePhotoRemoved}
              disabled={false}
            />
          </div>
        </div>

        {/* Test 4: HTML Standard */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">Test 4: IMG HTML Standard</h2>
          {currentPhotoUrl && (
            <img 
              src={currentPhotoUrl}
              alt="Test HTML Standard"
              className="max-w-full h-48 object-cover rounded-lg"
              onLoad={() => console.log('✅ HTML img loaded successfully')}
              onError={(e) => console.error('❌ HTML img error:', e)}
            />
          )}
        </div>

        {/* Actions Debug */}
        <div className="bg-gray-100 rounded-lg p-4 mt-6">
          <h3 className="font-semibold mb-2">Actions Debug</h3>
          <div className="space-x-4">
            <button 
              onClick={() => setCurrentPhotoUrl(undefined)}
              className="px-4 py-2 bg-red-500 text-white rounded hover:bg-red-600"
            >
              Supprimer image
            </button>
            <button 
              onClick={() => setCurrentPhotoUrl("https://taspdceblvmpvdjixyit.supabase.co/storage/v1/object/public/exercise-images/069d73e4-8384-4141-91ea-32bfecafb496/11a386d9-7dbf-4432-bc10-cd75267da8ab.jpg")}
              className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600"
            >
              Remettre image
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}