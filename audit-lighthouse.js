#!/usr/bin/env node

const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs').promises;
const path = require('path');

async function runLighthouseAudit(url, outputName) {
  console.log(`🔍 Audit Lighthouse: ${url}`);
  
  let chrome;
  try {
    // Lancer Chrome
    chrome = await chromeLauncher.launch({
      chromeFlags: ['--headless', '--no-sandbox', '--disable-gpu', '--disable-dev-shm-usage']
    });
    
    // Configuration Lighthouse
    const options = {
      logLevel: 'info',
      output: 'html',
      onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'],
      port: chrome.port,
    };
    
    // Exécuter l'audit
    const runnerResult = await lighthouse(url, options);
    
    // Sauvegarder le rapport HTML
    const reportHtml = runnerResult.report;
    const outputPath = path.join(__dirname, `lighthouse-${outputName}.html`);
    await fs.writeFile(outputPath, reportHtml);
    
    // Extraire et afficher les scores principaux
    const lhr = runnerResult.lhr;
    const scores = {
      performance: Math.round(lhr.categories.performance.score * 100),
      accessibility: Math.round(lhr.categories.accessibility.score * 100),
      bestPractices: Math.round(lhr.categories['best-practices'].score * 100),
      seo: Math.round(lhr.categories.seo.score * 100)
    };
    
    console.log(`✅ Rapport sauvegardé: ${outputPath}`);
    console.log(`📊 Scores - Performance: ${scores.performance}, Accessibilité: ${scores.accessibility}, Bonnes pratiques: ${scores.bestPractices}, SEO: ${scores.seo}`);
    
    return scores;
    
  } catch (error) {
    console.error(`❌ Erreur audit ${url}:`, error.message);
    return null;
  } finally {
    if (chrome) {
      await chrome.kill();
    }
  }
}

async function runAllAudits() {
  console.log('🚀 Début audit Lighthouse complet IronTrack\n');
  
  const pages = [
    { url: 'http://localhost:3001/', name: 'homepage', title: 'Page d\'accueil' },
    { url: 'http://localhost:3001/calendar', name: 'calendar', title: 'Calendrier (Tabs ShadCN)' },
    { url: 'http://localhost:3001/exercises', name: 'exercises', title: 'Exercices (Cards ShadCN)' },
    { url: 'http://localhost:3001/profile', name: 'profile', title: 'Profil (Forms ShadCN)' },
    { url: 'http://localhost:3001/training-partners', name: 'partners', title: 'Partenaires d\'entraînement' }
  ];
  
  const results = [];
  
  for (const page of pages) {
    console.log(`\n📄 ${page.title}`);
    console.log('─'.repeat(50));
    
    const scores = await runLighthouseAudit(page.url, page.name);
    if (scores) {
      results.push({ ...page, scores });
    }
    
    // Pause entre les audits
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  // Résumé final
  console.log('\n' + '='.repeat(60));
  console.log('📊 RÉSUMÉ AUDIT LIGHTHOUSE COMPLET');
  console.log('='.repeat(60));
  
  results.forEach(result => {
    console.log(`\n${result.title}:`);
    console.log(`  Performance: ${result.scores.performance}/100`);
    console.log(`  Accessibilité: ${result.scores.accessibility}/100`);
    console.log(`  Bonnes pratiques: ${result.scores.bestPractices}/100`);
    console.log(`  SEO: ${result.scores.seo}/100`);
  });
  
  console.log('\n🎉 Audit terminé ! Consultez les rapports HTML générés.');
}

// Exécuter si appelé directement
if (require.main === module) {
  runAllAudits().catch(console.error);
}

module.exports = { runLighthouseAudit, runAllAudits };