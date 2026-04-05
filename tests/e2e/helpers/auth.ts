import { type Page, test } from '@playwright/test'

type TestAccountRole = 'admin' | 'user'

interface TestCredentials {
  email: string
  password: string
}

const BASE_URL = process.env.E2E_BASE_URL || 'http://localhost:3000'

const CREDENTIALS: Record<TestAccountRole, TestCredentials> = {
  admin: {
    email: process.env.E2E_ADMIN_EMAIL || '',
    password: process.env.E2E_ADMIN_PASSWORD || '',
  },
  user: {
    email: process.env.E2E_USER_EMAIL || '',
    password: process.env.E2E_USER_PASSWORD || '',
  },
}

function readCredentials(role: TestAccountRole): TestCredentials {
  return CREDENTIALS[role]
}

function getCredentials(role: TestAccountRole): TestCredentials {
  const credentials = readCredentials(role)

  test.skip(
    !credentials.email || !credentials.password,
    `Variables ${role === 'admin' ? 'E2E_ADMIN_EMAIL/E2E_ADMIN_PASSWORD' : 'E2E_USER_EMAIL/E2E_USER_PASSWORD'} requises pour ce test.`
  )

  return credentials
}

export function getE2EBaseUrl(): string {
  return BASE_URL
}

export function getE2EEmail(role: TestAccountRole): string {
  return readCredentials(role).email
}

export async function loginAs(
  page: Page,
  role: TestAccountRole,
  options?: {
    loginPath?: string
    landingPath?: string
  }
): Promise<void> {
  const credentials = getCredentials(role)
  const loginPath = options?.loginPath || '/auth'
  const landingPath = options?.landingPath || '/'

  await page.goto(`${BASE_URL}${loginPath}`)
  await page.waitForSelector('input[type="email"]', { timeout: 10000 })
  await page.fill('input[type="email"]', credentials.email)
  await page.fill('input[type="password"]', credentials.password)
  await page.click('button[type="submit"]')
  await page.waitForURL(`${BASE_URL}${landingPath}`, { timeout: 15000 })
}
