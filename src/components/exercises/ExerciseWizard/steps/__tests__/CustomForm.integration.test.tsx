import React from 'react'
import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import '@testing-library/jest-dom'
import { CustomForm } from '../CustomForm'

// Mock des dépendances
jest.mock('@/utils/supabase/client', () => ({
  createClient: () => ({
    from: jest.fn().mockReturnValue({
      select: jest.fn().mockReturnValue({
        order: jest.fn().mockResolvedValue({
          data: [
            { id: 1, name: 'Machine', description: 'Machine de musculation' },
            { id: 2, name: 'Rameur', description: 'Rameur d\'endurance' }
          ],
          error: null
        })
      })
    })
  })
}))

jest.mock('@/utils/exerciseDuplicateDetection', () => ({
  detectExerciseDuplicates: jest.fn().mockResolvedValue({ isDuplicate: false })
}))

describe('CustomForm - Test d\'Intégration Champs Optionnels', () => {
  const mockOnComplete = jest.fn()
  const defaultProps = {
    exerciseType: 'Musculation' as const,
    onComplete: mockOnComplete,
    onBack: jest.fn(),
    isEditMode: false
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('doit implémenter la fonctionnalité complète des champs optionnels', async () => {
    const user = userEvent.setup()
    render(<CustomForm {...defaultProps} />)

    // 1. Vérifier la présence des nouveaux éléments
    expect(screen.getByText('Instructions détaillées (optionnel)')).toBeInTheDocument()
    expect(screen.getByText('Profil exercice: 60% complet')).toBeInTheDocument()

    // 2. Attendre le chargement des équipements
    await waitFor(() => {
      expect(screen.getByDisplayValue('Machine')).toBeInTheDocument()
    })

    // 3. Remplir les champs requis + description
    await user.type(screen.getByPlaceholderText('Ex: Développé couché incliné'), 'Test Exercice Complet')
    await user.type(screen.getByPlaceholderText('Décris brièvement l\'exercice...'), 'Super description')

    // 4. Vérifier l'évolution du score de complétion
    expect(screen.getByText('Profil exercice: 80% complet')).toBeInTheDocument()

    // 5. Ajouter les instructions
    await user.type(screen.getByPlaceholderText(/Décris la technique d'exécution/), 'Instructions détaillées de technique')

    // 6. Vérifier le score final et l'émoji
    expect(screen.getByText('Profil exercice: 95% complet')).toBeInTheDocument()
    expect(screen.getByText('✨')).toBeInTheDocument()

    // 7. Sélectionner difficulté
    await user.click(screen.getByText('Avancé'))

    // 8. Soumettre et vérifier la soumission
    await user.click(screen.getByText('Continuer'))

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Exercice Complet',
          description: 'Super description',
          instructions: 'Instructions détaillées de technique',
          difficulty: 'Avancé',
          exercise_type: 'Musculation',
          equipment_id: 1
        })
      )
    }, { timeout: 5000 })
  })

  it('doit permettre création minimale sans champs optionnels', async () => {
    const user = userEvent.setup()
    render(<CustomForm {...defaultProps} />)

    // Attendre le chargement
    await waitFor(() => {
      expect(screen.getByDisplayValue('Machine')).toBeInTheDocument()
    })

    // Remplir seulement les champs requis
    await user.type(screen.getByPlaceholderText('Ex: Développé couché incliné'), 'Exercice Minimal')
    await user.click(screen.getByText('Intermédiaire'))

    // Vérifier le score minimal
    expect(screen.getByText('Profil exercice: 60% complet')).toBeInTheDocument()

    // Soumettre
    await user.click(screen.getByText('Continuer'))

    await waitFor(() => {
      expect(mockOnComplete).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Exercice Minimal',
          difficulty: 'Intermédiaire',
          equipment_id: 1,
          // description et instructions doivent être undefined ou ""
        })
      )
    }, { timeout: 5000 })

    // Vérifier que les champs optionnels ne sont pas requis (peuvent être vides)
    const call = mockOnComplete.mock.calls[0][0]
    expect(call.description || undefined).toBeUndefined()
    expect(call.instructions || undefined).toBeUndefined()
  })

  it('doit afficher le compteur de caractères pour les instructions', async () => {
    const user = userEvent.setup()
    render(<CustomForm {...defaultProps} />)

    // Vérifier compteur initial
    expect(screen.getByText('0/500')).toBeInTheDocument()

    // Taper du texte
    const textarea = screen.getByPlaceholderText(/Décris la technique d'exécution/)
    await user.type(textarea, 'Test instructions')

    // Vérifier mise à jour du compteur
    expect(screen.getByText('17/500')).toBeInTheDocument()
  })
})