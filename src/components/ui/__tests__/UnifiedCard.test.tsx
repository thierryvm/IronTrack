import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { UnifiedCard, CardHeader, CardActions } from '../UnifiedCard'
import { Edit, Trash2, Eye, Plus } from 'lucide-react'

// Mock pour Framer Motion - Filtre les props spécifiques à Framer Motion
jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, whileHover, transition, ...props }: unknown) => <div {...props}>{children}</div>
  }
}))

describe('UnifiedCard', () => {
  const mockActions = [
    {
      label: 'Modifier',
      icon: <Edit className="h-6 w-6" />,
      onClick: jest.fn()
    },
    {
      label: 'Supprimer',
      icon: <Trash2 className="h-6 w-6" />,
      onClick: jest.fn(),
      danger: true
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rend le contenu de la carte correctement', () => {
    render(
      <UnifiedCard testId="test-card">
        <div>Contenu de test</div>
      </UnifiedCard>
    )

    expect(screen.getByTestId('test-card')).toBeInTheDocument()
    expect(screen.getByText('Contenu de test')).toBeInTheDocument()
  })

  it('affiche le menu dropdown quand il y a des actions', () => {
    render(
      <UnifiedCard actions={mockActions} testId="test-card">
        <div>Contenu</div>
      </UnifiedCard>
    )

    expect(screen.getByTestId('card-menu-button')).toBeInTheDocument()
    expect(screen.getByLabelText('Actions')).toBeInTheDocument()
  })

  it('ouvre et ferme le menu dropdown au clic', async () => {
    render(
      <UnifiedCard actions={mockActions} testId="test-card">
        <div>Contenu</div>
      </UnifiedCard>
    )

    const menuButton = screen.getByTestId('card-menu-button')
    
    // Menu fermé initialement
    expect(screen.queryByTestId('card-dropdown-menu')).not.toBeInTheDocument()
    
    // Ouvrir le menu
    fireEvent.click(menuButton)
    expect(screen.getByTestId('card-dropdown-menu')).toBeInTheDocument()
    
    // Vérifier les actions
    expect(screen.getByText('Modifier')).toBeInTheDocument()
    expect(screen.getByText('Supprimer')).toBeInTheDocument()
  })

  it('exécute les actions du menu dropdown', async () => {
    render(
      <UnifiedCard actions={mockActions} testId="test-card">
        <div>Contenu</div>
      </UnifiedCard>
    )

    // Ouvrir le menu
    fireEvent.click(screen.getByTestId('card-menu-button'))
    
    // Cliquer sur une action
    fireEvent.click(screen.getByTestId('card-action-0'))
    
    expect(mockActions[0].onClick).toHaveBeenCalledTimes(1)
  })

  it('ferme le menu après clic sur une action', async () => {
    render(
      <UnifiedCard actions={mockActions} testId="test-card">
        <div>Contenu</div>
      </UnifiedCard>
    )

    // Ouvrir le menu
    fireEvent.click(screen.getByTestId('card-menu-button'))
    expect(screen.getByTestId('card-dropdown-menu')).toBeInTheDocument()
    
    // Cliquer sur une action
    fireEvent.click(screen.getByTestId('card-action-0'))
    
    // Menu devrait se fermer
    await waitFor(() => {
      expect(screen.queryByTestId('card-dropdown-menu')).not.toBeInTheDocument()
    })
  })

  it('applique les styles de danger aux actions dangereuses', () => {
    render(
      <UnifiedCard actions={mockActions} testId="test-card">
        <div>Contenu</div>
      </UnifiedCard>
    )

    fireEvent.click(screen.getByTestId('card-menu-button'))
    
    const dangerAction = screen.getByTestId('card-action-1')
    expect(dangerAction).toHaveClass('text-red-600', 'hover:bg-red-50')
  })

  it('empêche la propagation des clics sur le menu', () => {
    const onCardClick = jest.fn()
    
    render(
      <UnifiedCard actions={mockActions} onCardClick={onCardClick} testId="test-card">
        <div>Contenu</div>
      </UnifiedCard>
    )

    // Clic sur le bouton menu ne doit pas déclencher onCardClick
    fireEvent.click(screen.getByTestId('card-menu-button'))
    expect(onCardClick).not.toHaveBeenCalled()

    // Clic sur la carte doit déclencher onCardClick
    fireEvent.click(screen.getByTestId('test-card'))
    expect(onCardClick).toHaveBeenCalledTimes(1)
  })
})

describe('CardHeader', () => {
  it('rend le titre et sous-titre correctement', () => {
    render(
      <CardHeader 
        title="Titre test" 
        subtitle="Sous-titre test"
      />
    )

    expect(screen.getByText('Titre test')).toBeInTheDocument()
    expect(screen.getByText('Sous-titre test')).toBeInTheDocument()
  })

  it('affiche le badge avec les bonnes couleurs', () => {
    render(
      <CardHeader 
        title="Test" 
        badge={{ text: 'Débutant', color: 'green' }}
      />
    )

    const badge = screen.getByText('Débutant')
    expect(badge).toHaveClass('bg-green-100', 'text-green-700')
  })

  it('affiche l\'icône quand fournie', () => {
    render(
      <CardHeader 
        title="Test" 
        icon={<Edit data-testid="header-icon" />}
      />
    )

    expect(screen.getByTestId('header-icon')).toBeInTheDocument()
  })
})

describe('CardActions', () => {
  const mockCardActions = [
    {
      label: 'Détails',
      icon: <Eye className="h-6 w-6" />,
      onClick: jest.fn(),
      variant: 'primary' as const
    },
    {
      label: 'Ajouter',
      icon: <Plus className="h-6 w-6" />,
      onClick: jest.fn(),
      variant: 'success' as const
    }
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('rend toutes les actions avec les bonnes couleurs', () => {
    render(<CardActions actions={mockCardActions} />)

    const detailsBtn = screen.getByRole('button', { name: /détails/i })
    const addBtn = screen.getByRole('button', { name: /ajouter/i })

    expect(detailsBtn).toHaveClass('bg-orange-600', 'text-white')
    expect(addBtn).toHaveClass('bg-green-500', 'text-white')
  })

  it('exécute les callbacks au clic', () => {
    render(<CardActions actions={mockCardActions} />)

    fireEvent.click(screen.getByRole('button', { name: /détails/i }))
    fireEvent.click(screen.getByRole('button', { name: /ajouter/i }))

    expect(mockCardActions[0].onClick).toHaveBeenCalledTimes(1)
    expect(mockCardActions[1].onClick).toHaveBeenCalledTimes(1)
  })

  it('applique les classes personnalisées', () => {
    const customActions = [{
      ...mockCardActions[0],
      className: 'custom-class'
    }]

    render(<CardActions actions={customActions} />)

    expect(screen.getByRole('button', { name: /détails/i }))
      .toHaveClass('custom-class')
  })
})