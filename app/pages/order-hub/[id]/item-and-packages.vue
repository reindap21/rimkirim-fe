<script setup lang="ts">
<<<<<<< HEAD
  // import { zodResolver } from "@primevue/forms/resolvers/zod";
  // import { z } from "zod";
  import { nanoid } from "nanoid";
  import { ref } from "vue";
  import type { OrderHubStep, Package } from "~/types/order-hub";
  import { useOrderHub } from "~/composables/useOrderHub";
  import { wordCapital } from "~/utils/string";
  import { nextTick } from "vue";
  import IconSaveProgress from "~/components/icons/IconSaveProgress.vue";

  // External

  const createPackage = (): Package => ({
    id: nanoid(),
    packagingType: "box",
    weightInKgs: 0,
    dimensionInCcLength: 0,
    dimensionInCcWidth: 0,
    dimensionInCcHeight: 0,
    totalItem: 0,
    totalValue: 0,
    chargeableWeight: 0,
    items: [],
    uploadedFiles: [],
  });

  // * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------

  // * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

  definePageMeta({
    layout: "order-hub",
    // middleware: 'auth'
  });

  // * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

  // TODO: Refactor fetch progress

  // Use order hub composable
  const { bookingCode, fetchProgress, navigateToOrderHub } = useOrderHub();

  const bookingProgressLoading = ref(true);

  const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");
  const packingListCode = ref("-");

  const viewMode = ref<"form" | "success">("form");

  const currentStep: OrderHubStep = "item_and_package";

  const visibleConfirmSaveLater = ref(false);

  const submittedResponse = ref<any>(); // eslint-disable-line

  // * ------- Form Handling

  // const formRef = ref<any>(null);
  const currencies = ref<{ name: string; code: string }[]>([]);
  const currenciesLoading = ref(true);
  const submitLoading = ref(false);
  const finishLaterLoading = ref(false);
  const errorSubmit = ref("");
  const packageErrorIndex = ref<number | null>(null);

  const selectedCurrency = ref<{ name: string; code: string } | undefined>(undefined);

  const initialValues = {};

  // const resolver = ref(
  //   zodResolver(
  //     z.object({
  //       // Sender
  //       // senderContactName: z.string().min(1, { message: 'Full name is required.' }),
  //     }),
  //   ),
  // );

  const packages = ref<Package[]>([]);

  // * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

  // TODO: Move to useOrderHub
  const fetchCurrencies = async () => {
    try {
      const res = await $fetch("/api/order-hub/currencies", {
        method: "GET",
        credentials: "include", // Required
      });
      currencies.value = (res as string[]).map((c) => ({
        name: wordCapital(c, "_"),
        code: c,
      }));

      // Set default currency to USD if available, otherwise first currency
      const defaultCurrency = currencies.value.find((c) => c.code === "usd") || currencies.value[0];
      if (defaultCurrency && !selectedCurrency.value) {
        selectedCurrency.value = defaultCurrency;
      }

      currenciesLoading.value = false;
    } catch (err) {
      console.error("fetch currencies error:", err);
      currenciesLoading.value = false;
    }
  };

  // Load booking progress data
  const loadBookingProgress = async () => {
    bookingProgressLoading.value = true;

    try {
      const res = await fetchProgress();

      if (!res) return;

      // Map the initial data
      packingListCode.value = res?.packing_list_code || "-";
      purposeOfShipment.value = res?.purpose_of_shipment;

      // Content
      const { item_and_package } = res;

      // Extract currencyCode and packages from data
      if (item_and_package?.data && typeof item_and_package.data === "object") {
        const data = item_and_package.data as {
          currencyCode?: string;
          packages?: Package[];
        };

        // Set currency if exists
        if (data.currencyCode) {
          const currency = currencies.value.find(
            (c) => c.code.toLowerCase() === (data.currencyCode ?? "").toLowerCase(),
          );
          if (currency) {
            selectedCurrency.value = currency;
          }
        }

        // Fill the packages
        packages.value =
          data.packages && data.packages.length > 0
            ? data.packages.map((v: Package) => ({ ...v, id: nanoid() }))
            : [createPackage()];
      } else {
        packages.value = [createPackage()];
      }
      bookingProgressLoading.value = false;
    } catch (err) {
      // Error is already handled by the composable
      bookingProgressLoading.value = false;
    }
  };

  // * Package

  const addPackage = (): void => {
    packages.value.push(createPackage());
  };

  const removePackage = (index: number): void => {
    if (packages.value.length <= 1) return;
    packages.value.splice(index, 1);
  };

  const validatePackages = (): { valid: boolean; message?: string; index?: number } => {
    if (!packages.value.length) {
      return { valid: false, message: "At least one package is required." };
    }

    for (let i = 0; i < packages.value.length; i++) {
      const pkg = packages.value[i];
      if (!pkg) continue;

      if (!pkg.packagingType) {
        return { valid: false, message: `Package ${i + 1}: Packaging type is required.`, index: i };
      }

      if (!pkg.weightInKgs || pkg.weightInKgs <= 0) {
        return {
          valid: false,
          message: `Package ${i + 1}: Weight must be greater than 0.`,
          index: i,
        };
      }

      if (!pkg.dimensionInCcLength || !pkg.dimensionInCcWidth || !pkg.dimensionInCcHeight) {
        return {
          valid: false,
          message: `Package ${i + 1}: All dimensions are required.`,
          index: i,
        };
      }

      if (!pkg.items.length) {
        return {
          valid: false,
          message: `Package ${i + 1}: At least one item is required.`,
          index: i,
        };
      }

      for (let j = 0; j < pkg.items.length; j++) {
        const item = pkg.items[j];
        if (!item) continue;

        if (!item.description?.trim()) {
          return {
            valid: false,
            message: `Package ${i + 1}, Item ${j + 1}: Description is required.`,
            index: i,
          };
        }

        if (!item.quantity || item.quantity <= 0) {
          return {
            valid: false,
            message: `Package ${i + 1}, Item ${j + 1}: Quantity must be greater than 0.`,
            index: i,
          };
        }

        if (!item.valuePerItem || item.valuePerItem < 0) {
          return {
            valid: false,
            message: `Package ${i + 1}, Item ${j + 1}: Value per item is required.`,
            index: i,
          };
        }
      }
    }

    return { valid: true };
  };

  const scrollToPackage = async (index: number) => {
    await nextTick();
    await new Promise((r) => setTimeout(r, 50));

    const el = document.getElementById(`package-${index}`);

    if (!el) return;

    el.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  };

  // Global Summary

  const totalPackage = computed<number>(() => packages.value.length);

  const totalValue = computed<number>(() =>
    packages.value.reduce((sum: number, p: Package) => sum + p.totalValue, 0),
  );

  const totalChargeableWeight = computed<number>(() =>
    packages.value.reduce((sum: number, p: Package) => sum + p.chargeableWeight, 0),
  );

  /**
   * Popup FinishLater : Show popup
   */
  const showPopupFinishLater = () => {
    visibleConfirmSaveLater.value = true;
  };

  /**
   * Popup FinishLater : Close popup
   */
  const closePopupFinishLater = () => {
    visibleConfirmSaveLater.value = false;
  };

  /**
   * Finish Later
   * @param $form
   */
  const handleFinishLater = async ($form: any) => {
    if (finishLaterLoading.value) return;

    finishLaterLoading.value = true;
    errorSubmit.value = "";

    const payload = {
      bookingCode: bookingCode.value,
      currencyCode: selectedCurrency.value?.code,
      packages: [...packages.value],
    };

    try {
      const res = await $fetch("/api/order-hub/item-and-package", {
        method: "PUT",
        body: payload,
        credentials: "include", // Required
      });

      if (res) {
        navigateToOrderHub();
      }
    } catch (err: any) {
      errorSubmit.value = err?.data?.message || "Error submit item and packages";
    } finally {
      submitLoading.value = false;
    }
  };

  // Action Buttons

  const handleSubmit = async ({ values, valid }: { values: any; valid: boolean }) => {
    if (!valid || submitLoading.value) return;

    errorSubmit.value = "";

    const pkgValidation = validatePackages();

    if (!pkgValidation.valid) {
      errorSubmit.value = pkgValidation.message || "Invalid package data.";

      if (typeof pkgValidation.index === "number") {
        packageErrorIndex.value = pkgValidation.index;
        await scrollToPackage(pkgValidation.index);
      }

      return;
    }

    if (!valid) return;

    submitLoading.value = true;

    const payload = {
      ...values,
      bookingCode: bookingCode.value,
      currencyCode: selectedCurrency.value?.code,
      packages: [...packages.value],
    };

    try {
      const res = await $fetch("/api/order-hub/item-and-package", {
        method: "PUT",
        body: payload,
        credentials: "include", // Required
      });

      // Store state
      // userState.value = res.user

      if (res) {
        submittedResponse.value = res;
        viewMode.value = "success";
      }
    } catch (err: any) {
      errorSubmit.value = err?.data?.message || "Error submit item and packages";
    } finally {
      submitLoading.value = false;
    }
  };

  // * ------- watch -------------------------------------------------------------------------------------------------------------------------------------------------

  // * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

  onMounted(() => {
    fetchCurrencies();
    loadBookingProgress();
  });
