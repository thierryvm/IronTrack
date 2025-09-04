export default {
  darkMode: 'class',
  content: [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      // Variables CSS personnalisées pour le système de thème
      colors: {
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          foreground: "var(--destructive-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          foreground: "var(--accent-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        // Surfaces principales
        'surface-light': '#ffffff',      // Fond clair principal
        'surface-lightAlt': '#f9fafb',   // Fond clair alternatif
        'surface-dark': '#0b1220',       // Fond sombre principal
        'surface-darkAlt': '#111827',    // Fond sombre alternatif
        
        // Brand - Orange IronTrack
        brand: {
          50: '#fff7ed',         // Orange très clair
          100: '#ffedd5',        // Orange clair
          200: '#fed7aa',        // Orange soft
          300: '#fdba74',        // Orange light
          400: '#fb923c',        // Orange medium
          500: '#f97316',        // Orange principal
          600: '#ea580c',        // Orange hover
          700: '#c2410c',        // Orange pressed
          800: '#9a3412',        // Orange darker
          900: '#7c2d12',        // Orange darkest
        },
        
        // États système
        success: {
          50: '#ecfdf5',
          500: '#10b981',
          600: '#059669',
        },
        warning: {
          50: '#fffbeb',
          500: '#f59e0b',
          600: '#d97706',
        },
        danger: {
          50: '#fef2f2',
          500: '#ef4444',
          600: '#dc2626',
        },
        
        // Legacy ChatGPT (compatibilité)
        chatgpt: {
          'bg-primary': '#ffffff',
          'bg-secondary': '#f9fafb',
          'text-primary': '#0d0d0d',
          'text-secondary': '#6b6b6b',
          'border': '#e5e7eb',
          'dark-bg-primary': '#0b1220',
          'dark-bg-secondary': '#111827',
          'dark-text-primary': '#f4f4f4',
          'dark-text-secondary': '#a1a1aa',
          'dark-border': '#374151',
        }
      },
      // Breakpoints adaptés aux formats d'écrans 2025
      screens: {
        'xs': '375px',    // iPhone 12 mini et plus grands
        '2xs': '320px',   // Très petits écrans
        '3xl': '1600px',  // Très grands écrans desktop
        '4xl': '1920px',  // Écrans ultra-larges
        // Breakpoints spécifiques aux appareils 2025
        'iphone-15-pro-max': '430px',
        'samsung-s24-ultra': '440px',
        'fold-portrait': { 'raw': '(min-width: 768px) and (max-width: 1024px) and (orientation: portrait)' },
        'mobile-landscape': { 'raw': '(max-height: 500px) and (orientation: landscape)' },
      },
      // Espacements adaptatifs pour safe areas
      spacing: {
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
      },
      // Tailles spécifiques pour éléments tactiles optimaux
      height: {
        'touch-44': '44px',  // Taille minimale recommandée Apple/Google
        'touch-48': '48px',  // Taille optimale Android
        'touch-56': '56px',  // Taille confortable Material Design
      },
      width: {
        'touch-44': '44px',
        'touch-48': '48px', 
        'touch-56': '56px',
      },
      // Rayons de bordure adaptés aux nouveaux designs
      borderRadius: {
        '4xl': '2rem',
        '5xl': '2.5rem',
      }
    },
  },
  plugins: [
    // Plugin de contraste sécurisé WCAG 2.1 AA
    require('./src/utils/tailwind/contrastPlugin.js')
  ],
}; 