<script setup lang="ts">
import InputText from 'primevue/inputtext'
import { computed } from 'vue'
import type { Component } from 'vue'

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

type IconPosition = 'left' | 'right'


// * ------- Defines -----------------------------------------------------------------------------------------------------------------------------------------------

const props = withDefaults(defineProps<{
  modelValue?: string
  placeholder?: string
  icon?: Component | null
  iconPosition?: IconPosition
  boxed?: boolean        // 👉 icon with background
  error?: string
}>(), {
  modelValue: '',
  placeholder: '',
  icon: null,
  error: '',
  iconPosition: 'left',
  boxed: false
})

const emit = defineEmits<{
  (e: 'update:modelValue', value: string): void
}>()

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Wrapper (always boxed)
 */
const wrapperClass = computed(() => [
  'flex items-center gap-2',
  'h-[46px]',
  'rounded-[6px]',
  'border',
  props.error ? 'border-red-500' : 'border-gray-300',
  'bg-white',
  'transition',
  'focus-within:border-[#C1FF00]'
].join(' '))

/**
 * Icon styles
 */
const iconClass = computed(() =>
  props.boxed
    ? 'flex items-center justify-center w-8 h-8 rounded-md bg-[#F5F5F5] text-neutral-100'
    : 'text-neutral-60'
)
</script>

<template>
  <div class="space-y-1">
    <!-- INPUT WRAPPER -->
    <div :class="wrapperClass">
      <!-- ICON LEFT -->
      <component :is="icon" v-if="icon && iconPosition === 'left'" :class="['ml-3 shrink-0', iconClass]" />

      <!-- INPUT -->
      <InputText
        :placeholder="placeholder" :value="modelValue"
        @input="emit('update:modelValue', ($event.target as HTMLInputElement).value)" />

      <!-- ICON RIGHT -->
      <component :is="icon" v-if="icon && iconPosition === 'right'" :class="['mr-3 shrink-0', iconClass]" />
    </div>

    <!-- ERROR MESSAGE -->
    <p v-if="error" class="text-xs text-red-500">
      {{ error }}
    </p>
  </div>
</template>