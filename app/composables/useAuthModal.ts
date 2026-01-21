export const useAuthModal = () => {
  const isOpen = useState<boolean>('auth-modal-open', () => false)
  const mode = useState<'login' | 'signup'>('auth-modal-mode', () => 'login')

  const openLogin = () => {
    mode.value = 'login'
    isOpen.value = true
  }

  const openSignup = () => {
    mode.value = 'signup'
    isOpen.value = true
  }

  const close = () => {
    isOpen.value = false
  }

  return {
    isOpen,
    mode,
    openLogin,
    openSignup,
    close
  }
}
