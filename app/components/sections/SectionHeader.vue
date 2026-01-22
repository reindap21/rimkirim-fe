<script setup lang="ts">

type PillType = 'base' | 'gray' | 'white'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  pillLabel?: string
  pillType?: PillType
  class?: string;
}

const props = withDefaults(defineProps<SectionHeaderProps>(), {
  pillType: 'base',
  class: ''
})

const pillStyleMap: Record<PillType, {
  bg?: string
  color?: string
  class?: string
}> = {
  base: {},
  gray: {
    bg: 'bg-[#FAFAFC]',
    color: 'text-[#1E1E1E]'
  },
  white: {
    bg: 'bg-white',
    color: 'text-[#1E1E1E]',
    class: 'border border-[#F5F5F5]'
  }
}

const pillStyle = pillStyleMap[props.pillType]
</script>


<template>
  <div class="flex flex-col items-center justify-center gap-2" :class="class">
    <BasePill v-if="pillLabel" :bg="pillStyle?.bg" :color="pillStyle?.color" :additionalClass="pillStyle.class">
      {{ pillLabel }}
    </BasePill>
    <div class="flex flex-col items-center gap-2">
      <h2 class="text-[40px] leading-[48px] font-bold tracking-[-0.5%] text-[#1E1E1E]">
        {{ title }}
      </h2>
      <p class="text-[14px] leading-[22px] font-[400] text-[#757575]" v-if="subtitle">{{ subtitle }}</p>
    </div>
  </div>
</template>ƒ