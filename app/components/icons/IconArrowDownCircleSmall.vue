<script setup lang="ts">
interface Props {
  width?: number | string;
  height?: number | string;
}

withDefaults(defineProps<Props>(), {
  width: 18,
  height: 18,
});

</script>

<template>
  <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M16.5 9C16.5 13.1421 13.1421 16.5 9 16.5C4.85786 16.5 1.5 13.1421 1.5 9C1.5 4.85786 4.85786 1.5 9 1.5C13.1421 1.5 16.5 4.85786 16.5 9Z"
      stroke="#1E1E1E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
    <path
d="M6 9.375C6 9.375 8.2095 12.375 9 12.375C9.79058 12.375 12 9.375 12 9.375M9 12V5.625" stroke="#1E1E1E"
      stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
  </svg>
</template>