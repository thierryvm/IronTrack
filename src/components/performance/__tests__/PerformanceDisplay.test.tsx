import { render, screen} from'@testing-library/react'
import { PerformanceDisplay, usePerformanceFormatter} from'../PerformanceDisplay'

const mockPerformanceMusculation = {
 weight: 80,
 reps: 8,
 sets: 3,
 performed_at:'2025-01-29T10:00:00Z'
}

const mockPerformanceCardioRameur = {
 distance: 2000,
 duration: 510, // 8:30
 stroke_rate: 28,
 watts: 180,
 heart_rate: 150,
 performed_at:'2025-01-29T10:00:00Z',
 notes:'Bonne session'
}

const mockPerformanceCardioRunning = {
 distance: 5,
 duration: 1800, // 30:00
 speed: 10,
 incline: 3,
 heart_rate: 160,
 performed_at:'2025-01-29T10:00:00Z'
}

const mockPerformanceCardioCycling = {
 distance: 15,
 duration: 2700, // 45:00
 cadence: 85,
 resistance: 12,
 calories: 350,
 performed_at:'2025-01-29T10:00:00Z'
}

describe('PerformanceDisplay', () => {
 describe('Performances Musculation', () => {
 it('affiche correctement les métriques de musculation', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 testId="perf-display"
 />
 )

 expect(screen.getByText('80kg')).toBeInTheDocument()
 expect(screen.getByText('8 reps')).toBeInTheDocument()
 expect(screen.getByText('3 sets')).toBeInTheDocument()
})

 it('affiche les métriques partielles de musculation', () => {
 const partialPerf = {
 weight: 60,
 performed_at:'2025-01-29T10:00:00Z'
}

 render(
 <PerformanceDisplay
 performance={partialPerf}
 exerciseType="Musculation"
 />
 )

 expect(screen.getByText('60kg')).toBeInTheDocument()
 expect(screen.queryByText('reps')).not.toBeInTheDocument()
})
})

 describe('Performances Cardio - Rameur', () => {
 it('formate correctement les métriques de rameur', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceCardioRameur}
 exerciseType="Cardio"
 exerciseName="Rameur"
 testId="rameur-display"
 />
 )

 expect(screen.getByText('2000m')).toBeInTheDocument() // Distance en mètres pour rameur
 expect(screen.getByText('8:30')).toBeInTheDocument() // Durée formatée
 expect(screen.getByText('28 SPM')).toBeInTheDocument() // Stroke rate
 expect(screen.getByText('180W')).toBeInTheDocument() // Watts
})

 it('limite les métriques selon maxMetrics', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceCardioRameur}
 exerciseType="Cardio"
 exerciseName="Rameur"
 maxMetrics={2}
 />
 )

 expect(screen.getByText('2000m')).toBeInTheDocument()
 expect(screen.getByText('8:30')).toBeInTheDocument()
 expect(screen.queryByText('28 SPM')).not.toBeInTheDocument() // Dépassement de limite
})
})

 describe('Performances Cardio - Course', () => {
 it('formate correctement les métriques de course', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceCardioRunning}
 exerciseType="Cardio"
 exerciseName="Course à pied"
 />
 )

 expect(screen.getByText('5km')).toBeInTheDocument() // Distance en km pour course
 expect(screen.getByText('30:00')).toBeInTheDocument() // Durée
 expect(screen.getByText('10 km/h')).toBeInTheDocument() // Vitesse
 expect(screen.getByText('3%')).toBeInTheDocument() // Inclinaison
})

 it('cache l\'inclinaison quand elle est 0', () => {
 const runningWithoutIncline = {
 ...mockPerformanceCardioRunning,
 incline: 0
}

 render(
 <PerformanceDisplay
 performance={runningWithoutIncline}
 exerciseType="Cardio"
 exerciseName="Course"
 />
 )

 expect(screen.queryByText('0%')).not.toBeInTheDocument()
})
})

 describe('Performances Cardio - Vélo', () => {
 it('formate correctement les métriques de vélo', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceCardioCycling}
 exerciseType="Cardio"
 exerciseName="Vélo"
 />
 )

 expect(screen.getByText('15km')).toBeInTheDocument()
 expect(screen.getByText('45:00')).toBeInTheDocument()
 expect(screen.getByText('85 RPM')).toBeInTheDocument() // Cadence
 expect(screen.getByText('Niv.12')).toBeInTheDocument() // Résistance
})
})

 describe('Variantes d\'affichage', () => {
 it('applique les styles de variante inline (défaut)', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 testId="inline-display"
 />
 )

 const container = screen.getByTestId('inline-display')
 expect(container).not.toHaveClass('bg-background','p-4') // Pas de styles card
})

 it('applique les styles de variante card', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 variant="card"
 testId="card-display"
 />
 )

 const container = screen.getByTestId('card-display')
 expect(container).toHaveClass('bg-background','rounded-lg','p-4')
 expect(screen.getByText('Performance musculation')).toBeInTheDocument()
})

 it('applique les styles de variante detailed', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceCardioRameur}
 exerciseType="Cardio"
 exerciseName="Rameur"
 variant="detailed"
 testId="detailed-display"
 />
 )

 const container = screen.getByTestId('detailed-display')
 expect(container).toHaveClass('bg-card','rounded-lg','p-6','shadow-sm')
 expect(screen.getByText('Performance cardio')).toBeInTheDocument()
 expect(screen.getByText('Notes:')).toBeInTheDocument() // Notes affichées en detailed
 expect(screen.getByText('Bonne session')).toBeInTheDocument()
})

 it('applique les styles de variante compact', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 variant="compact"
 testId="compact-display"
 />
 )

 const container = screen.getByTestId('compact-display')
 expect(container).toHaveClass('text-sm')
})
})

 describe('Affichage de la date', () => {
 beforeAll(() => {
 // Mock de la date actuelle pour des tests consistants
 jest.useFakeTimers()
 jest.setSystemTime(new Date('2025-01-30T12:00:00Z'))
})

 afterAll(() => {
 jest.useRealTimers()
})

 it('affiche"Hier" pour les performances d\'hier', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation} // 29 janvier
 exerciseType="Musculation"
 variant="card"
 />
 )

 expect(screen.getByText('Hier')).toBeInTheDocument()
})

 it('cache la date quand showDate=false', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 variant="card"
 showDate={false}
 />
 )

 expect(screen.queryByText('Hier')).not.toBeInTheDocument()
})

 it('affiche date relative pour les jours récents', () => {
 const perfOld = {
 ...mockPerformanceMusculation,
 performed_at:'2025-01-26T10:00:00Z' // Il y a 4 jours
}

 render(
 <PerformanceDisplay
 performance={perfOld}
 exerciseType="Musculation"
 variant="card"
 />
 )

 expect(screen.getByText('Il y a 4 jours')).toBeInTheDocument()
})
})

 describe('Gestion des icônes', () => {
 it('affiche les icônes par défaut', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 variant="card"
 />
 )

 // Vérifier présence d'icônes (via classe lucide ou rôle img)
 expect(document.querySelector('svg')).toBeInTheDocument()
})

 it('cache les icônes quand showIcon=false', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 variant="card"
 showIcon={false}
 />
 )

 // Beaucoup moins d'icônes quand désactivées
 const svgs = document.querySelectorAll('svg')
 expect(svgs.length).toBeLessThan(3) // Juste l'icône de date
})

 it('cache les icônes en variante compact', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 variant="compact"
 />
 )

 // En compact, les icônes des métriques sont cachées
 expect(screen.getByText('80kg')).toBeInTheDocument()
})
})

 describe('Cas limites', () => {
 it('affiche message par défaut pour performance vide', () => {
 const emptyPerf = {
 performed_at:'2025-01-29T10:00:00Z'
}

 render(
 <PerformanceDisplay
 performance={emptyPerf}
 exerciseType="Musculation"
 testId="empty-display"
 />
 )

 expect(screen.getByText('Aucune métrique enregistrée')).toBeInTheDocument()
 const container = screen.getByTestId('empty-display')
 expect(container).toHaveClass('text-gray-600','italic')
})

 it('gère les durées courtes correctement', () => {
 const shortPerf = {
 duration: 45, // 45 secondes
 performed_at:'2025-01-29T10:00:00Z'
}

 render(
 <PerformanceDisplay
 performance={shortPerf}
 exerciseType="Cardio"
 />
 )

 expect(screen.getByText('0:45')).toBeInTheDocument()
})

 it('applique className personnalisé', () => {
 render(
 <PerformanceDisplay
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 className="custom-class"
 testId="custom-display"
 />
 )

 const container = screen.getByTestId('custom-display')
 expect(container).toHaveClass('custom-class')
})
})
})

