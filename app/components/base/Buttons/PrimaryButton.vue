<script setup lang="ts">
<<<<<<< HEAD
  // * ------- Types

  interface Props {
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    rounded?: string; // rounded-[8px]
    fontWeight?: string; // font-medium
  }

  // * ------- Defines

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
    type: "button",
    rounded: "rounded-lg", // lg -> 8px
    fontWeight: "font-medium",
  });
=======

// * ------- Types

interface Props {
  loading?: boolean
  disabled?: boolean
  type?: 'button' | 'submit' | 'reset'
  rounded?: string // rounded-[8px] 
  fontWeight?: string  // font-medium
}

// * ------- Defines

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  type: 'button',
  rounded: 'rounded-lg', // lg -> 8px
  fontWeight: 'font-medium'
})
>>>>>>> Refactor page structure; Page customer infor and item & packages
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'h-[46px] text-[14px] leading-[22px] text-neutral-100 transition',
      'flex items-center justify-center gap-2',
      'hover:bg-[#A1D400]',
      'disabled:bg-neutral-40 disabled:!text-neutral-70 disabled:cursor-not-allowed',
      rounded,
      loading ? 'bg-[#A1D400]' : 'bg-primary',
      fontWeight,
    ]"
  >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>
