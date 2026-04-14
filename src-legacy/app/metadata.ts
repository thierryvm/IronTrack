import type { Metadata, MetadataRoute } from 'next';

export const APP_NAME = 'IronTrack';
export const APP_URL =
  process.env.NEXT_PUBLIC_APP_URL || 'https://iron-track-dusky.vercel.app';
export const APP_LOCALE = 'fr_BE';
export const APP_DESCRIPTION =
  "Application fitness, musculation et nutrition pour planifier tes séances, suivre ta progression et garder une vision claire de ton entraînement.";

export const DEFAULT_OG_IMAGE = {
  url: `${APP_URL}/opengraph-image`,
  width: 1200,
  height: 630,
  alt: 'IronTrack - application fitness, musculation et nutrition',
} as const;

export type PublicDiscoveryPage = {
  path: string;
  title: string;
  summary: string;
  changeFrequency: NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;
  priority: number;
};

export const PUBLIC_DISCOVERY_PAGES: PublicDiscoveryPage[] = [
  {
    path: '/',
    title: 'Accueil',
    summary:
      "Présentation d'IronTrack, application fitness, musculation et nutrition pensée pour le suivi, la progression et l'expérience PWA.",
    changeFrequency: 'weekly',
    priority: 1,
  },
  {
    path: '/faq',
    title: 'FAQ',
    summary:
      'Questions fréquentes sur les entraînements, les partenaires, la nutrition, la progression et les usages courants de la plateforme.',
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/support',
    title: "Centre d'aide",
    summary:
      "Documentation et guides de prise en main pour utiliser IronTrack, comprendre les parcours clés et résoudre les problèmes courants.",
    changeFrequency: 'monthly',
    priority: 0.8,
  },
  {
    path: '/pwa-guide',
    title: 'Guide PWA',
    summary:
      "Guide d'installation de l'application IronTrack sur iPhone, iPad, Android et desktop pour une expérience proche du natif.",
    changeFrequency: 'monthly',
    priority: 0.7,
  },
  {
    path: '/legal/privacy',
    title: 'Politique de confidentialité',
    summary:
      "Informations RGPD sur les données personnelles, les finalités de traitement, les droits d'accès et la confidentialité dans IronTrack.",
    changeFrequency: 'monthly',
    priority: 0.5,
  },
  {
    path: '/legal/terms',
    title: "Conditions d'utilisation",
    summary:
      "Conditions d'accès au service IronTrack, responsabilités, droits d'usage et cadre juridique applicable au produit.",
    changeFrequency: 'monthly',
    priority: 0.5,
  },
];

type PageMetadataOptions = {
  title: string;
  description: string;
  path?: string;
  keywords?: string[];
  index?: boolean;
  follow?: boolean;
  openGraphTitle?: string;
  openGraphDescription?: string;
};

export function createPageMetadata({
  title,
  description,
  path = '/',
  keywords,
  index = true,
  follow = true,
  openGraphTitle,
  openGraphDescription,
}: PageMetadataOptions): Metadata {
  const url = new URL(path, APP_URL).toString();
  const ogTitle = openGraphTitle ?? title;
  const ogDescription = openGraphDescription ?? description;

  return {
    title,
    description,
    keywords,
    alternates: {
      canonical: url,
    },
    robots: {
      index,
      follow,
      googleBot: {
        index,
        follow,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
    openGraph: {
      title: ogTitle,
      description: ogDescription,
      url,
      siteName: APP_NAME,
      locale: APP_LOCALE,
      type: 'website',
      images: [DEFAULT_OG_IMAGE],
    },
    twitter: {
      card: 'summary_large_image',
      title: ogTitle,
      description: ogDescription,
      images: [DEFAULT_OG_IMAGE.url],
    },
  };
}

type ProtectedPageMetadataOptions = Omit<
  PageMetadataOptions,
  'index' | 'follow'
>;

export function createProtectedPageMetadata(
  options: ProtectedPageMetadataOptions
): Metadata {
  return createPageMetadata({
    ...options,
    index: false,
    follow: false,
  });
}
