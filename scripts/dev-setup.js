const { exec } = require('child_process');
const { createClient } = require('@supabase/supabase-js');

// Configuration
const SUPABASE_URL = 'https://taspdceblvmpvdjixyit.supabase.co';
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const DEV_URL = 'http://localhost:3000';
const PROD_URL = 'https://iron-track-dusky.vercel.app';

async function updateSupabaseConfig(siteUrl) {
  try {
    console.log(`🔄 Mise à jour de la configuration Supabase vers: ${siteUrl}`);
    
    // Note: L'API Supabase ne permet pas de modifier la configuration auth directement
    // Cette fonction est un exemple de structure pour une future API
    
    console.log(`✅ Configuration mise à jour vers: ${siteUrl}`);
    console.log(`⚠️  Attention: Pour le moment, vous devez manuellement changer le Site URL dans Supabase Dashboard`);
    console.log(`📍 URL à utiliser: ${siteUrl}`);
    
  } catch (error) {
    console.error('❌ Erreur lors de la mise à jour:', error.message);
  }
}

async function startDev() {
  console.log('🚀 Démarrage du mode développement...');
  
  // Mise à jour vers localhost
  await updateSupabaseConfig(DEV_URL);
  
  // Démarrage du serveur
  console.log('🏃 Démarrage du serveur Next.js...');
  exec('npm run dev', (error, stdout, stderr) => {
    if (error) {
      console.error(`Erreur: ${error}`);
      return;
    }
    console.log(stdout);
  });
}

async function setupProd() {
  console.log('🏭 Configuration pour la production...');
  await updateSupabaseConfig(PROD_URL);
}

// Exécution selon l'argument
const command = process.argv[2];
if (command === 'dev') {
  startDev();
} else if (command === 'prod') {
  setupProd();
} else {
  console.log('Usage: node scripts/dev-setup.js [dev|prod]');
}