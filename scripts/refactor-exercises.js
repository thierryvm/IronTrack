const fs = require('fs');
const path = require('path');

// --- 1. Refactor src/utils/fileUpload.ts ---
const fileUploadPath = path.join(__dirname, '../src/utils/fileUpload.ts');
let fileUploadContent = fs.readFileSync(fileUploadPath, 'utf8');

// Remove detectBestConversionFormat and convertHeicToModernFormat
fileUploadContent = fileUploadContent.replace(
  /\/\*\*[\s\S]*?function detectBestConversionFormat\(\)[\s\S]*?async function convertHeicToModernFormat[\s\S]*?\}\n\n\/\*\*/g,
  '/**'
);

// Simplify uploadExercisePhoto
const uploadExerciseTarget = `export async function uploadExercisePhoto(file: File): Promise<UploadResult> {
  try {
    let processedFile = file
    
    // ÉTAPE 1: Conversion HEIC→JPEG si nécessaire
    if (file.type === 'image/heic' || file.type === 'image/heif' || 
        file.name.toLowerCase().endsWith('.heic') || 
        file.name.toLowerCase().endsWith('.heif')) {
      
      try {
        processedFile = await convertHeicToModernFormat(file)
      } catch (conversionError) {
        console.error('[HEIC] Échec conversion:', conversionError)
        // Fallback: essayer l'upload direct (si Supabase supporte finalement HEIC)
        return uploadSecureFile(file, 'exercise-images')
      }
    }`;

const uploadExerciseReplacement = `export async function uploadExercisePhoto(file: File): Promise<UploadResult> {
  try {
    let processedFile = file;
    // HEIC is now handled by ImagePicker before uploading`;

fileUploadContent = fileUploadContent.replace(uploadExerciseTarget, uploadExerciseReplacement);

fs.writeFileSync(fileUploadPath, fileUploadContent, 'utf8');

// --- 2. Refactor src/components/exercises/ExercisePhotoUpload.tsx ---
const exercisePath = path.join(__dirname, '../src/components/exercises/ExercisePhotoUpload.tsx');
let exerciseContent = fs.readFileSync(exercisePath, 'utf8');

exerciseContent = exerciseContent.replace(
  /import { ImageCropper } from '@\/components\/ui\/ImageCropper'/,
  "import { ImagePicker } from '@/components/shared/ImagePicker'"
);

exerciseContent = exerciseContent.replace(/const \[showCropper, setShowCropper\] = useState\(false\)/, 'const [isImagePickerOpen, setIsImagePickerOpen] = useState(false)');

exerciseContent = exerciseContent.replace(
  /const openFileDialog = \(\) => \{\s*if \(!disabled && !uploadState\.isUploading && fileInputRef\.current\) \{\s*fileInputRef\.current\.click\(\)\s*\}\s*\}/,
  `const openFileDialog = () => {\n    if (!disabled && !uploadState.isUploading) {\n      setIsImagePickerOpen(true)\n    }\n  }`
);

exerciseContent = exerciseContent.replace(
  /const openCameraDialog = \(\) => \{[\s\S]*?\}\s*\}/,
  `const openCameraDialog = () => {\n    if (!disabled && !uploadState.isUploading) {\n      setIsImagePickerOpen(true)\n    }\n  }`
);

exerciseContent = exerciseContent.replace(
  /setShowCropper\(true\)/g,
  'setIsImagePickerOpen(true)'
);

// Remove the input file from JSX
exerciseContent = exerciseContent.replace(
  /\{\/\* Input caché \*\/\}[\s\S]*?aria-label="Sélectionner photo d'exercice"\n\s*\/>\n/g,
  ''
);

// Replace ImageCropper with ImagePicker
exerciseContent = exerciseContent.replace(
  /\{\/\* Image Cropper Modal \*\/\}[\s\S]*?\}\)/,
  `{/* Image Picker Modal */}
      {isImagePickerOpen && (
        <ImagePicker
          open={isImagePickerOpen}
          onOpenChange={setIsImagePickerOpen}
          onImageCropped={async (file) => {
            await handleFileUpload(file);
          }}
          aspectRatio={4/3}
          cropShape="rect"
        />
      )}
    </div>
  )`
);


fs.writeFileSync(exercisePath, exerciseContent, 'utf8');
console.log('Script done.');
