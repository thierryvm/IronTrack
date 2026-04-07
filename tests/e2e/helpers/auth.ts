import fs from 'fs';
import path from 'path';

import type { Page } from '@playwright/test';

type Role = 'admin' | 'user';

interface AccountCredentials {
  email: string;
  password: string;
}

function parseDotEnvFile(filePath: string): Record<string, string> {
  if (!fs.existsSync(filePath)) {
    return {};
  }

  return fs
    .readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .reduce<Record<string, string>>((accumulator, line) => {
      const trimmedLine = line.trim();

      if (!trimmedLine || trimmedLine.startsWith('#')) {
        return accumulator;
      }

      const separatorIndex = trimmedLine.indexOf('=');

      if (separatorIndex <= 0) {
        return accumulator;
      }

      const key = trimmedLine.slice(0, separatorIndex).trim();
      let value = trimmedLine.slice(separatorIndex + 1).trim();

      if (
        (value.startsWith('"') && value.endsWith('"')) ||
        (value.startsWith("'") && value.endsWith("'"))
      ) {
        value = value.slice(1, -1);
      }

      accumulator[key] = value;
      return accumulator;
    }, {});
}

const envFileValues = parseDotEnvFile(path.resolve(process.cwd(), '.env.local'));

function readEnv(name: string): string | undefined {
  return process.env[name] ?? envFileValues[name];
}

function readFirstEnv(...names: string[]): string {
  for (const name of names) {
    const value = readEnv(name);

    if (value) {
      return value;
    }
  }

  return '';
}

export const E2E_BASE_URL =
  readFirstEnv('PLAYWRIGHT_BASE_URL', 'E2E_BASE_URL', 'NEXT_PUBLIC_APP_URL') ||
  'http://localhost:3000';

function getCredentials(role: Role): AccountCredentials {
  if (role === 'admin') {
    return {
      email: readFirstEnv('E2E_ADMIN_EMAIL', 'TEST_ADMIN_EMAIL', 'ADMIN_EMAIL'),
      password: readFirstEnv(
        'E2E_ADMIN_PASSWORD',
        'TEST_ADMIN_PASSWORD',
        'ADMIN_PASSWORD_TEMP'
      ),
    };
  }

  return {
    email: readFirstEnv('E2E_USER_EMAIL', 'TEST_USER_EMAIL', 'USER_EMAIL'),
    password: readFirstEnv('E2E_USER_PASSWORD', 'TEST_USER_PASSWORD', 'USER_PASSWORD'),
  };
}

export function getE2EAccount(role: Role): AccountCredentials {
  const credentials = getCredentials(role);

  if (!credentials.email || !credentials.password) {
    throw new Error(
      `Missing ${role} E2E credentials. Define ${
        role === 'admin'
          ? 'E2E_ADMIN_EMAIL and E2E_ADMIN_PASSWORD'
          : 'E2E_USER_EMAIL and E2E_USER_PASSWORD'
      } in the environment or .env.local.`
    );
  }

  return credentials;
}

export function appUrl(pathname = ''): string {
  const normalizedBaseUrl = E2E_BASE_URL.replace(/\/+$/, '');

  if (!pathname) {
    return normalizedBaseUrl;
  }

  const normalizedPathname = pathname.startsWith('/') ? pathname : `/${pathname}`;
  return `${normalizedBaseUrl}${normalizedPathname}`;
}

export async function signInWithRole(page: Page, role: Role): Promise<void> {
  const { email, password } = getE2EAccount(role);

  await page.goto(appUrl('/auth'));
  await page.waitForSelector('input[type="email"]', { timeout: 10000 });

  await page.fill('input[type="email"]', email);
  await page.fill('input[type="password"]', password);

  await Promise.all([
    page.click('button[type="submit"]'),
    page.waitForLoadState('networkidle').catch(() => undefined),
  ]);

  await page
    .waitForFunction(() => {
      const pathname = window.location.pathname;
      return pathname !== '/auth' && pathname !== '/login';
    }, null, { timeout: 15000 })
    .catch(() => undefined);

  await page.waitForTimeout(750);
}

export async function signInAsAdmin(page: Page): Promise<void> {
  await signInWithRole(page, 'admin');
}

export async function signInAsUser(page: Page): Promise<void> {
  await signInWithRole(page, 'user');
}
