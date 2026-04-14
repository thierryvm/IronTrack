'use client'

import { usePathname} from'next/navigation'
import Header from'./Header'

export default function ConditionalHeader() {
 const pathname = usePathname()
 
 // Masquer le header sur auth et admin (admin a son propre layout de navigation)
 const shouldHideHeader =
   pathname.startsWith('/auth') ||
   pathname.startsWith('/admin')
 
 if (shouldHideHeader) {
 return null
}
 
 return <Header />
}