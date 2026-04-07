import {
  Activity,
  BookOpen,
  ChevronRight,
  Settings,
  Target,
  Users,
} from 'lucide-react'

import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Badge } from '@/components/ui/badge'
import { type SupportTopic } from '@/components/support/support-content'

const iconMap = {
  account: Settings,
  general: BookOpen,
  onboarding: Target,
  partners: Users,
  progression: Activity,
}

interface SupportSectionProps {
  topic: SupportTopic
}

export default function SupportSection({ topic }: SupportSectionProps) {
  const Icon = iconMap[topic.id]

  return (
    <section
      id={topic.id}
      aria-labelledby={`${topic.id}-title`}
      className="rounded-[30px] border border-border bg-card/85 p-5 shadow-sm sm:p-6 xl:p-7"
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(260px,310px)_minmax(0,1fr)] xl:gap-8">
        <aside className="relative space-y-6 rounded-[24px] border border-white/6 bg-background/30 p-5 sm:p-6">
          <div className="space-y-4">
            <Badge
              variant="outline"
              className="absolute right-5 top-5 max-w-[calc(100%-5.5rem)] rounded-full border-primary/15 bg-primary/5 text-primary sm:right-6 sm:top-6"
            >
              {topic.label}
            </Badge>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10 text-primary">
              <Icon className="size-5" aria-hidden="true" />
            </div>
            <h2
              id={`${topic.id}-title`}
              className="max-w-[12ch] pr-20 text-[1.85rem] font-semibold leading-[1.04] tracking-tight text-foreground sm:max-w-none sm:pr-24 sm:text-[2rem]"
            >
              {topic.title}
            </h2>
            <p className="max-w-[24rem] text-sm leading-8 text-muted-foreground sm:text-base">
              {topic.summary}
            </p>
          </div>

          <div className="space-y-3 border-t border-border/70 pt-5">
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary/90">
              À retenir
            </p>
            <ul className="space-y-3">
              {topic.essentials.map((item) => (
                <li key={item} className="flex items-start gap-3">
                  <ChevronRight className="mt-1 size-4 shrink-0 text-primary" aria-hidden="true" />
                  <p className="text-sm leading-7 text-muted-foreground">{item}</p>
                </li>
              ))}
            </ul>
          </div>
        </aside>

        <div className="space-y-8">
          <div className="grid gap-5 lg:grid-cols-2 2xl:grid-cols-3">
          {topic.blocks.map((block) => (
            <article
              key={block.title}
              className="min-w-0 rounded-[24px] border border-white/6 bg-background/26 p-5 sm:p-6"
            >
              <h3 className="text-lg font-semibold leading-snug text-foreground">{block.title}</h3>
              <p className="mt-3 text-sm leading-7 text-muted-foreground">{block.description}</p>
              <div className="mt-5 space-y-3.5">
                {block.bullets.map((bullet) => (
                  <div key={bullet} className="flex items-start gap-3">
                    <span
                      className="mt-2 size-2 shrink-0 rounded-full bg-primary/80"
                      aria-hidden="true"
                    />
                    <p className="text-sm leading-7 text-muted-foreground">{bullet}</p>
                  </div>
                ))}
              </div>
            </article>
          ))}
          </div>

          <div className="space-y-4 rounded-[24px] border border-white/6 bg-background/20 p-5 sm:p-6">
            <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="text-base font-semibold text-foreground">Si quelque chose bloque</h3>
                <p className="mt-1 text-sm leading-6 text-muted-foreground">
                  Diagnostic rapide avant de basculer vers le support connecté.
                </p>
              </div>
              <Badge
                variant="outline"
                className="w-fit rounded-full border-primary/15 bg-primary/5 text-primary"
              >
                Vérifications fréquentes
              </Badge>
            </div>
            <Accordion
              type="single"
              collapsible
              className="w-full rounded-[22px] border border-border bg-background/55 px-5"
            >
              {topic.problems.map((problem) => (
                <AccordionItem key={problem.title} value={problem.title} className="border-border">
                  <AccordionTrigger className="text-foreground hover:no-underline">
                    {problem.title}
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground">
                    {problem.solution}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </div>
    </section>
  )
}
