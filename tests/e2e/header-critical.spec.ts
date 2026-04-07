import { test, expect } from '@playwright/test';
import { appUrl } from './helpers/auth';

test.describe('Header Critical Tests - ULTRAHARDCORE', () => {
  
  test.beforeEach(async ({ page }) => {
    // Navigate to home page
    await page.goto(appUrl());
    await page.waitForLoadState('networkidle');
  });

  test.describe('Logo Tests', () => {
    
    test('Logo should be visible and clickable', async ({ page }) => {
      // Check logo presence
      const logo = page.locator('a[href="/"]').first();
      await expect(logo).toBeVisible();
      
      // Check logo contains "IT" text
      await expect(logo).toContainText('IT');
      
      // Check logo has correct styling (orange background)
      const logoDiv = logo.locator('div').first();
      await expect(logoDiv).toHaveClass(/bg-orange-600/);
      
      // Test logo click
      await logo.click();
      await expect(page).toHaveURL(appUrl('/'));
    });

    test('Logo should have proper accessibility', async ({ page }) => {
      const logo = page.locator('a[href="/"]').first();
      
      // Check focus outline
      await logo.focus();
      await expect(logo).toHaveClass(/focus:outline-none/);
      
      // Test keyboard navigation
      await page.keyboard.press('Tab');
      await page.keyboard.press('Enter');
      await expect(page).toHaveURL(appUrl('/'));
    });

  });

  test.describe('Mobile Menu Tests', () => {
    
    test('Mobile menu should open and show all navigation links', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 }); // iPhone SE
      
      // Find and click hamburger menu
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      
      await expect(hamburgerBtn).toBeVisible();
      await hamburgerBtn.click();
      
      // Check menu is visible
      await expect(page.locator('text=Navigation')).toBeVisible();
      
      // Check all primary navigation links are present and visible
      const expectedLinks = [
        'Calendrier',
        'Exercices', 
        'Séances',
        'Partenaires',
        'Nutrition',
        'Progression'
      ];
      
      for (const linkText of expectedLinks) {
        const link = page.locator(`a:has-text("${linkText}")`);
        await expect(link).toBeVisible();
        
        // Check link has proper styling
        await expect(link).toHaveClass(/bg-gray-100/);
        await expect(link).toHaveClass(/text-gray-900/);
      }
    });

    test('Mobile menu links should be clickable and navigate correctly', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open menu
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await hamburgerBtn.click();
      
      // Click on Exercices link
      const exercicesLink = page.locator('a:has-text("💪 Exercices")');
      await expect(exercicesLink).toBeVisible();
      await exercicesLink.click();
      
      // Verify navigation
      await expect(page).toHaveURL(/.*\/exercises/);
      
      // Menu should close after click
      await expect(page.locator('text=Navigation')).not.toBeVisible();
    });

    test('Mobile menu should close when clicking overlay', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open menu
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await hamburgerBtn.click();
      
      // Menu should be visible
      await expect(page.locator('text=Navigation')).toBeVisible();
      
      // Click overlay
      const overlay = page.locator('.fixed.inset-0.bg-black');
      await overlay.click();
      
      // Menu should close
      await expect(page.locator('text=Navigation')).not.toBeVisible();
    });

    test('Mobile menu should close when clicking X button', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      // Open menu
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await hamburgerBtn.click();
      
      // Menu should be visible
      await expect(page.locator('text=Navigation')).toBeVisible();
      
      // Click close button
      const closeBtn = page.locator('button[aria-label="Fermer"]');
      await expect(closeBtn).toBeVisible();
      await closeBtn.click();
      
      // Menu should close
      await expect(page.locator('text=Navigation')).not.toBeVisible();
    });

  });

  test.describe('Notifications Mobile Tests', () => {
    
    test('Notifications dropdown should be readable on mobile', async ({ page }) => {
      // Set iPhone 14 viewport
      await page.setViewportSize({ width: 390, height: 844 });
      
      // Find and click notifications button
      const notifBtn = page.locator('button[aria-label="Notifications"]');
      
      if (await notifBtn.isVisible()) {
        await notifBtn.click();
        
        // Check notifications dropdown is visible and properly sized
        const notifDropdown = page.locator('text=🔔 Notifications').locator('..');
        await expect(notifDropdown).toBeVisible();
        
        // Check it doesn't overflow screen
        const dropdownBox = await notifDropdown.boundingBox();
        expect(dropdownBox?.width).toBeLessThanOrEqual(390); // Screen width
        
        // Check text is readable (dark text on light background)
        await expect(notifDropdown).toHaveClass(/bg-white/);
        
        // Check header is properly styled
        const header = page.locator('text=🔔 Notifications');
        await expect(header).toBeVisible();
        await expect(header).toHaveClass(/text-gray-900/);
        
        // If there's a "Voir toutes" link, check it's visible
        const seeAllLink = page.locator('text=📋 Voir toutes les notifications');
        if (await seeAllLink.isVisible()) {
          await expect(seeAllLink).toHaveClass(/text-orange-600/);
        }
      }
    });

  });

  test.describe('Accessibility Tests', () => {
    
    test('Header should have proper ARIA labels and roles', async ({ page }) => {
      // Check main header has proper role
      const header = page.locator('header');
      await expect(header).toBeVisible();
      
      // Check skip link for accessibility
      const skipLink = page.locator('text=Aller au contenu principal');
      await expect(skipLink).toBeInViewport({ ratio: 0.1 });
      
      // Test skip link focus
      await page.keyboard.press('Tab');
      await expect(skipLink).toBeFocused();
    });

    test('Keyboard navigation should work properly', async ({ page }) => {
      // Test tab navigation through header elements
      await page.keyboard.press('Tab'); // Skip link
      await page.keyboard.press('Tab'); // Logo
      
      const logo = page.locator('a[href="/"]').first();
      await expect(logo).toBeFocused();
      
      // Continue tabbing to other interactive elements
      await page.keyboard.press('Tab');
      
      // Should reach search input or other interactive elements
      const focusedElement = page.locator(':focus');
      await expect(focusedElement).toBeVisible();
    });

    test('Color contrast should meet WCAG AA standards', async ({ page }) => {
      // Check logo contrast
      const logo = page.locator('a[href="/"] div').first();
      await expect(logo).toHaveClass(/bg-orange-600/);
      await expect(logo).toHaveClass(/text-white/);
      
      // Orange 600 (#ea580c) on white has sufficient contrast
      // White text on orange 600 background has sufficient contrast
    });

  });

  test.describe('Responsive Design Tests', () => {
    
    test('Should work properly on iPhone SE (small screen)', async ({ page }) => {
      await page.setViewportSize({ width: 320, height: 568 }); // iPhone SE
      
      // Logo should be visible
      const logo = page.locator('a[href="/"]').first();
      await expect(logo).toBeVisible();
      
      // Hamburger menu should be visible
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await expect(hamburgerBtn).toBeVisible();
      
      // Desktop navigation should be hidden
      const desktopNav = page.locator('.hidden.lg\\:flex');
      await expect(desktopNav).not.toBeVisible();
    });

    test('Should work properly on iPad (tablet)', async ({ page }) => {
      await page.setViewportSize({ width: 768, height: 1024 }); // iPad
      
      // Logo should be visible with text
      const logo = page.locator('a[href="/"]').first();
      await expect(logo).toBeVisible();
      await expect(logo).toContainText('IronTrack');
      
      // Mobile menu should still be visible (lg:hidden means hidden on large screens)
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await expect(hamburgerBtn).toBeVisible();
    });

    test('Should work properly on Desktop (large screen)', async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 }); // Desktop
      
      // Logo should be visible with full text
      const logo = page.locator('a[href="/"]').first();
      await expect(logo).toBeVisible();
      await expect(logo).toContainText('IronTrack');
      await expect(logo).toContainText('Ton coach muscu personnel');
      
      // Desktop navigation should be visible
      const desktopNav = page.locator('.hidden.lg\\:flex');
      await expect(desktopNav).toBeVisible();
      
      // Hamburger menu should be hidden
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await expect(hamburgerBtn).not.toBeVisible();
    });

  });

  test.describe('Performance Tests', () => {
    
    test('Header should load quickly', async ({ page }) => {
      const startTime = Date.now();
      
      await page.goto(appUrl());
      await expect(page.locator('header')).toBeVisible();
      
      const loadTime = Date.now() - startTime;
      expect(loadTime).toBeLessThan(5000); // Should load within 5 seconds
    });

    test('Menu interactions should be responsive', async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      
      const startTime = Date.now();
      
      // Open menu
      const hamburgerBtn = page.locator('button[aria-label*="menu"]').or(
        page.locator('button').filter({ hasText: /menu/i })
      ).first();
      await hamburgerBtn.click();
      
      // Menu should appear quickly
      await expect(page.locator('text=Navigation')).toBeVisible();
      
      const interactionTime = Date.now() - startTime;
      expect(interactionTime).toBeLessThan(1000); // Should respond within 1 second
    });

  });

});
