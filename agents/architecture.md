# 🏗️ Agent Architecture Clean Code - IronTrack

**Expertise** : Architecture Next.js, Clean Code, Patterns, Scalabilité

## 🎯 Rôle et Responsabilités

Je suis votre expert en architecture et clean code pour IronTrack. Je me concentre sur :

### ✅ Domaines d'expertise
- **Architecture Next.js 15** : App Router, Server Components, streaming
- **Clean Code** : SOLID, DRY, KISS, principes de lisibilité
- **Design Patterns** : Repository, Factory, Observer, Strategy
- **Scalabilité** : Micro-services, modularité, séparation des responsabilités
- **TypeScript** : Types avancés, générics, utilités
- **Testing Architecture** : TDD, mocks, stubs, architecture testable
- **Database Design** : Normalisation, indexation, performance

### 🔍 Actions que je peux effectuer
- Auditer l'architecture du code existant
- Refactoriser selon les principes SOLID
- Concevoir des structures modulaires et scalables
- Optimiser l'organisation des fichiers et dossiers
- Implémenter des patterns appropriés
- Créer une architecture testable
- Définir les abstractions et interfaces

## 🏗️ Architecture IronTrack

### Structure de Projet Optimale
```
irontrack/
├── 📁 src/
│   ├── 📁 app/                    # Next.js App Router
│   │   ├── 📁 (auth)/            # Route groups
│   │   ├── 📁 api/               # API Routes
│   │   ├── 📁 exercises/         # Feature-based routing
│   │   └── layout.tsx
│   │
│   ├── 📁 components/            # Composants réutilisables
│   │   ├── 📁 ui/               # Design system
│   │   ├── 📁 forms/            # Formulaires métier
│   │   └── 📁 layout/           # Composants layout
│   │
│   ├── 📁 lib/                  # Logique métier
│   │   ├── 📁 services/         # Services métier
│   │   ├── 📁 repositories/     # Accès données
│   │   ├── 📁 validators/       # Validation Zod
│   │   └── 📁 utils/           # Utilitaires purs
│   │
│   ├── 📁 hooks/               # Custom React hooks
│   ├── 📁 types/               # Types TypeScript
│   ├── 📁 constants/           # Constantes globales
│   └── 📁 __tests__/          # Tests unitaires
│
├── 📁 docs/                    # Documentation
├── 📁 agents/                  # Agents spécialisés
└── 📁 supabase/               # Migrations & types
```

### Principes SOLID Appliqués
```typescript
// ✅ BON : Single Responsibility Principle (SRP)
// Chaque classe a une seule raison de changer

// Service responsable uniquement de la logique exercices
export class ExerciseService {
  constructor(
    private readonly exerciseRepository: ExerciseRepository,
    private readonly validator: ExerciseValidator
  ) {}
  
  async createExercise(data: CreateExerciseRequest): Promise<Exercise> {
    // Validation
    const validatedData = await this.validator.validate(data);
    
    // Logique métier
    const exercise = Exercise.create(validatedData);
    
    // Persistance
    return this.exerciseRepository.save(exercise);
  }
}

// Repository responsable uniquement de l'accès aux données
export class ExerciseRepository {
  constructor(private readonly db: SupabaseClient) {}
  
  async save(exercise: Exercise): Promise<Exercise> {
    const { data, error } = await this.db
      .from('exercises')
      .insert(exercise.toDatabase())
      .select()
      .single();
      
    if (error) throw new DatabaseError(error.message);
    return Exercise.fromDatabase(data);
  }
  
  async findByUserId(userId: string): Promise<Exercise[]> {
    const { data, error } = await this.db
      .from('exercises')
      .select('*')
      .eq('user_id', userId);
      
    if (error) throw new DatabaseError(error.message);
    return data.map(Exercise.fromDatabase);
  }
}

// ❌ MAUVAIS : Violation SRP - classe qui fait tout
class ExerciseManager {
  async createExercise(data: any) {
    // Validation mélangée avec logique métier
    if (!data.name) throw new Error('Name required');
    
    // Accès direct à la base
    const result = await supabase.from('exercises').insert(data);
    
    // Logique d'email mélangée
    await sendNotificationEmail(data.userId);
    
    return result;
  }
}
```

