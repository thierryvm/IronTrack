import { render, screen, waitFor } from '@testing-library/react'
import '@testing-library/jest-dom'

import AuthCodeErrorPage from '@/app/auth/auth-code-error/page'
import ResetPasswordPage from '@/app/auth/reset-password/page'
import { createClient } from '@/utils/supabase/client'

const push = jest.fn()
const mockSetSession = jest.fn()
const mockUpdateUser = jest.fn()
const mockSearchParamsGet = jest.fn()

jest.mock('next/navigation', () => ({
  useRouter: () => ({
    push,
    replace: jest.fn(),
  }),
  useSearchParams: () => ({
    get: mockSearchParamsGet,
  }),
}))

jest.mock('@/utils/supabase/client', () => ({
  createClient: jest.fn(),
}))

describe('Auth subpages', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    jest.useFakeTimers()

    ;(createClient as jest.Mock).mockReturnValue({
      auth: {
        setSession: mockSetSession,
        updateUser: mockUpdateUser,
      },
    })

    mockSetSession.mockResolvedValue({ error: null })
    mockUpdateUser.mockResolvedValue({ error: null })
  })

  afterEach(() => {
    jest.runOnlyPendingTimers()
    jest.useRealTimers()
  })

  it('affiche un état invalide propre pour la réinitialisation sans token', async () => {
    mockSearchParamsGet.mockReturnValue(null)

    render(<ResetPasswordPage />)

    expect(await screen.findByText('Lien de réinitialisation invalide ou expiré.')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toHaveTextContent(/^Retour à la connexion$/)
  })

  it('programme la redirection sur la page auth code error', async () => {
    render(<AuthCodeErrorPage />)

    expect(screen.getByText('Connexion interrompue')).toBeInTheDocument()
    expect(screen.getByRole('link', { name: 'Retour à la connexion' })).toBeInTheDocument()

    jest.advanceTimersByTime(5000)

    await waitFor(() => {
      expect(push).toHaveBeenCalledWith('/auth')
    })
  })
})
