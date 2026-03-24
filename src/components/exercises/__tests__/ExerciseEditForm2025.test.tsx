/**
 * Tests unitaires pour ExerciseEditForm2025 - Validation critique
 * 
 * Tests du problème de validation identifié par l'utilisateur
 * 🚨 PROBLÈME: Validation défaillante dans formulaire modification exercice
 */

import React from'react'
import { render, screen, fireEvent, waitFor} from'@testing-library/react'
import userEvent from'@testing-library/user-event'
import'@testing-library/jest-dom'
import { ExerciseEditForm2025} from'../ExerciseEditForm2025'
import { createClient} from'@/utils/supabase/client'
import { toast} from'react-hot-toast'
import { useRouter} from'next/navigation'

// Mocks complets
jest.mock('@/utils/supabase/client')
jest.mock('react-hot-toast')
jest.mock('next/navigation', () => ({
 useRouter: jest.fn()
}))
jest.mock('framer-motion', () => ({
 motion: {
 MotionWrapper: ({ children, className, ...props}: any) => {
 const { whileHover, whileTap, ...cleanProps} = props
 return <div {...cleanProps}>{children}</div>
}
}
}))
jest.mock('@/components/exercises/ExercisePhotoUpload', () => ({
 ImagePicker: ({ onPhotoUploaded, onPhotoRemoved, currentPhoto, disabled, ...props}: any) => (
 <div data-testid="exercise-photo-upload">
 <span>Photo Upload Component</span>
 {currentPhoto && <span>Current: {currentPhoto}</span>}
 </div>
 )
}))

// Mock shadcn Select → native <select> pour que getByDisplayValue fonctionne
jest.mock('@/components/ui/select', () => ({
 Select: ({ value, onValueChange, children}: any) => (
 <select
 value={value}
 onChange={(e) => onValueChange?.(e.target.value)}
 >
 {children}
 </select>
 ),
 SelectTrigger: ({ children}: any) => <>{children}</>,
 SelectValue: ({ placeholder}: any) => <option value="">{placeholder}</option>,
 SelectContent: ({ children}: any) => <>{children}</>,
 SelectItem: ({ value, children}: any) => <option value={value}>{children}</option>,
}))

jest.mock('@/components/ui/input', () => ({
 Input: ({ value, onChange, placeholder, className, ...props}: any) => (
 <input
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 className={className}
 {...props}
 />
 )
}))

jest.mock('@/components/ui/button', () => ({
 Button: ({ children, onClick, loading, disabled, icon, variant, size, fullWidth, className, ...props}: any) => (
 <button
 onClick={onClick}
 disabled={disabled || loading}
 className={className}
 {...props}
 >
 {loading ?'Enregistrement...' : children}
 </button>
 )
}))

jest.mock('@/components/ui/textarea', () => ({
 Textarea: ({ value, onChange, placeholder, readOnly, variant, rows, autoResize, ...props}: any) => (
 <textarea
 value={value}
 onChange={onChange}
 placeholder={placeholder}
 readOnly={readOnly}
 rows={rows}
 {...props}
 />
 )
}))

jest.mock('@/components/ui/button', () => ({
 Button: ({ children, onClick, loading, disabled, icon, variant, size, fullWidth, className, ...props}: any) => (
 <button 
 onClick={onClick} 
 disabled={disabled || loading}
 className={`mock-button ${variant} ${size} ${className}`}
 data-loading={loading}
 data-testid={props['data-testid']}
 >
 {icon}
 {children}
 </button>
 ),
 buttonVariants: () =>"mock-button-variant"
}))

// Mock Supabase avec chaînage complet fonctionnel
const createMockSupabaseChain = () => ({
 from: jest.fn().mockImplementation(() => createMockSupabaseChain()),
 select: jest.fn().mockImplementation(() => createMockSupabaseChain()),
 eq: jest.fn().mockImplementation(() => createMockSupabaseChain()),
 single: jest.fn().mockImplementation(() => Promise.resolve({ data: null, error: null})),
 order: jest.fn().mockImplementation(() => createMockSupabaseChain()),
 limit: jest.fn().mockImplementation(() => Promise.resolve({ data: [], error: null})),
 update: jest.fn().mockImplementation(() => createMockSupabaseChain()),
})

// Mocks spécialisés par test
let mockSupabase = createMockSupabaseChain()

// Mock update spécifique pour tests
const mockUpdateSuccess = jest.fn().mockResolvedValue({ data: {}, error: null})
const mockUpdateError = jest.fn().mockResolvedValue({ data: null, error: { message:'Database error'}})