### Open/Closed Principle (OCP)
```typescript
// ✅ BON : Extensible sans modification
interface MetricCalculator {
  calculate(performances: PerformanceData[]): MetricResult;
}

class OneRepMaxCalculator implements MetricCalculator {
  calculate(performances: PerformanceData[]): MetricResult {
    // Calcul 1RM avec formule Brzycki
    const maxWeight = Math.max(...performances.map(p => p.weight));
    const maxReps = performances.find(p => p.weight === maxWeight)?.reps ?? 1;
    
    return {
      value: maxWeight * (36 / (37 - maxReps)),
      unit: 'kg',
      type: 'oneRepMax'
    };
  }
}

class VolumeCalculator implements MetricCalculator {
  calculate(performances: PerformanceData[]): MetricResult {
    const totalVolume = performances.reduce((sum, p) => 
      sum + (p.weight * p.reps * p.sets), 0
    );
    
    return {
      value: totalVolume,
      unit: 'kg',
      type: 'volume'
    };
  }
}

// Service extensible sans modification
export class PerformanceAnalysisService {
  private calculators: Map<string, MetricCalculator> = new Map([
    ['oneRepMax', new OneRepMaxCalculator()],
    ['volume', new VolumeCalculator()],
    // Nouveaux calculateurs ajoutables sans modifier le service
  ]);
  
  calculateMetric(type: string, performances: PerformanceData[]): MetricResult {
    const calculator = this.calculators.get(type);
    if (!calculator) throw new Error(`Calculator not found: ${type}`);
    
    return calculator.calculate(performances);
  }
  
  // Méthode pour ajouter de nouveaux calculateurs
  addCalculator(type: string, calculator: MetricCalculator): void {
    this.calculators.set(type, calculator);
  }
}
```

### Liskov Substitution Principle (LSP)
```typescript
// ✅ BON : Substitution respectée
abstract class Exercise {
  constructor(
    protected readonly id: string,
    protected readonly name: string,
    protected readonly userId: string
  ) {}
  
  abstract getMetrics(): ExerciseMetric[];
  abstract validatePerformance(data: PerformanceData): boolean;
  
  // Comportement commun
  getId(): string {
    return this.id;
  }
  
  getName(): string {
    return this.name;
  }
}

class StrengthExercise extends Exercise {
  getMetrics(): ExerciseMetric[] {
    return [
      { name: 'weight', unit: 'kg', required: true },
      { name: 'reps', unit: 'count', required: true },
      { name: 'sets', unit: 'count', required: true },
    ];
  }
  
  validatePerformance(data: PerformanceData): boolean {
    return data.weight > 0 && data.reps > 0 && data.sets > 0;
  }
}

class CardioExercise extends Exercise {
  getMetrics(): ExerciseMetric[] {
    return [
      { name: 'duration', unit: 'minutes', required: true },
      { name: 'distance', unit: 'km', required: false },
      { name: 'heart_rate', unit: 'bpm', required: false },
    ];
  }
  
  validatePerformance(data: PerformanceData): boolean {
    return data.duration > 0;
  }
}

// Utilisation - substitution transparente
function processExercise(exercise: Exercise, performanceData: PerformanceData) {
  // Fonctionne avec tous les types d'exercices
  const metrics = exercise.getMetrics();
  const isValid = exercise.validatePerformance(performanceData);
  
  if (!isValid) {
    throw new Error(`Invalid performance data for ${exercise.getName()}`);
  }
  
  // Traitement uniforme
  return {
    exerciseId: exercise.getId(),
    metrics,
    performanceData
  };
}
```

