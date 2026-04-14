import Link from 'next/link'
import { ArrowUpRight, ShieldCheck } from 'lucide-react'

const footerLinks = [
  { href: '/faq', label: 'FAQ' },
  { href: '/pwa-guide', label: 'Guide PWA' },
  { href: '/auth', label: 'Espace connecté' },
  { href: '/support/contact', label: 'Contact support' },
]

export default function SupportFooter() {
  return (
    <footer className="rounded-[28px] border border-border bg-card/72 px-5 py-5 shadow-sm sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 lg:grid lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end lg:gap-8">
        <div className="space-y-2 lg:max-w-xl">
          <div className="flex items-center gap-2 text-foreground">
            <ShieldCheck className="size-4 text-primary" aria-hidden="true" />
            <p className="text-sm font-semibold">Centre d’aide IronTrack</p>
          </div>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            Documentation publique pour comprendre les parcours, retrouver les bonnes surfaces et
            basculer vers l’espace connecté quand une action privée est nécessaire.
          </p>
          <p className="text-xs leading-6 text-muted-foreground">
            © 2026 IronTrack. Mis à jour le 7 avril 2026.
          </p>
        </div>

        <nav
          aria-label="Liens complémentaires du support"
          className="flex flex-wrap gap-2 sm:justify-start lg:flex-nowrap lg:justify-end lg:self-end lg:pl-4"
        >
          {footerLinks.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              prefetch={false}
              className="inline-flex h-11 shrink-0 items-center justify-center gap-2 whitespace-nowrap rounded-full border border-border bg-background/55 px-5 text-sm font-medium leading-none text-foreground transition-colors hover:border-primary/25 hover:text-primary"
            >
              {link.label}
              <ArrowUpRight className="size-4" aria-hidden="true" />
            </Link>
          ))}
        </nav>
      </div>
    </footer>
  )
}
