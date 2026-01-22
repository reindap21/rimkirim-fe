<script setup lang="ts">
import { computed, type Component } from 'vue'

type OrderHubStatus = 'awaiting-input' | 'in-progress' | 'completed' | 'locked'

interface OrderHubInformationProps {
  status: OrderHubStatus
  totalProgress: number
  currentProgress: number
  title: string | string[]
  icon: Component
  description: string
  action?: Component
  error?: string;
}

const props = defineProps<OrderHubInformationProps>()

/* ---------- Status Mapping ---------- */
const statusConfig = {
  'awaiting-input': {
    label: 'AWAITING INPUT',
    bg: 'bg-[#FFE0C2]',
    text: 'text-[#FF9E42]',
    progress: 'text-[#FEBC18]'
  },
  'in-progress': {
    label: 'IN PROGRESS',
    bg: 'bg-[#C2E5FF]',
    text: 'text-[#3DADFF]',
    progress: 'text-[#3DADFF]'
  },
  completed: {
    label: 'COMPLETED',
    bg: 'bg-[#CDF4D3]',
    text: 'text-[#27C827]',
    progress: 'text-[#27C827]'
  },
  locked: {
    label: 'LOCKED',
    bg: 'bg-[#E0E0E0]',
    text: 'text-[#757575]',
    progress: 'text-[#757575]'
  }
} as const

const statusClass = computed(() => statusConfig[props.status])
const statusLabel = computed(() => statusConfig[props.status].label)

/* ---------- Icons ---------- */
/* Ganti icon ini dengan icon internal Rimkirim */
import IconFaceSmile from '@/components/icons/IconFaceSmile.vue'
import IconFaceStar from '@/components/icons/IconFaceStar.vue'
import IconFaceRelieved from '@/components/icons/IconFaceRelieved.vue'
import IconFaceDead from '../icons/IconFaceDead.vue'

const statusIcon = computed(() => {
  switch (props.status) {
    case 'completed':
      return IconFaceStar
    case 'in-progress':
      return IconFaceRelieved
    case 'locked':
      return IconFaceDead
    default:
      return IconFaceSmile
  }
})

/* ---------- Title Handling ---------- */
const titleLines = computed(() =>
  Array.isArray(props.title) ? props.title : props.title.split('\n')
)
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
        <span :class="[
          'inline-flex items-center gap-1 px-2 py-1 rounded-full text-[14px] leading-[22px] font-[400]',
          statusClass.bg,
          statusClass.text
        ]">
          <component :is="statusIcon" />
          {{ statusLabel }}
        </span>

        <!-- Progress -->
        <span :class="[
          'text-[14px] leading-[22px] font-medium',
          statusClass.progress
        ]">
          {{ currentProgress }}/{{ totalProgress }}
        </span>
      </div>

      <!-- Content -->
      <div class="flex flex-col gap-2">
        <component :is="icon" />

        <h3 class="flex flex-col gap-[2px] font-medium text-[18px] leading-[26px]"
          :class="status === 'locked' ? 'text-[#757575]' : 'text-[#1E1E1E]'"
        >
          <span v-for="(line, index) in titleLines" :key="index">
            {{ line }}
          </span>
        </h3>

        <p class="text-[14px] leading-[22px] text-[#9E9E9E]">
          {{ description }}
        </p>

        <!-- TODO: IF HAS ERROR/WARNING -->
      </div>

      <!-- Action Button -->
      <div class="flex items-center justify-end h-[38px] mt-auto">
        <button class="text-[14px] leading-[22px] font-medium text-[#1E1E1E] flex items-center gap-1 hover:opacity-80" v-if="status !== 'locked'">
          {{ status === "awaiting-input" ? "Start" : "Edit" }} →
        </button>
        <button class="text-[14px] leading-[22px] font-medium text-[#757575] flex items-center gap-1 hover:opacity-80" v-else>
          Wait for another form 1/3
        </button>
      </div>
    </div>
  </div>
</template>
