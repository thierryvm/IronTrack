'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'
import { useEffect, useState } from 'react'

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  // Évite le flash de l'icône incorrecte pendant l'hydration SSR
  if (!mounted) {
    return (
      <button
        className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none"
        aria-label="Chargement du thème"
        disabled
      >
        <Moon className="h-5 w-5" aria-hidden="true" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-muted-foreground hover:bg-muted hover:text-foreground transition-colors focus:outline-none"
      aria-label={theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  )
}