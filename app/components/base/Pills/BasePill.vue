<template>
  <span
    :class="[
      'inline-block rounded-full text-[14px] leading-[22px] font-medium',
      padding,
      margin,
      bg,
      color,
      additionalClass
    ]"
  >
    <slot />
  </span>
</template>

<script setup>

defineProps({
  /** Padding Tailwind (default: px-4 py-1.5) */
  padding: {
    type: String,
    default: 'px-5 py-2'
  },

  /** Margin Tailwind (optional) */
  margin: {
    type: String,
    default: ''
  },

  /** Background color Tailwind */
  bg: {
    type: String,
    default: 'bg-neutral-10'
  },

  /** Text color Tailwind */
  color: {
    type: String,
    default: 'text-[#616161]/80'
  },

  /** Additional custom class */
  additionalClass: {
    type: String,
    default: ''
  }
})

</script>