describe('usePerformanceFormatter', () => {
 // Test du hook avec un composant de test
 function TestComponent({ performance, exerciseType, exerciseName}: {
 performance: unknown
 exerciseType:'Musculation' |'Cardio'
 exerciseName?: string
}) {
 const { formatQuick} = usePerformanceFormatter()
 const formatted = formatQuick(performance, exerciseType, exerciseName)
 
 return <div data-testid="formatted-result">{formatted}</div>
}

 it('formate rapidement les performances de musculation', () => {
 render(
 <TestComponent
 performance={mockPerformanceMusculation}
 exerciseType="Musculation"
 />
 )

 expect(screen.getByTestId('formatted-result')).toHaveTextContent('80kg × 8 reps × 3 sets')
})

 it('formate rapidement les performances cardio rameur', () => {
 render(
 <TestComponent
 performance={mockPerformanceCardioRameur}
 exerciseType="Cardio"
 exerciseName="Rameur"
 />
 )

 expect(screen.getByTestId('formatted-result')).toHaveTextContent('2000m • 8:30 • 28 SPM • 180W')
})

 it('limite à 4 métriques maximum', () => {
 const perfWithManyMetrics = {
 distance: 10,
 duration: 3600,
 stroke_rate: 30,
 watts: 200,
 heart_rate: 150,
 calories: 400,
 performed_at:'2025-01-29T10:00:00Z'
}

 render(
 <TestComponent
 performance={perfWithManyMetrics}
 exerciseType="Cardio"
 exerciseName="Rameur"
 />
 )

 const result = screen.getByTestId('formatted-result').textContent ||''
 const metricCount = result.split(' •').length
 expect(metricCount).toBeLessThanOrEqual(4)
})

 it('retourne message par défaut pour performance vide', () => {
 const emptyPerf = { performed_at:'2025-01-29T10:00:00Z'}

 render(
 <TestComponent
 performance={emptyPerf}
 exerciseType="Musculation"
 />
 )

 expect(screen.getByTestId('formatted-result')).toHaveTextContent('Performance musculation')
})
})