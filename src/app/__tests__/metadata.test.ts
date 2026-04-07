import {
  APP_LOCALE,
  APP_URL,
  createPageMetadata,
  createProtectedPageMetadata,
} from '@/app/metadata';

describe('metadata helpers', () => {
  it('builds canonical and social urls from relative paths', () => {
    const metadata = createPageMetadata({
      title: 'Support',
      description: "Centre d'aide IronTrack",
      path: '/support',
      keywords: ['support'],
    });

    expect(metadata.alternates?.canonical).toBe(`${APP_URL}/support`);
    expect(metadata.openGraph?.url).toBe(`${APP_URL}/support`);
    expect(metadata.openGraph?.locale).toBe(APP_LOCALE);
    expect(metadata.twitter?.card).toBe('summary_large_image');
    expect(metadata.robots).toMatchObject({
      index: true,
      follow: true,
    });
  });

  it('marks protected areas as noindex and nofollow', () => {
    const metadata = createProtectedPageMetadata({
      title: 'Profil',
      description: 'Zone privée',
      path: '/profile',
    });

    expect(metadata.alternates?.canonical).toBe(`${APP_URL}/profile`);
    expect(metadata.robots).toMatchObject({
      index: false,
      follow: false,
      googleBot: {
        index: false,
        follow: false,
      },
    });
  });
});
