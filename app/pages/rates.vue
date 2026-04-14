<script setup lang="ts">
  import InputIcon from "primevue/inputicon";
  import { computed, ref } from "vue";
  import { MENU } from "~/config";
  import type { EstimateRatesRequest, LocationPayload, Rate, ShipmentType } from "~/types/rate";
  import type { AddressGeocode } from "~/types/order-hub";

  const authModal = useAuthModal();
  const { user } = useAuth();
  const router = useRouter();

  const origin = ref<LocationPayload | null>(null);
  const originAddress = ref("");
  const destination = ref<LocationPayload | null>(null);
  const destinationAddress = ref("");
  const shipmentType = ref("back_for_good");

  const rates = ref<Rate[]>([]);
  const ratesLoading = ref(false);
  const actionMoveNowLoading = ref<string | null>(null);

  const isVisibleAdvanceCalc = ref(false);
  const items = ref([
    { id: Date.now(), weight: null, length: null, width: null, height: null, quantity: 1 },
  ]);
  const volumetricFactor = 5000;

  const toggleCalculator = () => {
    isVisibleAdvanceCalc.value = !isVisibleAdvanceCalc.value;
  };

  const addItem = () => {
    items.value.push({
      id: Date.now() + Math.random(),
      weight: null, length: null, width: null, height: null, quantity: 1,
    });
  };

  const removeItem = (index: number) => {
    if (items.value.length === 1) return;
    items.value.splice(index, 1);
  };

  const totalActualWeight = computed(() => {
    return items.value.reduce((total, item) => {
      const weight = Number(item.weight) || 0;
      const qty = Number(item.quantity) || 1;
      return total + weight * qty;
    }, 0);
  });

  const totalVolumetricWeight = computed(() => {
    return items.value.reduce((total, item) => {
      const l = Number(item.length) || 0;
      const w = Number(item.width) || 0;
      const h = Number(item.height) || 0;
      const qty = Number(item.quantity) || 1;
      if (!l || !w || !h) return total;
      return total + (l * w * h / volumetricFactor) * qty;
    }, 0);
  });

  const chargeableWeight = computed(() => {
    return Math.ceil(Math.max(totalActualWeight.value, totalVolumetricWeight.value));
  });

  const handleOriginSelect = (payload: AddressGeocode) => {
    origin.value = payload;
    originAddress.value = payload?.address;
  };

  const handleDestinationSelect = (payload: AddressGeocode) => {
    destination.value = payload;
    destinationAddress.value = payload?.address;
  };

  const formatNumber = (value: number | string, options = { decimals: 0, locale: "en-US" }) => {
    const number = Number(value);
    if (isNaN(number)) return "0";
    return new Intl.NumberFormat(options.locale, {
      minimumFractionDigits: options.decimals,
      maximumFractionDigits: options.decimals,
    }).format(number);
  };

  const handleGetSpecialRate = async () => {
    ratesLoading.value = true;

    let payload: EstimateRatesRequest = {
      shipment_type: shipmentType.value as ShipmentType,
      origin: origin.value as LocationPayload,
      destination: destination.value as LocationPayload,
    };

    if (isVisibleAdvanceCalc.value) {
      const packages: EstimateRatesRequest["packages"] = items.value.map((item) => {
        const { weight, length, width, height, quantity } = item;
        return {
          weight,
          weight_unit: "kg",
          dimensions: { length, width, height },
          dimension_unit: "cm",
          quantity,
        };
      });
      payload = { ...payload, packages };
    }

    try {
      const res = await $fetch<{ rates: Rate[] }>(`/api/rates/estimate`, {
        method: "POST",
        credentials: "include",
        body: payload,
      });
      rates.value = res.rates;
    } catch (err) {
      console.error("fetch rates error:", err);
    } finally {
      ratesLoading.value = false;
    }
  };

  const handleActionMoveNow = async (rate: Rate) => {
    if (!user.value) {
      authModal.openLogin();
      return;
    }

    actionMoveNowLoading.value = rate.id;

    try {
      await $fetch(`/api/eligibility`, {
        method: "GET",
        credentials: "include",
        params: { rateId: rate.id },
      });

      router.push({
        path: MENU.ELIGIBLE,
        query: {
          rateId: rate.id,
          origin: (origin.value as LocationPayload)?.country,
        },
      });
    } catch (err) {
      console.error("fetch eligibility error:", err);
      actionMoveNowLoading.value = "";
    }
  };

  const isSubmitDisabled = computed(() => {
    if (!originAddress.value || !destinationAddress.value) return true;

    if (isVisibleAdvanceCalc.value) {
      const hasInvalidItem = items.value.some((item) =>
        !item.weight || !item.length || !item.width || !item.height ||
        !item.quantity || item.quantity <= 0
      );
      if (hasInvalidItem) return true;
    }

    return false;
  });
