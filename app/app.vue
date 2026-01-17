<!-- <script
  src="https://maps.googleapis.com/maps/api/js?key=AIzaSyAhKCFKLnzwr2aRdyRVmvWlJg1XQ8nAXiU&libraries=places"
  async
  defer
></script> -->

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
