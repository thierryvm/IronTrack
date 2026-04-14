'use client';

import { useState} from'react';
import { Eye, EyeOff, Mail, Lock, AlertTriangle, CheckCircle} from'lucide-react';
import { useInAppBrowserAuth} from'@/hooks/useInAppBrowserAuth';
import { Button} from'@/components/ui/button';
import { InputGlassmorphism} from'@/components/ui/input-glassmorphism';
import { AuthLabel} from'@/components/auth/AuthLabel';

interface EmailAuthFormProps {
 showGoogleOption?: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function EmailAuthForm({ showGoogleOption}: EmailAuthFormProps) {
 // Note: Google Auth conditionnel sera implémenté dans une prochaine version
 const [isSignUp, setIsSignUp] = useState(false);
 const [showPassword, setShowPassword] = useState(false);
 const [showConfirmPassword, setShowConfirmPassword] = useState(false);
 const [email, setEmail] = useState('');
 const [password, setPassword] = useState('');
 const [confirmPassword, setConfirmPassword] = useState('');
 const [showForgotPassword, setShowForgotPassword] = useState(false);

 const {
 isLoading,
 error,
 success,
 signInWithEmail,
 signUpWithEmail,
 resetPassword,
 clearMessages
} = useInAppBrowserAuth();

 const handleSubmit = async (e: React.FormEvent) => {
 e.preventDefault();
 clearMessages();

 if (showForgotPassword) {
 await resetPassword(email);
 return;
}

 if (isSignUp) {
 if (password !== confirmPassword) {
 return; // L'erreur sera gérée par la validation visuelle
}
 await signUpWithEmail(email, password);
} else {
 await signInWithEmail(email, password);
}
};

 const resetForm = () => {
 setEmail('');
 setPassword('');
 setConfirmPassword('');
 setShowPassword(false);
 setShowConfirmPassword(false);
 clearMessages();
};

 const switchMode = (mode:'signin' |'signup' |'forgot') => {
 resetForm();
 setIsSignUp(mode ==='signup');
 setShowForgotPassword(mode ==='forgot');
};

 // getTitle supprimé - titre maintenant géré par la page parente

 const getButtonText = () => {
 if (isLoading) return showForgotPassword ?'Envoi...' : isSignUp ?'Inscription...' :'Connexion...';
 return showForgotPassword ?'Envoyer le lien' : isSignUp ?'S\'inscrire' :'Se connecter';
};

 return (
 <div className="w-full">
 <div className="bg-transparent p-0">
 {/* Titre supprimé - déjà en haut de la page */}

 {/* Messages d'état glassmorphism */}
 {error && (
 <div
 role="alert"
 aria-live="polite"
 className="bg-red-500/20 border border-red-400/30 rounded-xl p-4 mb-4 backdrop-blur-md"
 >
 <div className="flex items-start gap-2">
 <AlertTriangle className="w-5 h-5 text-red-200 flex-shrink-0 mt-1" aria-hidden="true" />
 <p id="email-error" className="text-red-700 text-sm font-medium">{error}</p>
 </div>
 </div>
 )}

 {success && (
 <div className="bg-green-500/20 border border-green-400/30 rounded-xl p-4 mb-4 backdrop-blur-md">
 <div className="flex items-start gap-2">
 <CheckCircle className="w-5 h-5 text-green-300 flex-shrink-0 mt-1" />
 <p className="text-green-700 text-sm">{success}</p>
 </div>
 </div>
 )}


 {/* Formulaire */}
 <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
 {/* Email */}
 <div>
 <AuthLabel htmlFor="email">
 Adresse email
 </AuthLabel>
 <InputGlassmorphism
 id="email"
 name="email"
 type="email"
 value={email}
 onChange={(e) => setEmail(e.target.value)}
 icon={<Mail />}
 placeholder="ton-email@exemple.com"
 required
 autoComplete={isSignUp ?'email' :'username'}
 aria-describedby={error ?"email-error" : undefined}
 aria-invalid={!!error}
 />
 </div>

 {/* Mot de passe */}
 {!showForgotPassword && (
 <div>
 <AuthLabel htmlFor="password">
 Mot de passe
 </AuthLabel>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
 <input
 id="password"
 name="password"
 type={showPassword ?'text' :'password'}
 value={password}
 onChange={(e) => setPassword(e.target.value)}
 className="auth-input w-full h-11 rounded-xl border border-white/10 bg-[#16181f] pl-12 pr-12 text-foreground shadow-sm transition-all placeholder:text-muted-foreground focus:border-primary/50 focus:bg-[#1b1e27] focus:outline-none focus:ring-4 focus:ring-primary/10 sm:h-12"
 placeholder={isSignUp ?'Un mot de passe sécurisé (min. 8 caractères)' :'Ton mot de passe'}
 required
 autoComplete={isSignUp ?'new-password' :'current-password'}
 minLength={isSignUp ? 8 : undefined}
 />
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => setShowPassword(!showPassword)}
 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 focus:ring-2 focus:ring-primary transition-colors z-10"
 aria-label={showPassword ?"Masquer le mot de passe" :"Afficher le mot de passe"}
 >
 {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </Button>
 </div>
 {isSignUp && (
 <p className="text-xs text-muted-foreground mt-1">
 Le mot de passe doit contenir au moins 8 caractères
 </p>
 )}
 </div>
 )}

 {/* Confirmation du mot de passe */}
 {isSignUp && !showForgotPassword && (
 <div>
 <AuthLabel htmlFor="confirmPassword">
 Confirmer le mot de passe
 </AuthLabel>
 <div className="relative">
 <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground w-5 h-5 z-10" />
 <input
 id="confirmPassword"
 name="confirmPassword"
 type={showConfirmPassword ?'text' :'password'}
 value={confirmPassword}
 onChange={(e) => setConfirmPassword(e.target.value)}
 className={`auth-input w-full h-11 rounded-xl border pl-12 pr-12 shadow-sm transition-all focus:outline-none sm:h-12 ${
 confirmPassword && password !== confirmPassword
 ?'border-red-500/50 bg-red-950/20 text-foreground placeholder:text-red-300/70 focus:border-red-500/60 focus:ring-red-500/10'
 :'border-white/10 bg-[#16181f] text-foreground placeholder:text-muted-foreground focus:border-primary/50 focus:bg-[#1b1e27] focus:ring-4 focus:ring-primary/10'
}`}
 placeholder="Répète ton mot de passe"
 required
 autoComplete="new-password"
 />
 <Button
 type="button"
 variant="ghost"
 size="icon"
 onClick={() => setShowConfirmPassword(!showConfirmPassword)}
 className="absolute right-2 top-1/2 transform -translate-y-1/2 h-8 w-8 text-muted-foreground hover:text-foreground hover:bg-accent/50 focus:ring-2 focus:ring-primary transition-colors z-10"
 aria-label={showConfirmPassword ?"Masquer la confirmation du mot de passe" :"Afficher la confirmation du mot de passe"}
 >
 {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
 </Button>
 </div>
 {confirmPassword && password !== confirmPassword && (
 <p className="text-xs text-red-700 mt-1 flex items-center gap-1">
 <AlertTriangle className="w-3 h-3" />
 Les mots de passe ne correspondent pas
 </p>
 )}
 </div>
 )}

 <Button
 type="submit"
 disabled={isLoading || (isSignUp && password !== confirmPassword)}
 className="h-11 w-full rounded-xl bg-[var(--brand-700)] text-base font-bold tracking-wide text-white shadow-md transition-[transform,opacity,background-color] hover:bg-[var(--brand-800)] sm:h-12"
 >
 {isLoading ? (
 <div className="flex items-center gap-2">
 <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
 {getButtonText()}
 </div>
 ) : (
 getButtonText()
 )}
 </Button>
 </form>

 {/* Navigation entre les modes */}
 <div className="mt-5 space-y-1.5 text-center text-sm sm:mt-6 sm:space-y-2">
 {showForgotPassword ? (
 <Button
 variant="ghost"
 onClick={() => switchMode('signin')}
 className="text-muted-foreground hover:text-foreground"
 >
 ← Retour à la connexion
 </Button>
 ) : (
 <div className="space-y-2">
 <Button
 variant="ghost"
 onClick={() => { setIsSignUp(!isSignUp); resetForm()}}
 className="w-full text-muted-foreground hover:text-foreground"
 >
 {isSignUp ?'Déjà un compte ? Se connecter' :'Pas encore de compte ? Créer un compte'}
 </Button>

 {!isSignUp && (
 <Button
 variant="ghost"
 onClick={() => switchMode('forgot')}
 className="w-full text-muted-foreground hover:text-foreground"
 >
 Mot de passe oublié ?
 </Button>
 )}
 </div>
 )}
 </div>
 </div>
 </div>
 );
}
