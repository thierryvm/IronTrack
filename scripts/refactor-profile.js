const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/components/profile/ProfileClientWrapper.tsx');
let content = fs.readFileSync(filePath, 'utf8');

// 1. Remove Cropper dynamic import
content = content.replace(
  /const Cropper = dynamic\(\(\) => import\('react-easy-crop'\), \{[\s\S]*?\}\)/,
  `import { ImagePicker } from '@/components/shared/ImagePicker'`
);

// 2. Change Component signature and add Props interface
content = content.replace(
  /export default function ProfilePage\(\) \{/,
  `interface ProfileClientWrapperProps {
  initialProfile: UserProfile | null;
  initialStats: UserStats | null;
  initialAchievements: Achievement[];
}

export function ProfileClientWrapper({ initialProfile, initialStats, initialAchievements }: ProfileClientWrapperProps) {`
);

// 3. Update state initialization
content = content.replace(
  /const \[profile, setProfile\] = useState<UserProfile \| null>\(null\)/,
  `const [profile, setProfile] = useState<UserProfile | null>(initialProfile)`
);
content = content.replace(
  /const \[stats, setStats\] = useState<UserStats \| null>\(null\)/,
  `const [stats, setStats] = useState<UserStats | null>(initialStats)`
);
content = content.replace(
  /const \[achievements, setAchievements\] = useState<Achievement\[\]>\(\[\]\);/,
  `const [achievements, setAchievements] = useState<Achievement[]>(initialAchievements);`
);
content = content.replace(
  /const \[loading, setLoading\] = useState\(true\)/,
  `const [loading, setLoading] = useState(false)`
);

// 4. Comment out or remove useEffects for data loading to avoid client-side fetches on mount
content = content.replace(
  /useEffect\(\(\) => \{\s*loadProfileData\([^]*?eslint-disable-next-line react-hooks\/exhaustive-deps\s*\}, \[\]\);/,
  `// loadProfileData removed in favor of Server Component data fetching`
);

// 5. Replace avatar file handling logic with handleImageCropped
content = content.replace(
  /\/\/ Ajoute une fonction utilitaire pour détecter HEIC\/HEIF[^]*?setAvatarUploading\(false\);\s*\};/m,
  `  const handleImageCropped = async (file: File) => {
    if (!profile) return;
    setAvatarUploading(true);
    setAvatarError(null);
    try {
      const supabase = createClient();
      const userId = profile.id;
      const filePath = \`\${userId}/avatar.jpg\`;
      
      const { error: uploadError } = await supabase.storage.from('avatars').upload(filePath, file, {
        upsert: true,
        contentType: 'image/jpeg',
        cacheControl: '3600',
      });
      if (uploadError) throw uploadError;
      
      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);
      if (!data?.publicUrl) throw new Error("Impossible de récupérer l'URL publique");
      
      const cacheBustedUrl = data.publicUrl + '?t=' + Date.now();
      const { error: updateError } = await supabase.from('profiles').update({ avatar_url: cacheBustedUrl }).eq('id', userId);
      if (updateError) throw updateError;
      
      setProfile({ ...profile, avatar: cacheBustedUrl });
      setShowAvatarModal(false);
      
      setAvatarCongratsMsg(avatarMessages[Math.floor(Math.random() * avatarMessages.length)]);
      setShowAvatarCongrats(true);
      setAvatarAnimationKey(prev => prev + 1);
      setTimeout(() => setShowAvatarCongrats(false), 2500);
    } catch (err: any) {
      setAvatarError(err.message || "Erreur lors de l'upload");
    } finally {
      setAvatarUploading(false);
    }
  };`
);

// 6. Replace the entire Avatar Dialog with ImagePicker
// Find the start of the Avatar Modal
const modalStartRegex = /\{\/\* Modal avatar - ShadCN UI \+ fond flou \*\/\}/;
const match = content.match(modalStartRegex);
if (match) {
  const startIndex = match.index;
  // Find the end of this Dialog by looking for the next Modal comment
  const nextModalRegex = /\{\/\* Modal mascotte - ShadCN UI \+ fond flou \*\/\}/;
  const nextMatch = content.match(nextModalRegex);
  if (nextMatch) {
    const endIndex = nextMatch.index;
    const before = content.substring(0, startIndex);
    const after = content.substring(endIndex);
    const replacement = `{showAvatarModal && (
        <ImagePicker
          open={showAvatarModal}
          onOpenChange={setShowAvatarModal}
          onImageCropped={handleImageCropped}
        />
      )}\n      `;
    content = before + replacement + after;
  }
}

fs.writeFileSync(filePath, content, 'utf8');
console.log('Refactoring complete.');
