import { render, screen, fireEvent} from'@testing-library/react'
import { ActionHierarchy, useStandardActions, type ActionConfig} from'../ActionHierarchy'
import { Plus, Eye, Edit, Trash2, Copy} from'lucide-react'

// Mock pour Framer Motion
jest.mock('framer-motion', () => ({
 motion: {
 button: ({ children, whileHover, whileTap, transition, ...props}: unknown) => 
 <button {...props}>{children}</button>
}
}))

describe('ActionHierarchy', () => {
 const mockActions: ActionConfig[] = [
 {
 type:'primary',
 label:'Ajouter',
 icon: <Plus className="h-5 w-5" />,
 onClick: jest.fn(),
 variant:'success',
 testId:'add-action'
},
 {
 type:'secondary', 
 label:'Voir',
 icon: <Eye className="h-6 w-6" />,
 onClick: jest.fn(),
 variant:'neutral',
 testId:'view-action'
},
 {
 type:'tertiary',
 label:'Modifier',
 icon: <Edit className="h-6 w-6" />,
 onClick: jest.fn(),
 variant:'neutral',
 testId:'edit-action'
},
 {
 type:'tertiary',
 label:'Supprimer',
 icon: <Trash2 className="h-6 w-6" />,
 onClick: jest.fn(),
 variant:'danger',
 testId:'delete-action'
}
 ]

 beforeEach(() => {
 jest.clearAllMocks()
})

 describe('Rendu de base', () => {
 it('rend toutes les actions fournies', () => {
 render(<ActionHierarchy actions={mockActions} />)

 expect(screen.getByTestId('add-action')).toBeInTheDocument()
 expect(screen.getByTestId('view-action')).toBeInTheDocument()
 expect(screen.getByTestId('edit-action')).toBeInTheDocument()
 expect(screen.getByTestId('delete-action')).toBeInTheDocument()
})

 it('applique les bonnes classes selon le type d\'action', () => {
 render(<ActionHierarchy actions={mockActions} />)

 // Action primaire avec gradient
 const primaryBtn = screen.getByTestId('add-action')
 expect(primaryBtn).toHaveClass('bg-gradient-to-r','from-green-500','to-green-600')

 // Action secondaire avec fond plat
 const secondaryBtn = screen.getByTestId('view-action')
 expect(secondaryBtn).toHaveClass('bg-gray-100','text-gray-700')

 // Action tertiaire minimaliste
 const tertiaryBtn = screen.getByTestId('edit-action')
 expect(tertiaryBtn).toHaveClass('text-gray-600','','hover:bg-background')
})

 it('applique les couleurs selon le variant', () => {
 render(<ActionHierarchy actions={mockActions} />)

 // Success variant pour primary
 const successBtn = screen.getByTestId('add-action')
 expect(successBtn).toHaveClass('from-green-500','to-green-600')

 // Danger variant pour tertiary
 const dangerBtn = screen.getByTestId('delete-action')
 expect(dangerBtn).toHaveClass('text-red-600','hover:bg-red-50')
})
})

 describe('Layouts', () => {
 it('applique layout horizontal par défaut', () => {
 render(<ActionHierarchy actions={mockActions} />)

 const container = screen.getByTestId('action-hierarchy')
 expect(container).toHaveClass('flex','space-x-2')
})

 it('applique layout vertical', () => {
 render(<ActionHierarchy actions={mockActions} layout="vertical" />)

 const container = screen.getByTestId('action-hierarchy')
 expect(container).toHaveClass('flex','flex-col','space-y-2')
})

 it('applique layout grid', () => {
 render(<ActionHierarchy actions={mockActions} layout="grid" />)

 const container = screen.getByTestId('action-hierarchy')
 expect(container).toHaveClass('grid','grid-cols-2','gap-2')
})

 it('fait flex-1 les actions primaires en layout horizontal', () => {
 render(<ActionHierarchy actions={mockActions} />)

 // L'action primaire devrait être dans un div flex-1
 const primaryContainer = screen.getByTestId('add-action').parentElement
 expect(primaryContainer).toHaveClass('flex-1')
})
})

 describe('Interactions', () => {
 it('exécute les callbacks onClick', () => {
 render(<ActionHierarchy actions={mockActions} />)

 fireEvent.click(screen.getByTestId('add-action'))
 fireEvent.click(screen.getByTestId('view-action'))
 fireEvent.click(screen.getByTestId('edit-action'))
 fireEvent.click(screen.getByTestId('delete-action'))

 expect(mockActions[0].onClick).toHaveBeenCalledTimes(1)
 expect(mockActions[1].onClick).toHaveBeenCalledTimes(1)
 expect(mockActions[2].onClick).toHaveBeenCalledTimes(1)
 expect(mockActions[3].onClick).toHaveBeenCalledTimes(1)
})

 it('désactive les actions disabled', () => {
 const disabledActions = [
 { ...mockActions[0], disabled: true}
 ]
 
 render(<ActionHierarchy actions={disabledActions} />)

 const disabledBtn = screen.getByTestId('add-action')
 expect(disabledBtn).toBeDisabled()
 expect(disabledBtn).toHaveClass('disabled:opacity-50','disabled:cursor-not-allowed')
})
})

 describe('Accessibilité', () => {
 it('utilise aria-label personnalisé quand fourni', () => {
 const actionsWithAria = [
 { ...mockActions[0], ariaLabel:'Ajouter une nouvelle performance'}
 ]
 
 render(<ActionHierarchy actions={actionsWithAria} />)

 expect(screen.getByLabelText('Ajouter une nouvelle performance')).toBeInTheDocument()
})

 it('utilise le label comme aria-label par défaut', () => {
 render(<ActionHierarchy actions={[mockActions[1]]} />)

 expect(screen.getByLabelText('Voir')).toBeInTheDocument()
})

 it('a des focus rings appropriés', () => {
 render(<ActionHierarchy actions={mockActions} />)

 expect(screen.getByTestId('add-action')).toHaveClass('focus:ring-2','focus:ring-offset-2')
 expect(screen.getByTestId('view-action')).toHaveClass('focus:ring-2','focus:ring-offset-2')
 expect(screen.getByTestId('edit-action')).toHaveClass('focus:ring-1')
})
})

 describe('Responsive', () => {
 it('cache les labels des actions tertiaires sur mobile', () => {
 render(<ActionHierarchy actions={mockActions} />)

 const tertiaryBtnLabel = screen.getByTestId('edit-action').querySelector('span:last-child')
 expect(tertiaryBtnLabel).toHaveClass('hidden','sm:inline')
})

 it('garde les labels des actions primaires/secondaires visibles', () => {
 render(<ActionHierarchy actions={mockActions} />)

 const primaryBtnLabel = screen.getByTestId('add-action').querySelector('span:last-child')
 const secondaryBtnLabel = screen.getByTestId('view-action').querySelector('span:last-child')
 
 expect(primaryBtnLabel).not.toHaveClass('hidden')
 expect(secondaryBtnLabel).not.toHaveClass('hidden')
})
})

 describe('Classes personnalisées', () => {
 it('applique className sur le container', () => {
 render(<ActionHierarchy actions={mockActions} className="custom-container" />)

 expect(screen.getByTestId('action-hierarchy')).toHaveClass('custom-container')
})

 it('applique className sur les actions individuelles', () => {
 const customActions = [
 { ...mockActions[0], className:'custom-button'}
 ]
 
 render(<ActionHierarchy actions={customActions} />)

 expect(screen.getByTestId('add-action')).toHaveClass('custom-button')
})
})

 describe('Variantes de couleur complètes', () => {
 const variantActions: ActionConfig[] = [
 {
 type:'primary',
 label:'Success',
 icon: <Plus />,
 onClick: jest.fn(),
 variant:'success',
 testId:'success-primary'
},
 {
 type:'primary', 
 label:'Danger',
 icon: <Trash2 />,
 onClick: jest.fn(),
 variant:'danger',
 testId:'danger-primary'
},
 {
 type:'secondary',
 label:'Warning',
 icon: <Edit />,
 onClick: jest.fn(),
 variant:'warning',
 testId:'warning-secondary'
}
 ]

 it('applique toutes les variantes de couleur correctement', () => {
 render(<ActionHierarchy actions={variantActions} />)

 expect(screen.getByTestId('success-primary')).toHaveClass('from-green-500','to-green-600')
 expect(screen.getByTestId('danger-primary')).toHaveClass('from-red-500','to-red-600')
 expect(screen.getByTestId('warning-secondary')).toHaveClass('bg-yellow-100','text-yellow-700')
})
})
})

