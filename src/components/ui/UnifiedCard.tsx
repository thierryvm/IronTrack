'use client'

import { ReactNode, useState, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MoreVertical } from 'lucide-react'

interface DropdownAction {
  label: string
  icon: ReactNode
  onClick: () => void
  className?: string
  danger?: boolean
}

interface UnifiedCardProps {
  children: ReactNode
  className?: string
  hover?: boolean
  gradient?: boolean
  actions?: DropdownAction[]
  onCardClick?: () => void
  testId?: string
}

export function UnifiedCard({ 
  children, 
  className = '', 
  hover = true, 
  gradient = false,
  actions = [],
  onCardClick,
  testId
}: UnifiedCardProps) {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const buttonRef = useRef<HTMLButtonElement>(null)

  // Fermer dropdown si clic ailleurs
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node) &&
          buttonRef.current && !buttonRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const cardClasses = `
    relative bg-white rounded-xl shadow-md border border-gray-100
    ${hover ? 'hover:shadow-lg hover:border-orange-200 transition-all duration-300' : ''}
    ${gradient ? 'bg-gradient-to-br from-white to-gray-50' : ''}
    ${onCardClick ? 'cursor-pointer' : ''}
    ${className}
  `.trim()

  return (
    <motion.div
      data-testid={testId}
      className={cardClasses}
      onClick={onCardClick}
      whileHover={hover ? { y: -2 } : undefined}
      transition={{ duration: 0.2 }}
    >
      {children}
      
      {/* Menu dropdown 3 dots - Position fixée */}
      {actions.length > 0 && (
        <div className="absolute top-4 right-4 z-20">
          <button
            ref={buttonRef}
            onClick={(e) => {
              e.stopPropagation()
              setIsDropdownOpen(!isDropdownOpen)
            }}
            className="p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors"
            aria-label="Actions"
            data-testid="card-menu-button"
          >
            <MoreVertical className="h-4 w-4" />
          </button>
          
          {/* Dropdown menu - Position absolue améliorée */}
          {isDropdownOpen && (
            <div
              ref={dropdownRef}
              className="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-xl border border-gray-200 py-1 z-50"
              data-testid="card-dropdown-menu"
            >
              {actions.map((action, index) => (
                <button
                  key={index}
                  onClick={(e) => {
                    e.stopPropagation()
                    action.onClick()
                    setIsDropdownOpen(false)
                  }}
                  className={`
                    flex items-center space-x-3 px-4 py-2 text-sm w-full text-left
                    transition-colors duration-150
                    ${action.danger 
                      ? 'text-red-600 hover:bg-red-50' 
                      : 'text-gray-700 hover:bg-gray-50'
                    }
                    ${index === 0 ? 'rounded-t-lg' : ''}
                    ${index === actions.length - 1 ? 'rounded-b-lg' : ''}
                    ${action.className || ''}
                  `}
                  data-testid={`card-action-${index}`}
                >
                  <span className="flex-shrink-0">{action.icon}</span>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>
      )}
    </motion.div>
  )
}

// Composant d'en-tête de carte standardisé
interface CardHeaderProps {
  title: string
  subtitle?: string
  badge?: {
    text: string
    color: 'green' | 'yellow' | 'red' | 'blue' | 'gray'
  }
  icon?: ReactNode
  className?: string
}

export function CardHeader({ title, subtitle, badge, icon, className = '' }: CardHeaderProps) {
  const badgeColors = {
    green: 'bg-green-100 text-green-700',
    yellow: 'bg-yellow-100 text-yellow-700', 
    red: 'bg-red-100 text-red-700',
    blue: 'bg-blue-100 text-blue-700',
    gray: 'bg-gray-100 text-gray-700'
  }

  return (
    <div className={`flex items-start justify-between mb-3 ${className}`}>
      <div className="flex items-start space-x-3 flex-1">
        {icon && (
          <div className="flex-shrink-0 mt-1">
            {icon}
          </div>
        )}
        <div className="min-w-0 flex-1">
          <h3 className="text-lg font-semibold text-gray-900 truncate group-hover:text-orange-600 transition-colors">
            {title}
          </h3>
          {subtitle && (
            <p className="text-sm text-gray-600 mt-1">{subtitle}</p>
          )}
        </div>
      </div>
      
      {badge && (
        <span className={`px-2 py-1 rounded-full text-xs font-medium flex-shrink-0 ml-3 ${badgeColors[badge.color]}`}>
          {badge.text}
        </span>
      )}
    </div>
  )
}

// Composant d'actions de carte standardisé
interface CardActionsProps {
  actions: {
    label: string
    icon: ReactNode
    onClick: () => void
    variant?: 'primary' | 'secondary' | 'success' | 'danger'
    className?: string
  }[]
  className?: string
}

export function CardActions({ actions, className = '' }: CardActionsProps) {
  const variantClasses = {
    primary: 'bg-orange-500 text-white hover:bg-orange-600',
    secondary: 'bg-gray-500 text-white hover:bg-gray-600',
    success: 'bg-green-500 text-white hover:bg-green-600',
    danger: 'bg-red-500 text-white hover:bg-red-600'
  }

  return (
    <div className={`flex space-x-2 ${className}`}>
      {actions.map((action, index) => (
        <button
          key={index}
          onClick={action.onClick}
          className={`
            flex-1 px-3 py-2 rounded-lg font-medium text-sm
            transition-colors duration-200
            flex items-center justify-center space-x-1
            ${variantClasses[action.variant || 'primary']}
            ${action.className || ''}
          `}
          data-testid={`card-action-${index}`}
        >
          {action.icon}
          <span>{action.label}</span>
        </button>
      ))}
    </div>
  )
}