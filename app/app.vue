<script setup>
const { fetchUser } = useAuth()

await fetchUser()
</script>


<template>
  <div class="font-sans">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
</template>
