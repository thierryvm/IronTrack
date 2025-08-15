'use client'

import { Sun, Moon } from 'lucide-react'
import { useTheme } from './ThemeProvider'

export default function ThemeToggle() {
  const { theme, toggleTheme, mounted } = useTheme()

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-md text-gray-500 hover:bg-gray-100 hover:text-gray-700 dark:text-gray-300 dark:hover:bg-gray-800 transition-colors focus:outline-none focus:ring-2 focus:ring-orange-500 focus:ring-offset-2"
      aria-label={mounted && theme === 'dark' ? 'Passer au thème clair' : 'Passer au thème sombre'}
    >
      {mounted ? (theme === 'dark' ? <Sun className="h-5 w-5" aria-hidden="true" /> : <Moon className="h-5 w-5" aria-hidden="true" />) : <Moon className="h-5 w-5" aria-hidden="true" />}
    </button>
  )
} 