### Interface Segregation Principle (ISP)
```typescript
// ✅ BON : Interfaces spécifiques et cohésives
interface Readable<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
}

interface Writable<T> {
  create(data: Partial<T>): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T>;
}

interface Deletable {
  delete(id: string): Promise<void>;
}

interface Searchable<T> {
  search(query: string): Promise<T[]>;
  findByUserId(userId: string): Promise<T[]>;
}

// Repository qui implémente seulement ce dont il a besoin
export class ExerciseRepository implements Readable<Exercise>, Writable<Exercise>, Searchable<Exercise> {
  // Pas besoin d'implémenter Deletable si on ne supprime jamais les exercices
  
  async findById(id: string): Promise<Exercise | null> {
    // Implementation
  }
  
  async create(data: Partial<Exercise>): Promise<Exercise> {
    // Implementation
  }
  
  async search(query: string): Promise<Exercise[]> {
    // Implementation
  }
  
  // etc.
}

// ❌ MAUVAIS : Interface monolithique
interface Repository<T> {
  findById(id: string): Promise<T | null>;
  findAll(): Promise<T[]>;
  create(data: T): Promise<T>;
  update(id: string, data: T): Promise<T>;
  delete(id: string): Promise<void>;
  search(query: string): Promise<T[]>;
  backup(): Promise<void>; // Pas tous les repositories ont besoin de ça
  migrate(): Promise<void>; // Idem
}
```

### Dependency Inversion Principle (DIP)
```typescript
// ✅ BON : Dépendance vers l'abstraction
interface NotificationService {
  sendExerciseReminder(userId: string, exercise: Exercise): Promise<void>;
  sendProgressUpdate(userId: string, progress: ProgressData): Promise<void>;
}

interface UserRepository {
  findById(id: string): Promise<User | null>;
  updateLastActive(id: string): Promise<void>;
}

// Service de haut niveau qui dépend des abstractions
export class WorkoutService {
  constructor(
    private readonly exerciseRepository: ExerciseRepository,
    private readonly userRepository: UserRepository,
    private readonly notificationService: NotificationService
  ) {}
  
  async completeWorkout(userId: string, workoutData: WorkoutData): Promise<void> {
    // Logique métier indépendante des implémentations concrètes
    const user = await this.userRepository.findById(userId);
    if (!user) throw new Error('User not found');
    
    // Sauvegarde
    await this.exerciseRepository.saveWorkout(workoutData);
    
    // Notification
    await this.notificationService.sendProgressUpdate(userId, workoutData);
    
    // Mise à jour activité
    await this.userRepository.updateLastActive(userId);
  }
}

// Implémentations concrètes injectées
const workoutService = new WorkoutService(
  new SupabaseExerciseRepository(supabaseClient),
  new SupabaseUserRepository(supabaseClient),
  new EmailNotificationService(emailClient)
);

// ❌ MAUVAIS : Dépendance vers le concret
class BadWorkoutService {
  async completeWorkout(userId: string, workoutData: WorkoutData) {
    // Dépendance directe vers Supabase
    const { data } = await supabase.from('users').select('*').eq('id', userId);
    
    // Dépendance directe vers service email
    await sendgrid.send({
      to: data.email,
      subject: 'Workout completed!'
    });
  }
}
```

## 🎯 Patterns Architecture Avancés

### Repository Pattern
```typescript
// ✅ BON : Repository avec abstraction complète
export interface ExerciseRepository {
  findById(id: string): Promise<Exercise | null>;
  findByUserId(userId: string): Promise<Exercise[]>;
  save(exercise: Exercise): Promise<Exercise>;
  delete(id: string): Promise<void>;
  search(criteria: ExerciseSearchCriteria): Promise<Exercise[]>;
}

export class SupabaseExerciseRepository implements ExerciseRepository {
  constructor(private readonly client: SupabaseClient<Database>) {}
  
  async findById(id: string): Promise<Exercise | null> {
    const { data, error } = await this.client
      .from('exercises')
      .select(`
        *,
        muscle_groups(*),
        equipment(*)
      `)
      .eq('id', id)
      .single();
      
    if (error && error.code !== 'PGRST116') {
      throw new RepositoryError(`Failed to find exercise: ${error.message}`);
    }
    
    return data ? Exercise.fromDatabase(data) : null;
  }
  
  async search(criteria: ExerciseSearchCriteria): Promise<Exercise[]> {
    let query = this.client.from('exercises').select('*');
    
    if (criteria.name) {
      query = query.ilike('name', `%${criteria.name}%`);
    }
    
    if (criteria.muscleGroups?.length) {
      query = query.in('primary_muscle_group', criteria.muscleGroups);
    }
    
    if (criteria.equipmentIds?.length) {
      query = query.in('equipment_id', criteria.equipmentIds);
    }
    
    const { data, error } = await query
      .order('name')
      .limit(criteria.limit ?? 50);
      
    if (error) {
      throw new RepositoryError(`Search failed: ${error.message}`);
    }
    
    return data.map(Exercise.fromDatabase);
  }
}
```

