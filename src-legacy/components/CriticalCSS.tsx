// CRITICAL CSS INLINE pour LCP <2.5s - Next.js 15.3.5 optimisé
export function CriticalCSS() {
 return (
 <style dangerouslySetInnerHTML={{
 __html: `
 /* CSS CRITIQUE LÉGER - Éviter conflits Tailwind */
 body {
 font-family: -apple-system, BlinkMacSystemFont,'Segoe UI', sans-serif;
 -webkit-font-smoothing: antialiased;
 -moz-osx-font-smoothing: grayscale;
}
 
 /* AUTH UI PRIORITAIRE - Supabase forms */
 .supabase-auth-ui_ui-input {
 font-size: 16px !important;
 padding: 0.75rem !important;
 border-radius: 8px !important;
}
 
 /* BOUTONS AUTH CRITIQUES */
 .supabase-auth-ui_ui-button {
 background: #ea580c !important;
 min-height: 44px !important;
 border-radius: 8px !important;
}
 
 /* LOADING CRITIQUE uniquement */
 @keyframes spin {
 from { transform: rotate(0deg);}
 to { transform: rotate(360deg);}
}
 
 /* MOBILE TOUCH TARGETS */
 @media (max-width: 768px) {
 .supabase-auth-ui_ui-button,
 .supabase-auth-ui_ui-input {
 min-height: 48px !important;
 font-size: 16px !important;
}
}
 `
}} />
 )
}