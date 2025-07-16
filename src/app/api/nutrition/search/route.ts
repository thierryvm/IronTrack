import { NextRequest, NextResponse } from 'next/server'

// Interface pour les données OpenFoodFacts (basée sur la vraie réponse API)
interface OpenFoodFactsProduct {
  product_name?: string
  nutriments?: {
    'energy-kcal_100g'?: number
    'proteins_100g'?: number
    'carbohydrates_100g'?: number
    'fat_100g'?: number
    [key: string]: unknown
  }
  brands?: string
  quantity?: string
  image_front_url?: string
  categories?: string
}

interface OpenFoodFactsResponse {
  products?: OpenFoodFactsProduct[]
  count?: number
}

interface NutritionSearchResult {
  id: string
  name: string
  brand?: string
  calories_per_100g: number
  protein_per_100g: number
  carbs_per_100g: number
  fat_per_100g: number
  image_url?: string
  categories?: string
  quantity?: string
}

// Fonction de sanitisation des entrées
function sanitizeQuery(query: string): string {
  // Nettoyer et valider la requête de recherche
  return query
    .toLowerCase()
    // Supprimer seulement les caractères vraiment dangereux pour SQL/XSS
    .replace(/[<>&"]/g, '')
    // Garder les apostrophes et caractères de ponctuation utiles pour la recherche
    .replace(/[^a-zA-Z0-9\s\u00C0-\u017F\-'.,]/g, '')
    // Normaliser les espaces multiples en espaces simples
    .replace(/\s+/g, ' ')
    .trim()
    // Limiter la longueur
    .substring(0, 100)
}

// Fonction de validation des données nutritionnelles
function validateNutrientValue(value: unknown): number {
  const num = parseFloat(String(value))
  // Valider que c'est un nombre positif raisonnable
  if (isNaN(num) || num < 0 || num > 10000) {
    return 0
  }
  return Math.round(num * 100) / 100 // Arrondir à 2 décimales
}

// Base de données d'aliments frais belges/français
const LOCAL_FRESH_FOODS = [
  // Légumes frais
  { name: 'Tomates fraîches', calories: 18, protein: 0.9, carbs: 3.9, fat: 0.2, categories: 'Légumes frais' },
  { name: 'Salade verte', calories: 15, protein: 1.4, carbs: 2.9, fat: 0.2, categories: 'Légumes frais' },
  { name: 'Concombre', calories: 16, protein: 0.7, carbs: 3.6, fat: 0.1, categories: 'Légumes frais' },
  { name: 'Courgettes', calories: 17, protein: 1.2, carbs: 3.1, fat: 0.3, categories: 'Légumes frais' },
  { name: 'Carottes', calories: 41, protein: 0.9, carbs: 9.6, fat: 0.2, categories: 'Légumes frais' },
  { name: 'Oignons', calories: 40, protein: 1.1, carbs: 9.3, fat: 0.1, categories: 'Légumes frais' },
  { name: 'Poivrons', calories: 31, protein: 1.9, carbs: 6.0, fat: 0.3, categories: 'Légumes frais' },
  { name: 'Épinards frais', calories: 23, protein: 2.9, carbs: 3.6, fat: 0.4, categories: 'Légumes frais' },
  { name: 'Brocolis', calories: 34, protein: 2.8, carbs: 7.0, fat: 0.4, categories: 'Légumes frais' },
  { name: 'Champignons de Paris', calories: 22, protein: 3.1, carbs: 3.3, fat: 0.3, categories: 'Légumes frais' },
  
  // Fruits frais
  { name: 'Pommes', calories: 52, protein: 0.3, carbs: 14.0, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Bananes', calories: 89, protein: 1.1, carbs: 23.0, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Oranges', calories: 47, protein: 0.9, carbs: 12.0, fat: 0.1, categories: 'Fruits frais' },
  { name: 'Poires', calories: 57, protein: 0.4, carbs: 15.0, fat: 0.1, categories: 'Fruits frais' },
  { name: 'Fraises', calories: 32, protein: 0.7, carbs: 8.0, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Kiwis', calories: 61, protein: 1.1, carbs: 15.0, fat: 0.5, categories: 'Fruits frais' },
  { name: 'Raisins', calories: 69, protein: 0.7, carbs: 18.0, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Mangues', calories: 60, protein: 0.8, carbs: 15.0, fat: 0.4, categories: 'Fruits frais' },
  { name: 'Ananas', calories: 50, protein: 0.5, carbs: 13.0, fat: 0.1, categories: 'Fruits frais' },
  { name: 'Pêches', calories: 39, protein: 0.9, carbs: 9.5, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Abricots', calories: 48, protein: 1.4, carbs: 11.0, fat: 0.4, categories: 'Fruits frais' },
  { name: 'Cerises', calories: 63, protein: 1.1, carbs: 16.0, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Prunes', calories: 46, protein: 0.7, carbs: 11.0, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Melon', calories: 34, protein: 0.8, carbs: 8.2, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Pastèque', calories: 30, protein: 0.6, carbs: 7.6, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Citrons', calories: 29, protein: 1.1, carbs: 9.3, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Limes', calories: 30, protein: 0.7, carbs: 10.5, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Pamplemousse', calories: 42, protein: 0.8, carbs: 10.7, fat: 0.1, categories: 'Fruits frais' },
  { name: 'Myrtilles', calories: 57, protein: 0.7, carbs: 14.0, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Framboises', calories: 52, protein: 1.2, carbs: 12.0, fat: 0.7, categories: 'Fruits frais' },
  { name: 'Mûres', calories: 43, protein: 1.4, carbs: 10.0, fat: 0.5, categories: 'Fruits frais' },
  { name: 'Cassis', calories: 63, protein: 1.4, carbs: 15.0, fat: 0.4, categories: 'Fruits frais' },
  { name: 'Groseilles', calories: 56, protein: 1.4, carbs: 14.0, fat: 0.2, categories: 'Fruits frais' },
  { name: 'Figues fraîches', calories: 74, protein: 0.8, carbs: 19.0, fat: 0.3, categories: 'Fruits frais' },
  { name: 'Grenades', calories: 83, protein: 1.7, carbs: 19.0, fat: 1.2, categories: 'Fruits frais' },
  { name: 'Avocats', calories: 160, protein: 2.0, carbs: 8.5, fat: 15.0, categories: 'Fruits frais' },
  
  // Fruits secs
  { name: 'Amandes', calories: 579, protein: 21.0, carbs: 22.0, fat: 49.0, categories: 'Fruits secs' },
  { name: 'Noix', calories: 654, protein: 15.0, carbs: 14.0, fat: 65.0, categories: 'Fruits secs' },
  { name: 'Noisettes', calories: 628, protein: 15.0, carbs: 17.0, fat: 61.0, categories: 'Fruits secs' },
  { name: 'Pistaches', calories: 560, protein: 20.0, carbs: 28.0, fat: 45.0, categories: 'Fruits secs' },
  { name: 'Cacahuètes', calories: 567, protein: 26.0, carbs: 16.0, fat: 49.0, categories: 'Fruits secs' },
  { name: 'Noix de cajou', calories: 553, protein: 18.0, carbs: 30.0, fat: 44.0, categories: 'Fruits secs' },
  { name: 'Noix de pécan', calories: 691, protein: 9.0, carbs: 14.0, fat: 72.0, categories: 'Fruits secs' },
  { name: 'Noix du Brésil', calories: 656, protein: 14.0, carbs: 12.0, fat: 66.0, categories: 'Fruits secs' },
  { name: 'Pignons de pin', calories: 673, protein: 14.0, carbs: 13.0, fat: 68.0, categories: 'Fruits secs' },
  
  // Fruits séchés
  { name: 'Raisins secs', calories: 299, protein: 3.1, carbs: 79.0, fat: 0.5, categories: 'Fruits séchés' },
  { name: 'Abricots secs', calories: 241, protein: 3.4, carbs: 63.0, fat: 0.5, categories: 'Fruits séchés' },
  { name: 'Figues sèches', calories: 249, protein: 3.3, carbs: 64.0, fat: 0.9, categories: 'Fruits séchés' },
  { name: 'Dattes', calories: 282, protein: 2.5, carbs: 75.0, fat: 0.4, categories: 'Fruits séchés' },
  { name: 'Pruneaux', calories: 240, protein: 2.2, carbs: 64.0, fat: 0.4, categories: 'Fruits séchés' },
  { name: 'Cranberries séchées', calories: 308, protein: 0.1, carbs: 83.0, fat: 1.1, categories: 'Fruits séchés' },
  { name: 'Mangues séchées', calories: 314, protein: 2.5, carbs: 78.0, fat: 1.2, categories: 'Fruits séchés' },
  { name: 'Bananes séchées', calories: 346, protein: 3.9, carbs: 82.0, fat: 1.8, categories: 'Fruits séchés' },
  { name: 'Ananas séché', calories: 357, protein: 2.1, carbs: 93.0, fat: 0.2, categories: 'Fruits séchés' },
  { name: 'Papaye séchée', calories: 325, protein: 5.6, carbs: 82.0, fat: 1.0, categories: 'Fruits séchés' },
  
  // Viandes fraîches
  { name: 'Blanc de poulet', calories: 165, protein: 31.0, carbs: 0.0, fat: 3.6, categories: 'Viandes fraîches' },
  { name: 'Escalope de dinde', calories: 135, protein: 30.0, carbs: 0.0, fat: 1.0, categories: 'Viandes fraîches' },
  { name: 'Bœuf haché 5%', calories: 137, protein: 30.0, carbs: 0.0, fat: 2.0, categories: 'Viandes fraîches' },
  { name: 'Filet de porc', calories: 143, protein: 26.0, carbs: 0.0, fat: 3.5, categories: 'Viandes fraîches' },
  
  // Poissons frais
  { name: 'Saumon frais', calories: 208, protein: 25.0, carbs: 0.0, fat: 12.0, categories: 'Poissons frais' },
  { name: 'Cabillaud frais', calories: 82, protein: 18.0, carbs: 0.0, fat: 0.7, categories: 'Poissons frais' },
  { name: 'Thon frais', calories: 144, protein: 30.0, carbs: 0.0, fat: 1.0, categories: 'Poissons frais' },
  
  // Produits laitiers frais
  { name: 'Œufs frais', calories: 155, protein: 13.0, carbs: 1.1, fat: 11.0, categories: 'Produits laitiers frais' },
  { name: 'Fromage blanc 0%', calories: 47, protein: 8.0, carbs: 4.0, fat: 0.2, categories: 'Produits laitiers frais' },
  { name: 'Mozzarella fraîche', calories: 280, protein: 18.0, carbs: 3.0, fat: 22.0, categories: 'Produits laitiers frais' },
]

// Fonction pour transformer les aliments locaux
function transformLocalFood(food: typeof LOCAL_FRESH_FOODS[0]): NutritionSearchResult {
  const id = food.name.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase()
  return {
    id: `local_${id}_${Date.now()}`,
    name: food.name,
    brand: '🇧🇪 Produit frais local',
    calories_per_100g: food.calories,
    protein_per_100g: food.protein,
    carbs_per_100g: food.carbs,
    fat_per_100g: food.fat,
    categories: food.categories,
    quantity: '100g'
  }
}

// Fonction pour rechercher dans les aliments locaux
function searchLocalFoods(query: string): NutritionSearchResult[] {
  const normalizedQuery = query.toLowerCase().trim()
  
  return LOCAL_FRESH_FOODS
    .filter(food => {
      const foodName = food.name.toLowerCase()
      const foodCategories = food.categories.toLowerCase()
      
      // Recherche directe dans le nom
      if (foodName.includes(normalizedQuery)) return true
      
      // Recherche dans les catégories
      if (foodCategories.includes(normalizedQuery)) return true
      
      // Recherche par mots-clés simplifiée
      const keywordMatches: Record<string, string[]> = {
        // Légumes
        'tomate': ['tomates fraîches'],
        'salade': ['salade verte'],
        'concombre': ['concombre'],
        'carotte': ['carottes'],
        'oignon': ['oignons'],
        'champignon': ['champignons de paris'],
        'épinard': ['épinards frais'],
        'brocoli': ['brocolis'],
        'courgette': ['courgettes'],
        'poivron': ['poivrons'],
        
        // Fruits frais
        'pomme': ['pommes'],
        'banane': ['bananes'],
        'orange': ['oranges'],
        'poire': ['poires'],
        'fraise': ['fraises'],
        'kiwi': ['kiwis'],
        'raisin': ['raisins'],
        'mangue': ['mangues'],
        'ananas': ['ananas'],
        'pêche': ['pêches'],
        'abricot': ['abricots'],
        'cerise': ['cerises'],
        'prune': ['prunes'],
        'melon': ['melon'],
        'pastèque': ['pastèque'],
        'citron': ['citrons'],
        'lime': ['limes'],
        'pamplemousse': ['pamplemousse'],
        'myrtille': ['myrtilles'],
        'framboise': ['framboises'],
        'mûre': ['mûres'],
        'cassis': ['cassis'],
        'groseille': ['groseilles'],
        'figue': ['figues fraîches'],
        'grenade': ['grenades'],
        'avocat': ['avocats'],
        
        // Fruits secs
        'amande': ['amandes'],
        'noix': ['noix'],
        'noisette': ['noisettes'],
        'pistache': ['pistaches'],
        'cacahuète': ['cacahuètes'],
        'cajou': ['noix de cajou'],
        'pécan': ['noix de pécan'],
        'brésil': ['noix du brésil'],
        'pignon': ['pignons de pin'],
        
        // Fruits séchés
        'raisin sec': ['raisins secs'],
        'abricot sec': ['abricots secs'],
        'figue sèche': ['figues sèches'],
        'datte': ['dattes'],
        'pruneau': ['pruneaux'],
        'cranberry': ['cranberries séchées'],
        'mangue séchée': ['mangues séchées'],
        'banane séchée': ['bananes séchées'],
        'ananas séché': ['ananas séché'],
        'papaye séchée': ['papaye séchée'],
        
        // Viandes
        'oeuf': ['œufs frais'],
        'poulet': ['blanc de poulet'],
        'dinde': ['escalope de dinde'],
        'boeuf': ['bœuf haché'],
        'porc': ['filet de porc'],
        'saumon': ['saumon frais'],
        'thon': ['thon frais']
      }
      
      // Vérifier si le terme de recherche correspond à un alias
      for (const [keyword, foodMatches] of Object.entries(keywordMatches)) {
        if (normalizedQuery.includes(keyword)) {
          for (const foodMatch of foodMatches) {
            if (foodName.includes(foodMatch.toLowerCase())) {
              return true
            }
          }
        }
      }
      
      return false
    })
    .map(transformLocalFood)
    .slice(0, 5) // Limiter à 5 résultats locaux
}

// Fonction de transformation sécurisée des données
function transformProduct(product: OpenFoodFactsProduct): NutritionSearchResult | null {
  try {
    // Vérifier que le produit a les données minimales requises
    if (!product.product_name) {
      return null
    }
    
    // Générer un ID unique combinant nom et marque
    const brandSuffix = product.brands ? `_${product.brands.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 20)}` : ''
    const productId = `${product.product_name.replace(/[^a-zA-Z0-9]/g, '_').substring(0, 30)}${brandSuffix}_${Date.now()}`

    // Sanitiser le nom du produit
    const name = product.product_name
      .replace(/[<>'"&]/g, '')
      .substring(0, 200)
      .trim()

    if (!name) {
      return null
    }

    // Extraire et valider les nutriments
    const nutrients = product.nutriments || {}
    
    return {
      id: productId.substring(0, 50), // Limiter la longueur de l'ID
      name,
      brand: product.brands?.replace(/[<>'"&]/g, '').substring(0, 100),
      calories_per_100g: validateNutrientValue(nutrients['energy-kcal_100g']),
      protein_per_100g: validateNutrientValue(nutrients['proteins_100g']),
      carbs_per_100g: validateNutrientValue(nutrients['carbohydrates_100g']),
      fat_per_100g: validateNutrientValue(nutrients['fat_100g']),
      image_url: product.image_front_url?.startsWith('http') ? product.image_front_url.substring(0, 500) : undefined,
      categories: product.categories?.replace(/[<>'"&]/g, '').substring(0, 200),
      quantity: product.quantity?.replace(/[<>'"&]/g, '').substring(0, 50)
    }
  } catch (error) {
    console.error('Erreur transformation produit:', error)
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const query = searchParams.get('q')

    // Validation de la requête
    if (!query) {
      return NextResponse.json({ 
        error: 'Paramètre de recherche requis' 
      }, { status: 400 })
    }

    // Sanitiser la requête
    const sanitizedQuery = sanitizeQuery(query)
    
    if (sanitizedQuery.length < 2) {
      return NextResponse.json({ 
        error: 'La recherche doit contenir au moins 2 caractères' 
      }, { status: 400 })
    }

    // Construire l'URL OpenFoodFacts avec paramètres sécurisés et optimisés
    const searchUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(sanitizedQuery)}&search_simple=1&action=process&json=1&page_size=10&fields=product_name,brands,nutriments,quantity,image_front_url,categories&sort_by=unique_scans_n`


    // Effectuer la requête avec timeout
    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), 5000) // 5 secondes timeout

    try {
      const response = await fetch(searchUrl, {
        signal: controller.signal,
        headers: {
          'User-Agent': 'IronTrack-Nutrition-App/1.0'
        }
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw new Error(`API OpenFoodFacts error: ${response.status}`)
      }

      const data: OpenFoodFactsResponse = await response.json()

      // Rechercher d'abord dans les aliments locaux
      const localResults = searchLocalFoods(sanitizedQuery)
      
      // Debug: afficher les résultats locaux
      if (process.env.NODE_ENV === 'development') {
        console.log('Local results for query:', sanitizedQuery, localResults.length)
      }

      // Transformer et filtrer les produits OpenFoodFacts
      let products = (data.products || [])
        .map(transformProduct)
        .filter((product): product is NutritionSearchResult => product !== null)
        // Filtrer les produits avec au moins quelques données nutritionnelles valides
        .filter(product => 
          product.calories_per_100g >= 0 && 
          product.protein_per_100g >= 0 && 
          product.carbs_per_100g >= 0 && 
          product.fat_per_100g >= 0 &&
          // S'assurer qu'au moins une valeur nutritionnelle est présente
          (product.calories_per_100g > 0 || product.protein_per_100g > 0)
        )

      // Combiner les résultats locaux en premier, puis OpenFoodFacts
      products = [...localResults, ...products]

      // Si aucun résultat et le terme semble être un plat composé, essayer les ingrédients individuels
      if (products.length === 0 && sanitizedQuery.includes(' ')) {
        const mainIngredient = sanitizedQuery.split(' ').find(word => 
          ['poulet', 'boeuf', 'porc', 'poisson', 'saumon', 'thon', 'oeuf', 'fromage', 'lait', 'yaourt', 'riz', 'pâtes', 'pain', 'salade', 'tomate', 'avocat'].includes(word)
        )
        
        if (mainIngredient) {
          const fallbackUrl = `https://world.openfoodfacts.org/cgi/search.pl?search_terms=${encodeURIComponent(mainIngredient)}&search_simple=1&action=process&json=1&page_size=5&fields=product_name,brands,nutriments,quantity,image_front_url,categories&sort_by=unique_scans_n`
          
          try {
            const fallbackResponse = await fetch(fallbackUrl)
            if (fallbackResponse.ok) {
              const fallbackData: OpenFoodFactsResponse = await fallbackResponse.json()
              products = (fallbackData.products || [])
                .map(transformProduct)
                .filter((product): product is NutritionSearchResult => product !== null)
                .filter(product => 
                  product.calories_per_100g >= 0 && 
                  product.protein_per_100g >= 0 && 
                  product.carbs_per_100g >= 0 && 
                  product.fat_per_100g >= 0 &&
                  (product.calories_per_100g > 0 || product.protein_per_100g > 0)
                )
                .slice(0, 3) // Limiter à 3 résultats pour la recherche de fallback
            }
          } catch (fallbackError) {
            console.error('Erreur recherche fallback:', fallbackError)
          }
        }
      }

      // Trier par pertinence : produits avec le plus de données d'abord
      products = products.sort((a, b) => {
        const scoreA = (a.calories_per_100g > 0 ? 1 : 0) + 
                      (a.protein_per_100g > 0 ? 1 : 0) + 
                      (a.carbs_per_100g > 0 ? 1 : 0) + 
                      (a.fat_per_100g > 0 ? 1 : 0) +
                      (a.brand ? 1 : 0) +
                      (a.image_url ? 1 : 0)
        const scoreB = (b.calories_per_100g > 0 ? 1 : 0) + 
                      (b.protein_per_100g > 0 ? 1 : 0) + 
                      (b.carbs_per_100g > 0 ? 1 : 0) + 
                      (b.fat_per_100g > 0 ? 1 : 0) +
                      (b.brand ? 1 : 0) +
                      (b.image_url ? 1 : 0)
        return scoreB - scoreA
      })
      // Limiter à 8 résultats les plus pertinents
      .slice(0, 8)

      return NextResponse.json({
        success: true,
        products,
        count: products.length,
        query: sanitizedQuery
      })

    } catch (fetchError) {
      clearTimeout(timeoutId)
      
      if (fetchError instanceof Error && fetchError.name === 'AbortError') {
        return NextResponse.json({ 
          error: 'Timeout de la recherche nutrition' 
        }, { status: 408 })
      }
      
      throw fetchError
    }

  } catch (error) {
    console.error('Erreur API nutrition search:', error)
    
    return NextResponse.json({ 
      error: 'Erreur lors de la recherche nutrition',
      details: process.env.NODE_ENV === 'development' ? String(error) : undefined
    }, { status: 500 })
  }
}