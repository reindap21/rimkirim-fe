import { describe, it, expect, vi, beforeAll, beforeEach, afterEach } from 'vitest'
import { mockNuxtImport } from '@nuxt/test-utils/runtime'
import { useAuth } from '~/composables/useAuth'

// ---------------------------------------------------------------------------
// $fetch is a Nuxt global (not an unimport auto-import) — stub via globalThis.
// navigateTo IS a Nuxt auto-import — use mockNuxtImport.
// ---------------------------------------------------------------------------

const mockFetch = vi.fn()
const mockNavigateTo = vi.hoisted(() => vi.fn().mockResolvedValue(undefined))

mockNuxtImport('navigateTo', () => mockNavigateTo)

beforeAll(() => {
  vi.stubGlobal('$fetch', mockFetch)
})

beforeEach(() => {
  mockFetch.mockReset()
  mockNavigateTo.mockReset()
  mockNavigateTo.mockResolvedValue(undefined)
})

// Reset shared useState between tests
afterEach(() => {
  const { user, loading } = useAuth()
  user.value = null
  loading.value = false
})

// ---------------------------------------------------------------------------
// Initial state
// ---------------------------------------------------------------------------

describe('useAuth — initial state', () => {
  it('user is null by default', () => {
    const { user } = useAuth()
    expect(user.value).toBeNull()
  })

  it('loading is false by default', () => {
    const { loading } = useAuth()
    expect(loading.value).toBe(false)
  })
})

// ---------------------------------------------------------------------------
// fetchUser
// ---------------------------------------------------------------------------

describe('useAuth — fetchUser', () => {
  it('sets user from the session response', async () => {
    const fakeUser = { id: '1', name: 'Alice', email: 'alice@example.com' }
    mockFetch.mockResolvedValue({ user: fakeUser })

    const { user, fetchUser } = useAuth()
    await fetchUser()

    expect(user.value).toEqual(fakeUser)
  })

  it('calls $fetch with /api/auth/session', async () => {
    mockFetch.mockResolvedValue({ user: null })
    const { fetchUser } = useAuth()
    await fetchUser()
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/session')
  })

  it('sets loading to true during fetch and false after', async () => {
    let loadingDuring = false
    const { loading, fetchUser } = useAuth()

    mockFetch.mockImplementation(async () => {
      loadingDuring = loading.value
      return { user: { id: '1', name: 'Bob', email: 'bob@example.com' } }
    })

    await fetchUser()
    expect(loadingDuring).toBe(true)
    expect(loading.value).toBe(false)
  })

  it('resets loading to false when $fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'))
    const { loading, fetchUser } = useAuth()
    await expect(fetchUser()).rejects.toThrow('Network error')
    expect(loading.value).toBe(false)
  })

  it('leaves user as null when $fetch throws', async () => {
    mockFetch.mockRejectedValue(new Error('fail'))
    const { user, fetchUser } = useAuth()
    try {
      await fetchUser()
    } catch {
      // error is intentional — verify state below
    }
    expect(user.value).toBeNull()
  })

  it('sets user to undefined when response has no user field', async () => {
    mockFetch.mockResolvedValue({})
    const { user, fetchUser } = useAuth()
    await fetchUser()
    expect(user.value).toBeUndefined()
  })
})

// ---------------------------------------------------------------------------
// logout
// ---------------------------------------------------------------------------

describe('useAuth — logout', () => {
  it('calls $fetch POST /api/auth/logout with credentials=include', async () => {
    mockFetch.mockResolvedValue(undefined)
    const { logout } = useAuth()
    await logout()
    expect(mockFetch).toHaveBeenCalledWith('/api/auth/logout', {
      method: 'POST',
      credentials: 'include',
    })
  })

  it('sets user to null after logout', async () => {
    const fakeUser = { id: '1', name: 'Alice', email: 'alice@example.com' }
    mockFetch.mockResolvedValueOnce({ user: fakeUser })
    const { user, fetchUser, logout } = useAuth()
    await fetchUser()
    expect(user.value).not.toBeNull()

    mockFetch.mockResolvedValue(undefined)
    await logout()
    expect(user.value).toBeNull()
  })

  it('calls navigateTo("/") after logout', async () => {
    mockFetch.mockResolvedValue(undefined)
    const { logout } = useAuth()
    await logout()
    expect(mockNavigateTo).toHaveBeenCalledWith('/')
  })
})

// ---------------------------------------------------------------------------
// State sharing
// ---------------------------------------------------------------------------

describe('useAuth — state sharing across instances', () => {
  it('user state is shared between two instances', async () => {
    const fakeUser = { id: '2', name: 'Carol', email: 'carol@example.com' }
    mockFetch.mockResolvedValue({ user: fakeUser })

    const a = useAuth()
    await a.fetchUser()

    const b = useAuth()
    expect(b.user.value).toEqual(fakeUser)
  })
})
