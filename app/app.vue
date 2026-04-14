<script setup>
const { fetchUser } = useAuth()

// Use useAsyncData to properly handle SSR/CSR hydration
// This ensures server and client render the same initial state
if (import.meta.server) {
  await fetchUser()
}
</script>


<template>
  <div class="font-sans">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