</script>

<template>
  <section class="max-w-5xl mx-auto pt-40 pb-24 px-6">
    <!-- Title -->
    <div class="flex flex-col items-center justify-center gap-2 mb-8">
      <h1 class="text-[32px] leading-[130%] font-semibold text-neutral-100 text-center">
        Calculate Your Shipment
      </h1>
      <p class="text-body-sm font-[400] !text-neutral-70 uppercase">
        GET AN INSTANT ESTIMATE FOR YOUR INTERNATIONAL MOVE
      </p>
    </div>

    <!-- Body -->
    <div class="flex flex-col gap-6 rounded-2xl bg-neutral-10 border border-[#EDEDED]">
      <!-- Tabs -->
      <div class="flex gap-6 p-6 bg-neutral-20 border-b border-[#F6F6FA] rounded-tl-[14px] rounded-tr-[14px]">
        <button class="flex-1 h-[50px] rounded-lg bg-neutral-100 text-white text-body-lg font-medium cursor-default">
          Back for Good
        </button>
        <button class="flex-1 h-[50px] rounded-lg bg-white text-neutral-100 text-body-lg font-medium cursor-default">
          Moving Abroad
        </button>
      </div>

      <!-- Form -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-6 items-end px-6">
        <div class="flex flex-col gap-2">
          <label class="text-body-sm font-medium text-[#616161]">Moving from</label>
          <ClientOnly>
            <GoogleAddressInput v-model="originAddress" placeholder="Origin address" @select="handleOriginSelect" />
          </ClientOnly>
        </div>
        <div class="flex flex-col gap-2">
          <label class="text-body-sm font-medium text-[#616161]">Moving to</label>
          <ClientOnly>
            <GoogleAddressInput v-model="destinationAddress" country="id" placeholder="Destination address" @select="handleDestinationSelect" />
          </ClientOnly>
        </div>
      </div>

      <!-- Advance Calculator -->
      <div
        class="flex-col gap-6 px-6 transition-all duration-300 ease-out"
        :class="isVisibleAdvanceCalc ? 'max-h-fit opacity-100 flex' : 'max-h-0 opacity-0 -mt-6 -z-10 hidden'"
      >
        <div class="h-[1px] border-y border-[#EDEDED]" />
        <div class="flex items-center gap-2 text-body-lg font-medium text-neutral-100">
          <IconPackageDetails />
          PACKAGE DETAILS
        </div>

        <div class="flex flex-col gap-4">
          <div v-for="(item, index) in items" :key="item.id" class="relative flex items-start gap-6">
            <div class="flex-[1]">
              <div class="flex flex-col gap-[6px]">
                <label class="text-[14px] font-medium text-neutral-90">Weight (KG)</label>
                <div class="relative h-[46px]">
                  <InputNumber v-model="item.weight" placeholder="Weight" class="w-full h-full" input-class="w-full h-full pr-[56px]" />
                  <InputIcon class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]">KG</InputIcon>
                </div>
              </div>
            </div>
            <div class="flex-[3]">
              <div class="flex flex-col gap-[6px]">
                <label class="text-[14px] font-medium text-neutral-90">Dimension (L × W × H)</label>
                <div class="flex items-center gap-2">
                  <div class="relative h-[46px] w-full">
                    <InputNumber v-model="item.length" placeholder="L" class="w-full h-full" input-class="w-full h-full pr-[49px]" />
                    <InputIcon class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]">cm</InputIcon>
                  </div>
                  <span class="text-neutral-60 text-sm">×</span>
                  <div class="relative h-[46px] w-full">
                    <InputNumber v-model="item.width" placeholder="W" class="w-full h-full" input-class="w-full h-full pr-[49px]" />
                    <InputIcon class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]">cm</InputIcon>
                  </div>
                  <span class="text-neutral-60 text-sm">×</span>
                  <div class="relative h-[46px] w-full">
                    <InputNumber v-model="item.height" placeholder="H" class="w-full h-full" input-class="w-full h-full pr-[49px]" />
                    <InputIcon class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]">cm</InputIcon>
                  </div>
                </div>
              </div>
            </div>
            <div class="flex-[1] relative">
              <div class="flex flex-col gap-[6px]">
                <label class="text-[14px] font-medium text-neutral-90">Quantity</label>
                <div class="relative h-[46px]">
                  <InputNumber v-model="item.quantity" placeholder="1" class="w-full h-full" input-class="w-full h-full pr-[49px]" />
                  <InputIcon class="absolute right-[1px] !top-[1px] !mt-0 h-[44px] w-[45px] bg-neutral-20 !text-neutral-70 flex items-center justify-center rounded-tr-[5px] rounded-br-[5px]">pcs</InputIcon>
                </div>
              </div>
              <button v-if="items.length > 1" class="absolute -right-[21px] top-[41px] text-neutral-60 hover:text-red-500 transition" @click="removeItem(index)">
                <IconTrash width="18" height="18" />
              </button>
            </div>
          </div>

          <button class="flex items-center gap-2 text-sm font-medium text-neutral-100 w-fit" @click="addItem">
            <IconPlusCircle />
            Add Item
          </button>
        </div>

        <!-- Chargeable Weight -->
        <div class="flex items-center justify-between bg-neutral-20 p-4 border-b border-[#F6F6FA]">
          <div class="flex gap-3">
            <div class="flex justify-center items-center w-[44px] h-[44px] bg-white rounded-[8px]">
              <IconChargeableWeight />
            </div>
            <div class="flex flex-col gap-1">
              <p class="flex items-center gap-1 text-body-sm font-medium text-neutral-100">
                Chargeable Weight for this Package
                <IconQuestionMarkCircle />
              </p>
              <p class="text-body-sm text-neutral-60">
                Calculated as the greater of Actual Weight
                <span class="text-neutral-100">({{ formatNumber(Number(totalActualWeight)) }} Kg)</span>
                or Volumetric Weight
                <span class="text-neutral-100">({{ formatNumber(Number(totalVolumetricWeight)) }} Kg)</span>
              </p>
            </div>
          </div>
          <div class="flex items-center gap-1 text-lg font-semibold text-neutral-100 bg-white min-w-[100px] p-4 rounded-xl">
            <div class="text-body-lg font-bold w-full text-center">{{ formatNumber(Number(chargeableWeight)) }}</div>
            <div class="text-sm font-normal w-fit">Kg</div>
          </div>
        </div>

        <div class="h-[1px] border-y border-[#EDEDED]" />
      </div>

      <div class="flex items-start justify-between w-full h-[70px] px-6">
        <button
          class="flex items-center gap-2 py-2 text-body-sm font-[400] text-neutral-100 cursor-pointer"
          @click="toggleCalculator"
        >
          <IconCalculator />
          {{ isVisibleAdvanceCalc ? "Hide" : "Show" }} Advance Shipment Calculator
        </button>
        <PrimaryButton class="w-[158px]" :loading="ratesLoading" :disabled="isSubmitDisabled" @click="handleGetSpecialRate">
          Get Special Rate
        </PrimaryButton>
      </div>
    </div>

    <!-- Shipping Rate Options -->
    <div v-if="rates.length > 0" class="flex flex-col gap-3 mt-8">
      <h3 class="text-[24px] leading-[130%] text-neutral-100 font-medium">Shipping Option</h3>
      <template v-for="rate in rates" :key="rate.id">
        <UIRateCard
          :price="rate?.pricing?.amount"
          :currency="rate?.pricing?.currency"
          :unit="rate?.pricing?.unit"
          :min-weight="rate?.pricing?.minimum?.value"
          :badge="rate?.is_special_rate ? 'Special Rate' : 'Standard Rate'"
          :provider="rate?.provider?.branding?.logo"
          :origin-country="rate?.route?.origin?.country_name"
          :origin-flag="rate?.assets?.flags?.origin"
          :destination-country="rate?.route?.destination?.country_name"
          :destination-flag="rate?.assets?.flags?.destination"
          :eta="rate?.eta"
          :is-direct="rate?.route?.is_direct"
          :terms="rate?.terms"
          :loading="actionMoveNowLoading === rate.id"
          @action="handleActionMoveNow(rate)"
        />
      </template>
    </div>
  </section>
</template>