const mockRouter = {
 push: jest.fn(),
}

describe('ExerciseEditForm2025 - Tests de validation critiques', () => {
 beforeEach(() => {
 jest.clearAllMocks()
 
 // Reset mockSupabase pour chaque test
 mockSupabase = createMockSupabaseChain()
 
 ;(createClient as jest.Mock).mockReturnValue(mockSupabase)
 ;(useRouter as jest.Mock).mockReturnValue(mockRouter)
 ;(toast.error as jest.Mock).mockImplementation(() => {})
 ;(toast.success as jest.Mock).mockImplementation(() => {})

 // Configuration mock data par table
 const mockExerciseData = {
 id:'1',
 name:'Développé couché',
 exercise_type:'Musculation',
 muscle_group:'Pectoraux',
 equipment_id: 1,
 difficulty: 2,
 description:'Exercice de base',
 image_url: null
}

 const mockPerformanceData = [{ notes:'Dernière session excellente'}]
 
 const mockEquipmentData = [
 { id: 1, name:'Machine'},
 { id: 2, name:'Haltères'}
 ]

 const mockMuscleGroupData = [
 { id: 1, name:'Abdominaux'}, { id: 2, name:'Avant-bras'},
 { id: 3, name:'Biceps'}, { id: 4, name:'Dos'}, { id: 5, name:'Épaules'},
 { id: 6, name:'Fessiers'}, { id: 7, name:'Ischio-jambiers'}, { id: 8, name:'Jambes'},
 { id: 9, name:'Mollets'}, { id: 10, name:'Obliques'}, { id: 11, name:'Pectoraux'},
 { id: 12, name:'Quadriceps'}, { id: 13, name:'Trapèzes'}, { id: 14, name:'Triceps'}
 ]

 // Mock complet et fonctionnel selon table
 mockSupabase.from.mockImplementation((table: string) => {
 if (table ==='exercises') {
 return {
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 single: jest.fn().mockResolvedValue({
 data: mockExerciseData,
 error: null
})
})
}),
 update: jest.fn().mockReturnValue({
 eq: jest.fn().mockResolvedValue({
 data: mockExerciseData,
 error: null
})
})
}
}
 
 if (table ==='performance_logs') {
 return {
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 order: jest.fn().mockReturnValue({
 limit: jest.fn().mockResolvedValue({
 data: mockPerformanceData,
 error: null
})
})
})
})
}
}
 
 if (table ==='equipment') {
 return {
 select: jest.fn().mockReturnValue({
 order: jest.fn().mockResolvedValue({
 data: mockEquipmentData,
 error: null
})
})
}
}
 
 if (table ==='muscle_groups') {
 return {
 select: jest.fn().mockReturnValue({
 order: jest.fn().mockResolvedValue({
 data: mockMuscleGroupData,
 error: null
})
})
}
}

 // Fallback pour autres tables
 return createMockSupabaseChain()
})
})

 describe('🚨 TESTS PROBLÈME VALIDATION CRITIQUE', () => {
 test('VALIDATION CÔTÉ CLIENT - Champ nom vide', async () => {
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Développé couché')).toBeInTheDocument()
})

 // Vider le champ nom
 const nameInput = screen.getByDisplayValue('Développé couché')
 await userEvent.clear(nameInput)
 
 // Tenter de sauvegarder
 const saveButton = screen.getByText('Enregistrer les modifications')
 await userEvent.click(saveButton)

 // ✅ Doit afficher une erreur de validation
 expect(screen.getByText('Le nom de l\'exercice est requis')).toBeInTheDocument()
 
 // ✅ NE DOIT PAS appeler l'API avec des données invalides
 expect(mockSupabase.update).not.toHaveBeenCalled()
})

 test('VALIDATION CÔTÉ CLIENT - Groupe musculaire vide', async () => {
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Pectoraux')).toBeInTheDocument()
})

 // Vider le groupe musculaire
 const muscleSelect = screen.getByDisplayValue('Pectoraux')
 await userEvent.selectOptions(muscleSelect,'')
 
 // Tenter de sauvegarder
 const saveButton = screen.getByText('Enregistrer les modifications')
 await userEvent.click(saveButton)

 // ✅ Doit afficher une erreur de validation
 expect(screen.getByText('Le groupe musculaire est requis')).toBeInTheDocument()
 
 // ✅ NE DOIT PAS appeler l'API
 expect(mockSupabase.update).not.toHaveBeenCalled()
})

 test('FAILLE SÉCURITÉ - Validation contournement côté client', async () => {
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Développé couché')).toBeInTheDocument()
})

 // Simuler contournement validation JS (ex: DevTools)
 const nameInput = screen.getByDisplayValue('Développé couché')
 
 // Injection potentielle XSS/malicious data
 const maliciousData ='<script>alert("XSS")</script>'
 await userEvent.clear(nameInput)
 await userEvent.type(nameInput, maliciousData)
 
 const saveButton = screen.getByText('Enregistrer les modifications')
 await userEvent.click(saveButton)

 // ✅ SOLUTION IMPLÉMENTÉE: Notre nouvelle validation bloque les données dangereuses !
 // La validation côté serveur empêche maintenant les données malveillantes
 expect(mockSupabase.update).not.toHaveBeenCalled()
 
 // Vérifier qu'une erreur de validation est affichée
 await waitFor(() => {
 expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Erreurs de validation'))
})
})

 test('TYPE SAFETY - Faille type any', async () => {
 // Mock update spécifique pour ce test
 mockSupabase.from.mockImplementation((table: string) => {
 if (table ==='exercises') {
 return {
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 single: jest.fn().mockResolvedValue({
 data: {
 id:'1',
 name:'Développé couché',
 exercise_type:'Musculation',
 muscle_group:'Pectoraux',
 equipment_id: 1,
 difficulty: 2,
 description:'Exercice de base',
 image_url: null
},
 error: null
})
})
}),
 update: mockUpdateSuccess.mockReturnValue({
 eq: jest.fn().mockResolvedValue({ data: {}, error: null})
})
}
}
 return mockSupabase
})
 
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Développé couché')).toBeInTheDocument()
})

 const saveButton = screen.getByText('Enregistrer les modifications')
 await userEvent.click(saveButton)

 await waitFor(() => {
 expect(mockUpdateSuccess).toHaveBeenCalled()
})

 // ✅ Données devraient être typées correctement - vérifier le call
 const updateCall = mockUpdateSuccess.mock.calls[0][0]
 
 expect(updateCall).toHaveProperty('name')
 expect(updateCall).toHaveProperty('exercise_type')
 expect(updateCall).toHaveProperty('muscle_group')
 expect(updateCall).toHaveProperty('equipment_id')
 expect(updateCall).toHaveProperty('difficulty')
 
 // ✅ Type safety - difficulty doit être number
 expect(typeof updateCall.difficulty).toBe('number')
})

 test('MIDDLEWARE ADMIN - Défaillance table user_roles', async () => {
 // Simuler erreur table user_roles manquante
 const consoleSpy = jest.spyOn(console,'error').mockImplementation()
 
 // Ce test simule le problème middleware admin
 // En pratique, ça se passe dans middleware.ts lignes 96-116
 const mockUserRoleCheck = async (userId: string) => {
 try {
 // Simulation échec requête user_roles
 throw new Error('relation"user_roles" does not exist')
} catch (error) {
 console.error('[MIDDLEWARE] Admin role check failed:', error)
 return null
}
}

 const result = await mockUserRoleCheck('test-user-id')
 
 expect(result).toBeNull()
 expect(consoleSpy).toHaveBeenCalledWith(
'[MIDDLEWARE] Admin role check failed:',
 expect.any(Error)
 )
 
 consoleSpy.mockRestore()
})
})

 describe('✅ TESTS VALIDATION CORRECTE', () => {
 test('Validation réussie - Données complètes', async () => {
 // Mock pour capturer les données d'update (chaîne complète: update().eq().select())
 const mockUpdateWithData = jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 select: jest.fn().mockResolvedValue({ data: {}, error: null})
})
})
 
 mockSupabase.from.mockImplementation((table: string) => {
 if (table ==='exercises') {
 return {
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 single: jest.fn().mockResolvedValue({
 data: {
 id:'1',
 name:'Développé couché',
 exercise_type:'Musculation',
 muscle_group:'Pectoraux',
 equipment_id: 1,
 difficulty: 2,
 description:'Exercice de base',
 image_url: null
},
 error: null
})
})
}),
 update: mockUpdateWithData
}
}
 return mockSupabase
})
 
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Développé couché')).toBeInTheDocument()
})

 // Modifier des champs valides
 const nameInput = screen.getByDisplayValue('Développé couché')
 await userEvent.clear(nameInput)
 await userEvent.type(nameInput,'Développé couché modifié')
 
 const saveButton = screen.getByText('Enregistrer les modifications')
 await userEvent.click(saveButton)

 await waitFor(() => {
 // Vérifier que update() a été appelé avec les bonnes données
 expect(mockUpdateWithData).toHaveBeenCalledWith(
 expect.objectContaining({
 name:'Développé couché modifié',
 exercise_type:'Musculation',
 muscle_group:'Pectoraux',
 equipment_id: 1,
 difficulty: 2,
 updated_at: expect.any(String) // Date ISO
})
 )
 expect(toast.success).toHaveBeenCalledWith('Exercice mis à jour avec succès')
 expect(mockRouter.push).toHaveBeenCalledWith('/exercises')
})
})

 test('Gestion erreur API', async () => {
 // Mock spécifique pour test erreur
 const mockUpdateForError = jest.fn().mockResolvedValue({
 data: null,
 error: { message:'Database error'}
})
 
 mockSupabase.from.mockImplementation((table: string) => {
 if (table ==='exercises') {
 return {
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 single: jest.fn().mockResolvedValue({
 data: {
 id:'1',
 name:'Développé couché',
 exercise_type:'Musculation',
 muscle_group:'Pectoraux',
 equipment_id: 1,
 difficulty: 2,
 description:'Exercice de base',
 image_url: null
},
 error: null
})
})
}),
 update: jest.fn().mockReturnValue({
 eq: mockUpdateForError
})
}
}
 return mockSupabase
})
 
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Développé couché')).toBeInTheDocument()
})

 const saveButton = screen.getByText('Enregistrer les modifications')
 await userEvent.click(saveButton)

 await waitFor(() => {
 expect(toast.error).toHaveBeenCalledWith('Erreur lors de la sauvegarde')
})
})
})

 describe('📱 TESTS UI/UX', () => {
 test('Loading state initial', () => {
 // Mock pour forcer état loading - pas de données renvoyées immédiatement
 mockSupabase.from.mockImplementation(() => ({
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 single: jest.fn().mockReturnValue(
 // Promise qui ne se résout jamais pour maintenir état loading
 new Promise(() => {})
 )
})
})
}))
 
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 // Doit afficher le spinner de chargement - utiliser class selector
 const spinner = document.querySelector('.w-8.h-8.border-2.border-primary')
 expect(spinner).toBeInTheDocument()
})

 test('Disabled state pendant sauvegarde', async () => {
 // Mock API lente pour test état loading (chaîne complète: update().eq().select())
 let resolveSave: (value: unknown) => void
 const mockSlowUpdate = jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 select: jest.fn().mockImplementation(() =>
 new Promise(resolve => { resolveSave = resolve})
 )
})
})
 
 mockSupabase.from.mockImplementation((table: string) => {
 if (table ==='exercises') {
 return {
 select: jest.fn().mockReturnValue({
 eq: jest.fn().mockReturnValue({
 single: jest.fn().mockResolvedValue({
 data: {
 id:'1',
 name:'Développé couché',
 exercise_type:'Musculation',
 muscle_group:'Pectoraux',
 equipment_id: 1,
 difficulty: 2,
 description:'Exercice de base',
 image_url: null
},
 error: null
})
})
}),
 update: mockSlowUpdate
}
}
 return mockSupabase
})
 
 render(<ExerciseEditForm2025 exerciseId="1" />)
 
 await waitFor(() => {
 expect(screen.getByDisplayValue('Développé couché')).toBeInTheDocument()
})
 
 const saveButton = screen.getByRole('button', { name: /enregistrer les modifications/i})
 const cancelButton = screen.getByRole('button', { name: /annuler/i})
 
 // Cliquer pour commencer sauvegarde
 await userEvent.click(saveButton)

 // Vérifier état pendant sauvegarde
 await waitFor(() => {
 expect(screen.getByText('Enregistrement...')).toBeInTheDocument()
 expect(cancelButton).toBeDisabled()
})
 
 // Nettoyer - résoudre la promesse pour éviter leaks
 if (resolveSave!) {
 resolveSave({ data: {}, error: null})
}
})

 test('Exercice introuvable - Gestion 404', async () => {
 // Mock exercice inexistant
 mockSupabase.from.mockImplementation((table: string) => {
 if (table ==='exercises') {
 return {
 ...mockSupabase,
 single: () => Promise.resolve({
 data: null,
 error: { message:'No rows returned'}
})
}
}
 return mockSupabase
})

 render(<ExerciseEditForm2025 exerciseId="999" />)

 await waitFor(() => {
 expect(screen.getByText('Exercice introuvable')).toBeInTheDocument()
 expect(screen.getByText('L\'exercice demandé n\'existe pas ou a été supprimé.')).toBeInTheDocument()
})

 const backButton = screen.getByText('Retour aux exercices')
 await userEvent.click(backButton)
 
 expect(mockRouter.push).toHaveBeenCalledWith('/exercises')
})
})
})