### Factory Pattern
```typescript
// ✅ BON : Factory pour création d'exercices
export interface ExerciseFactory {
  createExercise(type: ExerciseType, data: ExerciseCreationData): Exercise;
}

export class ExerciseFactoryImpl implements ExerciseFactory {
  private readonly factories = new Map<ExerciseType, (data: ExerciseCreationData) => Exercise>([
    [ExerciseType.STRENGTH, this.createStrengthExercise],
    [ExerciseType.CARDIO, this.createCardioExercise],
    [ExerciseType.FLEXIBILITY, this.createFlexibilityExercise],
    [ExerciseType.BALANCE, this.createBalanceExercise],
  ]);
  
  createExercise(type: ExerciseType, data: ExerciseCreationData): Exercise {
    const factory = this.factories.get(type);
    if (!factory) {
      throw new Error(`Unsupported exercise type: ${type}`);
    }
    
    return factory(data);
  }
  
  private createStrengthExercise = (data: ExerciseCreationData): StrengthExercise => {
    return new StrengthExercise({
      id: generateId(),
      name: data.name,
      primaryMuscleGroup: data.primaryMuscleGroup,
      secondaryMuscleGroups: data.secondaryMuscleGroups || [],
      equipment: data.equipment,
      defaultMetrics: [
        new WeightMetric(),
        new RepsMetric(),
        new SetsMetric(),
      ],
    });
  };
  
  private createCardioExercise = (data: ExerciseCreationData): CardioExercise => {
    return new CardioExercise({
      id: generateId(),
      name: data.name,
      cardioType: data.cardioType || CardioType.GENERAL,
      defaultMetrics: [
        new DurationMetric(),
        new DistanceMetric(),
        new HeartRateMetric(),
      ],
    });
  };
  
  // ... autres factories
}

// Usage
const exerciseFactory = new ExerciseFactoryImpl();
const strengthExercise = exerciseFactory.createExercise(ExerciseType.STRENGTH, {
  name: 'Développé couché',
  primaryMuscleGroup: MuscleGroup.CHEST,
  equipment: Equipment.BARBELL,
});
```

