<script setup lang="ts">

import { computed, ref } from 'vue'

const props = withDefaults(defineProps<{
  price: number
  currency?: string
  unit?: string
  minWeight?: number
  badge?: string
  provider: {
    url: string,
    alt: string
  }
  originCountry: string
  originFlag: string
  destinationCountry: string
  destinationFlag: string
  eta?: {
    days_from: string,
    days_to: string
  },
  isDirect?: boolean
  terms?: string[]
  collapsible?: boolean
  loading?: boolean
}>(), {
  currency: 'IDR',
  unit: 'Kg',
  isDirect: true,
  collapsible: true,
  terms: () => [],
})

const emit = defineEmits(['action'])

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const expanded = ref(false)
const etaDays = `${props?.eta?.days_from} - ${props?.eta?.days_to}D`;

// * ------- Computed

const formattedPrice = computed(() =>
  props.price.toLocaleString('id-ID')
)

// * ------- Methods ------------------------------------------------------------------------------------------------------------------------------------------------


</script>


<template>
  <div class="px-6 py-4 rounded-2xl border-[2px] border-[#EDEDED]">
    <!-- TOP -->
    <div class="relative grid grid-cols-[1.3fr_auto_1fr] items-center gap-3">
      <!-- LEFT -->
      <div>
        <div class="flex items-center gap-3 mb-2">
          <span v-if="badge" class="px-3 py-1 text-[12px] leading-5 rounded-full bg-[#D6EAE74D] text-[#309786]">
            {{ badge }}
          </span>
          <img class="h-[28px] w-auto" :src="props?.provider?.url" :alt="props?.provider?.alt" />
        </div>

        <div class="text-[32px] font-medium leading-[130%] text-gray-900">
          {{ currency }} {{ formattedPrice }} / {{ unit }}
        </div>

        <p v-if="minWeight" class="text-[14px] leading-[22px] text-[#9E9E9E]">
          For Minimum {{ minWeight }} {{ unit }} Shipment
        </p>
      </div>

      <!-- CENTER -->
      <div class="hidden md:flex flex-1 items-center justify-center gap-10">
        <UICountry :flag="originFlag" :label="originCountry" />

        <div class="flex flex-col items-center text-sm text-[#9E9E9E]">
          {{ etaDays }}
          <IconDividerArrow />
          {{ isDirect ? "Direct" : "Transit" }}
        </div>

        <UICountry :flag="destinationFlag" :label="destinationCountry" />
      </div>

      <!-- CTA -->
      <div class="flex justify-end">
        <PrimaryButton class="absolute top-0 right-0 w-[107px]" :loading="loading" @click="emit('action')">Move Now</PrimaryButton>
      </div>
    </div>

    <!-- BOTTOM -->
    <div class="relative mt-6 border-t border-gray-200 pt-4 text-[14px] text-[#9E9E9E] transition-all duration-300 ease-out">
      <template v-if="expanded">
        <ul class="flex flex-col gap-2">
          <li v-for="(term, i) in terms" :key="i" class="flex items-start gap-2">
            <div class="mt-1">
              <IconInfoRate />
            </div>
            <span v-html="term" />
          </li>
        </ul>
      </template>

      <template v-else>
        <span>*Terms and conditions applied</span>
      </template>

      <div class="flex items-center">
        <button v-if="collapsible" class="absolute right-0 bottom-0 flex items-center gap-1 font-medium text-[#1E1E1E] focus-visible:rounded-md focus-visible:ring-offset-[6px]"
          @click="expanded = !expanded">
          {{ expanded ? 'Hide' : 'More Information' }}
          <IconChevronUp v-if="expanded" />
          <IconChevronDown v-else />
        </button>
      </div>
    </div>
  </div>
</template>