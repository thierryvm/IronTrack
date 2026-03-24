'use client'

import { usePathname} from'next/navigation'
import Header from'./Header'

export default function ConditionalHeader() {
 const pathname = usePathname()
 
 // Pages où le header doit être masqué
 const authPages = [
'/auth',
'/auth/auth-code-error'
 ]
 
 // Masquer le header sur les pages d'authentification
 const shouldHideHeader = authPages.includes(pathname)
 
 if (shouldHideHeader) {
 return null
}
 
 return <Header />
}