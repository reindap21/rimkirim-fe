<script setup lang="ts">

import InputIcon from "primevue/inputicon";
import { computed, ref } from 'vue';
import type { EstimateRatesRequest, LocationPayload, Rate, ShipmentType } from '~/types/rate';

// * ------- Composable --------------------------------------------------------------------------------------------------------------------------------------------

const authModal = useAuthModal()
const { user } = useAuth()

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const router = useRouter()

const origin = ref<LocationPayload | {}>({})
const originAddress = ref("")
const destination = ref<LocationPayload | {}>({})
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


const handleOriginSelect = (payload: any) => {
  origin.value = payload
  originAddress.value = payload?.address;
}

const handleDestinationSelect = (payload: any) => {
  destination.value = payload
  destinationAddress.value = payload?.address;
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


/**
 * 
 */
const handleGetSpecialRate = async () => {

  ratesLoading.value = true;

  let payload: EstimateRatesRequest = {
    shipment_type: shipmentType.value as ShipmentType,
    origin: origin.value as LocationPayload,
    destination: destination.value as LocationPayload,
  }

  if (isVisibleAdvanceCalc.value) {
    const packages: EstimateRatesRequest['packages'] = items.value.map((item) => {
      const { weight, length, width, height, quantity } = item
      return {
        weight,
        weight_unit: "kg",
        dimensions: {
          length,
          width,
          height
        },
        dimension_unit: "cm",
        quantity
      }
    })

    payload = {
      ...payload,
      packages
    }
  }

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

/**
 * Sync with SpecialRateSection
 * @param rate 
 */
const handleActionMoveNow = async (rate: Rate) => {

  // If not loggedin then open popup login
  if (!user.value) {
    authModal.openLogin();
    return;
  }

  // Set Loading
  actionMoveNowLoading.value = rate.id

  // Fetch API
  // Sync with Special Rate Section
  try {
    await $fetch(`/api/eligibility`, {
      method: "GET",
      credentials: 'include', // Required
      params: {
        rateId: rate.id
      }
    })

    // If success
    router.push({
      path: '/eligible',
      query: {
        rateId: rate.id,
        origin: (origin.value as any)?.country
      }
    })

  } catch (err) {
    console.error('fetch eligibility error:', err);
    actionMoveNowLoading.value = ""
  }
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

/**
 * Disbaled Submit Button
 */
const isSubmitDisabled = computed(() => {

  let isFormFilled = true

  // 1️⃣ Origin & Destination required
  if (!originAddress.value || !destinationAddress.value) {
    isFormFilled = false
  }

  if (isVisibleAdvanceCalc.value) {
    // 2️⃣ Check every item
    const hasInvalidItem = items.value.some(item => {
      return (
        !item.weight ||
        !item.length ||
        !item.width ||
        !item.height ||
        !item.quantity ||
        item.quantity <= 0
      )
    })

    isFormFilled = isFormFilled && !hasInvalidItem
  }

  return !isFormFilled
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
      <div class="flex gap-6 p-6 bg-[#F6F6FA] border-b border-[#F6F6FA] rounded-tl-[14px] rounded-tr-[14px]">
        <button
          class="flex-1 h-[50px] rounded-lg bg-[#1E1E1E] text-white text-[18px] leading-[26px] font-medium cursor-default">Back
          for Good</button>
        <button
          class="flex-1 h-[50px] rounded-lg bg-white text-[#1E1E1E] text-[18px] leading-[26px] font-medium cursor-default">Moving
          Abroad</button>
      </div>
      <!-- Form -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end px-6">
        <div class="flex flex-col gap-2">
          <label class="text-[14px] leading-[22px] font-medium text-[#616161]">Moving from</label>
          <!-- <input type="text" placeholder="Origin Address"
            class="mt-1 w-full h-[46px] rounded-lg border border-[#E5E7EB] px-4 text-sm" /> -->
          <ClientOnly>
            <GoogleAddressInput v-model="originAddress" placeholder="Origin address" @select="handleOriginSelect" />
          </ClientOnly>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-[14px] leading-[22px] font-medium text-[#616161]">Moving to</label>
          <!-- <input type="text" placeholder="Destination Address"
            class="mt-1 w-full h-[46px] rounded-lg border border-[#E5E7EB] px-4 text-sm" />  -->
          <ClientOnly>
            <GoogleAddressInput v-model="destinationAddress" placeholder="Destination address"
              @select="handleDestinationSelect" />
          </ClientOnly>
        </div>

      </div>
      <!-- Advance -->
      <div class="flex-col gap-6 px-6 transition-all duration-300 ease-out" :class="isVisibleAdvanceCalc
        ? 'max-h-fit opacity-100 flex'
        : 'max-h-0 opacity-0 -mt-6 -z-10 hidden'
        ">
        <div class="h-[1px] border-y border-[#EDEDED]" />

        <div class="flex items-center gap-2 text-[18px] leading-[26px] font-medium text-[#1E1E1E]">
          <IconPackageDetails />
          PACKAGE DETAILS
        </div>


        <div class="flex flex-col gap-4">
          <div v-for="(item, index) in items" :key="item.id" class="relative flex items-start gap-6">
            <!-- Weight -->
            <div class="flex-[1]">
              <div class="flex flex-col gap-[6px]">
                <label class="text-[14px] font-medium">Weight (KG)</label>

                <div class="relative h-[46px] border border-[#EDEDED] rounded-[6px]">
                  <InputNumber v-model="item.weight" placeholder="Weight" class="w-full h-full"
                    inputClass="w-full h-full pr-[56px]" />

                  <InputIcon class="absolute right-0 top-0 h-full w-[49px]
                   bg-[#F6F6FA] text-[#757575]
                   flex items-center justify-center
                   rounded-tr-[6px] rounded-br-[6px]">
                    KG
                  </InputIcon>
                </div>
              </div>
            </div>

            <!-- Dimension -->
            <div class="flex-[3]">
              <div class="flex flex-col gap-[6px]">
                <label class="text-[14px] font-medium">
                  Dimension (L × W × H)
                </label>

                <div class="flex items-center gap-2">
                  <!-- L -->
                  <div class="relative h-[46px] w-full border border-[#EDEDED] rounded-[6px]">
                    <InputNumber v-model="item.length" placeholder="L" class="w-full h-full"
                      inputClass="w-full h-full pr-[49px]" />
                    <InputIcon
                      class="absolute right-0 top-0 h-full w-[49px] bg-[#F6F6FA] text-[#757575] flex items-center justify-center rounded-tr-[6px] rounded-br-[6px]">
                      cm
                    </InputIcon>
                  </div>

                  <span class="text-[#9E9E9E] text-sm">×</span>

                  <!-- W -->
                  <div class="relative h-[46px] w-full border border-[#EDEDED] rounded-[6px]">
                    <InputNumber v-model="item.width" placeholder="W" class="w-full h-full"
                      inputClass="w-full h-full pr-[49px]" />
                    <InputIcon
                      class="absolute right-0 top-0 h-full w-[49px] bg-[#F6F6FA] text-[#757575] flex items-center justify-center rounded-tr-[6px] rounded-br-[6px]">
                      cm
                    </InputIcon>
                  </div>

                  <span class="text-[#9E9E9E] text-sm">×</span>

                  <!-- H -->
                  <div class="relative h-[46px] w-full border border-[#EDEDED] rounded-[6px]">
                    <InputNumber v-model="item.height" placeholder="H" class="w-full h-full"
                      inputClass="w-full h-full pr-[49px]" />
                    <InputIcon
                      class="absolute right-0 top-0 h-full w-[49px] bg-[#F6F6FA] text-[#757575] flex items-center justify-center rounded-tr-[6px] rounded-br-[6px]">
                      cm
                    </InputIcon>
                  </div>
                </div>
              </div>
            </div>

            <!-- Quantity -->
            <div class="flex-[1] relative">
              <div class="flex flex-col gap-[6px]">
                <label class="text-[14px] font-medium">Quantity</label>

                <div class="relative h-[46px] border border-[#EDEDED] rounded-[6px]">
                  <InputNumber v-model="item.quantity" placeholder="1" class="w-full h-full"
                    inputClass="w-full h-full pr-[49px]" />
                  <InputIcon class="absolute right-0 top-0 h-full w-[49px]
                   bg-[#F6F6FA] text-[#757575]
                   flex items-center justify-center
                   rounded-tr-[6px] rounded-br-[6px]">
                    pcs
                  </InputIcon>
                </div>
              </div>

              <!-- Remove Item -->
              <button v-if="items.length > 1" @click="removeItem(index)"
                class="absolute -right-[21px] top-[41px] text-[#9E9E9E] hover:text-red-500 transition">
                <IconTrash width="18" height="18" />
              </button>
            </div>
          </div>

          <!-- Add Item -->
          <button @click="addItem" class="flex items-center gap-2 text-sm font-medium text-[#1E1E1E] w-fit focus-visible:ring-offset-[6px] focus-visible:ring-offset-[#FAFAFC] focus-visible:rounded-md">
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
        <button class="flex items-center gap-2 py-2 text-[14px] leading-[22px] font-[400] text-[#1E1E1E] cursor-pointer focus-visible:ring-offset-[6px] focus-visible:ring-offset-[#FAFAFC] focus-visible:rounded-md"
          @click="toggleCalculator">
          <IconCalculator />
          {{ isVisibleAdvanceCalc ? 'Hide' : 'Show' }} Advance Shipment Calculator
        </button>
        <PrimaryButton class="w-[158px]" :loading="ratesLoading" :disabled="isSubmitDisabled"
          @click="handleGetSpecialRate">
          Get Special Rate
        </PrimaryButton>
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
