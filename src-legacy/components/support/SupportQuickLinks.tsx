import Link from 'next/link'
import {
  ArrowRight,
  LifeBuoy,
  Lock,
  MessageSquare,
  Smartphone,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { type SupportQuickLink } from '@/components/support/support-content'

const iconMap = {
  '/auth': Lock,
  '/faq': LifeBuoy,
  '/pwa-guide': Smartphone,
  '/support/contact': MessageSquare,
} as const

interface SupportQuickLinksProps {
  links: SupportQuickLink[]
}

export default function SupportQuickLinks({ links }: SupportQuickLinksProps) {
  return (
    <section aria-labelledby="support-quick-links" className="space-y-4">
      <div className="space-y-2">
        <h2 id="support-quick-links" className="text-2xl font-semibold text-foreground">
          Accès rapides
        </h2>
        <p className="text-sm leading-7 text-muted-foreground sm:text-base">
          Les pages publiques servent à comprendre. Les actions sensibles basculent ensuite vers
          un espace connecté.
        </p>
      </div>
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        {links.map((link) => {
          const Icon = iconMap[link.href as keyof typeof iconMap] ?? LifeBuoy
          const isPrimary = link.href === '/faq'

          return (
            <article
              key={link.href}
              className="flex h-full flex-col rounded-[28px] border border-border bg-card/85 p-6 shadow-sm"
            >
              <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
                <Icon className="size-5" aria-hidden="true" />
              </div>
              <div className="mt-5 flex items-center gap-2">
                <h3 className="text-xl font-semibold tracking-tight text-foreground">{link.label}</h3>
                {link.authRequired ? (
                  <Badge
                    variant="outline"
                    className="rounded-full border-border bg-background/70 text-foreground"
                  >
                    Privé
                  </Badge>
                ) : null}
              </div>
              <p className="mt-3 text-sm leading-7 text-muted-foreground sm:text-base">
                {link.description}
              </p>
              <div className="mt-auto pt-6">
                <Button
                  asChild
                  variant={isPrimary ? 'default' : 'outline'}
                  className={cn(
                    'min-h-[48px] w-full rounded-[18px] px-5',
                    isPrimary ? 'text-background hover:text-background' : 'bg-card'
                  )}
                >
                  <Link href={link.href} prefetch={false}>
                    {link.authRequired ? 'Connexion requise' : link.label}
                    <ArrowRight data-icon="inline-end" />
                  </Link>
                </Button>
              </div>
            </article>
          )
        })}
      </div>
    </section>
  )
}
