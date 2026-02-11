<script setup lang="ts">
import { computed, onMounted, onUnmounted, ref } from 'vue'

const props = defineProps<{
  file?: File
  name?: string
  size?: number
  uploadedAt?: string | Date
  class?: string
}>()

const emit = defineEmits<{
  (e: 'remove'): void
  (e: 'edit'): void
}>()

/* ---------------------------
 * File info resolver
 * --------------------------- */
const fileName = computed(() => props.file?.name || props.name || '-')
const fileSize = computed(() => props.file?.size || props.size || 0)

/* ---------------------------
 * Format size
 * --------------------------- */
function formatSize(bytes: number) {
  if (!bytes) return '0 KB'
  const kb = bytes / 1024
  if (kb < 1024) return `${kb.toFixed(1)} KB`
  return `${(kb / 1024).toFixed(1)} MB`
}

/* ---------------------------
 * Upload time handling
 * --------------------------- */
const uploadedTime = computed(() => {
  if (props.uploadedAt) return new Date(props.uploadedAt)
  return new Date()
})

const now = ref(Date.now())
let timer: any

onMounted(() => {
  timer = setInterval(() => {
    now.value = Date.now()
  }, 60_000) // update tiap menit
})

onUnmounted(() => clearInterval(timer))

const uploadedLabel = computed(() => {
  const diff = Math.floor((now.value - uploadedTime.value.getTime()) / 1000)

  if (diff < 30) return 'Uploaded just now'
  if (diff < 60) return 'Uploaded a minute ago'
  if (diff < 3600) return `Uploaded ${Math.floor(diff / 60)} minutes ago`
  if (diff < 86400) return `Uploaded ${Math.floor(diff / 3600)} hours ago`
  return `Uploaded ${Math.floor(diff / 86400)} days ago`
})
</script>

<template>
  <div
    class="flex items-center justify-between bg-white border border-neutral-30 p-4 rounded-[6px]"
    :class="props.class"
  >
    <div class="flex items-start gap-3">
      <IconDocImg />

      <div class="flex flex-col gap-1">
        <div class="text-neutral-100">
          {{ fileName }}
        </div>

        <div class="text-neutral-60 flex items-center gap-1 text-sm">
          <span>{{ formatSize(fileSize) }}</span>
          <span>•</span>
          <span>{{ uploadedLabel }}</span>
        </div>
      </div>
    </div>

    <div class="flex items-center gap-2">
      <!-- <button type="button" @click="emit('edit')">
        <IconEdit />
      </button> -->
      <button type="button" @click="emit('remove')">
        <IconTrash />
      </button>
    </div>
  </div>
</template>
