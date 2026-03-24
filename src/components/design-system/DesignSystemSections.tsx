import * as React from "react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Checkbox } from "@/components/ui/checkbox"
import { SliderDemo } from "@/components/design-system/SliderDemo"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Logo } from "@/components/shared/Logo"
import { Target, Sparkles, ChevronLeft, ChevronRight } from "lucide-react"

export function LogoDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
      <Card className="p-8 flex flex-col items-center justify-center gap-4 bg-muted">
        <Logo iconSize="sm" />
        <p className="text-sm text-muted-foreground">Taille Small (sm)</p>
      </Card>
      <Card className="p-8 flex flex-col items-center justify-center gap-4 bg-muted">
        <Logo iconSize="md" />
        <p className="text-sm text-muted-foreground">Taille Medium (md)</p>
      </Card>
      <Card className="p-8 flex flex-col items-center justify-center gap-4 bg-foreground">
        <Logo iconSize="lg" />
        <p className="text-sm text-muted-foreground">Taille Large (lg) sur fond sombre</p>
      </Card>
    </div>
  )
}

export function TypographyDemo() {
  return (
    <Card className="p-8 space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-5xl">Heading 1: La force commence ici</h1>
        <p className="text-sm text-muted-foreground">Class: text-4xl font-extrabold tracking-tight lg:text-5xl</p>
      </div>
      <div className="space-y-2">
        <h2 className="text-3xl font-bold tracking-tight">Heading 2: Suivez vos progrès</h2>
        <p className="text-sm text-muted-foreground">Class: text-3xl font-bold tracking-tight</p>
      </div>
      <div className="space-y-2">
        <h3 className="text-2xl font-semibold tracking-tight">Heading 3: Détails de l'entraînement</h3>
        <p className="text-sm text-muted-foreground">Class: text-2xl font-semibold tracking-tight</p>
      </div>
      <div className="space-y-2">
        <p className="leading-7 [&:not(:first-child)]:mt-6 text-base">
          Paragraphe standard. C'est ici que le texte principal est affiché. Il doit être hautement lisible, avec une hauteur de ligne généreuse.
        </p>
        <p className="text-sm text-muted-foreground">Class: leading-7</p>
      </div>
      <div className="space-y-2">
        <p className="text-sm text-muted-foreground">
          Muted text. Utilisé pour les descriptions secondaires, les aides de champs, ou les légendes. Discret mais lisible.
        </p>
        <p className="text-xs text-muted-foreground">Class: text-sm text-muted-foreground</p>
      </div>
    </Card>
  )
}

export function ButtonsDemo() {
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
      <div className="space-y-2">
        <Button className="w-full">Primary Button</Button>
        <p className="text-xs text-muted-foreground text-center">Variante par défaut (Orange)</p>
      </div>
      <div className="space-y-2">
        <Button variant="secondary" className="w-full">Secondary Button</Button>
        <p className="text-xs text-muted-foreground text-center">Action secondaire</p>
      </div>
      <div className="space-y-2">
        <Button variant="outline" className="w-full">Outline Button</Button>
        <p className="text-xs text-muted-foreground text-center">Bordure subtile</p>
      </div>
      <div className="space-y-2">
        <Button variant="destructive" className="w-full">Destructive Button</Button>
        <p className="text-xs text-muted-foreground text-center">Actions dangereuses</p>
      </div>
      <div className="space-y-2">
        <Button variant="ghost" className="w-full">Ghost Button</Button>
        <p className="text-xs text-muted-foreground text-center">Invisible sans survol</p>
      </div>
      <div className="space-y-2">
        <Button variant="link" className="w-full">Link Button</Button>
        <p className="text-xs text-muted-foreground text-center">Ressemble à un lien web</p>
      </div>
    </div>
  )
}

export function InputsDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-6 space-y-6">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Adresse e-mail</label>
          <Input type="email" placeholder="coach@irontrack.app" />
          <p className="text-xs text-muted-foreground">Le standard h-12 apporte un confort premium.</p>
        </div>
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none text-destructive">Mot de passe (Erreur)</label>
          <Input type="password" placeholder="••••••••" className="border-destructive focus-visible:ring-destructive" />
          <p className="text-xs text-destructive">Format de retour d'erreur.</p>
        </div>
      </Card>
      <Card className="p-6 space-y-6 bg-secondary">
        <div className="space-y-2">
          <label className="text-sm font-medium leading-none">Input sur fond grisé</label>
          <Input type="text" placeholder="Le contraste reste parfait..." />
        </div>
        <Button className="w-full mt-4">Soumettre le formulaire</Button>
      </Card>
    </div>
  )
}

