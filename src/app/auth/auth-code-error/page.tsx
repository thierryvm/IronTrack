'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AlertTriangle, ArrowLeft, LifeBuoy } from 'lucide-react'

import { AuthSecondaryLayout } from '@/components/auth/AuthSecondaryLayout'
import { Button } from '@/components/ui/button'

export default function AuthCodeErrorPage() {
  const router = useRouter()

  useEffect(() => {
    const timer = window.setTimeout(() => {
      router.push('/auth')
    }, 5000)

    return () => window.clearTimeout(timer)
  }, [router])

  return (
    <AuthSecondaryLayout
      badge="Lien invalide"
      title="Connexion interrompue"
      description="Le lien utilisé n&apos;est plus valide. Repars depuis l&apos;écran de connexion pour sécuriser l&apos;accès."
      mobileTitle="Lien de connexion invalide"
      mobileDescription="Le lien n&apos;est plus utilisable. Reviens sur la connexion pour relancer la procédure."
    >
      <div className="rounded-[24px] border border-white/10 bg-[#11131a] p-6 shadow-[0_24px_80px_rgba(0,0,0,0.28)]">
        <div className="mb-6 flex items-start gap-4">
          <div className="flex size-12 flex-shrink-0 items-center justify-center rounded-2xl border border-destructive/20 bg-destructive/10">
            <AlertTriangle className="h-5 w-5 text-destructive" aria-hidden="true" />
          </div>
          <div className="space-y-2">
            <h2 className="text-xl font-semibold text-white">Le lien a expiré ou a déjà été utilisé</h2>
            <p className="text-sm leading-6 text-white/68">
              Merci de recommencer la connexion ou l&apos;inscription depuis IronTrack pour générer un nouveau lien sûr.
            </p>
          </div>
        </div>

        <div className="mb-6 rounded-2xl border border-white/10 bg-white/[0.03] px-4 py-3 text-sm leading-6 text-white/68">
          Redirection automatique vers la connexion dans quelques secondes.
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Button asChild className="h-12 flex-1 rounded-xl text-base font-semibold">
            <Link href="/auth">
              <ArrowLeft className="h-4.5 w-4.5" aria-hidden="true" />
              Retour à la connexion
            </Link>
          </Button>
          <Button
            asChild
            variant="outline"
            className="h-12 flex-1 rounded-xl border-white/10 bg-transparent text-white hover:bg-white/5"
          >
            <Link href="/support">
              <LifeBuoy className="h-4.5 w-4.5" aria-hidden="true" />
              Ouvrir le support
            </Link>
          </Button>
        </div>
      </div>
    </AuthSecondaryLayout>
  )
}
