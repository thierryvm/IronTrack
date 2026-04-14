import { render, screen, fireEvent, waitFor} from'@testing-library/react'
import { ExerciseCard2025} from'../ExerciseCard2025'
import { Plus, Eye, Edit, Trash2, Copy} from'lucide-react'

// Mock pour Framer Motion
jest.mock('framer-motion', () => ({
 motion: {
 div: ({ children, whileHover, transition, ...props}: unknown) => <div {...props}>{children}</div>,
 button: ({ children, whileHover, transition, whileTap, ...props}: unknown) => <button {...props}>{children}</button>
}
}))

// Mock pour Next.js Image - Filtre les props spécifiques à Next.js
jest.mock('next/image', () => ({
 __esModule: true,
 default: ({ src, alt, width, height, className, loading, placeholder, blurDataURL, sizes, fill, ...props}: unknown) => 
 <img src={src} alt={alt} width={width} height={height} className={className} {...props} />
}))

const mockExercise = {
 id: 1,
 name:'Développé couché',
 muscle_group:'Pectoraux',
 equipment:'Barre olympique',
 difficulty:'Intermédiaire' as const,
 exercise_type:'Musculation' as const,
 image_url:'/test-image.jpg'
}

const mockPerformanceMusculation = {
 weight: 80,
 reps: 8,
 sets: 3,
 performed_at:'2025-01-29T10:00:00Z'
}

const mockPerformanceCardio = {
 distance: 2000,
 duration: 510, // 8:30
 stroke_rate: 28,
 watts: 180,
 performed_at:'2025-01-29T10:00:00Z'
}

const mockCardioExercise = {
 ...mockExercise,
 id: 2,
 name:'Rameur',
 muscle_group:'Corps entier',
 equipment:'Rameur',
 exercise_type:'Cardio' as const
}

