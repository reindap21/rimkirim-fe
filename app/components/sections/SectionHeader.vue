<script setup lang="ts">
  type PillType = "base" | "gray" | "white";

  interface SectionHeaderProps {
    title: string;
    subtitle?: string;
    pillLabel?: string;
    pillType?: PillType;
    class?: string;
  }

  const props = withDefaults(defineProps<SectionHeaderProps>(), {
    subtitle: "",
    pillLabel: "",
    pillType: "base",
    class: "",
  });

  const pillStyleMap: Record<
    PillType,
    {
      bg?: string;
      color?: string;
      class?: string;
    }
  > = {
    base: {},
    gray: {
      bg: "bg-neutral-10",
      color: "text-neutral-100",
    },
    white: {
      bg: "bg-white",
      color: "text-neutral-100",
      class: "border border-[#F5F5F5]",
    },
  };

  const pillStyle = pillStyleMap[props.pillType];
</script>

<template>
  <div class="flex flex-col items-center justify-center gap-2" :class="props.class">
    <BasePill
      v-if="pillLabel"
      :bg="pillStyle?.bg"
      :color="pillStyle?.color"
      :additional-class="pillStyle.class"
    >
      {{ pillLabel }}
    </BasePill>
    <div class="flex flex-col items-center gap-2">
      <h2 class="text-[40px] leading-[48px] font-bold tracking-[-0.5%] text-neutral-100">
        {{ title }}
      </h2>
      <p v-if="subtitle" class="text-[14px] leading-[22px] font-[400] !text-neutral-70">
        {{ subtitle }}
      </p>
    </div>
  </div>
</template>

