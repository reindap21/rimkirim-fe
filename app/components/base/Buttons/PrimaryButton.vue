<script setup lang="ts">
  // * ------- Types

  interface Props {
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    rounded?: string; // rounded-[8px]
    fontWeight?: string; // font-medium
  }

  // * ------- Defines

  withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
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
      'h-[46px] text-body-sm text-neutral-100 transition',
      'flex items-center justify-center gap-2',
      'hover:bg-primary-hover',
      'disabled:bg-neutral-40 disabled:!text-neutral-70 disabled:cursor-not-allowed',
      rounded,
      loading ? 'bg-primary-hover' : 'bg-primary',
      fontWeight,
    ]"
  >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>
