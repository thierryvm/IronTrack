import { useEffect} from'react'
import { useRouter} from'next/navigation'
import { checkOnboardingStatus} from'@/services/onboarding'

export function useOnboardingCheck() {
 const router = useRouter()

 useEffect(() => {
 const checkOnboarding = async () => {
 try {
 const isOnboardingCompleted = await checkOnboardingStatus()
 
 if (!isOnboardingCompleted) {
 // Rediriger vers la page d'onboarding si pas terminé
 router.push('/onboarding')
}
} catch (error) {
 console.error('Erreur lors de la vérification de l\'onboarding:', error)
}
}

 checkOnboarding()
}, [router])
}