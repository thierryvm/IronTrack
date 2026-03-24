import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"

export function DemoForms() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Auth Demo */}
      <Card className="p-8 space-y-24 bg-card/50">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Connexion</CardTitle>
          <CardDescription>Content de te revoir ! Accède à ton espace d'entrainement.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-4">
          <Button variant="outline" className="w-full rounded-full">Continuer avec Google</Button>
          <div className="relative flex items-center py-2">
            <div className="flex-grow border-t border-border"></div>
            <span className="flex-shrink-0 mx-4 text-xs text-muted-foreground uppercase">OU</span>
            <div className="flex-grow border-t border-border"></div>
          </div>
          <div className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Adresse email</label>
              <Input type="email" placeholder="ton-email@exemple.com" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Mot de passe</label>
              <Input type="password" placeholder="Ton mot de passe" />
            </div>
          </div>
        </CardContent>
        <CardFooter className="px-0 flex-col space-y-4 pt-4">
          <Button className="w-full rounded-2xl">Se connecter</Button>
          <div className="flex flex-col items-center space-y-2 text-sm text-muted-foreground">
            <button className="hover:text-foreground hover:underline transition-colors">Pas encore de compte ? Créer un compte</button>
            <button className="hover:text-foreground hover:underline transition-colors">Mot de passe oublié ?</button>
          </div>
        </CardFooter>
      </Card>

      {/* Workout Input Demo */}
      <Card className="p-8 space-y-4 bg-secondary/50">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Nouvel Exercice</CardTitle>
          <CardDescription>Saisis tes performances pour le Développé Couché.</CardDescription>
        </CardHeader>
        <CardContent className="px-0 space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Poids (kg)</label>
              <Input type="number" placeholder="ex: 80" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-semibold text-foreground">Répétitions</label>
              <Input type="number" placeholder="ex: 10" />
            </div>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground">RPE (1-10)</label>
            <Input type="number" placeholder="ex: 8" defaultValue="8" />
            <p className="text-xs text-muted-foreground">Estimation de l'effort perçu lors de la série.</p>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-semibold text-foreground text-destructive">Observation (Erreur)</label>
            <Input type="text" placeholder="Le texte ici" defaultValue="Douleur à l'épaule droite" aria-invalid="true" className="border-destructive focus-visible:ring-destructive" />
            <p className="text-xs text-destructive">Ce champ comporte une alerte médicale.</p>
          </div>
        </CardContent>
        <CardFooter className="px-0 flex justify-end space-x-2 pt-6">
          <Button variant="ghost">Annuler</Button>
          <Button>Valider la série</Button>
        </CardFooter>
      </Card>
    </div>
  )
}
