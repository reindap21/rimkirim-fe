<script setup lang="ts">
import type { Component } from 'vue'

type Props = {
  visible: boolean
  width?: string
  icon?: Component
  title: string
  description: string
  cancelText?: string
  okText?: string
}

const props = withDefaults(defineProps<Props>(), {
  width: '450px',
  icon: undefined,
  cancelText: 'Cancel',
  okText: 'OK',
})

const emit = defineEmits<{
  (e: 'update:visible', value: boolean): void
  (e: 'cancel' | 'ok'): void
}>()

const onCancel = () => {
  emit('update:visible', false)
  emit('cancel')
}

const onOk = () => {
  emit('ok')
  emit('update:visible', false)
}
</script>

<template>
  <Dialog
:visible="props.visible" :show-header="false" :closable="false" modal :style="{ width: props.width }"
    @update:visible="val => emit('update:visible', val)">
    <div class="flex flex-col gap-6 mt-8 mb-2">

      <div class="flex flex-col gap-4">
        <!-- Icon -->
        <component :is="props.icon" v-if="props.icon" class="mx-auto text-[#C1FF00]" />

        <!-- Title -->
        <h3 class="text-[24px] leading-[32px] font-semibold text-neutral-100 text-center">
          {{ props.title }}
        </h3>

        <!-- Description -->
        <p class="text-neutral-60 text-center px-2">
          {{ props.description }}
        </p>
      </div>

      <!-- Actions -->
      <div class="flex items-center gap-2">
        <OutlinedButton class="flex-1" @click="onCancel">{{ cancelText }}</OutlinedButton>
        <PrimaryButton class="flex-1" @click="onOk">{{ okText }}</PrimaryButton>
      </div>
    </div>
  </Dialog>
</template>
