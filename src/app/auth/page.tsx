'use client'

import { useState } from'react'
import Link from'next/link'
import { ShieldCheck, Sparkles, Timer, TrendingUp } from'lucide-react'

import EmailAuthForm from'@/components/auth/EmailAuthForm'
import InAppBrowserWarning from'@/components/auth/InAppBrowserWarning'
import { Logo } from'@/components/shared/Logo'
import { Button } from'@/components/ui/button'
import { createClient } from'@/utils/supabase/client'

const features = [
 { icon: TrendingUp, text:'Suivi clair de tes séances et de ta progression' },
 { icon: Timer, text:'Planification simple, pensée pour le mobile' },
 { icon: ShieldCheck, text:'Accès sécurisé à ton espace personnel' },
]

export default function AuthPage() {
 const supabase = createClient()
 const [oauthError, setOauthError] = useState<string | null>(null)

 const handleGoogleLogin = async () => {
 try {
 setOauthError(null)

 const { error } = await supabase.auth.signInWithOAuth({
 provider:'google',
 options: {
 redirectTo: `${window.location.origin}/`,
 },
 })

 if (error) {
 throw error
 }
 } catch (error: unknown) {
 setOauthError(error instanceof Error ? error.message :'Impossible de lancer la connexion Google pour le moment.')
 }
 }

 return (
 <main className="min-h-[100dvh] bg-background px-4 py-6 sm:px-6 lg:flex lg:items-center lg:justify-center lg:px-8">
 <div className="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[1.1fr_0.9fr]">
 <section className="relative overflow-hidden rounded-[28px] border border-border bg-slate-950 px-6 py-8 text-white shadow-2xl sm:px-8 lg:min-h-[720px] lg:px-10 lg:py-10">
 <div
 className="absolute inset-0 opacity-70"
 style={{ background:'radial-gradient(circle at top right, rgba(249,115,22,0.28), transparent 34%), radial-gradient(circle at bottom left, rgba(59,130,246,0.18), transparent 42%)' }}
 />
 <div
 className="absolute inset-0 opacity-10"
 style={{ backgroundImage:'radial-gradient(#ffffff 1px, transparent 1px)', backgroundSize:'28px 28px' }}
 />

 <div className="relative z-10 flex h-full flex-col justify-between gap-10">
 <div className="space-y-6">
 <div className="flex items-center justify-between gap-4">
 <Logo iconSize="lg" className="text-white" />
 <div className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-3 py-1 text-xs font-semibold text-white/90 backdrop-blur">
 <Sparkles className="h-3.5 w-3.5 text-primary" aria-hidden="true" />
 Expérience mobile revue
 </div>
 </div>

 <div className="max-w-xl space-y-4">
 <p className="text-sm font-medium uppercase tracking-[0.24em] text-white/60">
 Fitness, musculation & nutrition
 </p>
 <h1 className="max-w-lg text-4xl font-black leading-tight text-balance sm:text-5xl">
 Ton espace d&apos;entraînement, sans friction.
 </h1>
 <p className="max-w-lg text-base leading-7 text-white/72 sm:text-lg">
 Accède vite à tes séances, ta nutrition et tes progrès dans une interface plus nette, plus lisible et pensée d&apos;abord pour le mobile.
 </p>
 </div>

 <ul className="grid gap-3 sm:grid-cols-3">
 {features.map(({ icon: Icon, text }) => (
 <li key={text} className="rounded-2xl border border-white/10 bg-white/6 p-4 backdrop-blur">
 <Icon className="mb-3 h-5 w-5 text-primary" aria-hidden="true" />
 <p className="text-sm font-medium leading-6 text-white/84">{text}</p>
 </li>
 ))}
 </ul>
 </div>

 <div className="grid gap-3 sm:grid-cols-3">
 <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
 <p className="text-sm text-white/62">Coach</p>
 <p className="mt-2 text-2xl font-bold">1 app</p>
 </div>
 <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
 <p className="text-sm text-white/62">Parcours</p>
 <p className="mt-2 text-2xl font-bold">mobile-first</p>
 </div>
 <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
 <p className="text-sm text-white/62">Suivi</p>
 <p className="mt-2 text-2xl font-bold">plus lisible</p>
 </div>
 </div>
 </div>
 </section>

 <section className="rounded-[28px] border border-border bg-card px-5 py-6 shadow-xl sm:px-8 sm:py-8 lg:flex lg:min-h-[720px] lg:flex-col lg:justify-center">
 <div className="mx-auto flex w-full max-w-md flex-col gap-6">
 <div className="flex items-center justify-between gap-3 lg:hidden">
 <Logo iconSize="md" />
 <Link href="/support" className="text-sm font-medium text-safe-muted transition-colors hover:text-foreground">
 Besoin d&apos;aide ?
 </Link>
 </div>

 <div className="space-y-2">
 <p className="text-sm font-semibold uppercase tracking-[0.22em] text-primary">
 Connexion sécurisée
 </p>
 <h2 className="text-3xl font-bold text-foreground text-balance">
 Reprends ton rythme là où tu l&apos;as laissé.
 </h2>
 <p className="text-sm leading-6 text-safe-muted">
 Connecte-toi pour retrouver tes séances, ton planning et tes objectifs dans un espace plus clair et plus accessible.
 </p>
 </div>

 <div className="rounded-2xl border border-border bg-muted/35 p-4 lg:hidden">
 <p className="text-sm font-medium text-foreground">Accès rapide sur mobile</p>
 <p className="mt-1 text-sm leading-6 text-safe-muted">
 Planning, nutrition et progression restent accessibles dès le premier écran, sans détour visuel inutile.
 </p>
 </div>

 <InAppBrowserWarning />

 {oauthError && (
 <div role="alert" aria-live="polite" className="rounded-2xl border border-destructive/25 bg-destructive/10 px-4 py-3 text-sm text-destructive">
 {oauthError}
 </div>
 )}

 <Button
 type="button"
 variant="outline"
 onClick={handleGoogleLogin}
 className="h-12 w-full gap-2 rounded-xl border-border bg-background font-semibold text-base hover:bg-accent"
 >
 <svg className="h-5 w-5" viewBox="0 0 24 24" aria-hidden="true">
 <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
 <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
 <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
 <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
 </svg>
 Continuer avec Google
 </Button>

 <div className="relative">
 <div className="absolute inset-0 flex items-center">
 <div className="w-full border-t border-border" />
 </div>
 <div className="relative flex justify-center text-xs uppercase tracking-[0.2em]">
 <span className="bg-card px-3 text-safe-muted">ou</span>
 </div>
 </div>

 <EmailAuthForm showGoogleOption={false} />

 <div className="border-t border-border pt-4">
 <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-xs text-safe-muted">
 <Link href="/legal/terms" className="transition-colors hover:text-foreground">
 Conditions d&apos;utilisation
 </Link>
 <span aria-hidden>·</span>
 <Link href="/legal/privacy" className="transition-colors hover:text-foreground">
 Confidentialité
 </Link>
 <span aria-hidden>·</span>
 <Link href="/support" className="transition-colors hover:text-foreground">
 Support
 </Link>
 </div>
 </div>
 </div>
 </section>
 </div>
 </main>
 )
}
