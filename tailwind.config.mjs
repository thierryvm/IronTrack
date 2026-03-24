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
        ring: "var(--primary)",
        background: "var(--background)",
        foreground: "var(--foreground)",
        primary: {
          DEFAULT: "var(--primary)",
          hover: "var(--primary-hover)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          hover: "var(--secondary-hover)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
          hover: "var(--destructive-hover)",
          foreground: "var(--destructive-foreground)",
        },
        success: {
          DEFAULT: "var(--success)",
          hover: "var(--success-hover)",
          foreground: "var(--success-foreground)",
        },
        warning: {
          DEFAULT: "var(--warning)",
          hover: "var(--warning-hover)",
          foreground: "var(--warning-foreground)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          hover: "var(--muted-hover)",
          foreground: "var(--muted-foreground)",
        },
        accent: {
          DEFAULT: "var(--accent)",
          hover: "var(--accent-hover)",
          foreground: "var(--accent-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        header: {
          DEFAULT: "var(--header-bg)",
          border: "var(--header-border)",
          text: "var(--header-text)",
          muted: "var(--header-text-muted)"
        },
        
        // Brand - Orange IronTrack
        brand: {
          50: '#fff7ed',
          100: '#ffedd5',
          200: '#fed7aa',
          300: '#fdba74',
          400: '#fb923c',
          500: '#f97316',
          600: '#ea580c',
          700: '#c2410c',
          800: '#9a3412',
          900: '#7c2d12',
        }
      },
      // Restreindre la typographie pour forcer l'usage des tailles existantes
      fontSize: {
        xs: ['0.75rem', { lineHeight: '1rem' }],
        sm: ['0.875rem', { lineHeight: '1.25rem' }],
        base: ['1rem', { lineHeight: '1.5rem' }],
        lg: ['1.125rem', { lineHeight: '1.75rem' }],
        xl: ['1.25rem', { lineHeight: '1.75rem' }],
        '2xl': ['1.5rem', { lineHeight: '2rem' }],
        '3xl': ['1.875rem', { lineHeight: '2.25rem' }],
        '4xl': ['2.25rem', { lineHeight: '2.5rem' }],
      },
      boxShadow: {
        card: "var(--card-shadow)",
        'card-hover': "var(--card-shadow-hover)",
        button: "var(--button-shadow)",
      },
      spacing: {
        xs: "var(--spacing-xs)",
        sm: "var(--spacing-sm)",
        md: "var(--spacing-md)",
        lg: "var(--spacing-lg)",
        xl: "var(--spacing-xl)",
        '2xl': "var(--spacing-2xl)",
        'safe-top': 'env(safe-area-inset-top)',
        'safe-bottom': 'env(safe-area-inset-bottom)',
        'safe-left': 'env(safe-area-inset-left)',
        'safe-right': 'env(safe-area-inset-right)',
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