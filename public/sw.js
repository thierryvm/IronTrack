if(!self.define){let e,i={};const n=(n,r)=>(n=new URL(n+".js",r).href,i[n]||new Promise(i=>{if("document"in self){const e=document.createElement("script");e.src=n,e.onload=i,document.head.appendChild(e)}else e=n,importScripts(n),i()}).then(()=>{let e=i[n];if(!e)throw new Error(`Module ${n} didn't register its module`);return e}));self.define=(r,s)=>{const c=e||("document"in self?document.currentScript.src:"")||location.href;if(i[c])return;let o={};const f=e=>n(e,c),t={module:{uri:c},exports:o,require:f};i[c]=Promise.all(r.map(e=>t[e]||f(e))).then(e=>(s(...e),o))}}define(["./workbox-7a3591c1"],function(e){"use strict";self.skipWaiting(),e.clientsClaim(),e.precacheAndRoute([{url:"file.svg",revision:"d09f95206c3fa0bb9bd9fefabfd0ea71"},{url:"globe.svg",revision:"2aaafa6a49b6563925fe440891e32717"},{url:"icon-192.png",revision:"8bc1690ac8fc6d84410277925a801e48"},{url:"icon-512.png",revision:"77a26a7ed7fea0b77f53df5beff16e9a"},{url:"manifest.json",revision:"11ced0de409a90da35c0bda6bfd099b6"},{url:"next.svg",revision:"8e061864f388b47f33a1c3780831193e"},{url:"notification.mp3",revision:"cbc86ac106d917cbc1d9927540be6067"},{url:"serwist.config.js",revision:"69d4681ed89ac66dc3f2443e2c017527"},{url:"vercel.svg",revision:"c0af2f507b369b085b35ef4bbe3bcf1e"},{url:"window.svg",revision:"a2760511c65806022ad20adf74370ff3"}],{}),e.registerRoute(/^https?.*/,new e.NetworkFirst({cacheName:"http-cache",plugins:[new e.ExpirationPlugin({maxEntries:200,maxAgeSeconds:604800})]}),"GET")});
//# sourceMappingURL=sw.js.map

// Ajout IronBuddy : update auto et push notifications
self.addEventListener('install', event => {
  self.skipWaiting(); // Active immédiatement le nouveau SW
});
self.addEventListener('activate', event => {
  clients.claim(); // Prend le contrôle des pages ouvertes
});
// Permettre à l'app d'envoyer un message 'update' pour forcer l'update
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
// Gestion des push notifications (basique)
self.addEventListener('push', event => {
  const data = event.data ? event.data.json() : {};
  const title = data.title || 'IronTrack Notification';
  const options = {
    body: data.body || 'Tu as reçu une notification de IronTrack !',
    icon: '/icon-192.png',
    badge: '/icon-192.png',
  };
  event.waitUntil(self.registration.showNotification(title, options));
});
