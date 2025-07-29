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
  plugins: [],
}; 