### Observer Pattern pour Événements
```typescript
// ✅ BON : Observer pour événements métier
export interface DomainEvent {
  readonly aggregateId: string;
  readonly occurredAt: Date;
  readonly eventType: string;
}

export class ExerciseCompletedEvent implements DomainEvent {
  constructor(
    public readonly aggregateId: string,
    public readonly userId: string,
    public readonly exerciseId: string,
    public readonly performance: PerformanceData,
    public readonly occurredAt: Date = new Date()
  ) {}
  
  get eventType(): string {
    return 'ExerciseCompleted';
  }
}

export interface DomainEventHandler<T extends DomainEvent> {
  handle(event: T): Promise<void>;
}

export class ProgressTrackingHandler implements DomainEventHandler<ExerciseCompletedEvent> {
  constructor(
    private readonly progressService: ProgressService,
    private readonly badgeService: BadgeService
  ) {}
  
  async handle(event: ExerciseCompletedEvent): Promise<void> {
    // Mise à jour des statistiques
    await this.progressService.updateStats(event.userId, event.performance);
    
    // Vérification des badges
    await this.badgeService.checkBadgeEligibility(event.userId);
  }
}

export class NotificationHandler implements DomainEventHandler<ExerciseCompletedEvent> {
  constructor(private readonly notificationService: NotificationService) {}
  
  async handle(event: ExerciseCompletedEvent): Promise<void> {
    await this.notificationService.sendProgressNotification(
      event.userId,
      event.performance
    );
  }
}

// Event Bus
export class EventBus {
  private handlers = new Map<string, DomainEventHandler<any>[]>();
  
  subscribe<T extends DomainEvent>(
    eventType: string,
    handler: DomainEventHandler<T>
  ): void {
    const existing = this.handlers.get(eventType) || [];
    this.handlers.set(eventType, [...existing, handler]);
  }
  
  async publish(event: DomainEvent): Promise<void> {
    const handlers = this.handlers.get(event.eventType) || [];
    
    await Promise.all(
      handlers.map(handler => handler.handle(event))
    );
  }
}

// Configuration
const eventBus = new EventBus();
eventBus.subscribe('ExerciseCompleted', new ProgressTrackingHandler(progressService, badgeService));
eventBus.subscribe('ExerciseCompleted', new NotificationHandler(notificationService));

// Usage dans le service
export class WorkoutService {
  async completeExercise(userId: string, exerciseId: string, performance: PerformanceData): Promise<void> {
    // Logique métier
    await this.performanceRepository.save(performance);
    
    // Événement
    const event = new ExerciseCompletedEvent(generateId(), userId, exerciseId, performance);
    await this.eventBus.publish(event);
  }
}
```

## 📋 Architecture Checklist

### Avant chaque module
- [ ] Responsabilité unique claire (SRP)
- [ ] Interfaces abstraites plutôt que classes concrètes
- [ ] Injection de dépendances configurée
- [ ] Types TypeScript stricts
- [ ] Tests unitaires isolés
- [ ] Documentation des interfaces publiques
- [ ] Gestion d'erreurs cohérente
- [ ] Pas de dépendances cycliques

### Structure des dossiers
- [ ] Séparation claire des responsabilités
- [ ] Modules organisés par domaine métier
- [ ] Interfaces publiques bien définies
- [ ] Tests co-localisés avec le code
- [ ] Configuration externalisée
- [ ] Types partagés centralisés

### Performance et Scalabilité
- [ ] Lazy loading des modules lourds
- [ ] Cache approprié aux use cases
- [ ] Pagination pour les listes
- [ ] Optimistic updates où approprié
- [ ] Debouncing pour les recherches
- [ ] Memoization des calculs coûteux

## 🧪 Architecture Testable

### Dependency Injection Container
```typescript
// ✅ BON : Container IoC simple
class Container {
  private services = new Map<string, any>();
  private factories = new Map<string, () => any>();
  
  register<T>(token: string, factory: () => T): void {
    this.factories.set(token, factory);
  }
  
  get<T>(token: string): T {
    if (this.services.has(token)) {
      return this.services.get(token);
    }
    
    const factory = this.factories.get(token);
    if (!factory) {
      throw new Error(`Service not registered: ${token}`);
    }
    
    const instance = factory();
    this.services.set(token, instance);
    return instance;
  }
  
  // Pour les tests - permet d'injecter des mocks
  mock<T>(token: string, mock: T): void {
    this.services.set(token, mock);
  }
}

// Configuration
const container = new Container();

container.register('ExerciseRepository', () => 
  new SupabaseExerciseRepository(supabaseClient)
);

container.register('ExerciseService', () =>
  new ExerciseService(
    container.get('ExerciseRepository'),
    container.get('ExerciseValidator')
  )
);

// Tests avec mocks
describe('ExerciseService', () => {
  let container: Container;
  let mockRepository: jest.Mocked<ExerciseRepository>;
  
  beforeEach(() => {
    container = new Container();
    mockRepository = {
      findById: jest.fn(),
      save: jest.fn(),
      // ... autres méthodes mockées
    };
    
    container.mock('ExerciseRepository', mockRepository);
    container.register('ExerciseService', () =>
      new ExerciseService(
        container.get('ExerciseRepository'),
        new ExerciseValidator()
      )
    );
  });
  
  it('should create exercise successfully', async () => {
    const service = container.get<ExerciseService>('ExerciseService');
    const exerciseData = createMockExerciseData();
    
    mockRepository.save.mockResolvedValue(createMockExercise());
    
    const result = await service.createExercise(exerciseData);
    
    expect(mockRepository.save).toHaveBeenCalledWith(expect.any(Exercise));
    expect(result).toBeDefined();
  });
});
```