</script>

<template>
  <section class="flex flex-col relative gap-6 max-w-7xl mx-auto px-6 pt-28 pb-24 overscroll-none">
    <!-- <div
      class="fixed top-[14px] left-1/2  transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full w-fit z-[100]">
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium cursor-pointer rounded-full"
        :class="purposeOfShipment === 'moving_goods' ? 'bg-[#0093FF] text-white' : 'text-neutral-60'">
        Personal Belongings
      </div>
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium  cursor-pointer rounded-full"
        :class="purposeOfShipment === 'passenger_goods' ? 'bg-[#FF7C00] text-white' : 'text-neutral-60'">
=======

import { zodResolver } from '@primevue/forms/resolvers/zod';
import { ref } from 'vue';
import { z } from 'zod';
import { MENU } from '~/config';

// * ------- Types -------------------------------------------------------------------------------------------------------------------------------------------------


// * ------- Dedines -----------------------------------------------------------------------------------------------------------------------------------------------

definePageMeta({
  layout: 'order-hub',
  // middleware: 'auth'
})

// * ------- Vars --------------------------------------------------------------------------------------------------------------------------------------------------

const route = useRoute();
const router = useRouter();
const { user, loading } = useAuth()

const bookingCode = route.params.id as string;

const purposeOfShipment = ref<"" | "moving_goods" | "passenger_goods">("");
const packingListCode = ref("-");

const viewMode = ref<'form' | 'success'>("form")

// * ------- Form Handling

const formRef = ref<any>(null)
const submitLoading = ref(false);
const errorSubmit = ref("");

const initialValues = {

}

const resolver = ref(zodResolver(
  z.object({
    // Sender
    // senderContactName: z.string().min(1, { message: 'Full name is required.' }),
  })
));

// * ------- Methods -----------------------------------------------------------------------------------------------------------------------------------------------

const handleSubmit = async ({ values, valid }: { values: any, valid: boolean }) => {

  if (!valid || submitLoading.value) return;

  viewMode.value = 'success';

  errorSubmit.value = ''
  submitLoading.value = true

  const payload = {
    ...values,
    bookingCode: bookingCode,
  }

  try {
    const res = await $fetch('/order-hub/item-and-package', {
      method: 'POST',
      body: payload,
      credentials: 'include', // Required
    })

    // Store state
    // userState.value = res.user

    viewMode.value = 'success';

  } catch (err: any) {
    errorSubmit.value =
      err?.data?.message || 'Error submit item and packages'
  } finally {
    submitLoading.value = false
  }
};

const handleFinishLater = () => {
  // actionForm.value = ""
}

const handleBack = () => {
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  })
}

const handleGoToOrderHubPage = () => {
  router.push({
    path: `${MENU.ORDER_HUB}/${bookingCode}`,
  })
}

// * ------- onMounted ---------------------------------------------------------------------------------------------------------------------------------------------

onMounted(() => {

})


</script>


<template>
  <section class="flex flex-col relative gap-6 max-w-7xl mx-auto px-6 pt-28 pb-24">
    <!-- <div
      class="fixed top-[14px] left-1/2  transform -translate-x-1/2 flex items-center gap-2 px-4 py-2 bg-white shadow-lg rounded-full w-fit z-[100]">
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium cursor-pointer rounded-full"
        :class="purposeOfShipment === 'moving_goods' ? 'bg-[#0093FF] text-white' : 'text-[#9E9E9E]'">
        Personal Belongings
      </div>
      <div class="text-[12px] leading-[22px] px-8 py-3 font-medium  cursor-pointer rounded-full"
        :class="purposeOfShipment === 'passenger_goods' ? 'bg-[#FF7C00] text-white' : 'text-[#9E9E9E]'">
>>>>>>> Refactor page structure; Page customer infor and item & packages
        Passenger Goods
      </div>
    </div> -->

    <template v-if="viewMode === 'form'">
      <!-- Section Form -->
      <section class="w-[1024px] mx-auto flex flex-col gap-6 mt-4">
