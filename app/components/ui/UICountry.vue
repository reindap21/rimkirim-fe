<script setup lang="ts">

interface Props { flag?: string; label?: string }

withDefaults(defineProps<Props>(), {
  flag: "",
  label: "",
});

</script>

<template>
  <div class="flex flex-col justify-center items-center gap-1 w-[105px]">
    <div class="border border-[#F5F5F5] rounded-[4px]"><img :src="flag" class="w-[60px] h-[40px]" :alt="label" /></div>
    <div class="text-sm text-gray-500">{{ label }}</div>
  </div>
</template>
