<script setup lang="ts">
  // * ------- Types

  interface Props {
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    fontWeight?: string; // font-medium
  }

  // * ------- Defines

  withDefaults(defineProps<Props>(), {
    loading: false,
    disabled: false,
    type: "button",
    fontWeight: "font-medium",
  });
</script>

<template>
  <button
    :type="type"
    :disabled="disabled"
    :class="[
      'h-[46px] text-[14px] leading-[22px] text-neutral-100',
      'flex items-center justify-center gap-2 rounded-lg',
      // 'hover:bg-[#A1D400]',
      'disabled:!text-neutral-70 disabled:cursor-not-allowed',
      loading ? '' : '',
      fontWeight,
    ]"
  >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>
