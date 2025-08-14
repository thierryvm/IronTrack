/**
 * 🔧 PLUGIN TAILWIND - Classes Contraste Sécurisées (JS Version)
 * 
 * Plugin Tailwind CSS qui ajoute automatiquement des utility classes
 * garantissant le respect WCAG 2.1 AA dans toute l'application.
 */

import plugin from 'tailwindcss/plugin'

const contrastPlugin = plugin(function({ addUtilities, theme }) {
  
  // Utilitaires texte sécurisés
  const safeTextUtilities = {
    '.text-safe-primary': {
      color: theme('colors.gray.900')
    },
    '.text-safe-secondary': {
      color: theme('colors.gray.700')
    },
    '.text-safe-muted': {
      color: theme('colors.gray.600')
    },
    '.text-safe-orange': {
      color: theme('colors.orange.800')
    },
    '.text-safe-success': {
      color: theme('colors.green.700')
    },
    '.text-safe-error': {
      color: theme('colors.red.700')
    },
    '.text-safe-link': {
      color: theme('colors.blue.700'),
      '&:hover': {
        color: theme('colors.blue.800')
      }
    }
  }
  
  // Utilitaires boutons sécurisés
  const safeButtonUtilities = {
    '.btn-safe-primary': {
      backgroundColor: theme('colors.orange.600'),
      color: theme('colors.white'),
      borderColor: theme('colors.orange.600'),
      fontWeight: theme('fontWeight.medium'),
      borderRadius: theme('borderRadius.lg'),
      paddingTop: theme('spacing.2'),
      paddingBottom: theme('spacing.2'),
      paddingLeft: theme('spacing.4'),
      paddingRight: theme('spacing.4'),
      border: `1px solid`,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme('colors.orange.700'),
        borderColor: theme('colors.orange.700')
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.orange.500')}`
      }
    },
    
    '.btn-safe-secondary': {
      backgroundColor: theme('colors.gray.200'),
      color: theme('colors.gray.900'),
      borderColor: theme('colors.gray.300'),
      fontWeight: theme('fontWeight.medium'),
      borderRadius: theme('borderRadius.lg'),
      paddingTop: theme('spacing.2'),
      paddingBottom: theme('spacing.2'),
      paddingLeft: theme('spacing.4'),
      paddingRight: theme('spacing.4'),
      border: `1px solid`,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme('colors.gray.300')
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.gray.500')}`
      }
    }
  }
  
  // Utilitaires états sécurisés
  const safeStatusUtilities = {
    '.status-safe-success': {
      backgroundColor: theme('colors.green.50'),
      color: theme('colors.green.800'),
      borderColor: theme('colors.green.200'),
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      border: `1px solid`
    },
    
    '.status-safe-error': {
      backgroundColor: theme('colors.red.50'),
      color: theme('colors.red.800'),
      borderColor: theme('colors.red.200'),
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      border: `1px solid`
    },
    
    '.status-safe-warning': {
      backgroundColor: theme('colors.yellow.50'),
      color: theme('colors.yellow.800'),
      borderColor: theme('colors.yellow.200'),
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      border: `1px solid`
    },
    
    '.status-safe-info': {
      backgroundColor: theme('colors.blue.50'),
      color: theme('colors.blue.800'),
      borderColor: theme('colors.blue.200'),
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      border: `1px solid`
    }
  }
  
  // Ajouter toutes les utilitaires
  addUtilities({
    ...safeTextUtilities,
    ...safeButtonUtilities,
    ...safeStatusUtilities
  })
}, {
  theme: {
    extend: {
      // Couleurs personnalisées pour le contraste
      colors: {
        'safe': {
          'text': {
            'primary': '#111827',    // gray-900
            'secondary': '#374151',  // gray-700
            'muted': '#4b5563',      // gray-600
            'orange': '#9a3412',     // orange-800
          },
          'bg': {
            'orange': '#ea580c',     // orange-600
          }
        }
      }
    }
  }
})

export default contrastPlugin