describe('useStandardActions', () => {
 // Test du hook avec un composant de test
 function TestComponent() {
 const {
 createAddPerformanceAction,
 createViewDetailsAction,
 createEditAction,
 createDeleteAction,
 createDuplicateAction
} = useStandardActions()

 const actions = [
 createAddPerformanceAction(jest.fn()),
 createViewDetailsAction(jest.fn()),
 createEditAction(jest.fn()),
 createDeleteAction(jest.fn()),
 createDuplicateAction(jest.fn())
 ]

 return <ActionHierarchy actions={actions} />
}

 it('crée les actions standards avec les bonnes configurations', () => {
 render(<TestComponent />)

 // Vérifier que toutes les actions standards sont créées
 expect(screen.getByText('Performance')).toBeInTheDocument()
 expect(screen.getByText('Détails')).toBeInTheDocument()
 expect(screen.getByText('Modifier')).toBeInTheDocument()
 expect(screen.getByText('Supprimer')).toBeInTheDocument()
 expect(screen.getByText('Dupliquer')).toBeInTheDocument()

 // Vérifier les types d'actions
 expect(screen.getByText('Performance').closest('button')).toHaveClass('bg-gradient-to-r')
 expect(screen.getByText('Détails').closest('button')).toHaveClass('bg-gray-100')
 expect(screen.getByText('Supprimer').closest('button')).toHaveClass('text-red-600')
})

 it('crée des actions avec les aria-labels appropriés', () => {
 render(<TestComponent />)

 expect(screen.getByLabelText('Ajouter une nouvelle performance')).toBeInTheDocument()
 expect(screen.getByLabelText('Voir les détails')).toBeInTheDocument()
 expect(screen.getByLabelText('Modifier cet élément')).toBeInTheDocument()
 expect(screen.getByLabelText('Supprimer cet élément')).toBeInTheDocument()
 expect(screen.getByLabelText('Dupliquer cet élément')).toBeInTheDocument()
})
})