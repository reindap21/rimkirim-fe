<script setup lang="ts">
  interface Props {
    loading?: boolean;
    disabled?: boolean;
    type?: "button" | "submit" | "reset";
    rounded?: string; // rounded-[8px]
    fontWeight?: string; // font-medium
  }

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
      'h-[46px] text-body-sm text-white transition',
      'flex items-center justify-center gap-2',
      'hover:bg-black',
      'disabled:bg-neutral-40 disabled:!text-neutral-70 disabled:cursor-not-allowed',
      rounded,
      loading ? 'bg-black' : 'bg-neutral-100',
      fontWeight,
    ]"
  >
    <slot v-if="!loading" />
    <IconSpinner v-else />
  </button>
</template>
