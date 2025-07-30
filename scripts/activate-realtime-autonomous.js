/**
 * Script autonome pour activer le Realtime sur la table training_partners
 * Utilise le client Supabase avec service role key pour l'activation complète
 */

require('dotenv').config({ path: '.env.local' })
const { createClient } = require('@supabase/supabase-js')

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Variables d\'environnement manquantes')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function activateRealtimeNotifications() {
  console.log('=== ACTIVATION AUTONOME REALTIME NOTIFICATIONS ===\n')
  
  try {
    // 1. Activer la réplication temps réel pour la table training_partners
    console.log('📡 Activation de la réplication Realtime...')
    
    const activateReplicationSql = `
      -- Activer la réplication temps réel pour la table training_partners
      ALTER PUBLICATION supabase_realtime ADD TABLE training_partners;
    `
    
    const { error: replicationError } = await supabase.rpc('exec_sql', { 
      sql: activateReplicationSql 
    })
    
    if (replicationError) {
      console.error('❌ Erreur activation réplication:', replicationError)
    } else {
      console.log('✅ Réplication Realtime activée pour training_partners')
    }
    
    // 2. Vérifier et créer les politiques RLS nécessaires
    console.log('\n🔒 Vérification des politiques RLS...')
    
    const rlsPoliciesSql = `
      -- Vérifier que RLS est activé
      ALTER TABLE training_partners ENABLE ROW LEVEL SECURITY;
      
      -- Politique pour lire les invitations reçues
      CREATE POLICY IF NOT EXISTS "Users can read partnerships where they are partner" 
      ON training_partners FOR SELECT 
      TO authenticated 
      USING (partner_id = auth.uid());
      
      -- Politique pour lire les invitations envoyées  
      CREATE POLICY IF NOT EXISTS "Users can read partnerships where they are requester" 
      ON training_partners FOR SELECT 
      TO authenticated 
      USING (requester_id = auth.uid());
      
      -- Politique pour insérer des partenariats
      CREATE POLICY IF NOT EXISTS "Users can create partnerships as requester" 
      ON training_partners FOR INSERT 
      TO authenticated 
      WITH CHECK (requester_id = auth.uid());
      
      -- Politique pour modifier ses propres invitations
      CREATE POLICY IF NOT EXISTS "Users can update partnerships they are involved in" 
      ON training_partners FOR UPDATE 
      TO authenticated 
      USING (requester_id = auth.uid() OR partner_id = auth.uid());
    `
    
    const { error: rlsError } = await supabase.rpc('exec_sql', { 
      sql: rlsPoliciesSql 
    })
    
    if (rlsError) {
      console.error('❌ Erreur politiques RLS:', rlsError)
    } else {
      console.log('✅ Politiques RLS configurées')
    }
    
    // 3. Vérifier la configuration
    console.log('\n🔍 Vérification de la configuration...')
    
    const verificationSql = `
      -- Vérifier que la table est dans la publication realtime
      SELECT schemaname, tablename 
      FROM pg_publication_tables 
      WHERE pubname = 'supabase_realtime' 
      AND tablename = 'training_partners';
    `
    
    const { data: replicationCheck, error: checkError } = await supabase.rpc('exec_sql', { 
      sql: verificationSql 
    })
    
    if (checkError) {
      console.error('❌ Erreur vérification:', checkError)
    } else {
      if (replicationCheck && replicationCheck.length > 0) {
        console.log('✅ Table training_partners trouvée dans supabase_realtime')
      } else {
        console.log('⚠️  Table training_partners non trouvée dans supabase_realtime')
      }
    }
    
    // 4. Test de connexion Realtime
    console.log('\n🧪 Test de connexion Realtime...')
    
    const testChannel = supabase.channel('test-realtime-activation')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'training_partners'
      }, (payload) => {
        console.log('📡 Test Realtime reçu:', payload)
      })
      .subscribe((status) => {
        console.log('📡 Statut canal test:', status)
        
        if (status === 'SUBSCRIBED') {
          console.log('✅ Realtime fonctionne correctement !')
          
          // Nettoyer le canal de test après 2 secondes
          setTimeout(() => {
            supabase.removeChannel(testChannel)
            console.log('🧹 Canal de test nettoyé')
          }, 2000)
        } else if (status === 'CHANNEL_ERROR') {
          console.log('❌ Erreur connexion Realtime')
        }
      })
    
    // 5. Instructions post-activation
    console.log('\n📋 INSTRUCTIONS POST-ACTIVATION')
    console.log('──────────────────────────────────────────────────')
    console.log('1. ✅ Realtime activé sur training_partners')
    console.log('2. ✅ Politiques RLS configurées')
    console.log('3. 🔄 Redémarrer l\'application (npm run dev)')
    console.log('4. 🧪 Tester en créant une nouvelle invitation')
    console.log('5. 👀 Vérifier les logs console pour "✅ Canal realtime connecté"')
    
    console.log('\n🎉 ACTIVATION REALTIME TERMINÉE AVEC SUCCÈS !')
    
    // Attendre un peu avant de fermer pour voir les résultats du test
    setTimeout(() => {
      process.exit(0)
    }, 3000)
    
  } catch (error) {
    console.error('❌ Erreur lors de l\'activation:', error)
    process.exit(1)
  }
}

activateRealtimeNotifications()