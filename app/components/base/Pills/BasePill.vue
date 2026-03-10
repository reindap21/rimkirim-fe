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

<script setup lang="ts">

interface BasePillProps {
  /** Padding Tailwind (default: px-5 py-2) */
  padding?: string
  /** Margin Tailwind (optional) */
  margin?: string
  /** Background color Tailwind */
  bg?: string
  /** Text color Tailwind */
  color?: string
  /** Additional custom class */
  additionalClass?: string
}

withDefaults(defineProps<BasePillProps>(), {
  padding: 'px-5 py-2',
  margin: '',
  bg: 'bg-neutral-10',
  color: 'text-[#616161]/80',
  additionalClass: '',
})

</script>
