import { NextRequest, NextResponse} from'next/server'
import { createClient} from'@supabase/supabase-js'
import { createServerClient, type CookieOptions} from'@supabase/ssr'
import { cookies} from'next/headers'
import sharp from'sharp'

// Type definition for file objects from Supabase storage
interface StorageFile {
 name: string
 id?: string
 metadata: { size?: number} | null
}

const supabase = createClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.SUPABASE_SERVICE_ROLE_KEY!,
 {
 auth: {
 autoRefreshToken: false,
 persistSession: false
}
}
)

async function requireAdmin(): Promise<{ error: NextResponse } | { error: null }> {
 const cookieStore = await cookies()
 const authClient = createServerClient(
 process.env.NEXT_PUBLIC_SUPABASE_URL!,
 process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
 {
 cookies: {
 get(name: string) { return cookieStore.get(name)?.value },
 set(name: string, value: string, options: CookieOptions) { cookieStore.set({ name, value, ...options }) },
 remove(name: string) { cookieStore.set({ name, value: '', maxAge: 0 }) },
},
}
 )
 const { data: { user }, error: sessionError } = await authClient.auth.getUser()
 if (sessionError || !user) {
 return { error: NextResponse.json({ error: 'Non authentifié' }, { status: 401 }) }
}
 const { data: profile } = await authClient.from('profiles').select('role').eq('id', user.id).single()
 if (!profile || !['admin', 'super_admin'].includes(profile.role ?? '')) {
 return { error: NextResponse.json({ error: 'Permissions admin requises' }, { status: 403 }) }
}
 return { error: null }
}

/**
 * API Route pour optimisation batch des images existantes
 * POST /api/optimize-images
 */