describe('ExerciseCard2025', () => {
 const mockCallbacks = {
 onAddPerformance: jest.fn(),
 onViewDetails: jest.fn(),
 onDelete: jest.fn(),
 onDuplicate: jest.fn()
}

 beforeEach(() => {
 jest.clearAllMocks()
})

 describe('Rendu de base', () => {
 it('affiche les informations essentielles de l\'exercice', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 lastPerformance={mockPerformanceMusculation}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 testId="exercise-card"
 />
 )

 expect(screen.getByText('Développé couché')).toBeInTheDocument()
 expect(screen.getByText('Pectoraux')).toBeInTheDocument()
 expect(screen.getByText('Barre olympique')).toBeInTheDocument()
 expect(screen.getByText('Intermédiaire')).toBeInTheDocument()
})

 it('affiche l\'image avec les bonnes props Next.js', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 const image = screen.getByAltText('Photo de Développé couché')
 expect(image).toBeInTheDocument()
 expect(image).toHaveAttribute('src','/test-image.jpg')
})

 it('affiche un placeholder quand pas d\'image', () => {
 const exerciseWithoutImage = { ...mockExercise, image_url: undefined}
 
 render(
 <ExerciseCard2025
 exercise={exerciseWithoutImage}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 // Le placeholder doit contenir l'icône selon le type d'exercice
 expect(document.querySelector('.bg-gradient-to-br')).toBeInTheDocument()
})
})

 describe('Hiérarchie d\'actions', () => {
 it('affiche l\'action primaire en évidence', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 const primaryBtn = screen.getByTestId('add-performance-btn')
 expect(primaryBtn).toHaveClass('bg-gradient-to-r','from-orange-600','to-red-500')
 expect(primaryBtn).toHaveTextContent('Performance')
})

 it('affiche l\'action secondaire avec style discret', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

      const secondaryBtn = screen.getByTestId('view-details-btn')
      expect(secondaryBtn).toHaveClass('bg-muted', 'text-foreground')
      expect(secondaryBtn).toHaveTextContent('Détails')
    })

 it('cache le bouton supprimer quand pas d\'action delete', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
})

 it('affiche le bouton supprimer quand action delete disponible', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 )

 expect(screen.getByTestId('delete-button')).toBeInTheDocument()
})
})

 describe('Actions directes', () => {
 it('affiche tous les boutons quand toutes les actions sont fournies', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 )

 // Vérifier que tous les boutons directs sont visibles
 expect(screen.getByTestId('add-performance-btn')).toBeInTheDocument()
 expect(screen.getByTestId('view-details-btn')).toBeInTheDocument()
 expect(screen.getByTestId('delete-button')).toBeInTheDocument()
})


 it('stylise correctement le bouton supprimer comme action dangereuse', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 )

 // Vérifier styles du bouton delete (action dangereuse)
 const deleteButton = screen.getByTestId('delete-button')
 const className = deleteButton.className
 expect(className).toContain('hover:text-destructive')
 expect(className).toContain('hover:bg-red-50')
})

 it('affiche uniquement les boutons pour les actions fournies', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 // Pas d'onDelete fourni
 />
 )

 // Boutons fournis présents
 expect(screen.getByTestId('add-performance-btn')).toBeInTheDocument()
 expect(screen.getByTestId('view-details-btn')).toBeInTheDocument()
 
 // Bouton non fourni absent
 expect(screen.queryByTestId('delete-button')).not.toBeInTheDocument()
})
})

 describe('Actions callbacks', () => {
 it('exécute onAddPerformance au clic sur action primaire', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 fireEvent.click(screen.getByTestId('add-performance-btn'))
 expect(mockCallbacks.onAddPerformance).toHaveBeenCalledWith(1)
})

 it('exécute onViewDetails au clic sur action secondaire', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 fireEvent.click(screen.getByTestId('view-details-btn'))
 expect(mockCallbacks.onViewDetails).toHaveBeenCalledWith(1)
})

 it('exécute le callback delete du bouton direct', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 )

 // Cliquer directement sur le bouton delete
 fireEvent.click(screen.getByTestId('delete-button'))
 
 expect(mockCallbacks.onDelete).toHaveBeenCalledWith(1)
})
})

 describe('Affichage des performances', () => {
 it('formate correctement les performances de musculation', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 lastPerformance={mockPerformanceMusculation}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 expect(screen.getByText((content) => content.includes('80kg') && content.includes('reps') && content.includes('sets'))).toBeInTheDocument()
 expect(screen.getByText('29/01/2025')).toBeInTheDocument()
})

 it('formate correctement les performances cardio', () => {
 render(
 <ExerciseCard2025
 exercise={mockCardioExercise}
 lastPerformance={mockPerformanceCardio}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 // Rameur: distance + durée + SPM (maxDisplayItems=3 pour cardio non-running)
 expect(screen.getByText((content) => content.includes('2000m') && content.includes('8:30') && content.includes('28 SPM'))).toBeInTheDocument()
})

 it('affiche message par défaut sans performance', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 expect(screen.getByText('Aucune performance enregistrée')).toBeInTheDocument()
})
})

 describe('Accessibilité', () => {
 it('a des labels ARIA appropriés', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 )

 expect(screen.getByLabelText('Ajouter une nouvelle performance pour Développé couché')).toBeInTheDocument()
 expect(screen.getByLabelText('Voir les détails de Développé couché')).toBeInTheDocument()
 expect(screen.getByLabelText('Supprimer Développé couché')).toBeInTheDocument()
})

 it('vérifie les boutons d\'action directs', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 )

 // Vérifier que les boutons directs existent
 expect(screen.getByTestId('add-performance-btn')).toBeInTheDocument()
 expect(screen.getByTestId('view-details-btn')).toBeInTheDocument()
 expect(screen.getByTestId('delete-button')).toBeInTheDocument()
})

 it('empêche la propagation des clics sur les boutons d\'action', () => {
 const onCardClick = jest.fn()
 
 render(
 <div onClick={onCardClick}>
 <ExerciseCard2025
 exercise={mockExercise}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 onDelete={mockCallbacks.onDelete}
 />
 </div>
 )

 // Clic sur boutons d'action ne doit pas déclencher le parent
 fireEvent.click(screen.getByTestId('delete-button'))
 expect(onCardClick).not.toHaveBeenCalled()
 
 fireEvent.click(screen.getByTestId('add-performance-btn'))
 expect(onCardClick).not.toHaveBeenCalled()
})
})

 describe('Variantes de design', () => {
 it('applique les classes pour variante compact', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 variant="compact"
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 testId="compact-card"
 />
 )

 // Les classes de variante sont sur le Card interne, pas sur le wrapper motion.div
 const wrapper = screen.getByTestId('compact-card')
 expect(wrapper.firstElementChild).toHaveClass('max-w-sm')
})

 it('applique les classes pour variante detailed', () => {
 render(
 <ExerciseCard2025
 exercise={mockExercise}
 variant="detailed"
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 testId="detailed-card"
 />
 )

 // Les classes de variante sont sur le Card interne, pas sur le wrapper motion.div
 const wrapper = screen.getByTestId('detailed-card')
 expect(wrapper.firstElementChild).toHaveClass('max-w-2xl')
})
})

 describe('Couleurs de difficulté', () => {
 it('applique les bonnes couleurs pour chaque difficulté', () => {
 const difficulties = [
 { level:'Débutant' as const, classes: ['bg-green-100','text-green-700']},
 { level:'Intermédiaire' as const, classes: ['bg-yellow-100','text-yellow-700']},
 { level:'Avancé' as const, classes: ['bg-red-100','text-red-700']}
 ]

 difficulties.forEach(({ level, classes}) => {
 const { unmount} = render(
 <ExerciseCard2025
 exercise={{ ...mockExercise, difficulty: level}}
 onAddPerformance={mockCallbacks.onAddPerformance}
 onViewDetails={mockCallbacks.onViewDetails}
 />
 )

 const badge = screen.getByText(level)
 classes.forEach(className => {
 expect(badge).toHaveClass(className)
})

 unmount()
})
})
})
})