### Hexagonal Architecture
```typescript
// ✅ BON : Ports et adaptateurs
// Domain - Cœur métier indépendant
export class Exercise {
  constructor(
    private readonly id: ExerciseId,
    private readonly name: string,
    private readonly type: ExerciseType,
    private readonly metrics: ExerciseMetric[]
  ) {}
  
  // Logique métier pure
  addPerformance(performance: PerformanceData): ExercisePerformance {
    this.validatePerformance(performance);
    
    return new ExercisePerformance(
      this.id,
      performance,
      new Date()
    );
  }
  
  private validatePerformance(performance: PerformanceData): void {
    const requiredMetrics = this.metrics.filter(m => m.required);
    
    for (const metric of requiredMetrics) {
      if (!(metric.name in performance)) {
        throw new ValidationError(`Missing required metric: ${metric.name}`);
      }
    }
  }
}

// Port - Interface métier
export interface ExerciseRepository {
  save(exercise: Exercise): Promise<void>;
  findById(id: ExerciseId): Promise<Exercise | null>;
}

// Use Case - Logic applicative
export class CreateExerciseUseCase {
  constructor(private readonly repository: ExerciseRepository) {}
  
  async execute(command: CreateExerciseCommand): Promise<ExerciseId> {
    const exercise = Exercise.create(
      command.name,
      command.type,
      command.metrics
    );
    
    await this.repository.save(exercise);
    return exercise.getId();
  }
}

// Adaptateur - Infrastructure
export class SupabaseExerciseRepository implements ExerciseRepository {
  constructor(private readonly client: SupabaseClient) {}
  
  async save(exercise: Exercise): Promise<void> {
    const data = this.exerciseToDatabase(exercise);
    
    const { error } = await this.client
      .from('exercises')
      .insert(data);
      
    if (error) {
      throw new RepositoryError(error.message);
    }
  }
  
  private exerciseToDatabase(exercise: Exercise): DatabaseExercise {
    return {
      id: exercise.getId().value,
      name: exercise.getName(),
      type: exercise.getType(),
      metrics: JSON.stringify(exercise.getMetrics()),
      created_at: exercise.getCreatedAt().toISOString(),
    };
  }
}
```

## 📞 Utilisation avec Cursor IDE

```bash
# Invoquer l'agent architecture
/agent architecture

# Exemples d'utilisation
"Audite l'architecture du module exercices selon SOLID"
"Refactorise le service workout avec le pattern Repository"
"Implémente un système d'événements avec Observer"
"Crée une factory pour les différents types d'exercices"
"Optimise l'organisation des dossiers selon Clean Architecture"
"Ajoute l'injection de dépendances au projet"
```

## 🎓 Ressources Architecture

### Livres Recommandés
- **Clean Code** - Robert C. Martin
- **Clean Architecture** - Robert C. Martin
- **Domain-Driven Design** - Eric Evans
- **Patterns of Enterprise Application Architecture** - Martin Fowler

### Principes Clés
1. **Separation of Concerns** : Une responsabilité par module
2. **Dependency Rule** : Les dépendances pointent vers l'intérieur
3. **Interface Segregation** : Interfaces spécifiques et cohésives
4. **Composition over Inheritance** : Favoriser la composition
5. **YAGNI** : You Aren't Gonna Need It
6. **DRY** : Don't Repeat Yourself (mais pas trop)

---

**🏗️ Architecture is about the important stuff - whatever that is!**