<<<<<<< HEAD
        <FormHeader
          title="ITEM & PACKAGES"
          description="Add details of your packages, including dimensions, weight, contents and value."
          :packing-listcode="packingListCode"
        />

        <div class="flex flex-col p-6 gap-1 bg-neutral-20 border border-neutral-40 rounded-[12px]">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <h2 class="text-[20px] leading-[130%] font-medium text-neutral-90">
                Choose Your Currency
              </h2>
              <p class="text-[14px] leading-[22px] spacing-[0%] font-[400] text-neutral-60">
                You may pick any convenient currency from origin country to value your
              </p>
            </div>
            <div class="">
              <Select
                v-model="selectedCurrency"
                name="senderCountry"
                :options="currencies"
                class="w-[100px] h-full"
                option-label="name"
                fluid
              />
            </div>
          </div>
        </div>

        <!-- Packages -->
        <UIPackage
          v-for="(pkg, index) in packages"
          :key="pkg.id"
          :model-value="pkg"
          :index="index"
          :currency="selectedCurrency?.code"
          :booking-code="bookingCode"
          :total-packages="packages.length"
          :has-error="packageErrorIndex === index"
          @update:model-value="(val) => (packages[index] = val)"
          @remove="removePackage(index)"
        />

        <!-- :resolver="resolver" -->
        <Form
          v-slot="$form"
          class="flex flex-col gap-6"
          :initial-values="initialValues"
          validate-on-blur
          @submit="handleSubmit"
        >
          <!-- Add another package -->
          <div
            class="flex items-center justify-center px-4 py-5 rounded-[6px] border border-dashed border-neutral-40 hover:border-black cursor-pointer"
            @click="addPackage"
          >
            <TextAddAnotherPackage />
          </div>

          <!-- Summary -->
          <div class="grid grid-cols-3 bg-neutral-100 rounded-[8px] p-4">
            <div class="relative flex items-center gap-3">
              <div>
                <IconTotalPackage />
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-[12px] font-[400] leading-[20px] text-[#C2C2C2]">
                  Total Package
                </div>
                <div class="text-[18px] leading-[26px] font-bold text-white">
                  {{ totalPackage }}
                </div>
              </div>
              <div
                class="h-[32px] w-[2px] bg-[#] border border-[#757575] rounded-full absolute right-3 top-1/2 transform -translate-y-1/2"
              />
            </div>
            <div class="relative flex items-center gap-3">
              <div>
                <IconTotalValue />
              </div>
              <div class="flex flex-col gap-1">
                <div
                  class="flex items-center gap-1 text-[12px] font-[400] leading-[20px] text-[#C2C2C2]"
                >
                  Total Value
                  <PopoverTotalValueItemAndPackage />
                </div>
                <div
                  class="flex items-center gap-1 text-[18px] leading-[26px] font-bold text-white"
                >
                  <span v-if="selectedCurrency">{{ selectedCurrency?.code }}</span>
                  {{ totalValue }}
                </div>
              </div>
              <div
                class="h-[32px] w-[2px] bg-[#] border border-[#757575] rounded-full absolute right-3 top-1/2 transform -translate-y-1/2"
              />
            </div>
            <div class="flex items-center gap-3">
              <div>
                <IconTotalChargeable />
              </div>
              <div class="flex flex-col gap-1">
                <div
                  class="flex items-center gap-1 text-[12px] font-[400] leading-[20px] text-[#C2C2C2]"
                >
                  Total Chargeable Weight
                  <PopoverTotalChargeableWeightBase />
                </div>
                <div
                  class="flex items-center gap-3 text-[18px] leading-[26px] font-bold text-white"
                >
                  {{ Math.ceil(totalChargeableWeight) }}
                  <PillErrorMin21KgRequired
                    v-if="Math.ceil(totalChargeableWeight) < 21 && !bookingProgressLoading"
                  />
                </div>
=======
        <FormHeader title="ITEM & PACKAGES"
          description="Add details of your packages, including dimensions, weight, contents and value."
          :packingListCode="packingListCode" />

        <div class="flex flex-col p-6 gap-1 bg-[#F6F6FA] border border-[#E0E0E0] rounded-[12px]">
          <div class="flex items-center justify-between">
            <div class="flex flex-col gap-1">
              <h2 class="text-[20px] leading-[130%] font-medium text-[#404040]">Choose Your Currency</h2>
              <p class="text-[14px] leading-[22px] spacing-[0%] font-[400] text-[#9E9E9E]">
                You may pick any convenient currency from origin country to value your item.
              </p>
            </div>
            <div class="">
              <Select name="senderCountry" :options="[{ name: 'USD', code: 'USD' }]" class="w-[100px] h-full"
                optionLabel="name" fluid />
            </div>
          </div>

        </div>

        <Form class="flex flex-col gap-6" v-slot="$form" :resolver="resolver" :initialValues="initialValues"
          validateOnBlur @submit="handleSubmit">

          <div
            class="flex items-center justify-center px-4 py-5 rounded-[6px] border border-dashed border-[#E0E0E0] hover:border-black cursor-pointer">
            <svg width="218" height="50" viewBox="0 0 218 50" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M99.5 7.5V13.5C99.5 17.2712 99.5 19.1569 100.672 20.3284C101.843 21.5 103.729 21.5 107.5 21.5H111M118.5 14V7.5"
                stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path
                d="M100.869 5.31461L99.5 7.5H118.5L117.248 5.41303C116.394 3.99021 115.967 3.2788 115.279 2.8894C114.592 2.5 113.762 2.5 112.103 2.5H105.954C104.33 2.5 103.518 2.5 102.84 2.8753C102.162 3.2506 101.731 3.93861 100.869 5.31461Z"
                stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" />
              <path d="M109 7.5V2.5" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M107 10.5H111" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path d="M112.5 18.5H118.5M115.5 21.5V15.5" stroke="#9E9E9E" stroke-width="1.5" stroke-linecap="round"
                stroke-linejoin="round" />
              <path
                d="M38.785 34.214H40.157L44.063 44H42.607L41.627 41.564H37.301L36.349 44H34.879L38.785 34.214ZM41.235 40.374L39.471 35.796L37.707 40.374H41.235ZM48.2234 44.21C47.5514 44.21 46.9448 44.0653 46.4034 43.776C45.8714 43.4773 45.4514 43.062 45.1434 42.53C44.8448 41.9887 44.6954 41.3633 44.6954 40.654C44.6954 39.954 44.8448 39.3333 45.1434 38.792C45.4514 38.2507 45.8714 37.8307 46.4034 37.532C46.9448 37.224 47.5514 37.07 48.2234 37.07C49.4368 37.07 50.3561 37.4387 50.9814 38.176V33.654H52.3954V44H51.0234V43.02C50.6501 43.4307 50.2394 43.734 49.7914 43.93C49.3528 44.1167 48.8301 44.21 48.2234 44.21ZM48.5454 43.09C49.1241 43.09 49.6281 42.9407 50.0574 42.642C50.4961 42.334 50.8041 41.9233 50.9814 41.41V39.898C50.8228 39.3847 50.5194 38.974 50.0714 38.666C49.6328 38.358 49.1241 38.204 48.5454 38.204C48.0881 38.204 47.6728 38.3067 47.2994 38.512C46.9354 38.7173 46.6461 39.0067 46.4314 39.38C46.2261 39.7533 46.1234 40.178 46.1234 40.654C46.1234 41.13 46.2261 41.5547 46.4314 41.928C46.6461 42.3013 46.9354 42.5907 47.2994 42.796C47.6728 42.992 48.0881 43.09 48.5454 43.09ZM57.2605 44.21C56.5885 44.21 55.9819 44.0653 55.4405 43.776C54.9085 43.4773 54.4885 43.062 54.1805 42.53C53.8819 41.9887 53.7325 41.3633 53.7325 40.654C53.7325 39.954 53.8819 39.3333 54.1805 38.792C54.4885 38.2507 54.9085 37.8307 55.4405 37.532C55.9819 37.224 56.5885 37.07 57.2605 37.07C58.4739 37.07 59.3932 37.4387 60.0185 38.176V33.654H61.4325V44H60.0605V43.02C59.6872 43.4307 59.2765 43.734 58.8285 43.93C58.3899 44.1167 57.8672 44.21 57.2605 44.21ZM57.5825 43.09C58.1612 43.09 58.6652 42.9407 59.0945 42.642C59.5332 42.334 59.8412 41.9233 60.0185 41.41V39.898C59.8599 39.3847 59.5565 38.974 59.1085 38.666C58.6699 38.358 58.1612 38.204 57.5825 38.204C57.1252 38.204 56.7099 38.3067 56.3365 38.512C55.9725 38.7173 55.6832 39.0067 55.4685 39.38C55.2632 39.7533 55.1605 40.178 55.1605 40.654C55.1605 41.13 55.2632 41.5547 55.4685 41.928C55.6832 42.3013 55.9725 42.5907 56.3365 42.796C56.7099 42.992 57.1252 43.09 57.5825 43.09ZM72.0624 34.214H73.4344L77.3404 44H75.8844L74.9044 41.564H70.5784L69.6264 44H68.1564L72.0624 34.214ZM74.5124 40.374L72.7484 35.796L70.9844 40.374H74.5124ZM78.8817 37.28H80.2537V38.246C80.571 37.8447 80.9583 37.5507 81.4157 37.364C81.8823 37.168 82.3677 37.07 82.8717 37.07C83.7677 37.07 84.435 37.308 84.8737 37.784C85.3123 38.26 85.5317 38.8993 85.5317 39.702V44H84.1177V39.842C84.1177 38.75 83.595 38.204 82.5497 38.204C82.1017 38.204 81.6817 38.3113 81.2897 38.526C80.907 38.7313 80.5757 39.0487 80.2957 39.478V44H78.8817V37.28ZM90.6131 44.21C89.8571 44.21 89.1898 44.07 88.6111 43.79C88.0418 43.5007 87.5938 43.09 87.2671 42.558C86.9498 42.0167 86.7911 41.382 86.7911 40.654C86.7911 39.9353 86.9498 39.3053 87.2671 38.764C87.5845 38.2227 88.0325 37.8073 88.6111 37.518C89.1898 37.2193 89.8571 37.07 90.6131 37.07C91.3691 37.07 92.0365 37.2193 92.6151 37.518C93.1938 37.8073 93.6418 38.2227 93.9591 38.764C94.2858 39.3053 94.4491 39.9353 94.4491 40.654C94.4491 41.382 94.2858 42.0167 93.9591 42.558C93.6418 43.09 93.1938 43.5007 92.6151 43.79C92.0365 44.07 91.3691 44.21 90.6131 44.21ZM90.6131 43.09C91.3411 43.09 91.9198 42.866 92.3491 42.418C92.7785 41.97 92.9931 41.382 92.9931 40.654C92.9931 39.898 92.7785 39.3007 92.3491 38.862C91.9198 38.4233 91.3411 38.204 90.6131 38.204C89.8851 38.204 89.3065 38.4233 88.8771 38.862C88.4478 39.3007 88.2331 39.898 88.2331 40.654C88.2331 41.382 88.4478 41.97 88.8771 42.418C89.3065 42.866 89.8851 43.09 90.6131 43.09ZM98.3701 44.21C97.6888 44.21 97.1615 44.014 96.7881 43.622C96.4241 43.23 96.2421 42.6747 96.2421 41.956V38.372H95.2201V37.28H96.2421V35.264H97.6701V37.28H99.3221V38.372H97.6701V41.858C97.6701 42.306 97.7541 42.6233 97.9221 42.81C98.0995 42.9967 98.4168 43.09 98.8741 43.09C99.1448 43.09 99.4155 43.0293 99.6861 42.908V44.028C99.3315 44.1493 98.8928 44.21 98.3701 44.21ZM101.016 33.654H102.43V38.204C103.074 37.448 103.933 37.07 105.006 37.07C105.902 37.07 106.57 37.308 107.008 37.784C107.447 38.26 107.666 38.8993 107.666 39.702V44H106.252V39.842C106.252 38.75 105.73 38.204 104.684 38.204C104.236 38.204 103.816 38.3113 103.424 38.526C103.042 38.7313 102.71 39.0487 102.43 39.478V44H101.016V33.654ZM113.107 44.21C111.866 44.21 110.89 43.902 110.181 43.286C109.481 42.6607 109.131 41.7833 109.131 40.654C109.131 39.5527 109.444 38.68 110.069 38.036C110.704 37.392 111.604 37.07 112.771 37.07C113.546 37.07 114.204 37.2193 114.745 37.518C115.286 37.8073 115.692 38.2133 115.963 38.736C116.243 39.2493 116.383 39.8373 116.383 40.5V41.2H110.475C110.522 41.8347 110.788 42.3107 111.273 42.628C111.768 42.936 112.435 43.09 113.275 43.09C113.704 43.09 114.138 43.0527 114.577 42.978C115.016 42.894 115.403 42.7867 115.739 42.656V43.79C115.44 43.9113 115.044 44.0093 114.549 44.084C114.064 44.168 113.583 44.21 113.107 44.21ZM115.053 40.206C115.034 39.5713 114.824 39.0813 114.423 38.736C114.031 38.3813 113.471 38.204 112.743 38.204C112.034 38.204 111.483 38.386 111.091 38.75C110.699 39.114 110.494 39.5993 110.475 40.206H115.053ZM117.929 37.28H119.301V38.484C119.581 38.0733 119.973 37.77 120.477 37.574C120.99 37.378 121.583 37.28 122.255 37.28V38.386C121.536 38.386 120.92 38.5027 120.407 38.736C119.893 38.9693 119.539 39.338 119.343 39.842V44H117.929V37.28ZM128.702 34.214H132.468C133.523 34.214 134.353 34.48 134.96 35.012C135.576 35.5347 135.884 36.2813 135.884 37.252C135.884 38.2413 135.581 38.9927 134.974 39.506C134.367 40.01 133.532 40.262 132.468 40.262H130.13V44H128.702V34.214ZM132.314 39.072C132.967 39.072 133.485 38.9367 133.868 38.666C134.251 38.3953 134.442 37.924 134.442 37.252C134.442 36.58 134.251 36.1087 133.868 35.838C133.485 35.558 132.967 35.418 132.314 35.418H130.13V39.072H132.314ZM138.78 44.21C137.968 44.21 137.315 44.0047 136.82 43.594C136.335 43.174 136.092 42.6093 136.092 41.9C136.092 41.1533 136.325 40.5793 136.792 40.178C137.268 39.7673 137.94 39.562 138.808 39.562C139.732 39.562 140.516 39.7487 141.16 40.122V39.772C141.16 39.24 140.997 38.848 140.67 38.596C140.353 38.3347 139.849 38.204 139.158 38.204C138.747 38.204 138.346 38.246 137.954 38.33C137.571 38.4047 137.226 38.512 136.918 38.652V37.504C137.198 37.3733 137.562 37.2707 138.01 37.196C138.458 37.112 138.892 37.07 139.312 37.07C140.423 37.07 141.244 37.3173 141.776 37.812C142.317 38.2973 142.588 38.974 142.588 39.842V44H141.258V43.244C140.969 43.5613 140.623 43.804 140.222 43.972C139.83 44.1307 139.349 44.21 138.78 44.21ZM139.13 43.132C139.578 43.132 139.984 43.0433 140.348 42.866C140.712 42.6887 140.983 42.4413 141.16 42.124V41.214C140.553 40.822 139.877 40.626 139.13 40.626C138.589 40.626 138.183 40.7333 137.912 40.948C137.651 41.1533 137.52 41.4707 137.52 41.9C137.52 42.7213 138.057 43.132 139.13 43.132ZM147.611 44.21C146.865 44.21 146.202 44.07 145.623 43.79C145.045 43.51 144.592 43.104 144.265 42.572C143.948 42.0307 143.789 41.3913 143.789 40.654C143.789 39.9167 143.948 39.282 144.265 38.75C144.592 38.2087 145.045 37.7933 145.623 37.504C146.211 37.2147 146.883 37.07 147.639 37.07C148.666 37.07 149.487 37.2707 150.103 37.672V38.834C149.497 38.414 148.722 38.204 147.779 38.204C147.014 38.204 146.393 38.414 145.917 38.834C145.451 39.2447 145.217 39.8513 145.217 40.654C145.217 41.4567 145.451 42.0633 145.917 42.474C146.384 42.8847 146.995 43.09 147.751 43.09C148.694 43.09 149.506 42.866 150.187 42.418V43.566C149.861 43.79 149.487 43.9533 149.067 44.056C148.657 44.1587 148.171 44.21 147.611 44.21ZM151.725 33.654H153.139V44H151.725V33.654ZM153.153 40.598L156.247 37.28H157.969L154.861 40.598L158.291 44H156.569L153.153 40.598ZM161.339 44.21C160.527 44.21 159.873 44.0047 159.379 43.594C158.893 43.174 158.651 42.6093 158.651 41.9C158.651 41.1533 158.884 40.5793 159.351 40.178C159.827 39.7673 160.499 39.562 161.367 39.562C162.291 39.562 163.075 39.7487 163.719 40.122V39.772C163.719 39.24 163.555 38.848 163.229 38.596C162.911 38.3347 162.407 38.204 161.717 38.204C161.306 38.204 160.905 38.246 160.513 38.33C160.13 38.4047 159.785 38.512 159.477 38.652V37.504C159.757 37.3733 160.121 37.2707 160.569 37.196C161.017 37.112 161.451 37.07 161.871 37.07C162.981 37.07 163.803 37.3173 164.335 37.812C164.876 38.2973 165.147 38.974 165.147 39.842V44H163.817V43.244C163.527 43.5613 163.182 43.804 162.781 43.972C162.389 44.1307 161.908 44.21 161.339 44.21ZM161.689 43.132C162.137 43.132 162.543 43.0433 162.907 42.866C163.271 42.6887 163.541 42.4413 163.719 42.124V41.214C163.112 40.822 162.435 40.626 161.689 40.626C161.147 40.626 160.741 40.7333 160.471 40.948C160.209 41.1533 160.079 41.4707 160.079 41.9C160.079 42.7213 160.615 43.132 161.689 43.132ZM170.415 47.22C169.958 47.22 169.51 47.1827 169.071 47.108C168.642 47.0333 168.278 46.926 167.979 46.786V45.624C168.679 45.9413 169.491 46.1 170.415 46.1C171.283 46.1 171.913 45.9087 172.305 45.526C172.707 45.1527 172.907 44.5833 172.907 43.818V43.104C172.291 43.8413 171.386 44.21 170.191 44.21C169.51 44.21 168.899 44.0607 168.357 43.762C167.816 43.4633 167.391 43.0433 167.083 42.502C166.775 41.9607 166.621 41.34 166.621 40.64C166.621 39.9307 166.771 39.31 167.069 38.778C167.377 38.2367 167.797 37.8167 168.329 37.518C168.871 37.2193 169.477 37.07 170.149 37.07C170.775 37.07 171.302 37.1633 171.731 37.35C172.17 37.5273 172.576 37.826 172.949 38.246V37.28H174.321V43.664C174.321 44.812 173.999 45.6893 173.355 46.296C172.721 46.912 171.741 47.22 170.415 47.22ZM170.471 43.09C171.05 43.09 171.559 42.936 171.997 42.628C172.445 42.32 172.749 41.9093 172.907 41.396V39.884C172.73 39.3613 172.422 38.9507 171.983 38.652C171.554 38.3533 171.05 38.204 170.471 38.204C170.014 38.204 169.599 38.3067 169.225 38.512C168.861 38.708 168.572 38.9927 168.357 39.366C168.152 39.7393 168.049 40.164 168.049 40.64C168.049 41.1253 168.152 41.5547 168.357 41.928C168.572 42.292 168.861 42.5767 169.225 42.782C169.599 42.9873 170.014 43.09 170.471 43.09ZM179.839 44.21C178.598 44.21 177.623 43.902 176.913 43.286C176.213 42.6607 175.863 41.7833 175.863 40.654C175.863 39.5527 176.176 38.68 176.801 38.036C177.436 37.392 178.337 37.07 179.503 37.07C180.278 37.07 180.936 37.2193 181.477 37.518C182.019 37.8073 182.425 38.2133 182.695 38.736C182.975 39.2493 183.115 39.8373 183.115 40.5V41.2H177.207C177.254 41.8347 177.52 42.3107 178.005 42.628C178.5 42.936 179.167 43.09 180.007 43.09C180.437 43.09 180.871 43.0527 181.309 42.978C181.748 42.894 182.135 42.7867 182.471 42.656V43.79C182.173 43.9113 181.776 44.0093 181.281 44.084C180.796 44.168 180.315 44.21 179.839 44.21ZM181.785 40.206C181.767 39.5713 181.557 39.0813 181.155 38.736C180.763 38.3813 180.203 38.204 179.475 38.204C178.766 38.204 178.215 38.386 177.823 38.75C177.431 39.114 177.226 39.5993 177.207 40.206H181.785Z"
                fill="#9E9E9E" />
            </svg>
          </div>

          <div class="grid grid-cols-3 bg-[#1E1E1E] rounded-[8px] p-4">
            <div class="flex items-center gap-3">
              <div><svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="8" fill="white" />
                  <path
                    d="M23.6673 30.0007C23.6673 29.3441 23.6647 28.9522 23.627 28.6712C23.6097 28.5425 23.5894 28.4776 23.5775 28.4486C23.5749 28.4422 23.5723 28.4382 23.571 28.4356L23.5697 28.4317C23.5691 28.4313 23.5674 28.4312 23.5658 28.4304C23.5632 28.429 23.5591 28.4265 23.5528 28.4238C23.5237 28.4119 23.4588 28.3917 23.3301 28.3744C23.0492 28.3366 22.6573 28.334 22.0007 28.334H18.0007C17.3441 28.334 16.9522 28.3366 16.6712 28.3744C16.5425 28.3917 16.4776 28.4119 16.4486 28.4238C16.4419 28.4266 16.4368 28.429 16.4343 28.4304L16.4317 28.4317C16.4314 28.4321 16.431 28.433 16.4304 28.4343C16.429 28.4368 16.4266 28.4419 16.4238 28.4486C16.4119 28.4776 16.3917 28.5425 16.3744 28.6712C16.3366 28.9522 16.334 29.3441 16.334 30.0007C16.334 30.6573 16.3366 31.0492 16.3744 31.3301C16.3917 31.4588 16.4119 31.5237 16.4238 31.5528C16.4266 31.5594 16.429 31.5645 16.4304 31.5671L16.4317 31.5697L16.4343 31.571C16.4368 31.5723 16.4419 31.5747 16.4486 31.5775C16.4776 31.5894 16.5425 31.6097 16.6712 31.627C16.9522 31.6647 17.3441 31.6673 18.0007 31.6673H22.0007C22.6573 31.6673 23.0492 31.6647 23.3301 31.627C23.4588 31.6097 23.5237 31.5894 23.5528 31.5775C23.5591 31.5749 23.5632 31.5723 23.5658 31.571L23.5697 31.5697L23.571 31.5658C23.5723 31.5632 23.5749 31.5591 23.5775 31.5528C23.5894 31.5237 23.6097 31.4588 23.627 31.3301C23.6647 31.0492 23.6673 30.6573 23.6673 30.0007ZM25.6673 30.0007C25.6673 30.6009 25.6699 31.1518 25.61 31.597C25.5463 32.071 25.3958 32.5717 24.9837 32.9837C24.5717 33.3958 24.071 33.5463 23.597 33.61C23.1518 33.6699 22.6009 33.6673 22.0007 33.6673H18.0007C17.4004 33.6673 16.8495 33.6699 16.4043 33.61C15.9303 33.5463 15.4296 33.3958 15.0176 32.9837C14.6056 32.5717 14.455 32.071 14.3913 31.597C14.3314 31.1518 14.334 30.6009 14.334 30.0007C14.334 29.4004 14.3314 28.8495 14.3913 28.4043C14.455 27.9303 14.6056 27.4296 15.0176 27.0176C15.4296 26.6056 15.9303 26.455 16.4043 26.3913C16.8495 26.3314 17.4004 26.334 18.0007 26.334H22.0007C22.6009 26.334 23.1518 26.3314 23.597 26.3913C24.071 26.455 24.5717 26.6056 24.9837 27.0176C25.3958 27.4296 25.5463 27.9303 25.61 28.4043C25.6699 28.8495 25.6673 29.4004 25.6673 30.0007Z"
                    fill="#1E1E1E" />
                  <path
                    d="M35.6654 19.3342C35.6654 17.948 35.6539 17.478 35.5118 17.0516C35.3696 16.6254 35.0971 16.2422 34.2657 15.1336C33.0278 13.4832 32.5904 12.9425 32.0066 12.6506C31.4229 12.3589 30.7281 12.3342 28.6654 12.3342H19.3321C17.2695 12.3342 16.5747 12.3589 15.991 12.6506C15.4072 12.9425 14.9697 13.4832 13.7318 15.1336C12.9004 16.2423 12.6279 16.6254 12.4858 17.0516C12.3436 17.478 12.3321 17.948 12.3321 19.3342V26.0008C12.3321 28.5431 12.3341 30.3494 12.5183 31.7196C12.6987 33.061 13.0374 33.8337 13.6016 34.398C14.1659 34.9622 14.9386 35.3009 16.28 35.4813C17.6502 35.6655 19.4564 35.6675 21.9988 35.6675H25.9988C28.5411 35.6675 30.3473 35.6655 31.7175 35.4813C33.059 35.3009 33.8317 34.9622 34.3959 34.398C34.9602 33.8337 35.2989 33.061 35.4792 31.7196C35.6634 30.3494 35.6654 28.5431 35.6654 26.0008V19.3342ZM37.6654 26.0008C37.6654 28.4867 37.6673 30.452 37.461 31.9865C37.2508 33.5496 36.8077 34.8143 35.81 35.812C34.8123 36.8098 33.5475 37.2529 31.9844 37.4631C30.45 37.6694 28.4846 37.6675 25.9988 37.6675H21.9988C19.5129 37.6675 17.5476 37.6694 16.0131 37.4631C14.45 37.2529 13.1853 36.8098 12.1876 35.812C11.1898 34.8143 10.7467 33.5496 10.5365 31.9865C10.3302 30.452 10.3321 28.4867 10.3321 26.0008V19.3342C10.3321 18.0773 10.3203 17.2252 10.5886 16.4201C10.857 15.615 11.3775 14.9398 12.1316 13.9344C13.2491 12.4444 13.9911 11.4142 15.0964 10.8615C16.2016 10.3091 17.4699 10.3342 19.3321 10.3342H28.6654C30.5276 10.3342 31.7959 10.3091 32.9011 10.8615C34.0066 11.4142 34.7485 12.4445 35.866 13.9344C36.62 14.9398 37.1405 15.615 37.4089 16.4201L37.4975 16.7248C37.6749 17.4444 37.6654 18.2343 37.6654 19.3342V26.0008Z"
                    fill="#1E1E1E" />
                  <path
                    d="M36 15.666C36.5523 15.666 37 16.1137 37 16.666C37 17.2183 36.5523 17.666 36 17.666H12C11.4477 17.666 11 17.2183 11 16.666C11 16.1137 11.4477 15.666 12 15.666H36Z"
                    fill="#1E1E1E" />
                  <path
                    d="M26.0011 10.334C26.46 10.334 26.8599 10.6466 26.9711 11.0918L28.3045 16.4251C28.379 16.7238 28.3116 17.0406 28.1222 17.2832C27.9327 17.5256 27.6421 17.6673 27.3344 17.6673H20.6678C20.36 17.6673 20.0695 17.5256 19.88 17.2832C19.6906 17.0406 19.6231 16.7238 19.6977 16.4251L21.031 11.0918L21.0857 10.9316C21.243 10.5734 21.5994 10.334 22.0011 10.334H26.0011ZM21.9477 15.6673H26.0545L25.2211 12.334H22.781L21.9477 15.6673Z"
                    fill="#1E1E1E" />
                  <path
                    d="M19.666 19.3327V16.666C19.666 16.1137 20.1137 15.666 20.666 15.666C21.2183 15.666 21.666 16.1137 21.666 16.666V19.3327C21.666 19.9893 21.6687 20.3812 21.7064 20.6621C21.7237 20.7909 21.7439 20.8557 21.7559 20.8848C21.7586 20.8914 21.761 20.8965 21.7624 20.8991L21.7637 20.9017L21.7663 20.903C21.7689 20.9043 21.774 20.9068 21.7806 20.9095C21.8097 20.9215 21.8745 20.9417 22.0033 20.959C22.2842 20.9967 22.6761 20.9993 23.3327 20.9993H24.666C25.3226 20.9993 25.7145 20.9967 25.9955 20.959C26.1242 20.9417 26.1891 20.9215 26.2181 20.9095C26.2245 20.9069 26.2285 20.9043 26.2311 20.903L26.235 20.9017L26.2363 20.8978C26.2377 20.8952 26.2402 20.8912 26.2429 20.8848C26.2548 20.8557 26.275 20.7909 26.2923 20.6621C26.3301 20.3812 26.3327 19.9893 26.3327 19.3327V16.666C26.3327 16.1137 26.7804 15.666 27.3327 15.666C27.885 15.666 28.3327 16.1137 28.3327 16.666V19.3327C28.3327 19.933 28.3353 20.4838 28.2754 20.929C28.2117 21.403 28.0611 21.9037 27.6491 22.3158C27.2371 22.7278 26.7364 22.8783 26.2624 22.9421C25.8172 23.0019 25.2663 22.9993 24.666 22.9993H23.3327C22.7324 22.9993 22.1816 23.0019 21.7363 22.9421C21.2624 22.8783 20.7617 22.7278 20.3496 22.3158C19.9376 21.9037 19.787 21.403 19.7233 20.929C19.6635 20.4838 19.666 19.933 19.666 19.3327Z"
                    fill="#1E1E1E" />
                </svg>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-[12px] font-[400] leading-[20px] text-[#C2C2C2]">Total Package</div>
                <div class="text-[18px] leading-[26px] font-bold text-white">0</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="8" fill="white" />
                  <path
                    d="M33.0001 24.0072C33.0001 21.9519 32.9848 21.1761 32.7227 20.4785C32.4605 19.7813 31.9611 19.1875 30.6081 17.6413L28.879 15.666H19.1212L17.392 17.6413C16.039 19.1875 15.5396 19.7813 15.2774 20.4785C15.0153 21.1761 15.0001 21.9519 15.0001 24.0072V29.3327C15.0001 31.2462 15.0027 32.5808 15.1381 33.5879C15.2696 34.5662 15.5099 35.0847 15.879 35.4538C16.248 35.8228 16.7665 36.0631 17.7449 36.1947C18.7519 36.33 20.0865 36.3327 22.0001 36.3327H26.0001C27.9136 36.3327 29.2482 36.33 30.2553 36.1947C31.2336 36.0631 31.7521 35.8228 32.1212 35.4538C32.4902 35.0847 32.7305 34.5662 32.862 33.5879C32.9974 32.5808 33.0001 31.2462 33.0001 29.3327V24.0072ZM22.961 32.666V32.2311C22.5337 32.1397 22.1291 32.001 21.7605 31.821C20.6617 31.2842 19.6667 30.2609 19.6667 28.9095C19.6671 28.3575 20.1147 27.9095 20.6667 27.9095C21.2188 27.9095 21.6664 28.3575 21.6667 28.9095C21.6667 29.1973 21.9081 29.6675 22.6381 30.0241C23.3307 30.3624 24.2763 30.4825 25.2071 30.1868C26.0555 29.9173 26.2702 29.4691 26.3204 29.1191C26.3851 28.6675 26.1979 28.1936 25.9936 27.972C25.8018 27.7643 25.5542 27.6473 25.1212 27.5853C24.8657 27.5487 24.6188 27.5369 24.336 27.5293L23.336 27.498C21.4959 27.4047 20.148 26.4105 19.935 24.9017C19.7322 23.4644 20.6509 22.0805 22.1693 21.3691C22.4285 21.2478 22.6939 21.1578 22.961 21.0944V20.666C22.961 20.1139 23.4089 19.6662 23.961 19.666C24.5133 19.666 24.961 20.1137 24.961 20.666V21.0892C25.2368 21.1505 25.5027 21.2358 25.7527 21.3405C26.7763 21.7693 27.7544 22.6296 27.9688 23.8223C28.0665 24.3657 27.7049 24.8858 27.1615 24.9837C26.618 25.0814 26.0979 24.7199 26.0001 24.1764C25.9475 23.8842 25.6326 23.4592 24.9792 23.1855C24.3547 22.9241 23.6222 22.8967 23.017 23.1803C22.0734 23.6224 21.8667 24.2739 21.9154 24.6217C21.9544 24.8981 22.2361 25.4397 23.4376 25.5007C23.9936 25.5288 24.7848 25.516 25.405 25.6048C26.1034 25.7048 26.8508 25.9512 27.4636 26.6152C28.0637 27.2657 28.4522 28.3381 28.2995 29.403C28.1323 30.5696 27.3357 31.6091 25.8126 32.0931C25.5292 32.1831 25.2443 32.248 24.961 32.291V32.666C24.961 33.2183 24.5133 33.666 23.961 33.666C23.4089 33.6658 22.961 33.2182 22.961 32.666ZM30.9896 12.0046L30.9753 11.8717C30.9415 11.7901 30.876 11.7246 30.7943 11.6908V11.6921C30.78 11.6888 30.7413 11.6819 30.6615 11.6764C30.5175 11.6666 30.3243 11.666 30.0001 11.666H18.0001C17.6758 11.666 17.4826 11.6666 17.3386 11.6764C17.2036 11.6856 17.1861 11.6989 17.2058 11.6908C17.1241 11.7246 17.0586 11.7901 17.0248 11.8717C17.0329 11.8521 17.0197 11.8695 17.0105 12.0046C17.0007 12.1486 17.0001 12.3417 17.0001 12.666C17.0001 12.9903 17.0007 13.1835 17.0105 13.3275C17.0197 13.4625 17.0329 13.4799 17.0248 13.4603C17.0586 13.542 17.1241 13.6075 17.2058 13.6413C17.1861 13.6331 17.2036 13.6464 17.3386 13.6556C17.4826 13.6654 17.6758 13.666 18.0001 13.666H30.0001C30.3243 13.666 30.5175 13.6654 30.6615 13.6556C30.7413 13.6502 30.78 13.6432 30.7943 13.64C30.8759 13.6061 30.9415 13.5419 30.9753 13.4603L30.9896 13.3275C30.9995 13.1835 31.0001 12.9903 31.0001 12.666C31.0001 12.3417 30.9995 12.1486 30.9896 12.0046ZM33.0001 12.666C33.0001 12.963 33 13.2363 32.9844 13.4642C32.9683 13.7009 32.9325 13.9615 32.823 14.2259C32.5861 14.7976 32.1316 15.2521 31.56 15.4889C31.5146 15.5077 31.4682 15.521 31.4232 15.5358L32.1133 16.3249C33.3699 17.761 34.1756 18.6592 34.5951 19.7754C35.0146 20.8918 35.0001 22.0987 35.0001 24.0072V29.3327C35.0001 31.1899 35.0026 32.6835 34.8451 33.8548C34.6838 35.055 34.3378 36.0653 33.5352 36.8678C32.7327 37.6704 31.7223 38.0164 30.5222 38.1777C29.3509 38.3352 27.8573 38.3327 26.0001 38.3327H22.0001C20.1428 38.3327 18.6493 38.3352 17.4779 38.1777C16.2778 38.0164 15.2675 37.6704 14.4649 36.8678C13.6624 36.0653 13.3164 35.055 13.155 33.8548C12.9976 32.6835 13.0001 31.1899 13.0001 29.3327V24.0072C13.0001 22.0987 12.9855 20.8918 13.405 19.7754C13.8245 18.6592 14.6302 17.761 15.8868 16.3249L16.5756 15.5358C16.531 15.5211 16.4851 15.5075 16.4402 15.4889C15.8685 15.2521 15.414 14.7976 15.1771 14.2259C15.0676 13.9615 15.0319 13.7009 15.0157 13.4642C15.0001 13.2363 15.0001 12.963 15.0001 12.666C15.0001 12.3691 15.0001 12.0957 15.0157 11.8678C15.0319 11.6311 15.0676 11.3706 15.1771 11.1061C15.414 10.5344 15.8685 10.0799 16.4402 9.8431C16.7046 9.73356 16.9652 9.69782 17.2019 9.68164C17.4298 9.66609 17.7031 9.66602 18.0001 9.66602H30.0001C30.297 9.66602 30.5704 9.66609 30.7982 9.68164C31.0349 9.69782 31.2955 9.73359 31.56 9.8431C32.1316 10.0799 32.5861 10.5344 32.823 11.1061C32.9325 11.3705 32.9683 11.6312 32.9844 11.8678C33 12.0957 33.0001 12.3691 33.0001 12.666Z"
                    fill="#1E1E1E" />
                </svg>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-[12px] font-[400] leading-[20px] text-[#C2C2C2]">Total Value</div>
                <div class="text-[18px] leading-[26px] font-bold text-white">USD 0</div>
              </div>
            </div>
            <div class="flex items-center gap-3">
              <div>
                <svg width="48" height="48" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <rect width="48" height="48" rx="8" fill="white" />
                  <path
                    d="M32.3342 27.9994C32.3342 23.397 28.6033 19.666 24.0009 19.666C19.3985 19.666 15.6675 23.397 15.6675 27.9994V33.1843C15.6675 34.69 15.9579 35.3751 16.3225 35.7259C16.6959 36.0853 17.391 36.3327 18.816 36.3327H29.1858C30.6915 36.3327 31.3766 36.0423 31.7274 35.6777C32.0868 35.3043 32.3342 34.6092 32.3342 33.1843V27.9994ZM24.4397 27.5527C24.6866 27.0589 25.287 26.8582 25.7808 27.1048C26.2746 27.3517 26.4753 27.9521 26.2287 28.446L24.8954 31.1126C24.6485 31.6064 24.0481 31.8071 23.5543 31.5606C23.0605 31.3137 22.8598 30.7133 23.1064 30.2194L24.4397 27.5527ZM28.3342 27.9994C28.3342 25.6062 26.3941 23.666 24.0009 23.666C21.6077 23.666 19.6675 25.6062 19.6675 27.9994C19.6675 28.5516 19.2198 28.9994 18.6675 28.9994C18.1153 28.9994 17.6675 28.5516 17.6675 27.9994C17.6675 24.5016 20.5031 21.666 24.0009 21.666C27.4986 21.666 30.3342 24.5016 30.3342 27.9994C30.3342 28.5516 29.8865 28.9994 29.3342 28.9994C28.7819 28.9994 28.3342 28.5516 28.3342 27.9994ZM22.3342 17.8001C22.8768 17.7122 23.4335 17.666 24.0009 17.666C24.5683 17.666 25.125 17.7122 25.6675 17.8001V15.666H22.3342V17.8001ZM14.6454 11.6686C14.7047 11.7538 14.7702 11.8483 14.8446 11.9538C15.5448 12.9462 15.7495 13.205 16.0087 13.3692C16.1088 13.4326 16.2161 13.4877 16.329 13.5319H16.3303C16.6312 13.6495 16.9928 13.666 18.2509 13.666H29.7509C31.0088 13.666 31.3705 13.6495 31.6715 13.5319C31.7846 13.4877 31.8927 13.4327 31.9931 13.3692L32.0894 13.3028C32.3117 13.1296 32.5443 12.8222 33.1571 11.9538L33.355 11.6686C33.2317 11.6675 33.088 11.666 32.9188 11.666H15.0829C14.9132 11.666 14.7691 11.6675 14.6454 11.6686ZM34.3342 33.1843C34.3342 34.7258 34.0916 36.1055 33.1688 37.0645C32.2375 38.0323 30.8474 38.3327 29.1858 38.3327H18.816C17.2745 38.3327 15.8948 38.09 14.9358 37.1673C13.9679 36.236 13.6675 34.8459 13.6675 33.1843V27.9994C13.6675 23.5839 16.4377 19.8175 20.3342 18.3379V15.666H18.2509C17.1536 15.666 16.3367 15.6828 15.6011 15.3952C15.3699 15.3048 15.1477 15.1918 14.9384 15.0593C14.2659 14.6333 13.8169 13.9657 13.2105 13.1061C12.9719 12.768 12.7367 12.4378 12.5842 12.153C12.4369 11.8778 12.2317 11.4081 12.3928 10.8666L12.4566 10.6921C12.5296 10.5209 12.6306 10.3641 12.7548 10.2272C13.116 9.82912 13.5993 9.73662 13.911 9.70119C14.2369 9.66415 14.6493 9.66603 15.0829 9.66603H32.9188C33.3525 9.66603 33.7649 9.66415 34.0907 9.70119C34.4025 9.73662 34.8857 9.82914 35.247 10.2272C35.3709 10.3638 35.4721 10.5206 35.5452 10.6921L35.609 10.8679L35.6532 11.0671C35.7197 11.5233 35.5464 11.9123 35.4175 12.153C35.2651 12.4378 35.0298 12.768 34.7912 13.1061V13.1074C34.1851 13.9665 33.7359 14.6334 33.0634 15.0593C32.9589 15.1254 32.8508 15.187 32.7405 15.2429L32.4006 15.3952C31.665 15.6828 30.8482 15.666 29.7509 15.666H27.6675V18.3379C31.5641 19.8175 34.3342 23.5839 34.3342 27.9994V33.1843Z"
                    fill="#1E1E1E" />
                </svg>
              </div>
              <div class="flex flex-col gap-1">
                <div class="text-[12px] font-[400] leading-[20px] text-[#C2C2C2]">Total Chargeable Weight (i)</div>
                <div class="text-[18px] leading-[26px] font-bold text-white">0</div>
>>>>>>> Refactor page structure; Page customer infor and item & packages
              </div>
            </div>
          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
<<<<<<< HEAD
            <BlackButton class="w-[97px]" @click="navigateToOrderHub">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!-- @click="actionForm = ''" -->
              <TextButton
                :disabled="submitLoading || bookingProgressLoading"
                @click="showPopupFinishLater"
              >
                Finish Later
              </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton
                type="submit"
                class="w-[100px]"
                :loading="submitLoading"
                :disabled="finishLaterLoading || bookingProgressLoading"
              >
=======
            <BlackButton class="w-[97px]" @click="handleBack">Back</BlackButton>
            <div class="flex items-center gap-3">
              <!-- @click="actionForm = ''" -->
              <TextButton @click="handleFinishLater" :disabled="submitLoading">
                Finish Later
              </TextButton>
              <!--  :disabled="$form.invalid && $form.touched" -->
              <PrimaryButton type="submit" class="w-[100px]" :loading="submitLoading">
>>>>>>> Refactor page structure; Page customer infor and item & packages
                Done
              </PrimaryButton>
            </div>
          </div>
<<<<<<< HEAD

          <!-- Confirm Save Later -->
          <BasePopup
            v-model:visible="visibleConfirmSaveLater"
            :icon="IconSaveProgress"
            title="Your progress will be saved"
            :description="`Finish later will automatically save your progress in \nitem and packages.\nYou can comeback later to complete the form.`"
            @cancel="closePopupFinishLater"
            @ok="handleFinishLater($form)"
            :okLoading="finishLaterLoading"
          />
        </Form>
      </section>
    </template>

    <template v-if="viewMode === 'success'">
      <UISuccessSubmitFormStepOrderHub
        :step="currentStep"
        :response="submittedResponse"
        @go-to-order-hub="navigateToOrderHub"
      />
    </template>
  </section>
</template>
=======
        </Form>

        <!-- <BasePopup v-model:visible="visibleConfirmChangeShipmentOwner" :icon="IconAlertCircle"
          title="Change Information"
          :description="`Are you sure you want to replace all information with ${firstCapital(pendingShipmentOwnerSameAs as string)} Information?`"
          @cancel="handleOnCancelChangeShipmentOwner" @ok="handleOnOkChangeShipmentOwner" /> -->

      </section>
    </template>

    <template v-else>
      <!-- Success Notification -->
      <div class="w-[500px] mx-auto flex flex-col gap-6 bg-[#F6F6FA] rounded-[16px] mt-16 px-6 py-8">
        <div class="flex flex-col items-center gap-4">
          <!-- Icon -->
          <!-- <component v-if="props.icon" :is="props.icon" class="mx-auto text-[#C1FF00]" /> -->
          <svg width="42" height="42" viewBox="0 0 42 42" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M30.0288 7.03829C32.6859 4.83503 36.5738 5.41643 38.5977 8.13204C40.5039 10.69 40.1408 14.3181 37.6868 16.3984C31.2286 21.8725 26.2433 25.615 21.0396 31.1828C19.5905 32.7333 18.4204 33.9863 17.4046 34.8366C16.3842 35.6908 15.3069 36.3248 14.0259 36.3132C12.7644 36.3016 11.7282 35.6945 10.7532 34.8606C9.79494 34.0408 8.71569 32.8397 7.38992 31.3691L3.77713 27.3632C1.88851 25.268 1.65882 22.1515 3.21658 19.7993C5.4471 16.432 10.246 16.0946 12.9202 19.1225L15.1778 21.6792C19.5258 16.6538 24.124 11.936 30.0288 7.03829ZM36.4939 9.70089C35.3267 8.13453 33.1509 7.85959 31.7036 9.06002C25.9131 13.863 21.4074 18.4869 17.1226 23.4428C16.9639 23.6263 16.6966 23.9584 16.3689 24.164C15.7382 24.5595 14.9639 24.6119 14.2942 24.3213L14.0139 24.176C13.6845 23.9741 13.4162 23.6472 13.2569 23.4668L10.9532 20.8589C9.42405 19.1281 6.6846 19.3182 5.40579 21.2485C4.50823 22.6035 4.64154 24.3999 5.72708 25.6047L9.33987 29.6123C10.7148 31.1374 11.6612 32.1839 12.4588 32.8662C13.2394 33.5338 13.6902 33.6849 14.0498 33.6882C14.3904 33.6913 14.8615 33.5433 15.7195 32.8252C16.5824 32.1028 17.6246 30.9924 19.1221 29.3901C24.4641 23.6744 29.6594 19.7613 35.9898 14.3955C37.3629 13.2312 37.5899 11.1721 36.4939 9.70089Z"
              fill="#27C827" />
          </svg>


          <!-- Title -->
          <h3 class="text-[24px] leading-[32px] font-semibold text-[#1E1E1E] text-center">
            <!-- {{ props.title }} -->
            Customer Information <br />
            Saved!
          </h3>

          <!-- Description -->
          <p class="text-[#9E9E9E] text-center px-2">
            <!-- {{ props.description }} -->
            Your Customer Information has been successfully saved. Please proceed to finish the remaining form for your
            booking.
          </p>
        </div>

        <!-- Actions -->
        <div class="flex items-center justify-center">
          <PrimaryButton class="w-[244px]" @click="handleGoToOrderHubPage">Go To Booking Order Hub</PrimaryButton>
        </div>
      </div>
    </template>
  </section>
</template>
>>>>>>> Refactor page structure; Page customer infor and item & packages
