<script setup lang="ts">

import { ref } from 'vue';
import IconOrderHubCustomer from '~/components/icons/IconOrderHubCustomer.vue';
import IconOrderHubItemAndPackages from '~/components/icons/IconOrderHubItemAndPackages.vue';
import IconOrderHubPickup from '~/components/icons/IconOrderHubPickup.vue';

definePageMeta({
  layout: 'order',
  // middleware: 'auth'
})

const router = useRouter();
const route = useRoute();

// string | string[] | undefined
const bookingCode = computed(() => {
  const code = route.query.code
  return Array.isArray(code) ? code[0] : code
})

console.log(bookingCode);

</script>


<template>
  <section class="flex flex-col gap-6 max-w-7xl mx-auto px-6 pt-32 pb-24">
    <!-- Header -->
    <div class="flex flex-col items-center justify-center gap-2 mb-8">
      <BasePill bg="bg-[#F6F6FA]">
        <span class="text-[400]">
          Booking Number
        </span>
        <span class="font-bold text-[#1E1E1E]">BL02-004-2025</span>
      </BasePill>
      <h1 class="text-[32px] leading-[130%] font-semibold text-[#1E1E1E] text-center">INTERNATIONAL MOVING ORDER</h1>
      <p class="text-[14px] leading-[22px] font-[400] text-[#757575] uppercase">YOU MAY CHOOSE ANY FORM YOU WANT TO FILL
        FIRST</p>
    </div>

    <div class="flex flex-col gap-3">
      <!-- Cards -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <!-- CUSTOMER INFORMATION -->
        <UICardInformation status="completed" :totalProgress="14" :currentProgress="14" :title="['CUSTOMER', 'INFORMATION']"
          :icon="IconOrderHubCustomer" description="Personal details, contact info, and addresses." />

        <!-- ITEM & PACKAGES -->
        <UICardInformation status="awaiting-input" :totalProgress="5" :currentProgress="0" :title="['ITEM &', 'PACKAGES']"
          :icon="IconOrderHubItemAndPackages" description="Details of items, weights and packaging types." />

        <!-- COMPLIANCE DOCUMENT -->
        <UICardInformation status="in-progress" :totalProgress="4" :currentProgress="3" :title="['COMPLIANCE', 'DOCUMENT']"
          :icon="IconOrderHubCustomer" description="Submit document needed for your international move." />

        <!-- PICKUP DETAIL & SCHEDULE: LOCKED -->
        <UICardInformation status="locked" :totalProgress="3" :currentProgress="1" :title="['PICKUP DETAIL &', 'SCHEDULE']"
          :icon="IconOrderHubPickup" description="Select your preferred date & time for pickup." />
      </div>

      <div>
        <p class="text-[14px] leading-[22px] text-[#404040] font-[400]">
          Packing List Code: <span class="font-bold">-</span>
        </p>
      </div>
    </div>

    <!-- Footer Actions -->
    <div class="flex items-center justify-center md:flex-row gap-4 w-full">
      <div class="flex gap-4">
        <button
          class="h-[46px] w-[244px] flex justify-center items-center gap-2 rounded-lg border border-[#1E1E1E] text-[14px] leading-[22px] font-medium hover:bg-gray-50">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M15.75 10.5C16.1642 10.5 16.5 10.8358 16.5 11.25V14.25C16.5 14.8467 16.2628 15.4189 15.8408 15.8408C15.4189 16.2628 14.8467 16.5 14.25 16.5H3.75C3.15326 16.5 2.58114 16.2628 2.15918 15.8408C1.73722 15.4189 1.5 14.8467 1.5 14.25V11.25C1.5 10.8358 1.83579 10.5 2.25 10.5C2.66421 10.5 3 10.8358 3 11.25V14.25C3 14.4489 3.07907 14.6396 3.21973 14.7803C3.36038 14.9209 3.55109 15 3.75 15H14.25C14.4489 15 14.6396 14.9209 14.7803 14.7803C14.9209 14.6396 15 14.4489 15 14.25V11.25C15 10.8358 15.3358 10.5 15.75 10.5Z"
              fill="#1E1E1E" />
            <path
              d="M9 1.5C9.41421 1.5 9.75 1.83579 9.75 2.25V9.43945L12.2197 6.96973C12.5126 6.67683 12.9874 6.67683 13.2803 6.96973C13.5732 7.26262 13.5732 7.73738 13.2803 8.03027L9.53027 11.7803C9.49442 11.8161 9.45484 11.8482 9.41235 11.8762C9.38405 11.8949 9.35451 11.9109 9.32446 11.9253C9.29055 11.9416 9.25551 11.9559 9.21899 11.967C9.20377 11.9717 9.18829 11.9751 9.17285 11.9788C9.16433 11.9808 9.15585 11.9829 9.14722 11.9846C9.13945 11.9862 9.13158 11.987 9.12378 11.9883C9.08343 11.995 9.04225 12 9 12C8.9575 12 8.91606 11.9951 8.87549 11.9883C8.86769 11.987 8.85982 11.9862 8.85205 11.9846C8.84342 11.9829 8.83493 11.9808 8.82642 11.9788C8.81099 11.9751 8.79549 11.9717 8.78027 11.967C8.74378 11.9559 8.70869 11.9416 8.6748 11.9253C8.64496 11.9109 8.61576 11.8948 8.58765 11.8762C8.54516 11.8482 8.50558 11.8161 8.46973 11.7803L4.71973 8.03027C4.42683 7.73738 4.42683 7.26262 4.71973 6.96973C5.01262 6.67683 5.48738 6.67683 5.78027 6.96973L8.25 9.43945V2.25C8.25 1.83579 8.58579 1.5 9 1.5Z"
              fill="#1E1E1E" />
          </svg>

          Download Packing List
        </button>
        <PrimaryButton class="w-[165px]">
          Book My Order
        </PrimaryButton>
      </div>
    </div>
  </section>
</template>
