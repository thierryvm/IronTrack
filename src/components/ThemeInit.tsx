'use client'

import { useEffect} from'react'

export default function ThemeInit() {
 useEffect(() => {
 // Cette logique ne s'exécute que côté client
 // Le script dans le head s'occupe de l'initialisation rapide
}, []);

 return (
 <script
 id="theme-init"
 dangerouslySetInnerHTML={{
 __html: `(function() {
 try {
 const saved = localStorage.getItem('theme');
 const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
 
 // Nettoyer toutes les classes de thème
 document.documentElement.classList.remove('dark','light');
 
 if (saved ==='dark' || (!saved && prefersDark)) {
 document.documentElement.classList.add('dark');
} else {
 document.documentElement.classList.add('light');
}
} catch (e) {
 // Fallback selon préférence système 
 document.documentElement.classList.remove('dark','light');
 if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
 document.documentElement.classList.add('dark');
} else {
 document.documentElement.classList.add('light');
}
}
})();`
}}
 />
 );
}