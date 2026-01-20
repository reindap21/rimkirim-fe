<script setup lang="ts">
interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 20,
  height: 20,
  fill: "#9E9E9E",
});
</script>

<template>
  <svg :width="props.width" :height="props.height" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path
      d="M17.9533 9.20352C18.2066 9.55877 18.3333 9.73643 18.3333 9.99935C18.3333 10.2623 18.2066 10.4399 17.9533 10.7952C16.8149 12.3915 13.9076 15.8327 9.99996 15.8327C6.09228 15.8327 3.18504 12.3915 2.04666 10.7952C1.7933 10.4399 1.66663 10.2623 1.66663 9.99935C1.66663 9.73643 1.7933 9.55877 2.04666 9.20352C3.18504 7.60722 6.09228 4.16602 9.99996 4.16602C13.9076 4.16602 16.8149 7.60722 17.9533 9.20352Z"
      :stroke="fill" stroke-width="1.5" />
    <path
      d="M12.5 10C12.5 8.61925 11.3807 7.5 10 7.5C8.61925 7.5 7.5 8.61925 7.5 10C7.5 11.3807 8.61925 12.5 10 12.5C11.3807 12.5 12.5 11.3807 12.5 10Z"
      :stroke="fill" stroke-width="1.5" />
  </svg>
</template>