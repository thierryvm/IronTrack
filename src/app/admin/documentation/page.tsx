'use client'

import type { ReactNode } from 'react'
import {
  Activity,
  ChevronRight,
  Download,
  FileText,
  Lock,
  MessageSquare,
  Settings,
  Shield,
  Users,
} from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Card } from '@/components/ui/card'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface DocumentationSection {
  title: string
  icon: ReactNode
  accentClass: string
  items: string[]
}

function SectionCard({ section }: { section: DocumentationSection }) {
  return (
    <Card className="rounded-[26px] border-border bg-card/86 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)] sm:p-6">
      <div className="flex flex-col gap-5">
        <div className="flex items-start gap-3">
          <div className={`flex size-11 shrink-0 items-center justify-center rounded-2xl border ${section.accentClass}`}>
            {section.icon}
          </div>
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">Guide admin</p>
            <h2 className="mt-2 text-xl font-semibold tracking-tight text-foreground">{section.title}</h2>
          </div>
        </div>

        <div className="grid gap-3">
          {section.items.map((item) => (
            <div
              key={item}
              className="flex items-start gap-3 rounded-[18px] border border-border bg-background/60 px-4 py-3"
            >
              <ChevronRight className="mt-0.5 size-4 shrink-0 text-primary" />
              <p className="text-sm leading-7 text-foreground">{item}</p>
            </div>
          ))}
        </div>
      </div>
    </Card>
  )
}

export default function AdminDocumentationPage() {
  const { user } = useAdminAuth()

  const sections: DocumentationSection[] = [
    {
      title: 'Santé du système',
      icon: <Activity className="size-5 text-primary" />,
      accentClass: 'border-primary/14 bg-primary/10 text-primary',
      items: [
        'Le dashboard central remonte une lecture synthétique de la santé plateforme : dépendances, sécurité et runtime.',
        'La vérification système doit rester un repère rapide, pas une page de debug brute réservée aux développeurs.',
        'Toute alerte critique visible doit être investiguée avant d’engager une autre opération admin à risque.',
      ],
    },
    {
      title: 'Gestion des tickets',
      icon: <MessageSquare className="size-5 text-primary" />,
      accentClass: 'border-primary/14 bg-primary/10 text-primary',
      items: [
        'La page liste sert à trier et prioriser. La page détail sert à décider, répondre et documenter le contexte.',
        'Une réponse publique place le ticket en attente utilisateur. Une note interne reste strictement côté équipe.',
        'Sur mobile, le flux doit rester faisable d’une seule main : lire, changer le statut, puis répondre sans superposition.',
      ],
    },
    {
      title: 'Gestion des utilisateurs',
      icon: <Users className="size-5 text-primary" />,
      accentClass: 'border-emerald-500/14 bg-emerald-500/10 text-safe-success',
      items: [
        'La liste utilisateurs privilégie une lecture par cartes et un panneau d’actions centralisé plutôt qu’une table dense.',
        'Les rôles élevés, les blocages et les suppressions doivent être assumés explicitement et tracés.',
        'Le pseudo et l’email doivent rester lisibles immédiatement pour éviter les erreurs de ciblage en support.',
      ],
    },
    {
      title: 'Exports de données',
      icon: <Download className="size-5 text-primary" />,
      accentClass: 'border-sky-500/14 bg-sky-500/10 text-safe-info',
      items: [
        'Toujours vérifier la plage de dates avant export pour éviter un faux vide ou un export trop massif.',
        'Les exports servent à produire un livrable clair, pas à contourner les écrans applicatifs.',
        'Toute action d’export sensible doit rester traçable dans les logs admin.',
      ],
    },
    {
      title: 'Logs et audit',
      icon: <Shield className="size-5 text-primary" />,
      accentClass: 'border-amber-500/14 bg-amber-500/10 text-safe-warning',
      items: [
        'Les logs doivent pouvoir être lus sur mobile sans devoir scroller horizontalement dans une table.',
        'Le JSON détaillé n’apparaît qu’à la demande pour ne pas saturer la lecture principale.',
        'Une tentative non autorisée ou un échec répété mérite une revue prioritaire.',
      ],
    },
    {
      title: 'Configuration et sécurité',
      icon: <Settings className="size-5 text-primary" />,
      accentClass: 'border-destructive/14 bg-destructive/10 text-safe-error',
      items: [
        'Les surfaces de configuration ne doivent jamais devenir un fourre-tout de toggles incompréhensibles.',
        'Les permissions suivent le principe du moindre privilège : modérateur, admin, super admin.',
        'Les décisions sensibles doivent être explicites, compréhensibles et réversibles quand c’est possible.',
      ],
    },
  ]

  return (
    <div className="min-h-screen bg-background pb-10">
      <div className="mx-auto flex w-full max-w-[1440px] flex-col gap-6 px-4 pb-8 pt-4 sm:px-6 lg:px-8">
        <section className="overflow-hidden rounded-[30px] border border-border bg-[radial-gradient(circle_at_top_left,rgba(249,115,22,0.16),transparent_42%),linear-gradient(180deg,rgba(255,255,255,0.015),rgba(255,255,255,0))] p-5 shadow-[0_30px_80px_rgba(0,0,0,0.24)] sm:p-7">
          <div className="flex flex-col gap-4">
            <div className="flex flex-wrap gap-2">
              <Badge variant="outline" className="border-primary/20 bg-primary/10 text-primary">
                Documentation admin
              </Badge>
              <Badge variant="outline" className="border-border bg-background/70 text-foreground">
                {user?.role?.replace('_', ' ') || 'admin'}
              </Badge>
            </div>

            <div>
              <h1 className="text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
                Guide d’utilisation du panel admin
              </h1>
              <p className="mt-3 max-w-3xl text-sm leading-7 text-safe-muted sm:text-base">
                Cette page sert de repère opérationnel rapide. Elle doit aider une personne admin à agir juste, vite et sans ambiguïté, y compris depuis mobile.
              </p>
            </div>

            <Card className="rounded-[24px] border-border bg-card/82 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
              <div className="flex items-start gap-3">
                <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/14 bg-primary/10 text-primary">
                  <FileText className="size-5" />
                </div>
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                    Intention
                  </p>
                  <p className="mt-2 text-sm leading-7 text-foreground">
                    Le panel admin n’est pas une zone technique brute. Chaque page doit aider à comprendre la situation, prendre une décision, puis revenir vite au flux principal sans friction.
                  </p>
                </div>
              </div>
            </Card>
          </div>
        </section>

        <section className="grid gap-6 lg:grid-cols-2 xl:grid-cols-3">
          {sections.map((section) => (
            <SectionCard key={section.title} section={section} />
          ))}
        </section>

        <Card className="rounded-[26px] border-border bg-card/86 p-5 shadow-[0_18px_40px_rgba(0,0,0,0.16)]">
          <div className="flex items-start gap-3">
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-border bg-background/70 text-foreground">
              <Lock className="size-5" />
            </div>
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-safe-muted">
                Rappel final
              </p>
              <p className="mt-2 text-sm leading-7 text-foreground">
                Toute action sensible côté admin doit rester compréhensible, traçable et cohérente avec les permissions réelles. Si un écran demande trop d’explications pour être utilisé, il doit être simplifié.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}
