<script setup lang="ts">

import { Form } from '@primevue/forms';
import IconField from "primevue/iconfield";
import InputIcon from "primevue/inputicon";
import { ref, computed } from 'vue'
import InputGroup from 'primevue/inputgroup';
import InputGroupAddon from 'primevue/inputgroupaddon';
import type { Rate } from '~/interfaces/rate';


// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const router = useRouter()

const originAddress = ref("")
const destinationAddress = ref("")
const shipmentType = ref("back_for_good"); // back_for_good | moving_abroad

const rates = ref<Rate[]>([]);
const ratesLoading = ref(false);
const actionMoveNowLoading = ref<string | null>(null)

const isVisibleAdvanceCalc = ref(false);
const items = ref([
  {
    id: Date.now(),
    weight: null,
    length: null,
    width: null,
    height: null,
    quantity: 1,
  }
])
const volumetricFactor = 5000; // Chargable Weight

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

/**
 * Toggle Button to show hide advance calculator
 */
const toggleCalculator = () => {
  isVisibleAdvanceCalc.value = !isVisibleAdvanceCalc.value
}

/**
 * Action add item
 */
const addItem = () => {
  items.value.push({
    id: Date.now() + Math.random(),
    weight: null,
    length: null,
    width: null,
    height: null,
    quantity: 1,
  })
}

/**
 * Action remove item
 * @param index 
 */
const removeItem = (index: number) => {
  if (items.value.length === 1) return
  items.value.splice(index, 1)
}

/**
 * Calculate the total actual weight
 */
const totalActualWeight = computed(() => {
  return items.value.reduce((total, item) => {
    const weight = Number(item.weight) || 0
    const qty = Number(item.quantity) || 1
    return total + weight * qty
  }, 0)
})

/**
 * Calculate the total volumetric weight
 */
const totalVolumetricWeight = computed(() => {
  return items.value.reduce((total, item) => {
    const l = Number(item.length) || 0
    const w = Number(item.width) || 0
    const h = Number(item.height) || 0
    const qty = Number(item.quantity) || 1

    if (!l || !w || !h) return total

    const volumetric = (l * w * h) / volumetricFactor
    return total + volumetric * qty
  }, 0)
})

const handleOriginSelect = (data: any) => {
  console.log(data)
  originAddress.value = data;
}

const handleDestinationSelect = (data: any) => {
  console.log(data)
  destinationAddress.value = data;
}

// TODO: Refactor to Utils

const formatNumber = (
  value: any,
  options = { decimals: 0, locale: 'en-US' }
) => {
  const number = Number(value)

  if (isNaN(number)) return '0'

  return new Intl.NumberFormat(options.locale, {
    minimumFractionDigits: options.decimals,
    maximumFractionDigits: options.decimals,
  }).format(number)
}


const handleGetSpecialRate = async () => {

  ratesLoading.value = true;

  console.log(originAddress.value)
  console.log(destinationAddress.value)

  const payload = {
    shipment_type: shipmentType.value,
    origin: {
      "address": "Emirates Stadium, London N7 7AJ, United Kingdom",
      "placeid": "ChIJd8BlQ2cbdkgR7aZc8fY1d_o", // kayanya ga perlu deh? iya lah
      "latitude": 51.554888,
      "longitude": -0.108438,
      "postal_code": "N7 7AJ",
      "city": "London",
      "province": "England",
      "country": "GB"
    },
    destination: {
      "address": "Jl. Menteng Raya No.5 Blok FA5, Bintaro 15220",
      "placeid": "ChIJq6qq6PjXaS4R7EwZ6yK4gkU", // kayanya ga perlu deh? iya lah
      "latitude": -6.292348,
      "longitude": 106.722233,
      "postal_code": "15220",
      "city": "South Tangerang",
      "province": "Banten",
      "country": "ID"
    }
  }

  console.log('payload', payload)

  try {
    const res = await $fetch(`/api/rates/estimate`, {
      method: "POST",
      credentials: 'include', // Required
      body: payload
    })
    rates.value = (res as any).rates; // Array of rates
    ratesLoading.value = false;
  } catch (err) {
    console.error('fetch rates error:', err);
    ratesLoading.value = false;
  }
}

const handleActionMoveNow = (rate: Rate) => {

// Set Loading
actionMoveNowLoading.value = rate.id

// Fetch API

setTimeout(() => {
  // If success
  router.push({
    path: '/eligible',
    query: {
      rateId: rate.id
    }
  })
}, 1000);
}

