<script setup lang="ts">
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
        Passenger Goods
      </div>
    </div> -->

    <template v-if="viewMode === 'form'">
      <!-- Section Form -->
      <section class="w-[1024px] mx-auto flex flex-col gap-6 mt-4">
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
              </div>
            </div>
          </div>

          <div class="w-full flex items-center justify-between h-[70px] gap-3">
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
                Done
              </PrimaryButton>
            </div>
          </div>

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
