import type { GetSessionResponse } from "~/interfaces/service"
import type { User } from "~/interfaces/user"

export const useAuth = () => {
  const user = useState<User | null>('user', () => null)
  const loading = useState('auth-loading', () => false)

  const fetchUser = async () => {
    loading.value = true
    try {
      const res: GetSessionResponse = await $fetch('/api/auth/session') as any;
      user.value = res?.user
    } finally {
      loading.value = false
    }
  }

  const logout = async () => {
    await $fetch('/api/auth/logout', { method: 'POST', credentials: 'include' })
    user.value = null

    await navigateTo('/');
  }

  return {
    user,
    loading,
    fetchUser,
    logout
  }
}
