<script setup lang="ts">
interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 16,
  height: 16,
  fill: "#309786",
});
</script>

<template>
  <svg :width="props.width" :height="props.height" viewBox="0 0 16 16" :fill="props.fill"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.73341 5.64573C3.73341 4.50201 4.18294 3.40513 4.98309 2.59639C5.78325 1.78766 6.86849 1.33331 8.00008 1.33331C9.13167 1.33331 10.2169 1.78766 11.0171 2.59639C11.8172 3.40513 12.2667 4.50201 12.2667 5.64573V8.17766L13.3334 9.79482V12.1144H2.66675V9.79482L3.73341 8.17766V5.64573ZM7.46675 4.56763V7.80194H8.53341V4.56763H7.46675ZM8.53555 8.61052H7.46675V9.69078H8.53555V8.61052ZM6.21075 12.6534C6.32597 13.0426 6.5623 13.3838 6.88466 13.6264C7.20701 13.869 7.59819 14 8.00008 14C8.40198 14 8.79315 13.869 9.1155 13.6264C9.43786 13.3838 9.6742 13.0426 9.78941 12.6534H6.21075Z"
      fill="#currentColor" />
  </svg>
</template>