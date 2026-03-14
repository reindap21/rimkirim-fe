import { describe, it, expect, afterEach } from 'vitest'
import { useAuthModal } from '~/composables/useAuthModal'

// Reset Nuxt useState between tests by setting values back to their defaults
afterEach(() => {
  const { isOpen, mode } = useAuthModal()
  isOpen.value = false
  mode.value = 'login'
})

describe('useAuthModal', () => {
  it('has isOpen=false and mode="login" by default', () => {
    const { isOpen, mode } = useAuthModal()
    expect(isOpen.value).toBe(false)
    expect(mode.value).toBe('login')
  })

  it('openLogin sets mode to "login" and opens the modal', () => {
    const { isOpen, mode, openLogin } = useAuthModal()
    openLogin()
    expect(mode.value).toBe('login')
    expect(isOpen.value).toBe(true)
  })

  it('openLogin from signup mode switches mode to "login"', () => {
    const { mode, openSignup, openLogin } = useAuthModal()
    openSignup()
    expect(mode.value).toBe('signup')
    openLogin()
    expect(mode.value).toBe('login')
  })

  it('openSignup sets mode to "signup" and opens the modal', () => {
    const { isOpen, mode, openSignup } = useAuthModal()
    openSignup()
    expect(mode.value).toBe('signup')
    expect(isOpen.value).toBe(true)
  })

  it('openSignup from login mode switches mode to "signup"', () => {
    const { mode, openLogin, openSignup } = useAuthModal()
    openLogin()
    expect(mode.value).toBe('login')
    openSignup()
    expect(mode.value).toBe('signup')
  })

  it('close sets isOpen to false', () => {
    const { isOpen, openLogin, close } = useAuthModal()
    openLogin()
    expect(isOpen.value).toBe(true)
    close()
    expect(isOpen.value).toBe(false)
  })

  it('close is idempotent when modal is already closed', () => {
    const { isOpen, close } = useAuthModal()
    close()
    expect(isOpen.value).toBe(false)
  })

  it('state is shared across two instances (useState singleton)', () => {
    const a = useAuthModal()
    const b = useAuthModal()
    a.openSignup()
    expect(b.isOpen.value).toBe(true)
    expect(b.mode.value).toBe('signup')
  })

  it('sequence: open → close → reopen preserves correct state', () => {
    const { isOpen, mode, openLogin, openSignup, close } = useAuthModal()
    openLogin()
    expect(isOpen.value).toBe(true)
    expect(mode.value).toBe('login')
    close()
    expect(isOpen.value).toBe(false)
    openSignup()
    expect(isOpen.value).toBe(true)
    expect(mode.value).toBe('signup')
  })
})
