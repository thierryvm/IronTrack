'use client'

import { useState } from 'react'
import Link from 'next/link'
import {
  Calendar,
  Dumbbell,
  HelpCircle,
  Search,
  TrendingUp,
  Users,
} from 'lucide-react'

import { faqData, type FAQCategory } from './faq-content'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import { Input } from '@/components/ui/input'

type FAQCategoryOption = {
  id: 'all' | FAQCategory
  label: string
  icon: typeof HelpCircle
}

const faqCategoryOptions: FAQCategoryOption[] = [
  { id: 'all', label: 'Toutes les questions', icon: HelpCircle },
  { id: 'partners', label: 'Training Partners', icon: Users },
  { id: 'workouts', label: 'Séances & Exercices', icon: Dumbbell },
  { id: 'progression', label: 'Progression & Badges', icon: TrendingUp },
  { id: 'general', label: 'Général & Mascotte', icon: Calendar },
]

export default function FAQPage() {
  const [selectedCategory, setSelectedCategory] = useState<'all' | FAQCategory>('all')
  const [openItems, setOpenItems] = useState<string[]>([])
  const [searchQuery, setSearchQuery] = useState('')

  const filteredFAQ = faqData.filter((item) => {
    const matchesCategory = selectedCategory === 'all' || item.category === selectedCategory
    const normalizedQuery = searchQuery.trim().toLowerCase()
    const matchesSearch =
      normalizedQuery.length === 0 ||
      item.question.toLowerCase().includes(normalizedQuery) ||
      item.answer.toLowerCase().includes(normalizedQuery)

    return matchesCategory && matchesSearch
  })

  const categoryCounts = faqData.reduce<Record<'all' | FAQCategory, number>>(
    (accumulator, item) => {
      accumulator[item.category] += 1
      accumulator.all += 1
      return accumulator
    },
    {
      all: 0,
      general: 0,
      partners: 0,
      progression: 0,
      technical: 0,
      workouts: 0,
    },
  )

  const activeCategoryLabel =
    selectedCategory === 'all'
      ? 'Toutes les questions'
      : faqCategoryOptions.find((category) => category.id === selectedCategory)?.label ??
        'Questions'

  return (
    <main className="min-h-screen bg-background py-8">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 sm:px-6">
        <Card className="rounded-[28px] border-border bg-card/95 shadow-sm">
          <CardHeader className="gap-4">
            <div className="flex items-start gap-4">
              <div className="flex size-12 items-center justify-center rounded-2xl border border-primary/15 bg-primary/10 text-primary">
                <HelpCircle className="size-6" aria-hidden="true" />
              </div>
              <div className="space-y-2">
                <h1 className="text-3xl font-semibold text-foreground text-pretty sm:text-4xl">
                  Questions fréquentes
                </h1>
                <p className="max-w-3xl text-sm leading-7 text-muted-foreground sm:text-base">
                  Retrouve rapidement les réponses utiles sur les partenaires, les
                  séances, la progression et les usages courants d’IronTrack.
                </p>
              </div>
            </div>
          </CardHeader>
        </Card>

        <Card className="rounded-[28px] border-border bg-card/95 shadow-sm">
          <CardContent className="space-y-3 p-6">
            <label
              htmlFor="faq-search"
              className="text-sm font-medium text-foreground"
            >
              Rechercher dans la FAQ
            </label>
            <div className="relative">
              <Search
                className="pointer-events-none absolute left-4 top-1/2 size-5 -translate-y-1/2 text-muted-foreground"
                aria-hidden="true"
              />
              <Input
                id="faq-search"
                name="faq-search"
                type="search"
                value={searchQuery}
                onChange={(event) => setSearchQuery(event.target.value)}
                placeholder="Exemple : partenaire, objectif, badge…"
                autoComplete="off"
                className="pl-12"
              />
            </div>
          </CardContent>
        </Card>

        <div className="grid gap-6 lg:grid-cols-[18rem_minmax(0,1fr)]">
          <Card className="h-fit rounded-[28px] border-border bg-card/95 shadow-sm">
            <CardHeader className="pb-4">
              <h2 className="text-lg font-semibold text-foreground">Catégories</h2>
            </CardHeader>
            <CardContent className="space-y-2">
              {faqCategoryOptions.map((category) => {
                const Icon = category.icon
                const isActive = selectedCategory === category.id

                return (
                  <Button
                    key={category.id}
                    type="button"
                    variant={isActive ? 'secondary' : 'ghost'}
                    fullWidth
                    aria-pressed={isActive}
                    onClick={() => setSelectedCategory(category.id)}
                    className="min-h-[48px] justify-between rounded-2xl px-3"
                  >
                    <span className="flex min-w-0 items-center gap-3">
                      <Icon className="size-5 shrink-0" aria-hidden="true" />
                      <span className="truncate">{category.label}</span>
                    </span>
                    <span className="rounded-full border border-border bg-background px-2.5 py-1 text-xs font-semibold text-muted-foreground">
                      {categoryCounts[category.id]}
                    </span>
                  </Button>
                )
              })}
            </CardContent>
          </Card>

          <Card className="rounded-[28px] border-border bg-card/95 shadow-sm">
            <CardHeader className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
              <div className="space-y-1">
                <h2 className="text-xl font-semibold text-foreground">
                  {activeCategoryLabel}
                </h2>
                <p className="text-sm leading-6 text-muted-foreground">
                  {filteredFAQ.length} question{filteredFAQ.length > 1 ? 's' : ''}
                </p>
              </div>
              {searchQuery ? (
                <Button
                  type="button"
                  variant="link"
                  className="h-auto self-start px-0 text-primary"
                  onClick={() => setSearchQuery('')}
                >
                  Effacer la recherche
                </Button>
              ) : null}
            </CardHeader>
            <CardContent>
              {filteredFAQ.length === 0 ? (
                <div className="rounded-[24px] border border-dashed border-border bg-background/70 px-6 py-10 text-center">
                  <HelpCircle
                    className="mx-auto mb-4 size-12 text-muted-foreground"
                    aria-hidden="true"
                  />
                  <p className="text-sm leading-7 text-muted-foreground sm:text-base">
                    {searchQuery
                      ? 'Aucune question ne correspond à cette recherche.'
                      : 'Aucune question n’est disponible dans cette catégorie.'}
                  </p>
                </div>
              ) : (
                <Accordion
                  type="multiple"
                  value={openItems}
                  onValueChange={setOpenItems}
                  className="rounded-[24px] border border-border bg-background/60 px-5"
                >
                  {filteredFAQ.map((item) => (
                    <AccordionItem key={item.id} value={item.id} className="border-border">
                      <AccordionTrigger className="text-base font-medium text-foreground hover:no-underline">
                        {item.question}
                      </AccordionTrigger>
                      <AccordionContent className="pb-5 text-sm leading-7 text-muted-foreground sm:text-base">
                        {item.answer}
                      </AccordionContent>
                    </AccordionItem>
                  ))}
                </Accordion>
              )}
            </CardContent>
          </Card>
        </div>

        <section
          aria-labelledby="faq-contact-title"
          className="overflow-hidden rounded-[32px] border border-border bg-[linear-gradient(140deg,rgba(17,19,24,0.98),rgba(27,31,39,0.94))] px-6 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.18)] sm:px-8"
        >
          <div className="flex flex-col gap-6 text-center sm:items-center">
            <div className="space-y-3">
              <h2
                id="faq-contact-title"
                className="text-2xl font-semibold text-white text-pretty sm:text-3xl"
              >
                Tu ne trouves pas encore ta réponse ?
              </h2>
              <p className="max-w-2xl text-sm leading-7 text-white/80 sm:text-base">
                Consulte le centre d’aide complet pour les parcours détaillés, puis
                passe au contact support uniquement si une action privée est nécessaire.
              </p>
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
              <Button
                asChild
                className="min-h-[48px] rounded-[18px] px-6 text-slate-950 hover:text-slate-950"
              >
                <Link href="/support">Ouvrir le centre d’aide</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="min-h-[48px] rounded-[18px] border-white/15 bg-white/5 px-6 text-white hover:bg-white/10 hover:text-white"
              >
                <Link href="/support/contact">Contacter le support</Link>
              </Button>
            </div>
          </div>
        </section>
      </div>
    </main>
  )
}
