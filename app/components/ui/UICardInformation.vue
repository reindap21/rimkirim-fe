<script setup lang="ts">
  import { computed, type Component } from "vue";
  import IconFaceRelieved from "@/components/icons/IconFaceRelieved.vue";
  import IconFaceSmile from "@/components/icons/IconFaceSmile.vue";
  import IconFaceStar from "@/components/icons/IconFaceStar.vue";
  import IconFaceDead from "../icons/IconFaceDead.vue";

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  type OrderHubStatus = "awaiting_input" | "in_progress" | "completed" | "locked";

  interface OrderHubInformationProps {
    status: OrderHubStatus | undefined;
    totalProgress: number;
    currentProgress: number;
    title: string | string[];
    icon: Component;
    description: string;
    action?: Component;
    error?: string;
  }

  // * ------- Defines -----------------------------------------------------------------------------------------------------------------------------------------------

  const props = defineProps<OrderHubInformationProps>();
  const emit = defineEmits(["action"]);

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  /* ---------- Status Mapping ---------- */
  const statusConfig = {
    awaiting_input: {
      label: "AWAITING INPUT",
      bg: "bg-[#FFE0C2]",
      text: "text-[#FF9E42]",
      progress: "text-[#FEBC18]",
    },
    in_progress: {
      label: "IN PROGRESS",
      bg: "bg-[#C2E5FF]",
      text: "text-[#3DADFF]",
      progress: "text-[#3DADFF]",
    },
    completed: {
      label: "COMPLETED",
      bg: "bg-[#CDF4D3]",
      text: "text-[#27C827]",
      progress: "text-[#27C827]",
    },
    locked: {
      label: "LOCKED",
      bg: "bg-neutral-40",
      text: "!text-neutral-70",
      progress: "!text-neutral-70",
    },
  } as const;

  const statusClass = computed(() => statusConfig[props?.status || "locked"]);
  const statusLabel = computed(() => {
    if (!props?.status) return "...";
    return statusConfig[props?.status]?.label || "...";
  });

  /* ---------- Icons ---------- */

  const statusIcon = computed(() => {
    switch (props?.status) {
      case "awaiting_input":
        return IconFaceSmile;
      case "in_progress":
        return IconFaceRelieved;
      case "completed":
        return IconFaceStar;
      default:
        return IconFaceDead; // 'locked'
    }
  });

  /* ---------- Title Handling ---------- */
  const titleLines = computed(() =>
    Array.isArray(props?.title) ? props?.title : props?.title?.split("\n"),
  );
</script>

<template>
  <div
    class="rounded-[16px] px-6 py-4 border border-[#EDEDED] flex flex-col justify-between gap-8"
    :class="status === 'locked' ? 'bg-[#EDEDED]' : 'bg-white'"
  >
    <div class="h-full flex flex-col gap-4">
      <!-- Header -->
      <div class="flex items-center justify-between">
        <!-- Status Badge -->
        <span
          :class="[
            'inline-flex items-center gap-1 px-2 py-1 rounded-full min-w-[120px] text-[14px] leading-[22px] font-[400]',
            statusClass?.bg,
            statusClass?.text,
          ]"
        >
          <component :is="statusIcon" />
          {{ statusLabel }}
        </span>

        <!-- Progress -->
        <span :class="['text-[14px] leading-[22px] font-medium', statusClass?.progress]">
          {{ currentProgress }}/{{ totalProgress }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-2">
        <component :is="icon" />

        <h3
          class="flex flex-col gap-[2px] font-medium text-[18px] leading-[26px]"
          :class="status === 'locked' ? '!text-neutral-70' : 'text-neutral-100'"
        >
          <span v-for="(line, index) in titleLines" :key="index">
            {{ line }}
          </span>
        </h3>

        <p class="text-[14px] leading-[22px] text-neutral-60">
          {{ description }}
        </p>

        <!-- TODO: IF HAS ERROR/WARNING -->
      </div>

      <!-- Action Button -->
      <div class="flex items-center justify-end h-[38px] mt-auto">
        <button
          class="text-[14px] leading-[22px] font-medium text-neutral-100 flex items-center gap-1 hover:opacity-80"
          v-if="status !== 'locked'"
          @click="emit('action')"
        >
          {{ status === "awaiting_input" ? "Start" : "Edit" }} →
        </button>
        <button
          class="text-[14px] leading-[22px] font-medium !text-neutral-70 flex items-center gap-1 hover:opacity-80"
          v-else
        >
          Wait for another form 1/3
        </button>
      </div>
    </div>
  </div>
</template>
