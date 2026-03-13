<script setup lang="ts">

import { ref } from "vue";

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

interface Props {
  width?: number | string;
}

// * ------- Defines -----------------------------------------------------------------------------------------------------------------------------------------------

const props = withDefaults(defineProps<Props>(), {
  width: 350,
});

// * ------- Variables

const op = ref();

// * ------- Handlers

const toggle = (event?: MouseEvent) => {
  event?.preventDefault?.();
  op.value.toggle(event);
}
</script>

<template>
  <button type="button" @click="toggle">
    <IconQuestionMarkCircle />
  </button>
  <Popover ref="op" class="-ml-3" :style="{ width: `${props.width}px` }">
    <div class="flex flex-col gap-2 h-fit pt-3 pb-6">
      <div class="flex items-center justify-end px-3">
        <button type="button" @click="toggle">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M9 10.2776L4.52852 14.749C4.36122 14.9163 4.14829 15 3.88973 15C3.63118 15 3.41825 14.9163 3.25095 14.749C3.08365 14.5817 3 14.3688 3 14.1103C3 13.8517 3.08365 13.6388 3.25095 13.4715L7.72243 9L3.25095 4.52852C3.08365 4.36122 3 4.14829 3 3.88973C3 3.63118 3.08365 3.41825 3.25095 3.25095C3.41825 3.08365 3.63118 3 3.88973 3C4.14829 3 4.36122 3.08365 4.52852 3.25095L9 7.72243L13.4715 3.25095C13.6388 3.08365 13.8517 3 14.1103 3C14.3688 3 14.5817 3.08365 14.749 3.25095C14.9163 3.41825 15 3.63118 15 3.88973C15 4.14829 14.9163 4.36122 14.749 4.52852L10.2776 9L14.749 13.4715C14.9163 13.6388 15 13.8517 15 14.1103C15 14.3688 14.9163 14.5817 14.749 14.749C14.5817 14.9163 14.3688 15 14.1103 15C13.8517 15 13.6388 14.9163 13.4715 14.749L9 10.2776Z"
              fill="#9E9E9E" />
          </svg>
        </button>
      </div>
      <div class="flex flex-col px-6 gap-3 text-white">
        <slot />
      </div>
    </div>
  </Popover>
</template>