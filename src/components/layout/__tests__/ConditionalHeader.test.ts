import { shouldHideAppHeader } from '@/components/layout/ConditionalHeader'

describe('shouldHideAppHeader', () => {
  it('hides the app header on auth, admin and public discovery support routes', () => {
    expect(shouldHideAppHeader('/auth')).toBe(true)
    expect(shouldHideAppHeader('/auth/reset-password')).toBe(true)
    expect(shouldHideAppHeader('/admin/users')).toBe(true)
    expect(shouldHideAppHeader('/faq')).toBe(true)
    expect(shouldHideAppHeader('/support')).toBe(true)
    expect(shouldHideAppHeader('/pwa-guide')).toBe(true)
    expect(shouldHideAppHeader('/legal/privacy')).toBe(true)
  })

  it('keeps the app header on authenticated or action-oriented routes', () => {
    expect(shouldHideAppHeader('/')).toBe(false)
    expect(shouldHideAppHeader('/calendar')).toBe(false)
    expect(shouldHideAppHeader('/support/contact')).toBe(false)
  })
})
