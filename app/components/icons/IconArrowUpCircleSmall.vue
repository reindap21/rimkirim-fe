<script setup lang="ts">
interface Props {
  width?: number | string;
  height?: number | string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 18,
  height: 18,
});

</script>

<template>
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z"
      stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path d="M12 8.625C12 8.625 9.7905 5.62501 9 5.625C8.20942 5.62499 6 8.625 6 8.625M9 6V12.375" stroke="#1E1E1E"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>

</template>