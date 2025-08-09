#!/usr/bin/env node

/**
 * Script pour rafraîchir le cache du schéma PostgREST dans Supabase
 * 
 * Usage:
 *   node scripts/refresh-postgrest-cache.js
 *   
 * Ce script résout l'erreur "Could not find column in schema cache"
 * qui survient après les migrations de base de données.
 */

const https = require('https');

// Configuration depuis .env.local
const SUPABASE_URL = 'https://taspdceblvmpvdjixyit.supabase.co';
const SERVICE_ROLE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || '***REDACTED_SERVICE_ROLE_KEY***';

/**
 * Effectue une requête HTTP POST vers Supabase
 */
function makeRequest(url, method = 'POST', data = null) {
  return new Promise((resolve, reject) => {
    const urlObj = new URL(url);
    
    const options = {
      hostname: urlObj.hostname,
      port: urlObj.port || 443,
      path: urlObj.pathname + urlObj.search,
      method: method,
      headers: {
        'apikey': SERVICE_ROLE_KEY,
        'Authorization': `Bearer ${SERVICE_ROLE_KEY}`,
        'Content-Type': 'application/json',
        'User-Agent': 'IronTrack-Cache-Refresh/1.0'
      }
    };

    if (data && method !== 'GET') {
      const postData = JSON.stringify(data);
      options.headers['Content-Length'] = Buffer.byteLength(postData);
    }

    const req = https.request(options, (res) => {
      let responseData = '';
      
      res.on('data', (chunk) => {
        responseData += chunk;
      });
      
      res.on('end', () => {
        try {
          const response = responseData ? JSON.parse(responseData) : {};
          resolve({ status: res.statusCode, data: response, raw: responseData });
        } catch (e) {
          resolve({ status: res.statusCode, data: null, raw: responseData });
        }
      });
    });

    req.on('error', (err) => {
      reject(err);
    });

    if (data && method !== 'GET') {
      req.write(JSON.stringify(data));
    }
    
    req.end();
  });
}

/**
 * Méthodes de rafraîchissement du cache PostgREST
 */
async function refreshPostgRESTCache() {
  console.log('🔄 Rafraîchissement du cache PostgREST...\n');
  
  const methods = [
    {
      name: 'RPC Function refresh_postgrest_schema_cache',
      url: `${SUPABASE_URL}/rest/v1/rpc/refresh_postgrest_schema_cache`,
      method: 'POST'
    },
    {
      name: 'Admin reload-schema endpoint', 
      url: `${SUPABASE_URL}/rest/v1/admin/reload-schema`,
      method: 'POST'
    }
  ];

  let successCount = 0;
  
  for (const method of methods) {
    try {
      console.log(`⏳ Tentative: ${method.name}`);
      const response = await makeRequest(method.url, method.method);
      
      if (response.status >= 200 && response.status < 300) {
        console.log(`✅ Succès: ${method.name}`);
        console.log(`   Réponse: ${response.raw}`);
        successCount++;
      } else {
        console.log(`❌ Échec: ${method.name} (HTTP ${response.status})`);
        console.log(`   Erreur: ${response.raw}`);
      }
    } catch (error) {
      console.log(`❌ Erreur: ${method.name}`);
      console.log(`   Message: ${error.message}`);
    }
    console.log('');
  }

  // Test de validation
  console.log('🧪 Test de validation...');
  try {
    const testResponse = await makeRequest(`${SUPABASE_URL}/rest/v1/performance_logs?select=rest_seconds&limit=1`, 'GET');
    
    if (testResponse.status === 200 && testResponse.raw.includes('rest_seconds')) {
      console.log('✅ Validation: colonne rest_seconds accessible');
      console.log(`   Données: ${testResponse.raw}`);
    } else {
      console.log('❌ Validation échouée: colonne rest_seconds non accessible');
      console.log(`   Réponse: ${testResponse.raw}`);
    }
  } catch (error) {
    console.log(`❌ Erreur de validation: ${error.message}`);
  }

  console.log(`\n🎯 Résumé: ${successCount}/${methods.length} méthodes ont réussi`);
  
  if (successCount > 0) {
    console.log('\n✨ Le cache PostgREST a été rafraîchi avec succès !');
    console.log('   Vos migrations devraient maintenant être visibles dans l\'API REST.');
  } else {
    console.log('\n⚠️  Aucune méthode n\'a réussi. Solutions alternatives:');
    console.log('   1. Attendre 5-10 minutes (rafraîchissement automatique)');
    console.log('   2. Redémarrer votre instance Supabase depuis le dashboard');
    console.log('   3. Contacter le support Supabase si le problème persiste');
  }
}

// Exécution du script
if (require.main === module) {
  refreshPostgRESTCache().catch(console.error);
}

module.exports = { refreshPostgRESTCache };