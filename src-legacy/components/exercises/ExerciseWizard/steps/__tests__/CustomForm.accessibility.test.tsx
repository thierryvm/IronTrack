/**
 * Tests d'accessibilité WCAG 2.1 AA pour CustomForm
 * Focus sur les nouveaux champs optionnels et indicateur de complétion
 */

import React from'react'
import { render, screen, waitFor} from'@testing-library/react'
import userEvent from'@testing-library/user-event'
import'@testing-library/jest-dom'
import { CustomForm} from'../CustomForm'

// Mock des dépendances
jest.mock('@/utils/supabase/client', () => ({
 createClient: () => ({
 from: jest.fn().mockReturnValue({
 select: jest.fn().mockReturnValue({
 order: jest.fn().mockResolvedValue({
 data: [
 { id: 1, name:'Machine', description:'Machine de musculation'},
 { id: 2, name:'Rameur', description:'Rameur d\'endurance'}
 ],
 error: null
})
})
})
})
}))

jest.mock('@/utils/exerciseDuplicateDetection', () => ({
 detectExerciseDuplicates: jest.fn().mockResolvedValue({ isDuplicate: false})
}))

describe('CustomForm - Tests d\'Accessibilité WCAG 2.1 AA', () => {
 const defaultProps = {
 exerciseType:'Musculation' as const,
 onComplete: jest.fn(),
 onBack: jest.fn(),
 isEditMode: false
}

 beforeEach(() => {
 jest.clearAllMocks()
})

 describe('Accessibilité des Champs Optionnels', () => {
 it('doit indiquer clairement les champs optionnels', async () => {
 render(<CustomForm {...defaultProps} />)

 // Vérifier la présence des labels optionnels
 expect(screen.getByText('Description (optionnel)')).toBeInTheDocument()
 expect(screen.getByText('Instructions détaillées (optionnel)')).toBeInTheDocument()
})

 it('doit avoir des textes d\'aide descriptifs pour les champs optionnels', () => {
 render(<CustomForm {...defaultProps} />)

 // Texte d'aide pour description
 expect(screen.getByText(/une courte description aidera à identifier/i)).toBeInTheDocument()
 
 // Texte d'aide pour instructions
 expect(screen.getByText(/ces instructions aideront les utilisateurs/i)).toBeInTheDocument()
})

 it('doit marquer clairement les champs requis', () => {
 render(<CustomForm {...defaultProps} />)

 // Vérifier la présence des astérisques pour champs requis
 const requiredMarkers = screen.getAllByText('*')
 expect(requiredMarkers.length).toBeGreaterThan(0)
})
})

 describe('Indicateur de Complétion - Accessibilité', () => {
 it('doit afficher un indicateur de complétion visible', () => {
 render(<CustomForm {...defaultProps} />)

 // Vérifier la présence de l'indicateur initial
 const completionIndicator = screen.getByText(/profil exercice.*60%.*complet/i)
 expect(completionIndicator).toBeInTheDocument()

 // L'indicateur doit être visible (pas caché pour les lecteurs d'écran)
 expect(completionIndicator).toBeVisible()
 expect(completionIndicator).not.toHaveAttribute('aria-hidden','true')
})

 it('doit avoir des couleurs contrastées pour l\'indicateur', () => {
 render(<CustomForm {...defaultProps} />)

 // L'indicateur doit avoir une classe de couleur définie pour le contraste
 const indicator = screen.getByText(/60%.*complet/i)
 expect(indicator).toHaveClass(/text-orange-800/) // Couleur avec bon contraste
})
})

 describe('Navigation et Interaction', () => {
 it('doit avoir des champs focusables', async () => {
 render(<CustomForm {...defaultProps} />)

 await waitFor(() => {
 expect(screen.getByDisplayValue('Machine')).toBeInTheDocument()
})

 // Vérifier que les champs principaux peuvent recevoir le focus
 const nameInput = screen.getByPlaceholderText(/développé couché/i)
 const descriptionInput = screen.getByPlaceholderText(/décris brièvement/i)
 const instructionsInput = screen.getByPlaceholderText(/décris la technique/i)

 expect(nameInput).not.toHaveAttribute('disabled')
 expect(descriptionInput).not.toHaveAttribute('disabled') 
 expect(instructionsInput).not.toHaveAttribute('disabled')
})

 it('doit avoir des boutons de difficulté accessibles', () => {
 render(<CustomForm {...defaultProps} />)

 // Boutons de difficulté doivent être présents et interactifs
 const beginnerButton = screen.getByText('Débutant')
 const intermediateButton = screen.getByText('Intermédiaire')
 
 expect(beginnerButton).not.toHaveAttribute('disabled')
 expect(intermediateButton).not.toHaveAttribute('disabled')
})
})

 describe('Fonctionnalité des Champs Optionnels', () => {
 it('doit permettre de remplir les champs optionnels', async () => {
 const user = userEvent.setup()
 render(<CustomForm {...defaultProps} />)

 await waitFor(() => {
 expect(screen.getByDisplayValue('Machine')).toBeInTheDocument()
})

 // Remplir description
 const descriptionInput = screen.getByPlaceholderText(/décris brièvement/i)
 await user.type(descriptionInput,'Ma description test')
 expect(descriptionInput).toHaveValue('Ma description test')

 // Remplir instructions
 const instructionsInput = screen.getByPlaceholderText(/décris la technique/i)
 await user.type(instructionsInput,'Mes instructions test')
 expect(instructionsInput).toHaveValue('Mes instructions test')
})

 it('doit afficher le compteur de caractères pour les instructions', async () => {
 const user = userEvent.setup()
 render(<CustomForm {...defaultProps} />)

 // Vérifier compteur initial
 expect(screen.getByText('0/500')).toBeInTheDocument()

 // Ajouter du texte
 const instructionsInput = screen.getByPlaceholderText(/décris la technique/i)
 await user.type(instructionsInput,'Test')

 // Vérifier mise à jour du compteur
 await waitFor(() => {
 expect(screen.getByText('4/500')).toBeInTheDocument()
})
})
})

 describe('Messages d\'Aide et Conseils', () => {
 it('doit afficher des conseils adaptatifs selon le niveau de complétion', () => {
 render(<CustomForm {...defaultProps} />)

 // Vérifier la présence des conseils pour exercice peu complété
 expect(screen.getByText(/pour créer un exercice plus complet/i)).toBeInTheDocument()
 
 // Les conseils doivent être visibles et accessibles
 const adviceSection = screen.getByText(/pour créer un exercice plus complet/i).closest('div')
 expect(adviceSection).toBeVisible()
 expect(adviceSection).not.toHaveAttribute('aria-hidden','true')
})

 it('doit avoir des messages d\'aide contextuel pour chaque champ optionnel', () => {
 render(<CustomForm {...defaultProps} />)

 // Messages d'aide pour champs optionnels 
 expect(screen.getByText(/une courte description aidera/i)).toBeInTheDocument()
 expect(screen.getByText(/ces instructions aideront/i)).toBeInTheDocument()
 
 // Ces messages doivent être associés visuellement aux champs
 const descriptionHelp = screen.getByText(/une courte description aidera/i)
 const instructionsHelp = screen.getByText(/ces instructions aideront/i)
 
 expect(descriptionHelp).toBeVisible()
 expect(instructionsHelp).toBeVisible()
})
})

 describe('Validation de l\'Accessibilité Générale', () => {
 it('doit avoir une structure de formulaire sémantique', () => {
 const { container} = render(<CustomForm {...defaultProps} />)

 // Le composant doit contenir un formulaire HTML valide
 const form = container.querySelector('form')
 expect(form).toBeInTheDocument()
})

 it('doit avoir des éléments interactifs accessibles', () => {
 render(<CustomForm {...defaultProps} />)

 // Boutons principaux
 const continueButton = screen.getByText('Continuer')
 expect(continueButton).not.toHaveAttribute('disabled')
 expect(continueButton).toBeVisible()

 // Le formulaire ne doit pas avoir d'éléments cachés critiques
 const textInputs = screen.getAllByRole('textbox')
 textInputs.forEach(input => {
 expect(input).not.toHaveAttribute('aria-hidden','true')
})
})
})
})