'use client';

import { useState, useEffect} from'react';
import { detectBrowserInfo, redirectToSystemBrowser, copyCurrentUrlToClipboard, getPlatformSpecificInstructions, type BrowserInfo} from'@/utils/browserDetection';

interface InAppBrowserWarningProps {
 onClose?: () => void;
 showAlternativeAuth?: boolean;
}

export default function InAppBrowserWarning({ onClose, showAlternativeAuth = true}: InAppBrowserWarningProps) {
 const [browserInfo, setBrowserInfo] = useState<BrowserInfo | null>(null);
 const [copySuccess, setCopySuccess] = useState(false);
 const [isVisible, setIsVisible] = useState(false);

 useEffect(() => {
 const info = detectBrowserInfo();
 setBrowserInfo(info);
 
 if (info.isInAppBrowser) {
 setIsVisible(true);
}
}, []);

 const handleCopyUrl = async () => {
 const success = await copyCurrentUrlToClipboard();
 if (success) {
 setCopySuccess(true);
 setTimeout(() => setCopySuccess(false), 3000);
}
};

 const handleRedirectToBrowser = () => {
 redirectToSystemBrowser();
};

 const handleClose = () => {
 setIsVisible(false);
 onClose?.();
};

 if (!browserInfo?.isInAppBrowser || !isVisible) {
 return null;
}

 const instructions = getPlatformSpecificInstructions(browserInfo.platform);

 return (
 <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
 <div className="bg-card border border-border rounded-xl max-w-md w-full mx-4 shadow-2xl border border-border">
 {/* Header */}
 <div className="flex items-center justify-between p-6 border-b border-border">
 <div className="flex items-center gap-2">
 <div className="text-2xl">{instructions.icon}</div>
 <h2 className="text-lg font-semibold text-foreground">
 Problème de connexion Google
 </h2>
 </div>
 <button
 onClick={handleClose}
 className="text-gray-700 hover:text-foreground transition-colors"
 aria-label="Fermer"
 >
 <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
 <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
 </svg>
 </button>
 </div>

 {/* Content */}
 <div className="p-6 space-y-4">
 <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
 <div className="flex items-start gap-2">
 <div className="text-amber-500 mt-1">
 <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
 <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
 </svg>
 </div>
 <div>
 <p className="text-sm font-medium text-amber-800">
 Google n'autorise pas la connexion depuis les applications sociales
 </p>
 <p className="text-sm text-amber-700 mt-1">
 Pour votre sécurité, veuillez ouvrir ce lien dans votre navigateur principal.
 </p>
 </div>
 </div>
 </div>

 {/* Instructions */}
 <div className="space-y-2">
 <h3 className="font-medium text-foreground">{instructions.title}</h3>
 <ol className="space-y-2">
 {instructions.steps.map((step, index) => (
 <li key={index} className="flex items-start gap-2 text-sm text-gray-600">
 <span className="flex-shrink-0 w-5 h-5 bg-tertiary/12 text-secondary rounded-full flex items-center justify-center text-xs font-medium">
 {index + 1}
 </span>
 {step}
 </li>
 ))}
 </ol>
 </div>

 {/* Actions */}
 <div className="space-y-2 pt-4">
 {browserInfo.canRedirectToSystemBrowser && (
 <button
 onClick={handleRedirectToBrowser}
 className="w-full bg-secondary hover:bg-secondary-hover text-white font-medium py-2 px-4 rounded-lg transition-colors duration-200"
 >
 🚀 Ouvrir dans le navigateur
 </button>
 )}
 
 <button
 onClick={handleCopyUrl}
 className={`w-full border border-border hover:bg-muted text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 ${
 copySuccess ?'bg-green-50 border-green-300 text-green-700' :''
}`}
 >
 {copySuccess ?'✅ Lien copié !' :'📋 Copier le lien'}
 </button>
 </div>

 {/* Alternative auth */}
 {showAlternativeAuth && (
 <div className="pt-4 border-t border-border">
 <p className="text-sm text-gray-600 text-center mb-2">
 Ou connectez-vous autrement :
 </p>
 <div className="text-center">
 <button
 onClick={handleClose}
 className="text-secondary hover:text-secondary-hover font-medium text-sm transition-colors"
 >
 Utiliser email et mot de passe
 </button>
 </div>
 </div>
 )}

 {/* Debug info (only in development) */}
 {process.env.NODE_ENV ==='development' && (
 <details className="pt-4 border-t border-border">
 <summary className="text-xs text-gray-600 cursor-pointer">
 Infos de débogage
 </summary>
 <div className="mt-2 p-2 bg-background rounded text-xs text-gray-600 font-mono">
 <div>Plateforme: {browserInfo.platform}</div>
 <div>In-app: {browserInfo.isInAppBrowser ?'Oui' :'Non'}</div>
 <div>Redirection possible: {browserInfo.canRedirectToSystemBrowser ?'Oui' :'Non'}</div>
 <div className="truncate">User-Agent: {browserInfo.userAgent}</div>
 </div>
 </details>
 )}
 </div>
 </div>
 </div>
 );
}