export async function POST(request: NextRequest) {
 try {
 const authCheck = await requireAdmin()
 if (authCheck.error) return authCheck.error

 const { bucket, batchSize = 50} = await request.json()
 
 if (!bucket) {
 return NextResponse.json({ error:'Bucket required'}, { status: 400})
}
 
 // Lister les fichiers du bucket de façon récursive
 console.log(`🔍 Scanning bucket ${bucket}...`)
 
 let allFiles: StorageFile[] = []
 
 // 1. Fichiers à la racine
 const { data: rootFiles, error: rootError} = await supabase.storage
 .from(bucket)
 .list('', { limit: 1000})
 
 if (rootError) {
 return NextResponse.json({ error: rootError.message}, { status: 500})
}
 
 if (rootFiles) {
 allFiles = [...(rootFiles as StorageFile[])]
 console.log(`📁 Root level: ${rootFiles.length} items`)
 
 // 2. Pour chaque élément, vérifier s'il s'agit d'un dossier et lister son contenu
 for (const item of rootFiles) {
 // Si l'élément n'a pas d'extension et pourrait être un dossier
 if (!item.name.includes('.') && item.metadata === null) {
 console.log(`📂 Scanning folder: ${item.name}`)
 
 const { data: folderFiles, error: folderError} = await supabase.storage
 .from(bucket)
 .list(item.name, { limit: 1000})
 
 if (!folderError && folderFiles) {
 // Ajouter le préfixe du dossier aux noms de fichiers
 const prefixedFiles = (folderFiles as StorageFile[]).map(file => ({
 ...file,
 name: `${item.name}/${file.name}`
}))
 allFiles = [...allFiles, ...prefixedFiles]
 console.log(`📄 Found ${folderFiles.length} files in ${item.name}`)
}
}
}
}
 
 console.log(`📊 Total files found: ${allFiles.length}`)
 const files = allFiles
 
 // Filtrer les images (exclure les dossiers UUID corrompus)
 const imageFiles = files?.filter(file => {
 const ext = file.name.split('.').pop()?.toLowerCase()
 const hasImageExt = ['jpg','jpeg','png','webp','heic'].includes(ext ||'')
 
 // Exclure les UUID à la racine car ce sont des dossiers corrompus
 const isRootUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(file.name)
 
 if (isRootUUID) {
 console.log(`🚫 Excluding corrupted UUID folder: ${file.name}`)
}
 
 // Garder seulement les fichiers avec extension dans les sous-dossiers
 return hasImageExt && !isRootUUID
}) || []
 
 console.log(`🖼️ Valid image files after filtering: ${imageFiles.length}`)
 
 // Filtrer seulement les images > 300KB (candidats à optimisation)
 const filesToOptimize = imageFiles.filter(file => {
 const fileSize = (file.metadata?.size as number) || 0
 return fileSize > 300 * 1024
})
 
 console.log(`🎯 Images candidates pour optimisation: ${filesToOptimize.length}/${imageFiles.length}`)
 
 // Debug: Lister toutes les candidates
 filesToOptimize.forEach((file, index) => {
 console.log(`📋 Candidate ${index+1}: ${file.name} (${file.metadata?.size ||'unknown'}B)`)
})
 
 // Traitement batch
 const results = []
 const batch = filesToOptimize.slice(0, batchSize)
 
 console.log(`🚀 Batch processing: ${batch.length}/${filesToOptimize.length} files`)
 
 for (const file of batch) {
 try {
 console.log(`🔄 Processing ${file.name} (${file.metadata?.size ||'unknown size'})`)
 
 // Télécharger l'image avec service role (bypass RLS)
 const { data: fileData, error: downloadError} = await supabase.storage
 .from(bucket)
 .download(file.name)
 
 if (downloadError) {
 console.error(`❌ Download failed for ${file.name}:`, downloadError)
 throw downloadError
}
 
 console.log(`✅ Downloaded ${file.name} successfully (${fileData.size} bytes)`)
 
 const arrayBuffer = await fileData.arrayBuffer()
 const originalSize = arrayBuffer.byteLength
 
 // Vérifier si optimisation nécessaire
 if (originalSize < 300 * 1024) { // < 300KB
 results.push({
 file: file.name,
 status:'skipped',
 reason:'File too small',
 originalSize,
 optimizedSize: originalSize,
 compression: 0
})
 continue
}
 
 // Optimisation réelle avec Sharp.js
 let optimizedSize: number
 
 try {
 // Optimisation avec Sharp
 const imageBuffer = Buffer.from(arrayBuffer)
 
 // Obtenir les métadonnées de l'image
 const metadata = await sharp(imageBuffer).metadata()
 
 // Optimisation adaptée selon le type d'image
 let optimizedBuffer: Buffer
 
 if (metadata.format ==='jpeg' || metadata.format ==='jpg') {
 // JPEG: Réduire qualité et progressive
 optimizedBuffer = await sharp(imageBuffer)
 .jpeg({ 
 quality: 75, 
 progressive: true,
 mozjpeg: true 
})
 .toBuffer()
} else if (metadata.format ==='png') {
 // PNG: Optimiser couleurs et compression
 optimizedBuffer = await sharp(imageBuffer)
 .png({ 
 quality: 75,
 compressionLevel: 9,
 adaptiveFiltering: true
})
 .toBuffer()
} else if (metadata.format ==='webp') {
 // WebP: Déjà optimisé, réduire légèrement la qualité
 optimizedBuffer = await sharp(imageBuffer)
 .webp({ quality: 80})
 .toBuffer()
} else {
 // Autres formats: Convertir en WebP
 optimizedBuffer = await sharp(imageBuffer)
 .webp({ quality: 75})
 .toBuffer()
}
 
 optimizedSize = optimizedBuffer.length
 
 // Si l'optimisation apporte un gain significatif (>1KB ou >0.5%), on l'applique
 const minSavings = Math.max(1024, originalSize * 0.005) // Au moins 1KB ou 0.5%
 if (optimizedSize <= originalSize - minSavings) {
 // Sauvegarder l'image optimisée (remplacer le fichier existant)
 const { error: uploadError} = await supabase.storage
 .from(bucket)
 .upload(file.name, optimizedBuffer, {
 contentType: metadata.format ==='webp' || !metadata.format ?'image/webp' : `image/${metadata.format}`,
 upsert: true // Remplacer si existe
})
 
 if (uploadError) {
 console.error(`❌ Upload failed for ${file.name}:`, uploadError)
 throw uploadError
}
 
 // Forcer invalidation du cache pour obtenir les nouvelles métadonnées
 await new Promise(resolve => setTimeout(resolve, 500)) // Délai plus long
 
 // Vérifier que le fichier a bien été mis à jour
 try {
 const { data: verifyFile, error: verifyError} = await supabase.storage
 .from(bucket)
 .list(file.name.includes('/') ? file.name.split('/')[0] :'', { 
 limit: 100,
 search: file.name.includes('/') ? file.name.split('/')[1] : file.name
})
 
 if (!verifyError && verifyFile?.[0]) {
 const newSize = (verifyFile[0].metadata as Record<string, unknown>)?.size || optimizedSize
 console.log(`🔍 Vérification cache: ${file.name} nouvelle taille ${newSize}B (attendue ${optimizedSize}B)`)
}
} catch (verifyError) {
 console.log(`⚠️ Vérification cache échouée pour ${file.name}:`, verifyError)
}
 
 const compression = originalSize > 0 ? (1 - optimizedSize/originalSize) : 0
 console.log(`✅ Optimized ${file.name}: ${originalSize}B → ${optimizedSize}B (${Math.round(compression * 100)}% saved)`)
} else {
 // Gain insuffisant (<1KB ou <0.5%), garder l'original
 optimizedSize = originalSize
 const actualSavings = originalSize - optimizedBuffer.length
 const minRequired = Math.max(1024, Math.round(originalSize * 0.005))
 console.log(`⏩ Skipped ${file.name}: Gain insuffisant ${actualSavings}B (min requis: ${minRequired}B)`)
}
 
} catch (optimizationError) {
 console.error('❌ Optimization failed for', file.name, optimizationError)
 
 // Retourner l'erreur détaillée pour debugging
 results.push({
 file: file.name,
 status:'error',
 error: optimizationError instanceof Error ? optimizationError.message :'Unknown optimization error',
 details: optimizationError
})
 continue
}
 
 results.push({
 file: file.name,
 status: optimizedSize < originalSize ?'optimized' :'skipped',
 reason: optimizedSize >= originalSize ?'Already optimized' : undefined,
 originalSize,
 optimizedSize,
 compression: (originalSize - optimizedSize) / originalSize
})
 
} catch (error) {
 results.push({
 file: file.name,
 status:'error',
 error: error instanceof Error ? error.message :'Unknown error'
})
}
}
 
 // Statistiques
 const totalOriginal = results.reduce((sum, r) => sum + (r.originalSize || 0), 0)
 const totalOptimized = results.reduce((sum, r) => sum + (r.optimizedSize || 0), 0)
 const globalCompression = totalOriginal > 0 ? (totalOriginal - totalOptimized) / totalOriginal : 0
 
 return NextResponse.json({
 success: true,
 bucket,
 processed: results.length,
 totalFiles: filesToOptimize.length,
 totalFoundFiles: imageFiles.length,
 remainingFiles: Math.max(0, filesToOptimize.length - batchSize),
 stats: {
 totalOriginalSize: totalOriginal,
 totalOptimizedSize: totalOptimized,
 globalCompression,
 spaceSaved: totalOriginal - totalOptimized
},
 results
})
 
} catch (error) {
 console.error('Image optimization API error:', error)
 return NextResponse.json(
 { error:'Internal server error'}, 
 { status: 500}
 )
}
}

