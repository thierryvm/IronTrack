import type { MetadataRoute } from 'next'

import { APP_URL, PUBLIC_DISCOVERY_PAGES } from './metadata'

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date()

  return PUBLIC_DISCOVERY_PAGES.map((page) => ({
    url: new URL(page.path, APP_URL).toString(),
    lastModified: now,
    changeFrequency: page.changeFrequency,
    priority: page.priority,
  }))
}
