<script setup lang="ts">
<<<<<<< HEAD
  // * ------- Types

  interface Props {
    loading?: boolean;
    disabled?: boolean;
    active?: boolean;
    primaryWhenHover?: boolean;
    type?: "button" | "submit" | "reset";
    rounded?: string; // rounded-[8px]
    fontWeight?: string; // font-medium
  }

  // * ------- Defines

  const props = withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
    active: false,
    primaryWhenHover: false,
    type: "button",
    rounded: "rounded-lg", // lg -> 8px
    fontWeight: "font-medium",
  });
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'h-[46px] text-[14px] leading-[22px] text-neutral-100 transition border',
      active ? 'bg-primary border-transparent' : 'border-[#1E1E1E]',
      'flex items-center justify-center gap-2',
      primaryWhenHover ? 'hover:bg-[#C1FF00] hover:border-transparent' : 'hover:opacity-70',
      'disabled:!text-neutral-70 disabled:cursor-not-allowed',
      rounded,
      loading ? '' : '',
      fontWeight,
    ]"
  >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>
=======

// * ------- Types

interface Props {
  loading?: boolean
  disabled?: boolean
  active?: boolean
  primaryWhenHover?: boolean
  type?: 'button' | 'submit' | 'reset'
  rounded?: string // rounded-[8px] 
  fontWeight?: string  // font-medium
}

// * ------- Defines

const props = withDefaults(defineProps<Props>(), {
  loading: false,
  disabled: false,
  active: false,
  primaryWhenHover: false,
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
      'h-[46px] text-[14px] leading-[22px] text-[#1E1E1E] transition border',
      active ? 'bg-[#C1FF00] border-transparent' : 'border-[#1E1E1E]', 
      'flex items-center justify-center gap-2',
      primaryWhenHover ? 'hover:bg-[#C1FF00] hover:border-transparent' : 'hover:opacity-70',
      'disabled:text-[#757575] disabled:cursor-not-allowed',
      rounded,
      loading ? '' : '',
      fontWeight
    ]"
    >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>
>>>>>>> Refactor page structure; Page customer infor and item & packages
