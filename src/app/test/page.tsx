// Page de test minimale pour diagnostic
export default function TestPage() {
  return (
    <html lang="fr">
      <head>
        <title>Test IronTrack</title>
      </head>
      <body>
        <h1>🟢 IronTrack fonctionne !</h1>
        <p>Si vous voyez cette page, le serveur Next.js répond correctement.</p>
        <p>Date: {new Date().toLocaleString('fr-BE')}</p>
      </body>
    </html>
  )
}