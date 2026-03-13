<script setup lang="ts">
interface Props {
  width?: number | string;
  height?: number | string;
  fill?: string;
}

const props = withDefaults(defineProps<Props>(), {
  width: 18,
  height: 18,
  fill: "1E1E1E",
});

</script>

<template>
  <svg
:width="props.width" :height="props.height" viewBox="0 0 18 18" :fill="props.fill"
    xmlns="http://www.w3.org/2000/svg">
    <path
      d="M3.21959 11.7803C3.36024 11.9209 3.55097 11.9999 3.74984 11.9999C3.94871 11.9999 4.13944 11.9209 4.28009 11.7803L8.99984 7.06052L13.7196 11.7803C13.861 11.9169 14.0505 11.9925 14.2471 11.9908C14.4438 11.9891 14.6319 11.9102 14.771 11.7711C14.91 11.6321 14.9889 11.444 14.9906 11.2473C14.9923 11.0507 14.9167 10.8612 14.7801 10.7198L9.53009 5.46977C9.38944 5.32917 9.19871 5.25018 8.99984 5.25018C8.80097 5.25018 8.61024 5.32917 8.46959 5.46977L3.21959 10.7198C3.07899 10.8604 3 11.0511 3 11.25C3 11.4489 3.07899 11.6396 3.21959 11.7803Z"
      fill="currentColor" />
  </svg>
</template>
