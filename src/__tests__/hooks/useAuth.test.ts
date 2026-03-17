import { renderHook, waitFor, act } from '@testing-library/react'
import { useAuth } from '@/hooks/useAuth'
import { createClient } from '@/utils/supabase/client'

// Mock Supabase client
jest.mock('@/utils/supabase/client')

const mockCreateClient = createClient as jest.MockedFunction<typeof createClient>

describe('useAuth hook', () => {
  let mockSupabase: any

  beforeEach(() => {
    mockSupabase = {
      auth: {
        getSession: jest.fn(),
        onAuthStateChange: jest.fn(() => ({
          data: { subscription: { unsubscribe: jest.fn() } }
        }))
      }
    }
    mockCreateClient.mockReturnValue(mockSupabase)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  it('should initialize with loading state', () => {
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    expect(result.current.isLoading).toBe(true)
    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should set user when authentication is successful', async () => {
    const mockUser = {
      id: '123',
      email: 'test@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated'
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toEqual(mockUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should handle authentication errors gracefully', async () => {
    const mockError = new Error('Authentication failed')
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: mockError
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should handle auth state changes through subscription', async () => {
    const mockUser = {
      id: '456',
      email: 'user@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated'
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    // Mock la subscription callback
    let authCallback: any
    mockSupabase.auth.onAuthStateChange.mockImplementation((callback: any) => {
      authCallback = callback
      return { data: { subscription: { unsubscribe: jest.fn() } } }
    })

    const { result } = renderHook(() => useAuth())

    // Attendre l'initialisation
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Simuler un changement d'état d'auth via callback
    act(() => {
      authCallback('SIGNED_IN', { user: mockUser })
    })

    await waitFor(() => {
      expect(result.current.user).toEqual(mockUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    // Simuler une déconnexion
    act(() => {
      authCallback('SIGNED_OUT', null)
    })

    await waitFor(() => {
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })
  })

  it('should cleanup subscription on unmount', () => {
    const mockUnsubscribe = jest.fn()
    mockSupabase.auth.onAuthStateChange.mockReturnValue({
      data: { subscription: { unsubscribe: mockUnsubscribe } }
    })
    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: null },
      error: null
    })

    const { unmount } = renderHook(() => useAuth())

    unmount()

    expect(mockUnsubscribe).toHaveBeenCalled()
  })

  it('should handle unexpected errors during user retrieval', async () => {
    mockSupabase.auth.getSession.mockRejectedValue(new Error('Network error'))

    const consoleSpy = jest.spyOn(console, 'error').mockImplementation()

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    }, { timeout: 3000 })

    expect(result.current.user).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
    expect(consoleSpy).toHaveBeenCalledWith(
      'Erreur useAuth:',
      expect.any(Error)
    )

    consoleSpy.mockRestore()
  })

  it('should maintain consistent isAuthenticated state', async () => {
    const mockUser = {
      id: '789',
      email: 'consistent@example.com',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      app_metadata: {},
      user_metadata: {},
      aud: 'authenticated',
      role: 'authenticated'
    }

    mockSupabase.auth.getSession.mockResolvedValue({
      data: { session: { user: mockUser } },
      error: null
    })

    const { result } = renderHook(() => useAuth())

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    // Vérifier que isAuthenticated est cohérent avec user
    expect(result.current.isAuthenticated).toBe(!!result.current.user)
    expect(result.current.isAuthenticated).toBe(true)
  })
})
