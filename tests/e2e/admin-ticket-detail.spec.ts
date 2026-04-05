import { test, expect } from '@playwright/test';
import { getE2EBaseUrl, loginAs } from './helpers/auth';

const BASE_URL = getE2EBaseUrl();

test.describe('Admin Ticket Detail Page', () => {
  test.beforeEach(async ({ page }) => {
    // Naviguer vers la page de connexion et se connecter avec le compte admin
    await page.goto(BASE_URL);
    await loginAs(page, 'admin', { loginPath: '/login' });
  });

  test('devrait charger la page admin du ticket sans erreur', async ({ page }) => {
    // Naviguer vers un ticket de test
    const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
    await page.goto(`${BASE_URL}/admin/tickets/${ticketId}`);

    // Attendre le chargement (max 10 secondes)
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Vérifier qu'il n'y a pas de message d'erreur
    const errorElement = await page.locator('text=Erreur').first();
    const isErrorVisible = await errorElement.isVisible().catch(() => false);
    expect(isErrorVisible).toBeFalsy();

    // Vérifier que le titre du ticket est affiché
    await expect(page.locator('h1')).toContainText('Test du système de Q&R');
    
    // Vérifier que les contrôles admin sont présents
    await expect(page.locator('text=Gestion du ticket')).toBeVisible();
    await expect(page.locator('text=Statut')).toBeVisible();
    await expect(page.locator('text=Priorité')).toBeVisible();
    
    // Vérifier que le formulaire de réponse est présent
    await expect(page.locator('text=Répondre au ticket')).toBeVisible();
    await expect(page.locator('textarea')).toBeVisible();
  });

  test('devrait pouvoir envoyer une réponse', async ({ page }) => {
    const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
    await page.goto(`${BASE_URL}/admin/tickets/${ticketId}`);
    
    // Attendre le chargement
    await page.waitForLoadState('networkidle');
    
    // Remplir le formulaire de réponse
    const testMessage = `Test automatique Playwright ${Date.now()}`;
    await page.fill('textarea', testMessage);
    
    // Envoyer la réponse
    await page.click('button:has-text("Envoyer réponse")');
    
    // Attendre la confirmation
    await page.waitForTimeout(2000);
    
    // Vérifier que la textarea est vidée
    const textareaValue = await page.locator('textarea').inputValue();
    expect(textareaValue).toBe('');
  });

  test('devrait pouvoir modifier le statut du ticket', async ({ page }) => {
    const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
    await page.goto(`${BASE_URL}/admin/tickets/${ticketId}`);
    
    // Attendre le chargement
    await page.waitForLoadState('networkidle');
    
    // Changer le statut
    const statusSelect = page.locator('select').first();
    await statusSelect.selectOption('in_progress');
    
    // Attendre que le changement soit appliqué
    await page.waitForTimeout(1000);
    
    // Vérifier que le statut a changé dans l'en-tête
    await expect(page.locator('text=in_progress')).toBeVisible();
  });

  test('devrait afficher les logs de debug dans la console', async ({ page }) => {
    const logs = [];
    page.on('console', msg => {
      if (msg.type() === 'log' && msg.text().includes('💚 [FINAL]')) {
        logs.push(msg.text());
      }
    });

    const ticketId = '807594e2-05ac-4d24-a8c2-898d33e12ac8';
    await page.goto(`${BASE_URL}/admin/tickets/${ticketId}`);
    
    // Attendre le chargement
    await page.waitForTimeout(5000);
    
    // Vérifier qu'on a bien des logs de debug
    expect(logs.length).toBeGreaterThan(0);
    expect(logs.some(log => log.includes('Initialisation UNIQUE'))).toBeTruthy();
  });
});

test.describe('Admin Ticket Detail Error Cases', () => {
  test('devrait gérer les tickets inexistants', async ({ page }) => {
    // Connexion admin
    await loginAs(page, 'admin', { loginPath: '/login' });

    // Naviguer vers un ticket qui n'existe pas
    const fakeTicketId = 'aaaaaaaa-bbbb-cccc-dddd-eeeeeeeeeeee';
    await page.goto(`${BASE_URL}/admin/tickets/${fakeTicketId}`);
    
    // Attendre le chargement
    await page.waitForLoadState('networkidle');
    
    // Vérifier qu'un message d'erreur approprié est affiché
    await expect(page.locator('text=Ticket non trouvé')).toBeVisible();
  });
});
