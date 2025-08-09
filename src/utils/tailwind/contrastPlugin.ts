/**
 * 🔧 PLUGIN TAILWIND - Classes Contraste Sécurisées
 * 
 * Plugin Tailwind CSS qui ajoute automatiquement des utility classes
 * garantissant le respect WCAG 2.1 AA dans toute l'application.
 */

import plugin from 'tailwindcss/plugin'
import { SAFE_COLORS, SAFE_COLOR_COMBINATIONS } from '../contrastUtils'

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
    '.text-safe-placeholder': {
      color: theme('colors.gray.500')
    },
    '.text-safe-orange': {
      color: theme('colors.orange.800')
    },
    '.text-safe-success': {
      color: theme('colors.green.700')
    },
    '.text-safe-warning': {
      color: theme('colors.yellow.800')
    },
    '.text-safe-error': {
      color: theme('colors.red.700')
    },
    '.text-safe-info': {
      color: theme('colors.blue.700')
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
        boxShadow: `0 0 0 2px ${theme('colors.orange.500')}, 0 0 0 4px rgba(251, 146, 60, 0.1)`
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
        backgroundColor: theme('colors.gray.300'),
        borderColor: theme('colors.gray.400')
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.gray.500')}, 0 0 0 4px rgba(107, 114, 128, 0.1)`
      }
    },
    
    '.btn-safe-outline': {
      backgroundColor: 'transparent',
      color: theme('colors.orange.800'),
      borderColor: theme('colors.orange.700'),
      fontWeight: theme('fontWeight.medium'),
      borderRadius: theme('borderRadius.lg'),
      paddingTop: theme('spacing.2'),
      paddingBottom: theme('spacing.2'),
      paddingLeft: theme('spacing.4'),
      paddingRight: theme('spacing.4'),
      border: `2px solid`,
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        backgroundColor: theme('colors.orange.50'),
        color: theme('colors.orange.900')
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.orange.500')}, 0 0 0 4px rgba(251, 146, 60, 0.1)`
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
    },
    
    '.status-safe-success-solid': {
      backgroundColor: theme('colors.green.600'),
      color: theme('colors.white'),
      borderColor: theme('colors.green.600'),
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      border: `1px solid`
    },
    
    '.status-safe-error-solid': {
      backgroundColor: theme('colors.red.600'),
      color: theme('colors.white'),
      borderColor: theme('colors.red.600'),
      padding: `${theme('spacing.2')} ${theme('spacing.4')}`,
      borderRadius: theme('borderRadius.md'),
      border: `1px solid`
    }
  }
  
  // Utilitaires liens sécurisés
  const safeLinkUtilities = {
    '.link-safe': {
      color: theme('colors.blue.700'),
      textDecoration: 'underline',
      textDecorationColor: theme('colors.blue.700'),
      transition: 'all 0.2s ease-in-out',
      '&:hover': {
        color: theme('colors.blue.800'),
        textDecorationColor: theme('colors.blue.800')
      },
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.blue.500')}, 0 0 0 4px rgba(59, 130, 246, 0.1)`,
        borderRadius: theme('borderRadius.sm')
      }
    },
    
    '.link-safe-no-underline': {
      color: theme('colors.blue.700'),
      textDecoration: 'none',
      transition: 'color 0.2s ease-in-out',
      '&:hover': {
        color: theme('colors.blue.800'),
        textDecoration: 'underline'
      }
    }
  }
  
  // Utilitaires contraste conditionnels par background
  const backgroundContextUtilities = {
    '.on-white': {
      '.text-context': {
        color: theme('colors.gray.900')
      },
      '.text-context-secondary': {
        color: theme('colors.gray.700')
      },
      '.text-context-muted': {
        color: theme('colors.gray.600')
      }
    },
    
    '.on-gray-50': {
      '.text-context': {
        color: theme('colors.gray.900')
      },
      '.text-context-secondary': {
        color: theme('colors.gray.700')
      },
      '.text-context-muted': {
        color: theme('colors.gray.600')
      }
    },
    
    '.on-gray-100': {
      '.text-context': {
        color: theme('colors.gray.900')
      },
      '.text-context-secondary': {
        color: theme('colors.gray.800')
      },
      '.text-context-muted': {
        color: theme('colors.gray.700')
      }
    },
    
    '.on-orange-50': {
      '.text-context': {
        color: theme('colors.orange.900')
      },
      '.text-context-secondary': {
        color: theme('colors.orange.800')
      },
      '.text-context-muted': {
        color: theme('colors.orange.700')
      }
    },
    
    '.on-colored': {
      '.text-context': {
        color: theme('colors.white')
      },
      '.text-context-secondary': {
        color: theme('colors.gray.100')
      },
      '.text-context-muted': {
        color: theme('colors.gray.200')
      }
    }
  }
  
  // Utilitaires focus sécurisés (contraste élevé pour accessibilité)
  const safeFocusUtilities = {
    '.focus-safe': {
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.orange.500')}, 0 0 0 4px rgba(251, 146, 60, 0.2)`
      }
    },
    
    '.focus-safe-blue': {
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.blue.500')}, 0 0 0 4px rgba(59, 130, 246, 0.2)`
      }
    },
    
    '.focus-safe-green': {
      '&:focus': {
        outline: 'none',
        boxShadow: `0 0 0 2px ${theme('colors.green.500')}, 0 0 0 4px rgba(34, 197, 94, 0.2)`
      }
    }
  }
  
  // Ajouter toutes les utilitaires
  addUtilities({
    ...safeTextUtilities,
    ...safeButtonUtilities,
    ...safeStatusUtilities,
    ...safeLinkUtilities,
    ...backgroundContextUtilities,
    ...safeFocusUtilities
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
          },
          'border': {
            'orange': '#c2410c',     // orange-700
          }
        }
      },
      // Spacing pour touch targets (44px minimum)
      spacing: {
        'touch': '44px'
      },
      // Font sizes optimisées pour contraste
      fontSize: {
        'safe-sm': ['0.875rem', { lineHeight: '1.5', letterSpacing: '0.025em' }],
        'safe-base': ['1rem', { lineHeight: '1.6', letterSpacing: '0.025em' }],
        'safe-lg': ['1.125rem', { lineHeight: '1.7', letterSpacing: '0.025em' }]
      }
    }
  }
})

export default contrastPlugin