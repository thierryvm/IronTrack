import '@testing-library/jest-dom';

// Mock pour les modules externes
jest.mock('next/font/google', () => ({
  Inter: () => ({
    className: 'inter',
  }),
}));

// Mock pour les icônes Lucide
jest.mock('lucide-react', () => ({
  Plus: () => 'Plus',
  Apple: () => 'Apple',
  Target: () => 'Target',
  Flame: () => 'Flame',
  Scale: () => 'Scale',
  Clock: () => 'Clock',
  Edit: () => 'Edit',
  Trash2: () => 'Trash2',
  CheckCircle: () => 'CheckCircle',
  X: () => 'X',
  AlertTriangle: () => 'AlertTriangle',
  Utensils: () => 'Utensils',
  ChefHat: () => 'ChefHat',
  Layers: () => 'Layers',
  Search: () => 'Search',
  ArrowLeft: () => 'ArrowLeft',
  ArrowRight: () => 'ArrowRight',
  Save: () => 'Save',
  Calculator: () => 'Calculator',
  Info: () => 'Info',
  Loader2: () => 'Loader2',
  Package: () => 'Package',
}));

// Mock pour les variables d'environnement
process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://test.supabase.co';
process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY = 'test-anon-key';

// Mock pour window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(),
    removeListener: jest.fn(),
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock pour ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock pour fetch
global.fetch = jest.fn();

// Mock pour localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock as any;

// Configuration pour les tests de timeout
jest.setTimeout(10000);

// Nettoyer les mocks après chaque test
afterEach(() => {
  jest.clearAllMocks();
});

// Dummy test pour éviter l'erreur "no test found"
test('setup configuration', () => {
  expect(true).toBe(true);
});