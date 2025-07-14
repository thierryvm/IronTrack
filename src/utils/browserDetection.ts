/**
 * Utilitaires pour détecter les navigateurs in-app et WebView
 * Spécialement conçu pour gérer les restrictions Google OAuth
 */

export interface BrowserInfo {
  isInAppBrowser: boolean;
  platform: 'facebook' | 'instagram' | 'twitter' | 'linkedin' | 'tiktok' | 'snapchat' | 'messenger' | 'whatsapp' | 'telegram' | 'discord' | 'unknown';
  userAgent: string;
  canRedirectToSystemBrowser: boolean;
}

/**
 * Détecte si l'utilisateur utilise un navigateur in-app
 */
export function detectBrowserInfo(): BrowserInfo {
  const userAgent = navigator.userAgent.toLowerCase();
  
  // Détection des différentes plateformes in-app
  const platforms = {
    facebook: /fban|fbav|fbsv/i.test(userAgent),
    instagram: /instagram/i.test(userAgent),
    twitter: /twitter/i.test(userAgent),
    linkedin: /linkedinapp/i.test(userAgent),
    tiktok: /tiktok|musical_ly/i.test(userAgent),
    snapchat: /snapchat/i.test(userAgent),
    messenger: /messenger/i.test(userAgent),
    whatsapp: /whatsapp/i.test(userAgent),
    telegram: /telegram/i.test(userAgent),
    discord: /discord/i.test(userAgent),
  };

  // Détection générique des WebView
  const isWebView = /wv|webview/i.test(userAgent);
  const isInAppGeneric = /; wv\)|;wv\)/i.test(userAgent);
  
  // Détermine la plateforme spécifique
  const platform = Object.entries(platforms).find(([, detected]) => detected)?.[0] as BrowserInfo['platform'] || 'unknown';
  
  // Vérifie si c'est un navigateur in-app
  const isInAppBrowser = Object.values(platforms).some(detected => detected) || isWebView || isInAppGeneric;
  
  // Détermine si la redirection vers le navigateur système est possible
  const canRedirectToSystemBrowser = typeof window !== 'undefined' && (
    /android/i.test(userAgent) || 
    /iphone|ipad|ipod/i.test(userAgent)
  );

  return {
    isInAppBrowser,
    platform,
    userAgent,
    canRedirectToSystemBrowser
  };
}

/**
 * Tente de rediriger vers le navigateur système
 */
export function redirectToSystemBrowser(fallbackUrl?: string): void {
  const currentUrl = fallbackUrl || window.location.href;
  const userAgent = navigator.userAgent.toLowerCase();
  
  try {
    // Pour Android
    if (/android/i.test(userAgent)) {
      // Tentative avec Chrome
      window.location.href = `googlechrome://navigate?url=${encodeURIComponent(currentUrl)}`;
      
      // Fallback avec l'intent Android
      setTimeout(() => {
        window.location.href = `intent://${currentUrl.replace(/https?:\/\//, '')}#Intent;scheme=https;package=com.android.chrome;end`;
      }, 1000);
    }
    
    // Pour iOS
    else if (/iphone|ipad|ipod/i.test(userAgent)) {
      // Safari sur iOS
      window.location.href = currentUrl;
    }
    
    // Fallback général
    else {
      window.open(currentUrl, '_blank');
    }
  } catch (error) {
    console.warn('Impossible de rediriger vers le navigateur système:', error);
    // Fallback final
    window.open(currentUrl, '_blank');
  }
}

/**
 * Copie l'URL actuelle dans le presse-papiers
 */
export async function copyCurrentUrlToClipboard(): Promise<boolean> {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(window.location.href);
      return true;
    } else {
      // Fallback pour les environnements non-sécurisés
      const textArea = document.createElement('textarea');
      textArea.value = window.location.href;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();
      const success = document.execCommand('copy');
      document.body.removeChild(textArea);
      return success;
    }
  } catch (error) {
    console.error('Erreur lors de la copie:', error);
    return false;
  }
}

/**
 * Génère des instructions spécifiques selon la plateforme
 */
export function getPlatformSpecificInstructions(platform: BrowserInfo['platform']): {
  title: string;
  steps: string[];
  icon: string;
} {
  const instructions: Record<BrowserInfo['platform'], {
    title: string;
    steps: string[];
    icon: string;
  }> = {
    facebook: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '📱'
    },
    instagram: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '📱'
    },
    twitter: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '🐦'
    },
    linkedin: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '💼'
    },
    tiktok: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '🎵'
    },
    snapchat: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '👻'
    },
    messenger: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 lignes en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '💬'
    },
    whatsapp: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '💬'
    },
    telegram: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '✈️'
    },
    discord: {
      title: 'Ouvrir dans votre navigateur',
      steps: [
        'Appuyez sur les 3 points en haut à droite',
        'Sélectionnez "Ouvrir dans le navigateur"',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '🎮'
    },
    unknown: {
      title: 'Ouvrir dans votre navigateur principal',
      steps: [
        'Recherchez une option "Ouvrir dans le navigateur"',
        'Ou copiez le lien et ouvrez-le dans Chrome/Safari',
        'Vous pourrez alors vous connecter avec Google'
      ],
      icon: '🌐'
    }
  };

  return instructions[platform];
}