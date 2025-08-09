import { defineConfig, devices } from '@playwright/test';

/**
 * Configuration Playwright optimisée pour IronTrack
 * 
 * Focus sur:
 * - Tests multi-navigateurs (Chromium, Firefox, Safari)
 * - Tests responsifs mobile/desktop
 * - Capture écrans et vidéos pour debugging
 * - CI/CD prêt avec parallélisation
 * - Tests anti-régression automatiques
 */

export default defineConfig({
  // Répertoire des tests
  testDir: './tests/e2e',
  
  // Configuration pour CI/CD
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  
  // Reporter pour différents environnements
  reporter: [
    ['html'],
    ['json', { outputFile: 'test-results/results.json' }],
    process.env.CI ? ['github'] : ['list']
  ],

  // Configuration globale des tests
  use: {
    // URL de base pour les tests
    baseURL: process.env.BASE_URL || 'http://localhost:3000',
    
    // Trace et debugging
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    
    // Timeout par action (20s par défaut)
    actionTimeout: 20000,
    
    // Navigation timeout
    navigationTimeout: 30000,
    
    // Headers par défaut
    extraHTTPHeaders: {
      'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8'
    }
  },

  // Configuration multi-navigateurs et appareils
  projects: [
    // Desktop Browsers
    {
      name: 'chromium-desktop',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox-desktop',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit-desktop',
      use: { ...devices['Desktop Safari'] },
    },

    // Mobile Browsers (IronTrack est mobile-first)
    {
      name: 'mobile-chrome',
      use: { ...devices['Pixel 5'] },
    },
    {
      name: 'mobile-safari',
      use: { ...devices['iPhone 12'] },
    },

    // Tablette
    {
      name: 'tablet',
      use: { ...devices['iPad Pro'] },
    },

    // Tests spécifiques résolutions IronTrack
    {
      name: 'irontrack-mobile',
      use: {
        ...devices['Pixel 5'],
        viewport: { width: 390, height: 844 },
      },
    },
    {
      name: 'irontrack-desktop',
      use: {
        viewport: { width: 1440, height: 900 },
        deviceScaleFactor: 1,
      },
    }
  ],

  // Serveur de développement automatique
  webServer: [
    {
      command: 'npm run dev',
      url: 'http://localhost:3000',
      reuseExistingServer: !process.env.CI,
      timeout: 120 * 1000, // 2 minutes pour démarrage Next.js
    }
  ],

  // Configuration output
  outputDir: 'test-results/',
  
  // Timeout global des tests
  timeout: 60000, // 1 minute par test
  expect: {
    timeout: 10000, // 10s pour les assertions
  },

  // Configuration réseau
  globalSetup: require.resolve('./tests/global-setup.ts'),
  globalTeardown: require.resolve('./tests/global-teardown.ts'),
});