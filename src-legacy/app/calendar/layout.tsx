import { Metadata} from'next'

// SEO CRITICAL: Métadonnées calendrier pour 66% → 100% (+34 points)
export const metadata: Metadata = {
 title:'Calendrier - Planning entraînements | IronTrack',
 description:'Planifiez et organisez vos séances de musculation. Calendrier interactif pour suivre vos entraînements, cardio, repos et progression hebdomadaire.',
 keywords: ['calendrier musculation','planning entraînement','organisation fitness','suivi séances','calendrier fitness'],
 openGraph: {
 title:'Calendrier IronTrack - Planning musculation',
 description:'Organisez vos séances de musculation avec le calendrier interactif IronTrack',
 type:'website'
}
}

export default function CalendarLayout({
 children,
}: {
 children: React.ReactNode
}) {
 return children
}