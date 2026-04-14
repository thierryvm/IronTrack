'use client'

import { Suspense, useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter, useSearchParams } from 'next/navigation'
import { ArrowLeft, CheckCircle2, Eye, EyeOff, KeyRound, Loader2 } from 'lucide-react'

import { AuthSecondaryLayout } from '@/components/auth/AuthSecondaryLayout'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { createClient } from '@/utils/supabase/client'

type TokenState = 'checking' | 'ready' | 'invalid'

function ResetPasswordForm() {
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [message, setMessage] = useState('')
  const [isSuccess, setIsSuccess] = useState(false)
  const [tokenState, setTokenState] = useState<TokenState>('checking')

  const [supabase] = useState(() => createClient())
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    let isMounted = true

    const accessToken = searchParams.get('access_token')
    const refreshToken = searchParams.get('refresh_token')

    if (!accessToken || !refreshToken) {
      setTokenState('invalid')
      setMessage('Lien de réinitialisation invalide ou expiré.')
      return () => {
        isMounted = false
      }
    }

    const syncSession = async () => {
      const { error } = await supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken,
      })

      if (!isMounted) {
        return
      }

      if (error) {
        setTokenState('invalid')
        setMessage('Lien de réinitialisation invalide ou expiré.')
        return
      }

      setTokenState('ready')
    }

    void syncSession()

    return () => {
      isMounted = false
    }
  }, [searchParams, supabase])

  const handlePasswordReset = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault()

    if (tokenState !== 'ready') {
      setMessage('Lien de réinitialisation invalide ou expiré.')
      return
    }

    if (password.length < 8) {
      setMessage('Le mot de passe doit contenir au moins 8 caractères.')
      return
    }

    if (password !== confirmPassword) {
      setMessage('Les mots de passe ne correspondent pas.')
      return
    }

    setLoading(true)
    setMessage('')

    try {
      const { error } = await supabase.auth.updateUser({ password })

      if (error) {
        throw error
      }

      setIsSuccess(true)
      setMessage('Mot de passe mis à jour avec succès.')

      window.setTimeout(() => {
        router.push('/auth')
      }, 2500)
    } catch (error: unknown) {
      setMessage((error as Error)?.message || 'Erreur lors de la mise à jour du mot de passe.')
    } finally {
      setLoading(false)
    }
  }

  const passwordsDoNotMatch = confirmPassword.length > 0 && password !== confirmPassword
  const isErrorMessage = tokenState === 'invalid' || /erreur|invalide|correspondent/i.test(message)

  return (
    <AuthSecondaryLayout
      badge="Réinitialisation"
      title="Nouveau mot de passe"
      description="Sécurise ton accès et repars sur une base propre avec un mot de passe mis à jour."
      mobileDescription="Renseigne un nouveau mot de passe pour retrouver ton espace sans friction."
    >
      <div className="rounded-[24px] border border-white/10 bg-[#11131a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl border border-primary/20 bg-primary/10">
            <KeyRound className="h-5 w-5 text-primary" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Mets ton accès à jour</h2>
            <p className="text-sm leading-6 text-white/68">
              Utilise un mot de passe d&apos;au moins 8 caractères pour protéger ton espace IronTrack.
            </p>
          </div>
        </div>

        {message ? (
          <div
            role="status"
            aria-live="polite"
            className={`mb-6 rounded-2xl border px-4 py-3 text-sm leading-6 ${
              isErrorMessage
                ? 'border-destructive/25 bg-destructive/10 text-destructive'
                : 'border-emerald-500/25 bg-emerald-500/10 text-emerald-300'
            }`}
          >
            {message}
          </div>
        ) : null}

        {isSuccess ? (
          <div className="space-y-6">
            <div className="flex items-center gap-4 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-4">
              <div className="flex size-11 items-center justify-center rounded-full bg-emerald-500/15">
                <CheckCircle2 className="h-5 w-5 text-emerald-300" aria-hidden="true" />
              </div>
              <div className="space-y-1">
                <p className="font-semibold text-white">Mot de passe mis à jour</p>
                <p className="text-sm text-white/68">Redirection automatique vers la connexion en cours.</p>
              </div>
            </div>

            <Button asChild className="h-12 w-full rounded-xl text-base font-semibold">
              <Link href="/auth">Retour à la connexion</Link>
            </Button>
          </div>
        ) : tokenState === 'invalid' ? (
          <div className="space-y-4">
            <p className="text-sm leading-6 text-white/68">
              Demande un nouveau lien depuis la page de connexion pour reprendre la procédure en toute sécurité.
            </p>
            <div className="flex flex-col gap-3 sm:flex-row">
              <Button asChild className="h-12 flex-1 rounded-xl text-base font-semibold">
                <Link href="/auth">Retour à la connexion</Link>
              </Button>
              <Button
                asChild
                variant="outline"
                className="h-12 flex-1 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5"
              >
                <Link href="/support">Ouvrir le support</Link>
              </Button>
            </div>
          </div>
        ) : (
          <form className="space-y-5" onSubmit={handlePasswordReset}>
            <div className="space-y-2">
              <label htmlFor="password" className="block text-sm font-semibold text-white">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="Au moins 8 caractères"
                  minLength={8}
                  required
                  className="h-14 rounded-2xl border-white/10 bg-[#16181f] pr-14 text-white placeholder:text-white/36 focus-visible:border-primary focus-visible:ring-primary/30"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowPassword((current) => !current)}
                  aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  className="absolute right-1 top-1/2 h-11 w-11 -translate-y-1/2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white"
                >
                  {showPassword ? (
                    <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <label htmlFor="confirmPassword" className="block text-sm font-semibold text-white">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Input
                  id="confirmPassword"
                  type={showConfirmPassword ? 'text' : 'password'}
                  value={confirmPassword}
                  onChange={(event) => setConfirmPassword(event.target.value)}
                  placeholder="Répète ton nouveau mot de passe"
                  required
                  aria-invalid={passwordsDoNotMatch}
                  className="h-14 rounded-2xl border-white/10 bg-[#16181f] pr-14 text-white placeholder:text-white/36 focus-visible:border-primary focus-visible:ring-primary/30"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowConfirmPassword((current) => !current)}
                  aria-label={
                    showConfirmPassword
                      ? 'Masquer la confirmation du mot de passe'
                      : 'Afficher la confirmation du mot de passe'
                  }
                  className="absolute right-1 top-1/2 h-11 w-11 -translate-y-1/2 rounded-xl text-white/60 hover:bg-white/5 hover:text-white"
                >
                  {showConfirmPassword ? (
                    <EyeOff className="h-4.5 w-4.5" aria-hidden="true" />
                  ) : (
                    <Eye className="h-4.5 w-4.5" aria-hidden="true" />
                  )}
                </Button>
              </div>
              {passwordsDoNotMatch ? (
                <p className="text-sm text-destructive">Les mots de passe ne correspondent pas.</p>
              ) : null}
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm text-white/68">
              Le lien est vérifié côté serveur avant d&apos;autoriser la mise à jour du mot de passe.
            </div>

            <Button
              type="submit"
              disabled={loading || tokenState !== 'ready' || password.length < 8 || passwordsDoNotMatch}
              className="h-12 w-full rounded-xl text-base font-semibold"
            >
              {loading ? (
                <>
                  <Loader2 className="h-4.5 w-4.5 animate-spin" aria-hidden="true" />
                  Mise à jour en cours
                </>
              ) : (
                'Mettre à jour le mot de passe'
              )}
            </Button>

            <Button
              asChild
              variant="outline"
              className="h-12 w-full rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5"
            >
              <Link href="/auth">
                <ArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />
                Retour à la connexion
              </Link>
            </Button>
          </form>
        )}
      </div>
    </AuthSecondaryLayout>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-[#0b0d12]">
          <div className="flex items-center gap-3 rounded-2xl border border-white/10 bg-[#11131a] px-5 py-4 text-sm text-white/72 shadow-lg">
            <Loader2 className="h-4.5 w-4.5 animate-spin text-primary" aria-hidden="true" />
            Chargement de la réinitialisation
          </div>
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  )
}
