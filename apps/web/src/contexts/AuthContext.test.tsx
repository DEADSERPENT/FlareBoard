import { describe, it, expect, beforeEach, vi } from 'vitest'
import { renderHook, waitFor } from '@testing-library/react'
import { BrowserRouter } from 'react-router-dom'
import { AuthProvider, useAuth } from './AuthContext'
import { mockUser } from '@/test/mocks'

const mockNavigate = vi.fn()

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  }
})

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear()
    mockNavigate.mockClear()
  })

  it('should start with no user when not authenticated', async () => {
    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      ),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.user).toBeNull()
    expect(result.current.token).toBeNull()
    expect(result.current.isAuthenticated).toBe(false)
  })

  it('should restore user from localStorage on mount', async () => {
    const testToken = 'test-token-123'
    const testUser = {
      id: mockUser.id,
      email: mockUser.email,
      fullName: mockUser.name,
      roleId: '1',
    }

    localStorage.setItem('token', testToken)
    localStorage.setItem('user', JSON.stringify(testUser))

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      ),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    expect(result.current.token).toBe(testToken)
    expect(result.current.user).toEqual(testUser)
    expect(result.current.isAuthenticated).toBe(true)
  })

  it('should login user and persist to localStorage', async () => {
    const testToken = 'new-token-456'
    const testUser = {
      id: '2',
      email: 'newuser@example.com',
      fullName: 'New User',
      roleId: '1',
    }

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      ),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.login(testToken, testUser)

    await waitFor(() => {
      expect(result.current.token).toBe(testToken)
      expect(result.current.user).toEqual(testUser)
      expect(result.current.isAuthenticated).toBe(true)
    })

    expect(localStorage.getItem('token')).toBe(testToken)
    expect(localStorage.getItem('user')).toBe(JSON.stringify(testUser))
  })

  it('should logout user and clear localStorage', async () => {
    const testToken = 'logout-token'
    const testUser = {
      id: '3',
      email: 'logout@example.com',
      fullName: 'Logout User',
      roleId: '1',
    }

    localStorage.setItem('token', testToken)
    localStorage.setItem('user', JSON.stringify(testUser))

    const { result } = renderHook(() => useAuth(), {
      wrapper: ({ children }) => (
        <BrowserRouter>
          <AuthProvider>{children}</AuthProvider>
        </BrowserRouter>
      ),
    })

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false)
    })

    result.current.logout()

    await waitFor(() => {
      expect(result.current.token).toBeNull()
      expect(result.current.user).toBeNull()
      expect(result.current.isAuthenticated).toBe(false)
    })

    expect(localStorage.getItem('token')).toBeNull()
    expect(localStorage.getItem('user')).toBeNull()
    expect(mockNavigate).toHaveBeenCalledWith('/login')
  })

  it('should throw error when useAuth is used outside AuthProvider', () => {
    expect(() => {
      renderHook(() => useAuth())
    }).toThrow('useAuth must be used within an AuthProvider')
  })
})
