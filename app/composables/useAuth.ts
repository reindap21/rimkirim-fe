import type { GetSessionResponse } from "~/types/service"
import type { UserType } from "~/types/user"

export const useAuth = () => {
  const user = useState<UserType | null>('user', () => null)
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