export function InteractionsDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      <Card className="p-6 flex flex-col items-center justify-center gap-6">
        <h3 className="text-sm font-semibold text-muted-foreground w-full text-left">Badges</h3>
        <div className="flex flex-wrap gap-2 justify-center">
          <Badge>Par défaut</Badge>
          <Badge variant="secondary">Secondaire</Badge>
          <Badge variant="outline">Outline</Badge>
          <Badge variant="destructive">Destructif</Badge>
        </div>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center gap-6">
        <h3 className="text-sm font-semibold text-muted-foreground w-full text-left">Switches (Toggles)</h3>
        <div className="flex items-center space-x-2">
          <Switch id="airplane-mode" />
          <label htmlFor="airplane-mode" className="text-sm font-medium leading-none">Activer le mode sombre</label>
        </div>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center gap-6">
        <h3 className="text-sm font-semibold text-muted-foreground w-full text-left">Checkboxes</h3>
        <div className="flex items-center space-x-2 w-full">
          <Checkbox id="terms" />
          <label htmlFor="terms" className="text-sm font-medium leading-none">Accepter les conditions</label>
        </div>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center gap-6">
        <h3 className="text-sm font-semibold text-muted-foreground w-full text-left">Sliders</h3>
        <SliderDemo />
      </Card>
    </div>
  )
}

export function NavigationDemo() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <Card className="p-6">
        <h3 className="text-lg font-semibold mb-4">Tabs (Onglets)</h3>
        <Tabs defaultValue="account" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="account">Aperçu</TabsTrigger>
            <TabsTrigger value="password">Statistiques</TabsTrigger>
          </TabsList>
          <TabsContent value="account" className="p-4 border rounded-xl mt-4 bg-muted">
            <p className="text-sm text-muted-foreground">L'onglet actif utilise la nouvelle charte stricte V5.</p>
          </TabsContent>
          <TabsContent value="password" className="p-4 border rounded-xl mt-4 bg-muted">
            <p className="text-sm text-muted-foreground">Voici le contenu du deuxième onglet.</p>
          </TabsContent>
        </Tabs>
      </Card>
      <Card className="p-6 flex flex-col items-center justify-center">
        <h3 className="text-lg font-semibold mb-4 w-full text-left">Dialog (Fenêtre Superposée)</h3>
        <Dialog>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full h-24 border-dashed rounded-2xl hover:bg-primary/10 hover:border-primary hover:text-primary transition-colors gap-2">
              <Target className="w-5 h-5" />
              <span className="text-lg">Ouvrir la Modale de Test</span>
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[425px] rounded-3xl">
            <DialogHeader>
              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
                <Sparkles className="w-6 h-6 text-primary" />
              </div>
              <DialogTitle className="text-2xl font-bold">Modale Premium</DialogTitle>
              <DialogDescription className="text-base pt-2">
                Les modales utilisent le radius ultra-arrondi (rounded-3xl). Les émojis sont remplacés par des icônes Lucide.
              </DialogDescription>
            </DialogHeader>
            <div className="flex justify-end gap-2 mt-6">
              <Button variant="outline" className="w-full">Annuler</Button>
              <Button className="w-full">Confirmer l'action</Button>
            </div>
          </DialogContent>
        </Dialog>
      </Card>
    </div>
  )
}

export function CalendarDemo() {
  return (
    <Card className="p-4 md:p-8 bg-muted">
      <div className="flex justify-between items-center mb-6">
        <h3 className="text-2xl font-bold">Mars 2026</h3>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" className="h-[auto]">Aujourd'hui</Button>
          <div className="flex border rounded-lg overflow-hidden">
            <Button variant="ghost" className="rounded-none px-2 border-r h-[auto]" size="sm"><ChevronLeft className="w-4 h-4" /></Button>
            <Button variant="ghost" className="rounded-none px-2 h-[auto]" size="sm"><ChevronRight className="w-4 h-4" /></Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-7 gap-2 md:gap-4">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map((day) => (
          <div key={day} className="text-center text-sm font-semibold text-muted-foreground pb-2">
            {day}
          </div>
        ))}
        {/* Jours vides */}
        <div className="h-24 rounded-2xl border border-dashed border-border/50 bg-background/50"></div>
        <div className="h-24 rounded-2xl border border-dashed border-border/50 bg-background/50"></div>
        
        {/* Jour avec séance */}
        <div className="h-24 rounded-2xl border-2 border-primary bg-primary/5 p-2 flex flex-col justify-between shadow-sm cursor-pointer hover:bg-primary/10 transition-colors">
          <div className="flex justify-between items-start">
            <span className="text-sm font-bold text-primary">2</span>
            <Badge className="bg-primary h-5 w-5 p-0 flex items-center justify-center shrink-0">1</Badge>
          </div>
          <div className="mt-auto">
            <span className="text-xs font-medium text-primary line-clamp-2 leading-tight">Push (Pecs, Triceps)</span>
          </div>
        </div>
      </div>
    </Card>
  )
}
