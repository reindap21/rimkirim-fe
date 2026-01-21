<script setup lang="ts">
interface Props {
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  rounded?: string // rounded-[8px] 
  fontWeight?: string  // font-medium
}

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  type: 'button',
  rounded: 'rounded-lg', // lg -> 8px
  fontWeight: 'font-medium'
})
</script>

<template>
  <button 
    :type="type" 
    :disabled="disabled" 
    :class="[
      'h-[46px] text-[14px] leading-[22px] text-[#1E1E1E] transition',
      'flex items-center justify-center gap-2',
      'hover:bg-[#A1D400]',
      'disabled:bg-[#E0E0E0] disabled:text-[#757575] disabled:cursor-not-allowed',
      rounded,
      loading ? 'bg-[#A1D400]' : 'bg-[#C1FF00]',
      fontWeight
    ]"
    >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>