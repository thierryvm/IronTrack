# Guide de Configuration HTTP/2 et HTTP/3 pour IronTrack

## 📡 État Actuel des Protocoles HTTP (2025)

### HTTP/3 - Le Standard le Plus Récent
- **Statut** : RFC 9114 (Standard officiel depuis 2022)
- **Adoption** : 95% de support navigateur, 34% des top 10M de sites web
- **Performance** : Jusqu'à 4x plus rapide qu'HTTP/1.1 dans certains cas
- **Transport** : Utilise QUIC over UDP (pas TCP)
- **Avantages** : Résout le "head-of-line blocking" d'HTTP/2

### HTTP/2 - Standard Mature
- **Statut** : RFC 9113 (révision 2022 de RFC 7540)
- **Adoption** : Largement déployé et supporté
- **Transport** : TCP avec multiplexing
- **Performance** : Amélioration significative vs HTTP/1.1

## 🚀 Configuration IronTrack

### 1. Configuration Next.js (next.config.ts)
```typescript
// Headers optimisés pour HTTP/2+ ajoutés
experimental: {
  optimizePackageImports: ['lucide-react', 'framer-motion'],
},
async headers() {
  return [
    {
      source: '/(.*)',
      headers: [
        // DNS Prefetch pour améliorer les performances HTTP/2
        { key: 'X-DNS-Prefetch-Control', value: 'on' },
        // HSTS pour forcer HTTPS (requis pour HTTP/2)
        { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
        // Headers de sécurité
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'origin-when-cross-origin' },
        { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()' }
      ]
    }
  ]
}
```

### 2. Options de Déploiement HTTP/2+

#### 🟢 Option 1: Vercel (Recommandé)
```bash
# Déploiement automatique avec HTTP/2 + HTTP/3
npm run build
vercel --prod
```
**Avantages :**
- HTTP/2 et HTTP/3 activés automatiquement
- Compression Brotli/Gzip automatique
- CDN Edge mondial avec latence ultra-faible
- Certificats SSL automatiques
- Aucune configuration serveur requise

#### 🟡 Option 2: Self-Hosting avec Nginx (Avancé)
```nginx
# /etc/nginx/sites-available/irontrack
server {
    listen 443 ssl http2;
    listen [::]:443 ssl http2;
    
    # Configuration HTTP/3 (optionnel)
    listen 443 http3 reuseport;
    listen [::]:443 http3 reuseport;
    
    server_name votre-domaine.com;
    
    # Certificats SSL (requis pour HTTP/2+)
    ssl_certificate /path/to/certificate.pem;
    ssl_certificate_key /path/to/private.key;
    
    # Configuration SSL moderne
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512;
    
    # Headers HTTP/3
    add_header Alt-Svc 'h3=":443"; ma=86400, h2=":443"; ma=86400' always;
    
    # Compression (optimisé pour HTTP/2)
    gzip on;
    gzip_vary on;
    gzip_types text/plain text/css application/json application/javascript text/xml application/xml text/javascript;
    
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

#### 🔴 Option 3: Node.js Direct HTTP/2 (Développement uniquement)
```javascript
// server.js - Pour test uniquement
const { createSecureServer } = require('http2');
const { readFileSync } = require('fs');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  const server = createSecureServer({
    cert: readFileSync('./localhost.pem'),
    key: readFileSync('./localhost-key.pem')
  });

  server.on('stream', (stream, headers) => {
    handle(stream, headers);
  });

  server.listen(3000, () => {
    console.log('> Ready on https://localhost:3000');
  });
});
```

### 3. Vérification HTTP/2/HTTP/3

#### Test Browser DevTools
1. Ouvrir DevTools → Network
2. Charger la page
3. Vérifier colonne "Protocol" : 
   - `h2` = HTTP/2
   - `h3` = HTTP/3

#### Test Curl
```bash
# Test HTTP/2
curl -I --http2 https://votre-domaine.com

# Test HTTP/3
curl -I --http3 https://votre-domaine.com
```

#### Test en ligne
- https://tools.keycdn.com/http2-test
- https://www.http3check.net/

## ⚡ Optimisations Performance HTTP/2+

### 1. Resource Hints
```html
<!-- DNS Prefetch -->
<link rel="dns-prefetch" href="//taspdceblvmpvdjixyit.supabase.co">

<!-- Preconnect pour Supabase -->
<link rel="preconnect" href="https://taspdceblvmpvdjixyit.supabase.co">

<!-- Module Preload -->
<link rel="modulepreload" href="/path/to/critical-component.js">
```

### 2. Code Splitting Optimisé
```javascript
// Lazy loading avec React.lazy()
const AdminPanel = lazy(() => import('./admin/AdminPanel'));
const ExerciseWizard = lazy(() => import('./exercises/ExerciseWizard'));

// Route-based splitting
export default function App() {
  return (
    <Suspense fallback={<div>Chargement...</div>}>
      <Routes>
        <Route path="/admin/*" element={<AdminPanel />} />
        <Route path="/exercises/new" element={<ExerciseWizard />} />
      </Routes>
    </Suspense>
  );
}
```

### 3. Image Optimization
```javascript
// next/image avec loading optimisé
import Image from 'next/image';

<Image
  src="/exercise-photo.jpg"
  alt="Exercice de musculation"
  width={400}
  height={300}
  priority={false} // true pour above-the-fold
  loading="lazy" // Lazy loading par défaut
  placeholder="blur"
  blurDataURL="data:image/jpeg;base64,/9j/4AAQSkZ..."
/>
```

## 📊 Impact Performance Attendu

### Métriques Core Web Vitals
- **LCP (Largest Contentful Paint)** : -20-40% avec HTTP/2
- **FID (First Input Delay)** : -30-50% avec HTTP/3
- **CLS (Cumulative Layout Shift)** : Stable avec optimisations images

### Métriques Réseau
- **Time to First Byte** : -25-35% avec HTTP/3
- **Full Page Load** : -30-60% selon complexité
- **Resource Loading** : Parallélisation HTTP/2 multiplexing

## 🔧 Commandes de Test

```bash
# Build et test performance
npm run build
npm run start

# Audit Lighthouse
npx lighthouse https://localhost:3000 --output=html --output-path=./lighthouse-report.html

# Bundle analyzer
npm install --save-dev @next/bundle-analyzer
ANALYZE=true npm run build
```

## ✅ Checklist HTTP/2+ Ready

- [x] ✅ HTTPS configuré (requis pour HTTP/2+)
- [x] ✅ Headers de sécurité ajoutés
- [x] ✅ Resource hints configurés
- [x] ✅ Images optimisées avec next/image
- [x] ✅ Code splitting implémenté
- [x] ✅ Compression activée (Vercel automatique)
- [ ] 🎯 Certificat SSL en production
- [ ] 🎯 Test HTTP/3 avec curl --http3
- [ ] 🎯 Monitoring performance avec Core Web Vitals

## 🎯 Recommandation Finale

**Pour IronTrack en 2025** : Déployer sur **Vercel** pour bénéficier automatiquement d'HTTP/2 + HTTP/3 sans configuration serveur complexe. La configuration Next.js actuelle est déjà optimisée pour ces protocoles.

Les headers ajoutés dans `next.config.ts` préparent l'application pour des performances optimales sur HTTP/2+ avec sécurité renforcée.