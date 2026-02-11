<script setup lang="ts">
definePageMeta({
  layout: 'clean',
})

const route = useRoute()

const userState = useState('user', () => null)

onMounted(async () => {
  const query = route.query

  if (!query.token) {
    return navigateTo('/login?error=no_token')
  }

  try {
    const token = query.token.toString();
    if (token) {
      localStorage.setItem('token', token)
    }

    const res = await $fetch('https://dev.core.rimkirim.com/api/auth/me', {
      method: 'GET',
      headers: {
        Authorization: `Bearer ${token}`,
        'Accept': 'application/json'
      }
    })

    if (res?.data) {
      userState.value = res.data
    }

    await navigateTo('/')

  } catch (err) {
    console.error('Google login failed:', err)
    navigateTo('/login?error=google_failed')
  }
})
</script>

<template>
  <div class="flex items-center justify-center min-h-screen">
    <p>Signing you in with Google...</p>
  </div>
</template>