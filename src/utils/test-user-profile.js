// Script de test pour valider la récupération du profil utilisateur
// Ce script peut être exécuté en développement pour tester le hook

async function testUserProfile() {
  const { createClient } = require('@/utils/supabase/client')
  
  console.log('🧪 Test du profil utilisateur...')
  
  try {
    const supabase = createClient()
    
    // Test 1: Vérifier l'utilisateur connecté
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError) {
      console.error('❌ Erreur d\'authentification:', userError.message)
      return
    }
    
    if (!user) {
      console.log('⚠️ Aucun utilisateur connecté')
      return
    }
    
    console.log('✅ Utilisateur connecté:', user.email)
    
    // Test 2: Récupérer le profil
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('id, email, full_name, pseudo, avatar_url')
      .eq('id', user.id)
      .single()
    
    if (profileError) {
      console.error('❌ Erreur de profil:', profileError.message)
      
      // Test 3: Créer un profil si nécessaire
      if (profileError.code === 'PGRST116') {
        console.log('🔄 Création d\'un profil...')
        
        const { data: newProfile, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            email: user.email || '',
            full_name: user.user_metadata?.full_name || null,
            pseudo: user.user_metadata?.name || null
          })
          .select('id, email, full_name, pseudo, avatar_url')
          .single()
        
        if (insertError) {
          console.error('❌ Erreur de création:', insertError.message)
        } else {
          console.log('✅ Profil créé:', newProfile)
        }
      }
    } else {
      console.log('✅ Profil récupéré:', profile)
    }
    
    // Test 4: Logique de nom d'affichage
    function getDisplayName(profile) {
      if (!profile) return 'Utilisateur'
      
      if (profile.full_name?.trim()) {
        return profile.full_name.trim()
      }
      
      if (profile.pseudo?.trim()) {
        return profile.pseudo.trim()
      }
      
      if (profile.email) {
        return profile.email.split('@')[0]
      }
      
      return 'Utilisateur'
    }
    
    const displayName = getDisplayName(profile)
    console.log('✅ Nom d\'affichage:', displayName)
    
    // Test 5: Scénarios de test
    console.log('\n🔍 Tests de scénarios:')
    
    // Scénario 1: Avec full_name
    console.log('Scénario 1 (full_name):', getDisplayName({
      full_name: 'Marie Dubois',
      pseudo: 'marie123',
      email: 'marie@example.com'
    }))
    
    // Scénario 2: Avec pseudo seulement
    console.log('Scénario 2 (pseudo):', getDisplayName({
      full_name: null,
      pseudo: 'marie123',
      email: 'marie@example.com'
    }))
    
    // Scénario 3: Avec email seulement
    console.log('Scénario 3 (email):', getDisplayName({
      full_name: null,
      pseudo: null,
      email: 'marie.dubois@example.com'
    }))
    
    // Scénario 4: Profil vide
    console.log('Scénario 4 (vide):', getDisplayName(null))
    
    console.log('\n✅ Tests terminés avec succès!')
    
  } catch (error) {
    console.error('❌ Erreur lors du test:', error.message)
  }
}

// Export pour utilisation dans les tests
if (typeof module !== 'undefined' && module.exports) {
  module.exports = { testUserProfile }
}

// Exécution directe si possible
if (typeof window !== 'undefined') {
  testUserProfile()
}