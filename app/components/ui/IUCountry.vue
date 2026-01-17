<script setup lang="ts">

interface Props { flag: string; label: string }

const props = withDefaults(defineProps<Props>(), {
  flag: "",
  label: "",
});

console.log('flag', props.flag)
console.log('label', props.label)

</script>

<template>
  <div class="text-center w-[105px]">
    <div class="text-4xl">{{ props?.flag }}</div>
    <div class="text-sm text-gray-500">{{ props?.label }}</div>
  </div>
</template>
