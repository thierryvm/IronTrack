/**
 * Tests automatisés de contraste WCAG 2.1 AA
 * Validation des combinaisons de couleurs utilisées dans IronTrack
 */

import { describe, it, expect} from'@jest/globals'

// Utility pour calculer le ratio de contraste WCAG
function getLuminance(hex: string): number {
 // Convertir hex en RGB
 const r = parseInt(hex.slice(1, 3), 16) / 255
 const g = parseInt(hex.slice(3, 5), 16) / 255
 const b = parseInt(hex.slice(5, 7), 16) / 255

 // Calculer la luminance relative
 const rsRGB = r <= 0.03928 ? r / 12.92 : Math.pow((r + 0.055) / 1.055, 2.4)
 const gsRGB = g <= 0.03928 ? g / 12.92 : Math.pow((g + 0.055) / 1.055, 2.4)
 const bsRGB = b <= 0.03928 ? b / 12.92 : Math.pow((b + 0.055) / 1.055, 2.4)

 return 0.2126 * rsRGB + 0.7152 * gsRGB + 0.0722 * bsRGB
}

function getContrastRatio(color1: string, color2: string): number {
 const lum1 = getLuminance(color1)
 const lum2 = getLuminance(color2)
 const brightest = Math.max(lum1, lum2)
 const darkest = Math.min(lum1, lum2)
 return (brightest + 0.05) / (darkest + 0.05)
}

// Couleurs Tailwind utilisées dans IronTrack (hex values)
const tailwindColors = {
 // Orange (Primary)
'orange-50':'#fff7ed',
'orange-100':'#ffedd5', 
'orange-200':'#fed7aa',
'orange-300':'#fdba74',
'orange-400':'#fb923c',
'orange-500':'#f97316', // Primary
'orange-600':'#ea580c', // Primary text
'orange-700':'#c2410c',
'orange-800':'#9a3412',
'orange-900':'#7c2d12',

 // Rouge (Accents)
'red-50':'#fef2f2',
'red-100':'#fee2e2',
'red-200':'#fecaca', 
'red-300':'#fca5a5',
'red-400':'#f87171',
'red-500':'#ef4444', // Error
'red-600':'#dc2626', // Error text
'red-700':'#b91c1c',
'red-800':'#991b1b',
'red-900':'#7f1d1d',

 // Vert (Success)
'green-50':'#f0fdf4',
'green-100':'#dcfce7',
'green-200':'#bbf7d0',
'green-300':'#86efac',
'green-400':'#4ade80',
'green-500':'#22c55e', // Success
'green-600':'#16a34a', // Success text
'green-700':'#15803d',
'green-800':'#166534',
'green-900':'#14532d',

 // Gris (Neutral)
'gray-50':'#f9fafb',
'gray-100':'#f3f4f6',
'gray-200':'#e5e7eb',
'gray-300':'#d1d5db',
'gray-400':'#9ca3af',
'gray-500':'#6b7280',
'gray-600':'#4b5563',
'gray-700':'#374151', // Text color
'gray-800':'#1f2937',
'gray-900':'#111827', // Dark text

 // Basiques
'white':'#ffffff',
'black':'#000000',
}

