'use client'

import { useState } from 'react'
import { Slider } from '@/components/ui/slider'

/**
 * Wrapper client-side pour afficher les sliders dans la page design-system.
 * Les fonctions event handlers doivent être dans un composant 'use client'
 * pour être compatibles avec Next.js 15 SSR streaming.
 */
export function SliderDemo() {
  const [value1, setValue1] = useState([50])
  const [value2, setValue2] = useState([80])

  return (
    <div className="w-full space-y-4">
      <Slider
        value={value1}
        onValueChange={setValue1}
        max={100}
        step={1}
      />
      <Slider
        value={value2}
        onValueChange={setValue2}
        max={100}
        step={1}
        className="mt-4"
      />
    </div>
  )
}
