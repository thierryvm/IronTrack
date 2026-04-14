import Link from 'next/link'

import SupportHero from '@/components/support/SupportHero'
import SupportQuickLinks from '@/components/support/SupportQuickLinks'
import SupportFooter from '@/components/support/SupportFooter'
import SupportScrollTopButton from '@/components/support/SupportScrollTopButton'
import SupportSection from '@/components/support/SupportSection'
import { supportQuickLinks, supportTopics } from '@/components/support/support-content'
import { Button } from '@/components/ui/button'

export default function SupportPage() {
  return (
    <main className="min-h-screen bg-background">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-4 py-6 sm:px-6 lg:px-8 lg:py-8">
        <SupportHero />

        <section aria-labelledby="support-navigation" className="space-y-4">
          <div className="space-y-2">
            <h2 id="support-navigation" className="text-2xl font-semibold text-foreground">
              Parcours d’aide
            </h2>
            <p className="text-sm leading-7 text-muted-foreground sm:text-base">
              Choisis directement la surface concernée. Chaque section résume le flux utile,
              les points de contrôle et les problèmes fréquents.
            </p>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-5">
            {supportTopics.map((topic) => (
              <Button
                key={topic.id}
                asChild
                variant="outline"
                className="min-h-[48px] justify-start rounded-[18px] border-border bg-card/75 px-4"
              >
                <Link href={`#${topic.id}`}>{topic.label}</Link>
              </Button>
            ))}
          </div>
        </section>

        <SupportQuickLinks links={supportQuickLinks} />

        <div className="space-y-6">
          {supportTopics.map((topic) => (
            <SupportSection key={topic.id} topic={topic} />
          ))}
        </div>

        <SupportFooter />
      </div>

      <SupportScrollTopButton />
    </main>
  )
}
