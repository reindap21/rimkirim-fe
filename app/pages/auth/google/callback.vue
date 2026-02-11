<script setup lang="ts">
definePageMeta({
  layout: 'clean',
})

const route = useRoute()

onMounted(async () => {
  const query = route.query

  if (!query.code) {
    return navigateTo('/login?error=no_code')
  }

  try {
    // Kirim SEMUA query param dari Google ke backend
    const res = await $fetch('https://dev.core.rimkirim.com/oauth/google/callback', {
      method: 'GET',
      query: query as Record<string, string>,
    })

    // Kalau backend kirim token di body
    if (res?.token) {
      localStorage.setItem('token', res.token)
    }

    await navigateTo('/dashboard')

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