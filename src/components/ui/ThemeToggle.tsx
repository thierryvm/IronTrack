'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  // Éviter le rendu côté serveur
  if (!mounted) {
    return (
      <button className="p-2 rounded-md text-orange-100 hover:bg-orange-600 hover:text-white transition-colors">
        <Sun className="h-5 w-5" />
      </button>
    )
  }

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-orange-100 hover:bg-orange-600 hover:text-white transition-colors"
    >
      {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  )
} 