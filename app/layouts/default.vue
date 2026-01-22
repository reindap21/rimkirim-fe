<script setup lang="ts">

// State from Compoesable
const authModal = useAuthModal()

</script>

<template>
  <div>
    <Header />
    <slot />
    <ModalAuth :open="authModal.isOpen.value" :mode="authModal.mode.value" @close="authModal.close"
      @update:mode="authModal.mode = $event" />
    <Footer />
  </div>
</template>
