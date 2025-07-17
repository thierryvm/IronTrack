const { createClient } = require('@supabase/supabase-js')

// Configuration Supabase
const supabaseUrl = 'https://taspdceblvmpvdjixyit.supabase.co'
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRhc3BkY2VibHZtcHZkaml4eWl0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE3NTQ3NzYsImV4cCI6MjA2NzMzMDc3Nn0.v-EJdY0mrG4RBN6g5ONnDXgl946f7lYzmcMCzw2Pdh0'

const supabase = createClient(supabaseUrl, supabaseKey)

// IDs des utilisateurs
const THIERRY_ID = '30157b6b-b64c-4dbf-a627-9a75b6267dc7'
const TITI_ID = '069d73e4-8384-4141-91ea-32bfecafb496'

async function testNutritionSharing() {
    console.log('🔍 === TEST DE PARTAGE NUTRITION ===')
    
    // 1. Vérifier les données nutrition de titi
    console.log('\n1. Vérification données nutrition de titi...')
    const { data: nutritionData, error: nutritionError } = await supabase
        .from('nutrition_logs')
        .select('*')
        .eq('user_id', TITI_ID)
        .order('date', { ascending: false })
        .limit(5)
    
    if (nutritionError) {
        console.error('❌ Erreur nutrition:', nutritionError)
        return
    }
    
    console.log('✅ Données nutrition trouvées:', nutritionData.length, 'entrées')
    nutritionData.forEach(entry => {
        console.log(`   - ${entry.date} ${entry.meal_type}: ${entry.food_name} (${entry.calories}cal)`)
    })
    
    // 2. Vérifier le partenariat
    console.log('\n2. Vérification partenariat...')
    const { data: partnershipData, error: partnershipError } = await supabase
        .from('training_partners')
        .select('*')
        .eq('status', 'accepted')
        .or(`and(requester_id.eq.${THIERRY_ID},partner_id.eq.${TITI_ID}),and(requester_id.eq.${TITI_ID},partner_id.eq.${THIERRY_ID})`)
        .single()
    
    if (partnershipError) {
        console.error('❌ Erreur partenariat:', partnershipError)
        return
    }
    
    console.log('✅ Partenariat trouvé:', partnershipData.status)
    
    // 3. Vérifier les permissions de partage
    console.log('\n3. Vérification permissions de partage...')
    const { data: sharingSettings, error: sharingError } = await supabase
        .from('partner_sharing_settings')
        .select('*')
        .eq('user_id', TITI_ID)
        .eq('partner_id', THIERRY_ID)
        .single()
    
    if (sharingError) {
        console.error('❌ Erreur permissions:', sharingError)
        return
    }
    
    console.log('✅ Permissions trouvées:', {
        share_nutrition: sharingSettings.share_nutrition,
        share_workouts: sharingSettings.share_workouts,
        share_progress: sharingSettings.share_progress
    })
    
    // 4. Simuler la requête API exacte
    console.log('\n4. Simulation requête API...')
    
    // Requête exacte comme dans l'API
    let query = supabase
        .from('nutrition_logs')
        .select(`
            id,
            date,
            meal_type,
            food_name,
            calories,
            protein,
            carbs,
            fat,
            time,
            created_at
        `)
        .eq('user_id', TITI_ID)
        .order('date', { ascending: false })
        .order('time', { ascending: true })
    
    // Filtrer par les 7 derniers jours
    const sevenDaysAgo = new Date()
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7)
    query = query.gte('date', sevenDaysAgo.toISOString().split('T')[0])
    
    const { data: apiData, error: apiError } = await query
    
    if (apiError) {
        console.error('❌ Erreur API simulation:', apiError)
        return
    }
    
    console.log('✅ Données API récupérées:', apiData.length, 'entrées')
    
    // 5. Vérifier les profils
    console.log('\n5. Vérification profils...')
    const { data: profiles, error: profileError } = await supabase
        .from('profiles')
        .select('id, pseudo, full_name')
        .in('id', [THIERRY_ID, TITI_ID])
    
    if (profileError) {
        console.error('❌ Erreur profils:', profileError)
        return
    }
    
    console.log('✅ Profils trouvés:')
    profiles.forEach(profile => {
        console.log(`   - ${profile.pseudo} (${profile.id})`)
    })
    
    // 6. Test avec fetch direct sur l'API
    console.log('\n6. Test API directe (sans auth)...')
    
    try {
        const response = await fetch(`http://localhost:3000/api/nutrition/shared?partnerId=${TITI_ID}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        
        const result = await response.json()
        
        console.log('📡 Réponse API:', {
            status: response.status,
            ok: response.ok,
            result: result
        })
        
    } catch (error) {
        console.error('❌ Erreur fetch API:', error)
    }
    
    console.log('\n🎯 === FIN DU TEST ===')
}

// Exécuter le test
testNutritionSharing().catch(console.error)