// * ------- Compute -----------------------------------------------------------------------------------------------------------------------------------------------

/**
 * The chargable weight
 */
const chargeableWeight = computed(() => {
  return Math.ceil(
    Math.max(totalActualWeight.value, totalVolumetricWeight.value)
  )
})


</script>

<template>

  <section class="max-w-5xl mx-auto pt-40 pb-24 px-6">

    <!-- Title -->
    <div class="flex flex-col items-center justify-center gap-2 mb-8">
      <h1 class="text-[32px] leading-[130%] font-semibold text-[#1E1E1E]">Calculate Your Shipment</h1>
      <p class="text-[14px] leading-[22px] font-[400] text-[#757575] uppercase">GET AN INSTANT ESTIMATE FOR YOUR
        INTERNATIONAL MOVE</p>
    </div>

    <!-- Body -->
    <div class="flex flex-col gap-6 rounded-2xl bg-[#FAFAFC] border border-[#EDEDED]">
      <!-- Tabs -->
      <div class="flex gap-6 p-6 bg-[#F6F6FA] border-b border-[#F6F6FA]">
        <button class="flex-1 h-[50px] rounded-lg bg-[#1E1E1E] text-white text-[18px] leading-[26px] font-medium">Back
          for Good</button>
        <button class="flex-1 h-[50px] rounded-lg bg-white text-[#1E1E1E] text-[18px] leading-[26px] font-medium">Moving
          Abroad</button>
      </div>
      <!-- Form -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end px-6">
        <div class="flex flex-col gap-2">
          <label class="text-[14px] leading-[22px] font-medium text-[##404040]">Moving from</label>
          <!-- <input type="text" placeholder="Origin Address"
            class="mt-1 w-full h-[46px] rounded-lg border border-[#E5E7EB] px-4 text-sm" /> -->
          <GoogleAddressInput v-model="originAddress" placeholder="Origin address" @select="handleOriginSelect" />
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[14px] leading-[22px] font-medium text-[##404040]">Moving to</label>
          <!-- <input type="text" placeholder="Destination Address"
            class="mt-1 w-full h-[46px] rounded-lg border border-[#E5E7EB] px-4 text-sm" />  -->
          <GoogleAddressInput v-model="destinationAddress" placeholder="Destination address"
            @select="handleDestinationSelect" />
        </div>

      </div>
      <!-- Advance -->
      <div class="flex flex-col gap-6 px-6 transition-all duration-300 ease-out" :class="isVisibleAdvanceCalc
        ? 'max-h-fit opacity-100'
        : 'max-h-0 opacity-0 -mt-6 -z-10'
        ">
        <div class="h-[1px] border-y border-[#EDEDED]" />

        <div class="flex items-center gap-2 text-[18px] leading-[26px] font-medium text-[#1E1E1E]">
          <IconPackageDetails />
          PACKAGE DETAILS
        </div>


        <div class="flex flex-col gap-3">
          <div v-for="(item, index) in items" :key="item.id"
            class="relative grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <!-- Weight -->
            <div class="flex flex-col gap-2">
              <label class="text-[14px] leading-[22px] font-medium" for="weight">Weight (KG)</label>
              <InputGroup>
                <InputNumber id="weight" v-model="item.weight" placeholder="Weight" />
                <InputGroupAddon class="bg-[#F6F6FA] text-[#757575] text-[14px] leading-[22px] font-[400]">
                  KG
                </InputGroupAddon>
              </InputGroup>
            </div>

            <!-- Dimension -->
            <div class="md:col-span-2">
              <div class="flex flex-col gap-2">
                <label class="text-[14px] leading-[22px] font-medium">Dimension (L × W × H)</label>
                <div class="flex gap-2">
                  <InputGroup>
                    <InputNumber id="L" v-model="item.length" placeholder="L" />
                    <InputGroupAddon class="bg-[#F6F6FA] text-[#757575] text-[14px] leading-[22px] font-[400]">
                      cm
                    </InputGroupAddon>
                  </InputGroup>
                  <InputGroup>
                    <InputNumber id="W" v-model="item.width" placeholder="W" />
                    <InputGroupAddon class="bg-[#F6F6FA] text-[#757575] text-[14px] leading-[22px] font-[400]">
                      cm
                    </InputGroupAddon>
                  </InputGroup>
                  <InputGroup>
                    <InputNumber id="H" v-model="item.height" placeholder="H" />
                    <InputGroupAddon class="bg-[#F6F6FA] text-[#757575] text-[14px] leading-[22px] font-[400]">
                      cm
                    </InputGroupAddon>
                  </InputGroup>
                </div>
              </div>
            </div>

            <!-- Quantity -->
            <div class="flex flex-col gap-2">
              <label class="text-[14px] leading-[22px] font-medium" for="quantity">Quantity</label>
              <InputGroup>
                <InputNumber id="quantity" v-model="item.quantity" placeholder="Qty" />
                <InputGroupAddon class="bg-[#F6F6FA] text-[#757575] text-[14px] leading-[22px] font-[400]">
                  pcs
                </InputGroupAddon>
              </InputGroup>

              <!-- Remove Item -->
              <button v-if="items.length > 1" @click="removeItem(index)" class="absolute bottom-3 -right-5">
                <IconTrash height="18" width="18" />
              </button>
            </div>
          </div>

          <!-- Add Item -->
          <button class="flex items-center gap-2 text-sm font-medium text-[#1E1E1E] w-fit" @click="addItem">
            <IconPlusCircle />
            Add Item
          </button>
        </div>


        <!-- Chargeable Weight -->
        <div class="flex items-center justify-between bg-[#F6F6FA] p-4 border-b border-[#F6F6FA]">
          <div class="flex gap-3">
            <div class="flex justify-center items-center w-[44px] h-[44px] bg-white rounded-[8px]">
              <IconChargeableWeight />
            </div>

            <div class="flex flex-col gap-1">
              <p class="flex items-center gap-1 text-[14px] leading-[22px] font-medium text-[#1E1E1E]">
                Chargeable Weight for this Package
                <IconQuestionMarkCircle />
              </p>
              <p class="text-[14px] leading-[22px] text-[#9E9E9E]">
                Calculated as the greater of Actual Weight <span class="text-[#1E1E1E]">({{
                  formatNumber(Number(totalActualWeight)) }} Kg)</span> or
                Volumetric Weight <span class="text-[#1E1E1E]">({{ formatNumber(Number(totalVolumetricWeight)) }}
                  Kg)</span>
              </p>
            </div>
          </div>
          <div
            class="flex items-center gap-1 text-lg font-semibold text-[#1E1E1E] bg-white min-w-[100px] p-4 rounded-xl">
            <div class="text-[18px] leading-[26px] font-bold w-full text-center">{{
              formatNumber(Number(chargeableWeight)) }}</div>
            <div class="text-sm font-normal w-fit">Kg</div>
          </div>
        </div>

        <div class="h-[1px] border-y border-[#EDEDED]" />
      </div>

      <div class="flex items-start justify-between w-full h-[70px] px-6">
        <button class="flex items-center gap-2 py-2 text-[14px] leading-[22px] font-[400] text-[#1E1E1E] cursor-pointer"
          @click="toggleCalculator">
          <IconCalculator />
          {{ isVisibleAdvanceCalc ? 'Hide' : 'Show' }} Advance Shipment Calculator
        </button>
        <button
          class="h-[46px] w-[158px] px-6 rounded-lg bg-[#C1FF00] text-[#1E1E1E] font-medium hover:bg-[#A1D400] text-[14px] leading-[22px] flex items-center justify-center"
          @click="handleGetSpecialRate">
          <IconSpinner v-if="ratesLoading" />
          <span v-else>Get Special Rate</span>
        </button>
      </div>
    </div>

    <!-- Shipping Rate Options -->
    <div class="flex flex-col gap-3 mt-8" v-if="rates.length > 0">
      <h3 class="text-[24px] leading-[130%] text-[#1E1E1E] font-medium">Shipping Option</h3>
      <template v-for="rate in rates" :key="rate.id">
        <UIRateCard :price="rate?.pricing?.amount" :currency="rate?.pricing?.currency" :unit="rate?.pricing?.unit"
          :minWeight="rate?.pricing?.minimum?.value" badge="Special Rate" :provider="rate?.provider?.branding?.logo"
          :originCountry="rate?.route?.origin?.country_name" :originFlag="rate?.assets?.flags?.origin"
          :destinationCountry="rate?.route?.destination?.country_name"
          :destinationFlag="rate?.assets?.flags?.destination" :eta="rate?.eta" :isDirect="rate?.route?.is_direct"
          :terms="rate?.terms" :loading="actionMoveNowLoading === rate.id" @action="handleActionMoveNow(rate)" />
      </template>
    </div>
  </section>
</template>
