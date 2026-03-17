import { test, expect, Page } from '@playwright/test'

test.describe('Menu Mobile Debug ULTRAHARDCORE', () => {
  test('Diagnostiquer pourquoi styles ne s\'appliquent pas', async ({ page }) => {
    // Activer logs console
    page.on('console', msg => {
      if (msg.text().includes('🚨') || msg.text().includes('🎨') || msg.text().includes('🌫️')) {
        console.log(`CONSOLE: ${msg.text()}`)
      }
    })

    console.log('🎯 DÉBUT TEST ULTRAHARDCORE')
    
    // Naviguer vers la page
    await page.goto('http://localhost:3000')
    await page.waitForLoadState('networkidle')
    
    console.log('🔑 ÉTAPE 0: Connexion utilisateur')
    
    // Se connecter avec le compte admin test
    await page.fill('input[type="email"]', 'thierryvm@hotmail.com')
    await page.fill('input[type="password"]', 'Lucas24052405@')
    await page.click('button[type="submit"]')
    
    // Attendre redirection vers dashboard
    await page.waitForURL('http://localhost:3000', { timeout: 15000 })
    await page.waitForLoadState('networkidle')
    
    // Vérifier que l'utilisateur est connecté (menu burger visible)
    await page.waitForSelector('button[aria-label*="menu"], button[aria-label*="Ouvrir"]', { timeout: 10000 })
    
    console.log('📱 ÉTAPE 1: Utilisateur connecté et page chargée')
    
    // Screenshot AVANT menu
    await page.screenshot({ path: 'debug-avant-menu.png', fullPage: true })
    
    // Cliquer sur menu burger
    const menuButton = await page.locator('button[aria-label*="menu"], button[aria-label*="Ouvrir"]').first()
    await menuButton.click()
    
    console.log('🍔 ÉTAPE 2: Menu burger cliqué')
    
    // Attendre que le menu s'ouvre
    await page.waitForTimeout(500)
    
    // Screenshot APRÈS menu ouvert
    await page.screenshot({ path: 'debug-apres-menu.png', fullPage: true })
    
    console.log('📸 ÉTAPE 3: Screenshots pris')
    
    // Vérifier éléments dans DOM
    const menuElement = await page.locator('[data-testid="menu-mobile-debug"]')
    const overlayElement = await page.locator('[data-testid="overlay-debug"]')
    
    // Vérifier présence
    const menuExists = await menuElement.count()
    const overlayExists = await overlayElement.count()
    
    console.log(`🔍 MENU EXISTS: ${menuExists}`)
    console.log(`🔍 OVERLAY EXISTS: ${overlayExists}`)
    
    if (menuExists > 0) {
      // Récupérer styles computed réels
      const menuStyles = await menuElement.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          position: computed.position,
          zIndex: computed.zIndex,
          backgroundColor: computed.backgroundColor,
          height: computed.height,
          display: computed.display,
          transform: computed.transform,
          visibility: computed.visibility,
          opacity: computed.opacity
        }
      })
      
      console.log('🎨 STYLES COMPUTED MENU:', JSON.stringify(menuStyles, null, 2))
      
      // Récupérer styles inline
      const inlineStyles = await menuElement.evaluate((el: HTMLElement) => el.style.cssText)
      console.log('📝 STYLES INLINE:', inlineStyles)
      
      // Récupérer position/dimensions
      const boundingBox = await menuElement.boundingBox()
      console.log('📐 BOUNDING BOX:', boundingBox)
    }
    
    if (overlayExists > 0) {
      const overlayStyles = await overlayElement.evaluate((el) => {
        const computed = window.getComputedStyle(el)
        return {
          position: computed.position,
          zIndex: computed.zIndex,
          backgroundColor: computed.backgroundColor,
          backdropFilter: computed.backdropFilter,
          display: computed.display,
          visibility: computed.visibility,
          opacity: computed.opacity
        }
      })
      
      console.log('🌫️ STYLES COMPUTED OVERLAY:', JSON.stringify(overlayStyles, null, 2))
    }
    
    // Vérifier si d'autres éléments ont des z-index élevés
    const highZElements = await page.evaluate(() => {
      const elements = Array.from(document.querySelectorAll('*'))
      return elements
        .map((el: Element) => {
          const computed = window.getComputedStyle(el as HTMLElement)
          const zIndex = parseInt(computed.zIndex) || 0
          return {
            tagName: el.tagName,
            className: (el as HTMLElement).className,
            id: (el as HTMLElement).id,
            zIndex: zIndex,
            position: computed.position
          }
        })
        .filter(item => item.zIndex > 1000)
        .sort((a, b) => b.zIndex - a.zIndex)
        .slice(0, 10) // Top 10
    })
    
    console.log('🎯 TOP Z-INDEX ELEMENTS:', JSON.stringify(highZElements, null, 2))
    
    console.log('✅ TEST TERMINÉ - Vérifiez logs et screenshots')
  })
})