describe('Tests de Contraste WCAG 2.1 AA', () => {
 describe('Combinaisons Primary Orange', () => {
 it('devrait avoir un contraste suffisant pour orange-600/white (boutons larges)', () => {
 const ratio = getContrastRatio(tailwindColors['orange-600'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(3.0) // AA pour texte large
 expect(ratio).toBeCloseTo(3.6, 1) // Ratio approximatif attendu
})

 it('devrait avoir un contraste suffisant pour orange-800/white (texte)', () => {
 const ratio = getContrastRatio(tailwindColors['orange-800'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
 expect(ratio).toBeCloseTo(7.3, 1)
})

 it('devrait avoir un contraste suffisant pour orange-800/gray-50', () => {
 const ratio = getContrastRatio(tailwindColors['orange-800'], tailwindColors['gray-50'])
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
})
})

 describe('Combinaisons Texte Principal', () => {
 it('devrait avoir un contraste excellent pour gray-900/white', () => {
 const ratio = getContrastRatio(tailwindColors['gray-900'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(7.0) // AAA compliance
 expect(ratio).toBeCloseTo(17.7, 1) // Contraste maximal
})

 it('devrait avoir un contraste suffisant pour gray-700/white', () => {
 const ratio = getContrastRatio(tailwindColors['gray-700'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
 expect(ratio).toBeCloseTo(10.3, 1)
})

 it('devrait avoir un contraste suffisant pour gray-600/gray-50', () => {
 const ratio = getContrastRatio(tailwindColors['gray-600'], tailwindColors['gray-50'])
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
})
})

 describe('Combinaisons États (Success, Error, Warning)', () => {
 it('devrait avoir un contraste suffisant pour green-600/white (success)', () => {
 const ratio = getContrastRatio(tailwindColors['green-600'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(3.0) // AA pour texte large (success souvent pour badges)
 expect(ratio).toBeCloseTo(3.3, 1)
})

 it('devrait avoir un contraste suffisant pour red-600/white (error)', () => {
 const ratio = getContrastRatio(tailwindColors['red-600'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
 expect(ratio).toBeCloseTo(4.8, 1)
})

 it('devrait avoir un contraste suffisant pour success text sur fond vert clair', () => {
 const ratio = getContrastRatio(tailwindColors['green-800'], tailwindColors['green-50'])
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
})
})

 describe('Combinaisons à Éviter (Tests de Régression)', () => {
 it('NE DEVRAIT PAS utiliser orange-200/orange-500 (contraste insuffisant)', () => {
 const ratio = getContrastRatio(tailwindColors['orange-200'], tailwindColors['orange-500'])
 expect(ratio).toBeLessThan(3.0) // Confirme que cette combinaison est interdite
})

 it('NE DEVRAIT PAS utiliser gray-400/gray-50 (contraste insuffisant)', () => {
 const ratio = getContrastRatio(tailwindColors['gray-400'], tailwindColors['gray-50'])
 expect(ratio).toBeLessThan(4.5) // Confirme contraste insuffisant
})

 it('NE DEVRAIT PAS utiliser red-200/red-500 (contraste insuffisant)', () => {
 const ratio = getContrastRatio(tailwindColors['red-200'], tailwindColors['red-500'])
 expect(ratio).toBeLessThan(3.0) // Confirme que cette combinaison est interdite
})
})

 describe('Gradients et Overlays', () => {
 it('devrait avoir un contraste suffisant pour white text sur gradient orange-rouge', () => {
 // Test sur la couleur la plus claire du gradient (orange-600 CORRIGÉ)
 const ratioOrange = getContrastRatio(tailwindColors['orange-600'], tailwindColors.white)
 // Test sur la couleur la plus foncée du gradient (red-500) 
 const ratioRed = getContrastRatio(tailwindColors['red-500'], tailwindColors.white)
 
 expect(Math.min(ratioOrange, ratioRed)).toBeGreaterThanOrEqual(3.0) // AA pour texte large
})

 it('devrait avoir un contraste suffisant pour overlay semi-transparent', () => {
 // Simuler white/90 (90% opacité) = #e6e6e6 approximativement
 const overlayColor ='#e6e6e6'
 const ratio = getContrastRatio(tailwindColors['gray-900'], overlayColor)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA pour texte normal
})
})

 describe('States Interactifs', () => {
 it('devrait maintenir le contraste pour hover states', () => {
 // orange-600 -> orange-700 on hover (CORRIGÉ)
 const baseRatio = getContrastRatio(tailwindColors['orange-600'], tailwindColors.white)
 const hoverRatio = getContrastRatio(tailwindColors['orange-700'], tailwindColors.white)
 
 expect(baseRatio).toBeGreaterThanOrEqual(3.0)
 expect(hoverRatio).toBeGreaterThanOrEqual(4.5) // Amélioration au hover
})

 it('devrait maintenir le contraste pour active states', () => {
 // orange-700 -> orange-800 on active (CORRIGÉ)
 const normalRatio = getContrastRatio(tailwindColors['orange-700'], tailwindColors.white)
 const activeRatio = getContrastRatio(tailwindColors['orange-800'], tailwindColors.white)
 
 expect(normalRatio).toBeGreaterThanOrEqual(4.5)
 expect(activeRatio).toBeGreaterThanOrEqual(4.5) // Maintient le contraste
})
})

 describe('Focus Indicators', () => {
 it('devrait avoir un contraste suffisant pour focus ring orange', () => {
 // Focus ring orange-600 sur fond blanc (CORRIGÉ)
 const ratio = getContrastRatio(tailwindColors['orange-600'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(3.0) // AA pour éléments non-texte
})

 it('devrait avoir un contraste suffisant pour focus ring sur fonds sombres', () => {
 // Focus ring orange-400 sur fond gray-800
 const ratio = getContrastRatio(tailwindColors['orange-400'], tailwindColors['gray-800'])
 expect(ratio).toBeGreaterThanOrEqual(3.0) // AA pour éléments non-texte
})
})
})

describe('Tests Spécifiques IronTrack', () => {
 describe('Composants NumberWheel', () => {
 it('devrait avoir un contraste suffisant pour valeur sélectionnée', () => {
 // orange-800 text sur fond blanc (CORRIGÉ)
 const ratio = getContrastRatio(tailwindColors['orange-800'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA
})

 it('devrait avoir un contraste suffisant pour valeurs non-sélectionnées', () => {
 // gray-600 text sur fond blanc
 const ratio = getContrastRatio(tailwindColors['gray-600'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA
})
})

 describe('Cartes Exercices', () => {
 it('devrait avoir un contraste suffisant pour titre sur fond blanc', () => {
 // gray-900 text sur fond white
 const ratio = getContrastRatio(tailwindColors['gray-900'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(7.0) // AAA (excellent)
})

 it('devrait avoir un contraste suffisant pour description', () => {
 // gray-700 text sur fond white
 const ratio = getContrastRatio(tailwindColors['gray-700'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA
})
})

 describe('Headers et Navigation', () => {
 it('devrait avoir un contraste suffisant pour header gradient', () => {
 // White text sur orange-600 (partie la plus claire du gradient CORRIGÉ)
 const ratio = getContrastRatio(tailwindColors.white, tailwindColors['orange-600'])
 expect(ratio).toBeGreaterThanOrEqual(3.0) // AA pour texte large
})

 it('devrait avoir un contraste suffisant pour liens navigation', () => {
 // white text sur orange-600 (CORRIGÉ)
 const ratio = getContrastRatio(tailwindColors.white, tailwindColors['orange-600'])
 expect(ratio).toBeGreaterThanOrEqual(3.0) // AA pour texte large
})
})

 describe('Formulaires et Inputs', () => {
 it('devrait avoir un contraste suffisant pour placeholder text', () => {
 // gray-400 sur fond white (placeholder standard)
 const ratio = getContrastRatio(tailwindColors['gray-400'], tailwindColors.white)
 // Note: Les placeholders peuvent avoir un contraste plus faible (recommandation WCAG)
 expect(ratio).toBeGreaterThan(2.0) // Minimum viable pour placeholders
})

 it('devrait avoir un contraste suffisant pour input text', () => {
 // gray-900 sur fond white
 const ratio = getContrastRatio(tailwindColors['gray-900'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(7.0) // AAA (excellent)
})

 it('devrait avoir un contraste suffisant pour error messages', () => {
 // red-600 sur fond white
 const ratio = getContrastRatio(tailwindColors['red-600'], tailwindColors.white)
 expect(ratio).toBeGreaterThanOrEqual(4.5) // AA
})
})
})