/**
 * GET /api/optimize-images - Scan des buckets
 */
export async function GET(request: NextRequest) {
 try {
 const authCheck = await requireAdmin()
 if (authCheck.error) return authCheck.error

 const { searchParams} = new URL(request.url)
 const bucket = searchParams.get('bucket')
 
 if (!bucket) {
 return NextResponse.json({ error:'Bucket parameter required'}, { status: 400})
}
 
 // Lister tous les fichiers de façon récursive
 console.log(`🔍 Scanning bucket ${bucket} for analysis...`)
 
 let allFiles: StorageFile[] = []
 
 // 1. Fichiers à la racine
 const { data: rootFiles, error: rootError} = await supabase.storage
 .from(bucket)
 .list('', { limit: 1000})
 
 if (rootError) {
 return NextResponse.json({ error: rootError.message}, { status: 500})
}
 
 if (rootFiles) {
 allFiles = [...(rootFiles as StorageFile[])]
 console.log(`📁 Root level: ${rootFiles.length} items`)
 
 // 2. Scanner les dossiers
 for (const item of rootFiles) {
 if (!item.name.includes('.') && item.metadata === null) {
 console.log(`📂 Scanning folder: ${item.name}`)
 
 const { data: folderFiles, error: folderError} = await supabase.storage
 .from(bucket)
 .list(item.name, { limit: 1000})
 
 if (!folderError && folderFiles) {
 const prefixedFiles = (folderFiles as StorageFile[]).map(file => ({
 ...file,
 name: `${item.name}/${file.name}`
}))
 allFiles = [...allFiles, ...prefixedFiles]
 console.log(`📄 Found ${folderFiles.length} files in ${item.name}`)
}
}
}
}
 
 console.log(`📊 Total files found: ${allFiles.length}`)
 const files = allFiles
 
 // Analyser les images (exclure les dossiers UUID corrompus)
 const imageFiles = files?.filter(file => {
 const ext = file.name.split('.').pop()?.toLowerCase()
 const hasImageExt = ['jpg','jpeg','png','webp','heic','heif'].includes(ext ||'')
 
 // Exclure les UUID à la racine car ce sont des dossiers corrompus
 const isRootUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(file.name)
 
 // Garder seulement les fichiers avec extension dans les sous-dossiers
 return hasImageExt && !isRootUUID
}) || []
 
 // Analyser les tailles pour détecter les images candidates à optimisation 
 const candidateFiles = imageFiles.filter(file => {
 // Fichiers > 300KB considérés comme candidats à traiter
 const fileSize = (file.metadata?.size as number) || 0
 return fileSize > 300 * 1024
})
 
 console.log(`🔍 Images candidates détectées: ${candidateFiles.length}/${imageFiles.length}`)
 
 // Debug: Afficher les tailles détectées
 imageFiles.forEach(file => {
 const size = (file.metadata?.size as number) || 0
 const isCandidate = size > 300 * 1024
 console.log(`📊 ${file.name}: ${(size / 1024).toFixed(1)}KB ${isCandidate ?'🎯 candidate' :'✅ optimisée'}`)
})
 
 // Estimation ULTRA-RÉALISTE pour images déjà optimisées
 const totalSize = candidateFiles.reduce((sum, file) => sum + ((file.metadata?.size as number) || 0), 0)
 const estimatedSavings = candidateFiles.reduce((sum, file) => {
 const size = (file.metadata?.size as number) || 0
 // Pour images déjà optimisées : gain réaliste 0.1-0.2%
 const realisticSaving = size * 0.002 // 0.2% 
 // Seules 20% des images auront ce gain minimal
 return sum + (realisticSaving * 0.2)
}, 0)
 
 console.log(`💰 Estimation: ${candidateFiles.length} candidates, total ${(totalSize/1024/1024).toFixed(1)}MB, économies estimées ${(estimatedSavings/1024).toFixed(1)}KB`)
 
 const analysis = {
 totalFiles: candidateFiles.length, // RÉALITÉ : toutes les candidates
 totalFoundFiles: imageFiles.length,
 estimatedSize: totalSize,
 estimatedSavings: estimatedSavings,
 largeFiles: candidateFiles.filter(f => f.name.includes('IMG_') || f.name.includes('DSC_')).length,
 heicFiles: candidateFiles.filter(f => f.name.toLowerCase().endsWith('.heic')).length,
 alreadyOptimized: imageFiles.length - candidateFiles.length
}
 
 return NextResponse.json({
 success: true,
 bucket,
 analysis,
 preview: imageFiles.slice(0, 10) // Premier 10 fichiers pour preview
})
 
} catch (error) {
 console.error('Image scan API error:', error)
 return NextResponse.json(
 { error:'Internal server error'}, 
 { status: 500}
 )
}
}
